
import { useEffect, useState } from 'react';
import { openweathermapAPI, dataserviceAPI, accuweatherAPI, openweathermapLocation } from './openweathermapAPI';
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
            dataservice,
            openweathermapLocation_res
        ] = await Promise.all([
            openweathermapAPI(latitude, longitude),
            dataserviceAPI(latitude, longitude),
            openweathermapLocation(latitude, longitude)
        ]);
        // if (dataservice?.status == 200) {
        //     const accuweather_res = await accuweatherAPI(dataservice.data.Key);
        //     if (accuweather_res?.status == 200) {
        //         setAccuweatherReport(accuweather_res.data)
        //     }
        // }
        if (openweathermap?.status == 200) {
            setWeathermapReport(openweathermap.data);
        }
        if (openweathermapLocation_res?.status == 200) {
            setWeathermapReportCity(openweathermapLocation_res.data)
        }
        setIsLoading(false);
    }
    useEffect(() => {
        onPageload();
    }, [])
    return {
        weathermapReport,
        accuweatherReport,
        IsLoading,
        weathermapReportCity
    };
};
export default UniqueDateController;
