
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Image,
  Button, TouchableOpacity
} from 'react-native';
import {
  useCameraPermission,
  useMicrophonePermission,
  useCameraDevice,
  useCameraFormat,
  Camera,
  PhotoFile,
  TakePhotoOptions,
  VideoFile,
  useCodeScanner,
  CameraProps
} from 'react-native-vision-camera';
import Reanimated, { useAnimatedProps, useSharedValue } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Video from 'react-native-video';

Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
const App = () => {
  const device = useCameraDevice('back', {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera'
    ]
  })
  const zoom = useSharedValue(device.neutralZoom)
  const format = useCameraFormat(device, [
    { videoAspectRatio: 16 / 9 },
    { videoResolution: { width: 3048, height: 2160 } },
    { fps: 60 }
  ])
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      console.log(`Scanned ${codes.length} codes!`);
      console.log(codes[0]);
    },
  });

  const { hasPermission, requestPermission } = useCameraPermission();
  const {
    hasPermission: microphonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  const [isActive, setIsActive] = useState(false);
  const [flash, setFlash] = useState('off');
  const [isRecording, setIsRecording] = useState(false);

  const [photo, setPhoto] = useState();
  const [video, setVideo] = useState();

  const camera = useRef(null);

  const [mode, setMode] = useState('camera');

  useEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, [])
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }

    if (!microphonePermission) {
      requestMicrophonePermission();
    }
  }, [hasPermission, microphonePermission]);

  const onTakePicturePressed = async () => {
    if (isRecording) {
      camera.current?.stopRecording();
      return;
    }

    const photo = await camera.current?.takePhoto({
      flash,
    });
    setPhoto(photo);
  };

  const onStartRecording = async () => {
    if (!camera.current) {
      return;
    }
    setIsRecording(true);
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
  };

  const uploadPhoto = async () => {
    if (!photo) {
      return;
    }

    const result = await fetch(`file://${photo.path}`);
    const data = await result.blob();
    // console.log(data);
    // upload data to your network storage (ex: s3, supabase storage, etc)
  };

  if (!hasPermission || !microphonePermission) {
    return <ActivityIndicator />;
  }

  if (!device) {
    return <Text>Camera device not found</Text>;
  }
  console.log('QR camer: ', mode === 'qr' && isActive && !photo && !video);
  return (
    <View style={{ flex: 1 }}>

      {mode === 'qr' ? (
        <Camera
          device={device}
          codeScanner={codeScanner}
          style={StyleSheet.absoluteFill}
          isActive={mode === 'qr' && isActive && !photo && !video}
        />
      ) : (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive && !photo && !video && mode === 'camera'}
          photo={true}
          video={true}
          audio={true}
          format={format}
        />
      )}

      {video && (
        <>
          <Video
            style={StyleSheet.absoluteFill}
            source={{
              uri: video.path,
            }}
            useNativeControls
            isLooping
          />
        </>
      )}

      {photo && (
        <>
          <Image source={{ uri: photo.path }} style={StyleSheet.absoluteFill} />
          <Text>sdfsdfdf</Text>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.40)',
            }}
          >
            <Button title="Upload" onPress={uploadPhoto} />
          </View>
        </>
      )}

      {!photo && !video && (
        <>
          <View
            style={{
              position: 'absolute',
              right: 10,
              top: 50,
              padding: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(0, 0, 0, 0.40)',
              gap: 30,
            }}
          >
            <TouchableOpacity onPress={() =>
              setFlash((curValue) => (curValue === 'off' ? 'on' : 'off'))
            }>
              <Text>{flash}</Text>
            </TouchableOpacity>

          </View>

          <Pressable
            onPress={onTakePicturePressed}
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
      )}
    </View>
  );
};

export default App;
