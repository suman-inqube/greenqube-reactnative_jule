import axios from 'axios';
export const openweathermapAPI = async (latitude, longitude) => {
    try {
        const openweathermap_res = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=ab4f63e8f8f932fb9a541694ffde64bd&units=metric`);
        // const openweathermap_res = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=ab4f63e8f8f932fb9a541694ffde64bd`);
        // https://openweathermap.org/data/2.5/onecall?lat=22.3&lon=87.9167&units=metric&appid=439d4b804bc8187953eb36d2a8c26a02
        return openweathermap_res;
    } catch (error) {
        return error.response;
    }
}
export const openweathermapLocation = async (latitude, longitude) => {
    try {
        const openweathermapLocation = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=ab4f63e8f8f932fb9a541694ffde64bd&units=metric`);
        return openweathermapLocation;
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