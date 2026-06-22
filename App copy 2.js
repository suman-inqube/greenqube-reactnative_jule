// ─── App.js ───────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useDownload,formatBytes } from './pages/hooks/ModelDownload';
const STAGE_LABELS = {
  idle:       'Ready',
  checking:   'Checking server…',
  downloading:'Downloading…',
  paused:     'Paused',
  extracting: 'Extracting files…',
  complete:   'Complete!',
  failed:     'Failed',
};

const STAGE_COLORS = {
  idle:       '#888',
  checking:   '#FF9800',
  downloading:'#2196F3',
  paused:     '#FF9800',
  extracting: '#9C27B0',
  complete:   '#4CAF50',
  failed:     '#F44336',
};

export default function App() {
  const {
    status, progress, bytesWritten, totalBytes, busy,
    canStart, canPause, canResume, canCancel,
    init, start, pause, resume, cancel,
  } = useDownload();

  useEffect(() => {
    init().then(state => {
      if (state.status === 'paused' && state.bytesWritten > 0) {
        Alert.alert(
          'Resume Download?',
          `Download is ${state.progress}% complete (${formatBytes(state.bytesWritten)} saved).\nResume where you left off?`,
          [
            { text: 'Cancel download', style: 'destructive', onPress: handleCancel },
            { text: 'Resume', onPress: handleResume },
          ],
        );
      }
    });
  }, []);

  const handleStart = async () => {
    const result = await start();
    if (result?.error)                  Alert.alert('Error', result.error);
    else if (result === 'not_modified') Alert.alert('Up to date', 'File is already the latest version.');
    else if (result === 'done')         Alert.alert('Done', 'Download and extraction complete!');
  };

  const handlePause = async () => {
    const result = await pause();
    if (result?.error) Alert.alert('Error', result.error);
  };

  const handleResume = async () => {
    const result = await resume();
    if (result?.error)          Alert.alert('Error', result.error);
    else if (result === 'done') Alert.alert('Done', 'Download and extraction complete!');
  };

  const handleCancel = async () => { await cancel(); };

  const color = STAGE_COLORS[status] ?? '#888';

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.heading}>Download Manager</Text>
      <Text style={styles.sub}>Pause · Resume · Smart Cache</Text>

      <View style={styles.badge}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.badgeText, { color }]}>
          {STAGE_LABELS[status] ?? status}
        </Text>
      </View>

      <View style={styles.barWrap}>
        <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.pct}>{progress}%</Text>

      {totalBytes > 0 && (
        <Text style={styles.byteInfo}>
          {formatBytes(bytesWritten)} / {formatBytes(totalBytes)}
        </Text>
      )}

      <View style={styles.btns}>
        <Btn label="Start"  color="#4CAF50" onPress={handleStart}  disabled={!canStart} />
        <Btn label="Pause"  color="#FF9800" onPress={handlePause}  disabled={!canPause} />
        <Btn label="Resume" color="#2196F3" onPress={handleResume} disabled={!canResume} />
        <Btn label="Cancel" color="#F44336" onPress={handleCancel} disabled={!canCancel} />
      </View>

      {status === 'complete' && (
        <View style={[styles.notice, { backgroundColor: '#E8F5E9' }]}>
          <Text style={{ color: '#388E3C', fontWeight: '600' }}>
            Files extracted successfully.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const Btn = ({ label, color, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!!disabled}
    activeOpacity={0.75}
    style={[styles.btn, { backgroundColor: disabled ? '#ccc' : color }]}
  >
    <Text style={styles.btnText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root:      { flexGrow: 1, padding: 24, paddingTop: 60, backgroundColor: '#F5F5F5', alignItems: 'center' },
  heading:   { fontSize: 26, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  sub:       { fontSize: 13, color: '#888', marginBottom: 32, letterSpacing: 0.5 },
  badge:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 14, fontWeight: '600' },
  barWrap:   { width: '100%', height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  barFill:   { height: '100%', borderRadius: 5 },
  pct:       { fontSize: 32, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  byteInfo:  { fontSize: 13, color: '#888', marginBottom: 32 },
  btns:      { width: '100%', gap: 10 },
  btn:       { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  btnText:   { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  notice:    { marginTop: 24, padding: 16, borderRadius: 10, width: '100%', alignItems: 'center' },
});