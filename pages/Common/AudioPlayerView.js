import { StyleSheet, View } from 'react-native'
import React from 'react'
import { AudioPlayer } from 'react-native-simple-audio-player';
const AudioPlayerView = ({ path }) => {
    return (
        <View style={{ flex: 1, backgroundColor: '#313131', justifyContent: 'center' }}>
            <AudioPlayer url={path} autoPlay={true} />
        </View>
    )
}

export default AudioPlayerView

const styles = StyleSheet.create({})