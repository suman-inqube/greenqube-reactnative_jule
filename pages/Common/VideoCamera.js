
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
const CameraScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { farmeruserID, agri_land_user_rels } = route.params;
    const { isRecording, setVideo, setIsRecording } = VideoCameraController(farmeruserID, agri_land_user_rels);
    const device = useCameraDevice('back', {
        physicalDevices: ['ultra-wide-angle-camera'],
    });
    const camera = useRef(null);
    const onStartRecording = async () => {
        if (!camera.current) {
            return;
        }
        setIsRecording(true);
        if (isRecording == false) {
            camera.current.startRecording({
                onRecordingFinished: (video) => {
                    setIsRecording(false);
                    setVideo(video);
                    navigation.navigate("livehood", { farmeruserID: farmeruserID, agri_land_user_rels: agri_land_user_rels, video: video })
                },
                onRecordingError: (error) => {
                    console.error(error);
                    setIsRecording(false);
                },
            });
        } else {
            camera.current?.stopRecording();
        }
    };
    if (!device) {
        return <Text>Camera device not found</Text>;
    }
    return (
        <View style={{ flex: 1 }}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                // photo
                video
                audio
            />
            <>
                <Pressable
                    onPress={onStartRecording}
                    onLongPress={onStartRecording}
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
