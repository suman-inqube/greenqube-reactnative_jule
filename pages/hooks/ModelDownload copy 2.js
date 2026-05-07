// ─── useDownload.js ───────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import EncryptedStorage from 'react-native-encrypted-storage';
import NetInfo from '@react-native-community/netinfo';

const API_URL     = 'http://188.166.254.225:8000/download';
const ZIP_PATH    = `${RNFS.DocumentDirectoryPath}/latest.zip`;
const EXTRACT_PATH = RNFS.DocumentDirectoryPath;
const KEY_LAST_MODIFIED = '@last_modified';
const KEY_DL_STATE      = '@download_state';

// ─── helpers ─────────────────────────────────────────────────────────────────
export const formatBytes = (bytes = 0) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const checkNet = async () => {
  const s = await NetInfo.fetch();
  if (!s.isConnected) throw new Error('No internet connection. Please check your network.');
};

// ─── DownloadManager class (same logic, zero changes) ────────────────────────
class DownloadManager {
  constructor() {
    this._job   = null;
    this._state = {
      status:       'idle',
      progress:     0,
      bytesWritten: 0,
      totalBytes:   0,
      lastModified: null,
    };
    this._listeners = [];
  }

  // internal
  _emit() {
    const snap = { ...this._state };
    this._listeners.forEach(fn => fn(snap));
  }

  _set(patch) {
    this._state = { ...this._state, ...patch };
    this._emit();
    this._persist();
  }

  async _persist() {
    try {
      await EncryptedStorage.setItem(
        KEY_DL_STATE,
        JSON.stringify({ ...this._state, ts: Date.now() }),
      );
    } catch (_) {}
  }

  async _loadPersisted() {
    try {
      const raw = await EncryptedStorage.getItem(KEY_DL_STATE);
      if (!raw) return;
      const saved = JSON.parse(raw);

      if (saved.status === 'paused' && saved.bytesWritten > 0) {
        const exists = await RNFS.exists(ZIP_PATH);
        if (!exists) { await this._clearPersisted(); return; }

        const stat = await RNFS.stat(ZIP_PATH);
        if (Number(stat.size) !== saved.bytesWritten) {
          await this._clearPersisted();
          return;
        }
        this._state = { ...this._state, ...saved };
        this._emit();
      }
    } catch (_) {}
  }

  async _clearPersisted() {
    try { await EncryptedStorage.removeItem(KEY_DL_STATE); } catch (_) {}
  }

  // public
  subscribe(fn) {
    this._listeners.push(fn);
    fn({ ...this._state });
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  getState() { return { ...this._state }; }

  async init() {
    await this._loadPersisted();
    return this._state;
  }

  async start() {
    await checkNet();

    this._set({ status: 'checking' });

    const savedLM = await EncryptedStorage.getItem(KEY_LAST_MODIFIED).catch(() => null);
    const headRes = await fetch(API_URL, {
      method: 'HEAD',
      headers: savedLM ? { 'If-Modified-Since': savedLM } : {},
    });

    if (headRes.status === 304) {
      this._set({ status: 'idle' });
      return 'not_modified';
    }

    const serverLM = headRes.headers.get('last-modified');
    this._set({
      status:       'downloading',
      lastModified: serverLM,
      bytesWritten: 0,
      totalBytes:   0,
      progress:     0,
    });

    return await this._runDownload(0, false);
  }

  async resume() {
    await checkNet();
    const { bytesWritten } = this._state;
    if (bytesWritten <= 0) return this.start();

    this._set({ status: 'downloading' });
    return await this._runDownload(bytesWritten, true);
  }

  async _runDownload(resumeFrom, isResume) {
    if (!isResume && await RNFS.exists(ZIP_PATH)) {
      await RNFS.unlink(ZIP_PATH).catch(() => {});
    }

    const headers = {};
    if (isResume && resumeFrom > 0) {
      headers['Range'] = `bytes=${resumeFrom}-`;
    }

    const dlJob = RNFS.downloadFile({
      fromUrl:           API_URL,
      toFile:            ZIP_PATH,
      headers,
      background:        true,
      discretionary:     false,
      connectionTimeout: 30000,
      readTimeout:       120000,
      progressInterval:  200,
      progress: (res) => {
        const written = isResume ? resumeFrom + res.bytesWritten : res.bytesWritten;
        const total   = isResume ? resumeFrom + res.contentLength : res.contentLength;
        const pct     = total > 0 ? Math.min(100, Math.round((written / total) * 100)) : 0;
        this._set({ bytesWritten: written, totalBytes: total, progress: pct });
      },
    });

    this._job = dlJob;

    try {
      const result = await dlJob.promise;

      if (result.statusCode === 200 || result.statusCode === 206) {
        this._set({ status: 'extracting', progress: 100 });
        await unzip(ZIP_PATH, EXTRACT_PATH);
        await RNFS.unlink(ZIP_PATH).catch(() => {});

        if (this._state.lastModified) {
          await EncryptedStorage.setItem(KEY_LAST_MODIFIED, this._state.lastModified);
        }

        this._set({ status: 'complete', progress: 100 });
        await this._clearPersisted();
        return 'done';
      }

      throw new Error(`Server returned HTTP ${result.statusCode}`);
    } catch (err) {
      if (this._state.status === 'paused') return 'paused';
      this._set({ status: 'failed' });
      await this._clearPersisted();
      throw err;
    }
  }

  async pause() {
    if (this._job?.jobId && this._state.status === 'downloading') {
      try {
        await RNFS.stopDownload(this._job.jobId);
        this._set({ status: 'paused' });
        return true;
      } catch (e) {
        console.warn('Pause failed:', e);
      }
    }
    return false;
  }

  async cancel() {
    if (this._job?.jobId) {
      try { await RNFS.stopDownload(this._job.jobId); } catch (_) {}
    }
    this._job   = null;
    this._state = { status: 'idle', progress: 0, bytesWritten: 0, totalBytes: 0, lastModified: null };
    await RNFS.unlink(ZIP_PATH).catch(() => {});
    await this._clearPersisted();
    this._emit();
  }
}

// ─── THE HOOK ────────────────────────────────────────────────────────────────
export const useDownload = () => {
  // singleton manager lives for the lifetime of the hook consumer
  const mgrRef = useRef(null);
  if (!mgrRef.current) mgrRef.current = new DownloadManager();
  const mgr = mgrRef.current;

  const [dlState, setDlState] = useState(mgr.getState());
  const [busy,    setBusy]    = useState(false);

  // subscribe to manager updates → push into React state
  useEffect(() => {
    const unsub = mgr.subscribe(setDlState);
    return unsub;
  }, []);

  // init on mount: restore persisted paused state
  const init = async () => {
    const state = await mgr.init();
    return state;
  };

  // wrap: prevents double-taps, surfaces errors via returned object
  const wrap = (fn) => async () => {
    if (busy) return;
    setBusy(true);
    try {
      return await fn();
    } catch (e) {
      return { error: e.message || String(e) };
    } finally {
      setBusy(false);
    }
  };

  const start  = wrap(() => mgr.start());
  const pause  = wrap(() => mgr.pause());
  const resume = wrap(() => mgr.resume());
  const cancel = wrap(() => mgr.cancel());

  const { status, progress, bytesWritten, totalBytes } = dlState;

  return {
    // state
    status,
    progress,
    bytesWritten,
    totalBytes,
    busy,
    // derived booleans (same logic as original App)
    canStart:  !busy && (status === 'idle' || status === 'complete' || status === 'failed'),
    canPause:  !busy && status === 'downloading',
    canResume: !busy && status === 'paused',
    canCancel: !busy && (status === 'downloading' || status === 'paused'),
    // actions
    init,
    start,
    pause,
    resume,
    cancel,
  };
};