import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { AudioRecorderPlayer, AudioUtils } from 'react-native-audio-recorder-player';

const recorderPlayer = new AudioRecorderPlayer();

//test code 2
const App = () => {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {

      const initialFileName = 'recording.mp3';


      await recorderPlayer.startRecorder(
        `${AudioUtils.DocumentDirectoryPath}/${initialFileName}`
      );

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };


  return (
    <View>
      <Text style={{ padding: 20 }} onPress={startRecording}>startRecording</Text>
      <Text style={{ padding: 20 }} onPress={stopRecording}>stopRecording</Text>
      <Text style={{ padding: 20 }} onPress={startPlayback}>startPlayback</Text>
      <Text style={{ padding: 20 }} onPress={stopPlayback}>stopPlayback</Text>
    </View>
  )
}

export default App

const styles = StyleSheet.create({})
