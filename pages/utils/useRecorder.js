import { useState, useRef } from 'react';
import Sound from 'react-native-nitro-sound';
import RNFS from 'react-native-fs';

const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

// ✅ Reusable recorder logic
const useRecorder = (itemId) => {
  const [recordData, setRecordData] = useState({
    item: itemId,
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    result: '',
  });

  const intervalRef = useRef(null);
  const filePath = `${RNFS.DocumentDirectoryPath}/item_${itemId}.mp3`;

  const startRecording = async () => {
    try {
      await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      await Sound.startRecording(filePath);

      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;

        setRecordData((prev) => ({
          ...prev,
          isLoggingIn: true,
          recordSecs: Math.floor(elapsed / 1000),
          recordTime: formatTime(elapsed),
        }));

        if (elapsed >= 60000) stopRecording(); // auto-stop at 60s
      }, 500);
    } catch (err) {
      console.error('Start recording error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const resultPath = await Sound.stopRecording();

      setRecordData((prev) => ({
        ...prev,
        isLoggingIn: false,
        recordSecs: 0,
        recordTime: '00:00:00',
        result: resultPath,
      }));

      console.log(`Recording saved for item ${itemId}:`, resultPath);
      return resultPath;
    } catch (err) {
      console.error('Stop recording error:', err);
    }
  };

  const playRecording = async () => {
    try {
      if (recordData.result) {
        await Sound.play(recordData.result);
      } else {
        console.warn(`No recording available for item ${itemId}`);
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  return {
    recordData,
    startRecording,
    stopRecording,
    playRecording,
  };
};

export default useRecorder;
