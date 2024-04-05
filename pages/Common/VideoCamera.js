
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    Pressable,
    Image,
    Button,
} from 'react-native';
import {
    useCameraPermission,
    useMicrophonePermission,
    useCameraDevice,
    Camera,
    PhotoFile,
    TakePhotoOptions,
    VideoFile,
    useCodeScanner,
} from 'react-native-vision-camera';
import Video from 'react-native-video';
import VideoCameraController from '../ViewController/VideoCameraController';
import { useRoute, useNavigation } from '@react-navigation/native';
const CameraScreen = ({ recordingDuration, plotVideo, camera, isRecording, onStartRecording, setRecordingDuration }) => {
    const device = useCameraDevice('back', {
        physicalDevices: ['ultra-wide-angle-camera'],
    });
    if (!device) {
        return <Text>Camera device not found</Text>;
    }
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prevDuration => prevDuration + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => {
            clearInterval(interval);
        };
    }, [isRecording]);
    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(
            remainingSeconds,
        ).padStart(2, '0')}`;
    };
    return (
        <View style={{ flex: 1 }}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                // photo
                video
            // audio
            />
            <>
                {isRecording ? (
                    <View style={styles.recordingTimer}>
                        <Text style={{ color: 'white' }}>{formatTime(recordingDuration)}</Text>
                    </View>
                ) : null}
                <Pressable
                    onPress={() => onStartRecording(plotVideo.id, 'userList')}
                    onLongPress={() => onStartRecording(plotVideo.id, 'userList')}
                    style={{
                        position: 'absolute',
                        alignSelf: 'center',
                        bottom: 50,
                        width: 75,
                        height: 75,
                        backgroundColor: isRecording ? 'red' : 'white',
                        borderRadius: 75,
                    }}
                />
            </>
        </View>
    );
};
export default CameraScreen;
const styles = StyleSheet.create({
    recordingTimer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 40,
        fontSize: 15,
        padding: 10,
        backgroundColor: 'red',
        elevation: 10,
        position: 'absolute',
        bottom: 150,
        borderRadius: 25,
    }
})
