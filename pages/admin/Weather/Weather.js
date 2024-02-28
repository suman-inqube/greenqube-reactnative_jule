import { StyleSheet, Text, View, Image, Dimensions, FlatList, TouchableOpacity, ImageBackground, ScrollView, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
const { width, height } = Dimensions.get('window');
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
import { openweathermapAPI } from './openweathermapAPI';
import Geolocation from '@react-native-community/geolocation';
const todayDate = new Date().toISOString().slice(0, 10);
import UniqueDateController from './UniqueDate';
import moment from "moment";
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { AlertMesg } from '../../Common/ToastAlert'
import LoadingScreen from '../../Common/LoadingScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
const Weather = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // const { latLong } = route.params;
    const { weathermapReport, accuweatherReport, weathermapReportCity, IsLoading } = UniqueDateController();
    const [open, setopen] = useState("");
    const collapsing = (date) => {
        if (open != date) {
            setopen(date);
        } else {
            setopen("");
        }
    }
    const HandlerGoBack = () => {
        navigation.navigate('FarmerDashboard');
    }
    return (
        <Root>
            {/* <StatusBar translucent backgroundColor="transparent" barStyle="light-content" style={{ marginTop: StatusBar.currentHeight }} /> */}
            <View style={styles.container}>
                <CustomHeader path="FarmerDashboard" HandlerGoBack={HandlerGoBack} banner={true} />
                <ImageBackground source={require('../../Common/images/weather_bg.png')} style={styles.image}>
                    {IsLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : <>
                        <Text style={styles.headerText}>{weathermapReportCity.name && 'weather'} {weathermapReportCity.name}  {weathermapReportCity.country}</Text>
                        <View style={styles.table}>
                            <View style={styles.thead}>
                                <Text style={[styles.text, { fontSize: 20, textAlign: 'left' }]}>{weathermapReportCity.name && 'Now'}</Text>
                                <View style={styles.th}>
                                    <Text style={[styles.text, { fontSize: 60 }]}>{weathermapReport[0] && weathermapReport[0].main.temp_max}</Text>
                                    <Text style={[styles.text, { fontSize: 28 }]}>{weathermapReport[0] && `°C  ${weathermapReport[0].weather[0].main}`}</Text>
                                </View>
                                <Text style={styles.text}>{weathermapReport[0] && moment(weathermapReport[0].dt_txt).utc().format('MMMM Do YYYY')}</Text>
                            </View>
                            <View style={{ height: 100 }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {
                                        accuweatherReport.map((data, index) => {
                                            const dataSplit = data.DateTime.split('T');
                                            return (
                                                <View key={index} style={{ padding: 10 }}>
                                                    <Text style={styles.text}>{dataSplit[1].substring(0, 4)}{dataSplit[1].substring(0, 2) < 12 ? 'AM' : 'PM'}</Text>
                                                    <Image source={{
                                                        uri: `https://weather.ls.hereapi.com/static/weather/icon/${data.WeatherIcon}.png`
                                                    }} style={{ width: 60, height: 60 }} />
                                                    <Text style={styles.text}>{data.Temperature.Value} °{data.Temperature.Unit}</Text>
                                                </View>
                                            )
                                        })
                                    }
                                </ScrollView>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {
                                    weathermapReport.map((data, index) => {
                                        // console.log(data.main.temp_max.toFixed(0))
                                        // console.log("***")
                                        // console.log(data.main.temp_min.toFixed(0))
                                        return (
                                            <View key={index} style={{ width: '100%' }}>
                                                <TouchableOpacity key={index} style={styles.tbody} onPress={() => { collapsing(days[new Date(data.dt_txt).getDay()]) }}>
                                                    <Text style={[styles.text, { width: '33%', fontSize: 14 }]}>
                                                        {index == 0 && 'Today'}{index == 1 && 'Tomorrow'} {index != 0 && index != 1 && days[new Date(data.dt_txt).getDay()]}
                                                    </Text>
                                                    <View>
                                                        <Image source={{
                                                            uri: `http://openweathermap.org/img/w/${data.weather[0].icon}.png`
                                                        }} style={{ width: 60, height: 60 }} />
                                                    </View>
                                                    <Text style={[styles.text, { width: '33%', fontSize: 14 }]}>{data.weather[0].main}</Text>
                                                    <Text style={[styles.text, { width: '33%', fontSize: 14 }]}>{data.main.temp_max}/{(data.main.temp_min - 1).toFixed(2)}'°C'</Text>
                                                </TouchableOpacity>
                                                {
                                                    open == days[new Date(data.dt_txt).getDay()] ?
                                                        <View style={{ marginHorizontal: '10%', borderTopWidth: 1, borderBlockColor: '#FFF', justifyContent: 'space-between' }}>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#FFF' }}>
                                                                <View style={{ width: '46%', marginHorizontal: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <View >
                                                                        <Text style={styles.text_texp}>Max Temp</Text>
                                                                        <Text style={styles.text_texp}>{data.main.temp_max} '°C'</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'column' }}>
                                                                        <Image source={require('../../Common/images/min_temp.png')} style={{ width: 40, height: 40 }} />
                                                                    </View>
                                                                </View>
                                                                <View style={{ borderRightWidth: 1, borderColor: '#FFF', width: 1, height: 50, marginHorizontal: 10, marginVertical: 5 }}></View>
                                                                <View style={{ width: '46%', marginHorizontal: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <View>
                                                                        <Text style={styles.text_texp}>Min Temp</Text>
                                                                        <Text style={styles.text_texp}>{(data.main.temp_min - 1).toFixed(2)} '°C'</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'column' }}>
                                                                        <Image source={require('../../Common/images/max_temp.png')} style={{ width: 40, height: 40 }} />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#FFF' }}>
                                                                <View style={{ width: '46%', marginHorizontal: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <View>
                                                                        <Text style={styles.text_texp}>Wind</Text>
                                                                        <Text style={styles.text_texp}>{`${data.wind.speed}`}</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'column' }}>
                                                                        <Image source={require('../../Common/images/nnw_wind.png')} style={{ width: 40, height: 40 }} />
                                                                    </View>
                                                                </View>
                                                                <View style={{ borderRightWidth: 1, borderColor: '#FFF', width: 1, height: 50, marginHorizontal: 10, marginVertical: 5 }}></View>
                                                                <View style={{ width: '46%', marginHorizontal: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <View>
                                                                        <Text style={styles.text_texp}>Rain</Text>
                                                                        <Text style={styles.text_texp}>{`${data.clouds.all} %`}</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'column' }}>
                                                                        <Image source={require('../../Common/images/rain.png')} style={{ width: 40, height: 40 }} />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#FFF' }}>
                                                                <View style={{ width: '46%', marginHorizontal: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <View>
                                                                        <Text style={styles.text_texp}>humidity</Text>
                                                                        <Text style={styles.text_texp}>{data.main.humidity} %</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'column' }}>
                                                                        <Image source={require('../../Common/images/humidity.png')} style={{ width: 40, height: 40 }} />
                                                                    </View>
                                                                </View>
                                                                <View style={{ borderRightWidth: 1, borderColor: '#FFF', width: 1, height: 50, marginHorizontal: 10, marginVertical: 5 }}></View>
                                                                <View style={{ width: '46%', marginHorizontal: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <View>
                                                                        <Text style={styles.text_texp}>Pressure</Text>
                                                                        <Text style={styles.text_texp}>{data.main.pressure} pa</Text>
                                                                    </View>
                                                                    <View style={{ flexDirection: 'column' }}>
                                                                        <Image source={require('../../Common/images/nnw_wind.png')} style={{ width: 40, height: 40 }} />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View> : ""
                                                }

                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    </>}
                </ImageBackground>
            </View>
        </Root>
    )
}

export default Weather;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center'

    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // or 'stretch'
        position: 'absolute',
        height: height,
        // backgroundColor: 'transparent',
        backgroundColor: '#000',
        opacity: 0.9
    },
    headerText: {
        textAlign: 'right',
        color: '#FFF',
        fontSize: 25,
        margin: 10,
        marginTop: 40
    },
    table: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    thead: {
        width: '80%',
        marginHorizontal: 'auto'
    },
    th: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    text: {
        fontSize: 15,
        color: '#FFF',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular'
    },
    tbody: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginHorizontal: '5%',
        // borderWidth: 5,
        // marginVertical: 10
    },
    image: {
        flex: 1,
        resizeMode: "cover",
        // justifyContent: "center"
    },
    text_texp: {
        fontSize: 13,
        color: '#FFF',
        fontFamily: 'Poppins-Regular',
        lineHeight: 30
    },
    loadingScreen: {
        position: 'absolute',
        top: 300,
        zIndex: 999,
        left: '45%'
    },
})