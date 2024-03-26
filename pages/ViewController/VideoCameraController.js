
import React, { useState, useEffect } from 'react'
import { onBackPress } from '../Common/BackPressHandler';
import { useNavigation } from '@react-navigation/native';
const VideoCameraController = (farmeruserID, agri_land_user_rels) => {
    const navigation = useNavigation();
    const [isRecording, setIsRecording] = useState(false);
    const [video, setVideo] = useState({});

    return {
        isRecording,
        setVideo,
        setIsRecording,
        video
    }
}
export default VideoCameraController