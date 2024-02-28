import axios from 'axios';
export const openweathermapAPI = async (latitude, longitude) => {
    try {
        const openweathermap_res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=ab4f63e8f8f932fb9a541694ffde64bd&units=metric`);
        // const openweathermap_res = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=ab4f63e8f8f932fb9a541694ffde64bd`);
        return openweathermap_res;
    } catch (error) {
        return error.response;
    }
}
export const dataserviceAPI = async (latitude, longitude) => {
    try {
        const openweathermap_res = await axios.get(`https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=gSAnNHGH5TmIYQguWXTytBHGyYTwW0NL&q=${latitude},${longitude}`);
        return openweathermap_res;
    } catch (error) {
        return error.response;
    }
}
export const accuweatherAPI = async (key) => {
    try {
        const accuweather_res = await axios.get(`http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${key}?apikey=gSAnNHGH5TmIYQguWXTytBHGyYTwW0NL&metric=true`);
        return accuweather_res;
    } catch (error) {
        return error.response;
    }
}




// http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/3182646?apikey=gSAnNHGH5TmIYQguWXTytBHGyYTwW0NL&metric=true