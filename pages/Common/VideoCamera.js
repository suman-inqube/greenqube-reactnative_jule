
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
const CameraScreen = () => {
    const device = useCameraDevice('back', {
        physicalDevices: ['ultra-wide-angle-camera'],
    });
    const [isActive, setIsActive] = useState(true);
    const [flash, setFlash] = useState('off');
    const [isRecording, setIsRecording] = useState(false);
    const [photo, setPhoto] = useState();
    const [video, setVideo] = useState();
    const camera = useRef(null);
    const [mode, setMode] = useState('camera');
    const onStartRecording = async () => {
        if (!camera.current) {
            return;
        }
        setIsRecording(true);
        if (isRecording == false) {
            camera.current.startRecording({
                flash: flash === 'on' ? 'on' : 'off',
                onRecordingFinished: (video) => {
                    console.log(video);
                    setIsRecording(false);
                    setVideo(video);
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
                photo
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
