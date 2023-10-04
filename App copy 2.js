import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import  AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const recorderPlayer = new AudioRecorderPlayer();

const App = () => {

  const documentDirectory = RNFS.DocumentDirectoryPath;
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      const filePath = `${documentDirectory}/recording_${Date.now()}.mp3`;
      await recorderPlayer.startRecorder(filePath);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await recorderPlayer.stopRecorder();
      setIsRecording(false);

      // Add the recorded file to the list with a timestamp
      setRecordings([...recordings, { filePath: result, timestamp: new Date() }]);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const renderRecordedItems = ({ item }) => (
    <View>
      <Text>{item.timestamp.toLocaleString()}</Text>
      <Text>{item.filePath}</Text>
    </View>
  );


  return (
    <View>
      <Button title={isRecording ? 'Stop Recording' : 'Start Recording'} onPress={isRecording ? stopRecording : startRecording} />
      <FlatList
        data={recordings}
        renderItem={renderRecordedItems}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  )
}

export default App


