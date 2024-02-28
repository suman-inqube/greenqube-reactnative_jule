
import axios from 'axios';
export const openweathermapAPI = async (latitude, longitude) => {
    try {
        const openweathermap_res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=ab4f63e8f8f932fb9a541694ffde64bd&units=metric`);
        // const openweathermap_res = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=ab4f63e8f8f932fb9a541694ffde64bd`);
        return openweathermap_res;
    } catch (error) {
        return  error.response;
    }
}