import React, { useState, useEffect } from 'react'
import DeviceInfo from 'react-native-device-info';
import NetInfo from "@react-native-community/netinfo";
const index = () => {
    const [GPSStatus, setGPSStatus] = useState("");
    const [netConnection, setNetConnection] = useState("")
    const GPS = () => {
        DeviceInfo.getAvailableLocationProviders().then((providers) => {
            setGPSStatus(providers.gps)
        });
    }
    const MobileNetWork = () => {
        return NetInfo.addEventListener(state => {
            setNetConnection(state.isConnected);
        });
    }
    useEffect(() => {
        const unsubscribe = MobileNetWork();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [])
    return {
        GPS,
        GPSStatus,
        MobileNetWork,
        netConnection
    }
}
export default index;