import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
// import { AudioRecorderPlayer } from 'react-native-audio-recorder-player';


const App = () => {
  const audioRecorderPlayer = new AudioRecorderPlayer();
  // const checkFun = () => {
  //   // Define the desired file name and path
  //   const fileName = 'my_custom_audio.mp3'; // Change this to your desired file name
  //   const filePath = `/path/to/save/${fileName}`; // Change this to your desired file path

  //   // Start recording with the custom file name and path
  //   const onStartRecording = async () => {
  //     try {
  //       const data=await audioRecorderPlayer.startRecorder(filePath);
  //       console.log(data)
  //     } catch (error) {
  //       console.error('Recording error:', error);
  //     }
  //   };

  //   // Example usage
  //   onStartRecording();
  // }
  // const audioRecorderPlayer = new AudioRecorderPlayer();
  const startRecording = async () => {
    const result = await audioRecorderPlayer.startRecorder();
    console.log('adsadad'.result)
    if (result) {
      console.log('Recording started');
    } else {
      console.log('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    if (result) {
      console.log('Recording stopped. File saved at:', result);
    } else {
      console.log('Failed to stop recording');
    }
  };
  const startPlayback = async (audioFile) => {
    // console.log(audioFile)
    const result = await audioRecorderPlayer.startPlayer();
    if (result) {
      console.log('Playback started');
    } else {
      console.log('Failed to start playback');
    }
  };

  const stopPlayback = async () => {
    const result = await audioRecorderPlayer.stopPlayer();
    if (result) {
      console.log('Playback stopped');
    } else {
      console.log('Failed to stop playback');
    }
  };
  return (
    <View>
      <Text style={{ padding: 20 }} onPress={startRecording}>startRecording</Text>
      <Text style={{ padding: 20 }} onPress={stopRecording}>stopRecording</Text>
      <Text style={{ padding: 20 }} onPress={startPlayback}>startPlayback</Text>
      <Text style={{ padding: 20 }} onPress={stopPlayback}>stopPlayback</Text>

{/* <Text style={{ padding: 20 }} onPress={checkFun}>startRecording</Text> */}



    </View>
  )
}

export default App

const styles = StyleSheet.create({})