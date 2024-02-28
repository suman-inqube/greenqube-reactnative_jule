
import { useEffect, useState } from 'react';
import { openweathermapAPI, dataserviceAPI, accuweatherAPI } from './openweathermapAPI';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert'
import { getItem } from '../../../config/getDataFromStorage';
const UniqueDateController = () => {
    const [weathermapReport, setWeathermapReport] = useState([]);
    const [weathermapReportCity, setWeathermapReportCity] = useState([]);
    const [accuweatherReport, setAccuweatherReport] = useState([]);
    const [IsLoading, setIsLoading] = useState(false);
    const onPageload = async () => {
        const { latitude, longitude } = await getItem('fusedLocation');
        setIsLoading(true);
        const [openweathermap,
            dataservice
        ] = await Promise.all([
            openweathermapAPI(latitude, longitude),
            dataserviceAPI(latitude, longitude)
        ]);
        if (dataservice.status == 200) {
            const accuweather_res = await accuweatherAPI(dataservice.data.Key);
            if (accuweather_res.status == 200) {
                setAccuweatherReport(accuweather_res.data)
            }
        }
        if (openweathermap.status == 200) {
            setWeathermapReportCity(openweathermap.data.city)
            setWeathermapReport(openweathermap.data.list);
            const array = [];
            openweathermap.data.list.map((date, index) => {
                if (!array.some(cred => cred.dt_txt.slice(0, 10) === date.dt_txt.slice(0, 10))) {
                    array.push(date);
                }
            })
            setWeathermapReport(array);
            setIsLoading(false);
        }
    }
    useEffect(() => {
        onPageload();
    }, [])
    return {
        weathermapReport,
        accuweatherReport,
        IsLoading,
        weathermapReportCity,
    };
};

export default UniqueDateController;
