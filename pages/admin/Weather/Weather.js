import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
const {height} = Dimensions.get('window');
import UniqueDateController from './UniqueDate';
import moment from 'moment';
import {Root} from '@sekizlipenguen/react-native-popup-confirm-toast';
import LoadingScreen from '../../Common/LoadingScreen';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomHeader from '../CustomHeader';
const options = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
};
const Weather = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const { latLong } = route.params;
  const {weathermapReport, weathermapReportCity, IsLoading} =
    UniqueDateController();
  const [open, setopen] = useState('');
  const collapsing = date => {
    if (open != date) {
      setopen(date);
    } else {
      setopen('');
    }
  };
  const HandlerGoBack = () => {
    navigation.navigate('FarmerDashboard');
  };
  return (
    <Root>
      {/* <StatusBar translucent backgroundColor="transparent" barStyle="light-content" style={{ marginTop: StatusBar.currentHeight }} /> */}
      <View style={styles.container}>
        <CustomHeader
          path="FarmerDashboard"
          HandlerGoBack={HandlerGoBack}
          banner={true}
        />
        <ImageBackground
          source={require('../../Common/images/weather_bg.png')}
          style={styles.image}>
          {IsLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            <>
              {/* <Text style={styles.headerText}>{`${weathermapReportCity?.name}, ${weathermapReportCity?.sys?.country}`}</Text> */}
              <View style={styles.table}>
                <View style={styles.thead}>
                  {/* <Text style={[styles.text, { fontSize: 20, textAlign: 'left' }]}>{weathermapReportCity.name && 'Now'}</Text> */}
                  <Text style={styles.headerText}>
                    Weather{' '}
                    {`${weathermapReportCity?.name}, ${weathermapReportCity?.sys?.country}`}
                  </Text>
                  <View style={styles.th}>
                    <Text style={[styles.text, {fontSize: 20}]}>Now</Text>
                    <Text style={[styles.text, {fontSize: 60}]}>
                      {' '}
                      {weathermapReportCity?.main?.temp.toFixed(0)} °C
                    </Text>
                    {/* <Text style={[styles.text, { fontSize: 28 }]}>{weathermapReport[0] && `°C  ${weathermapReport[0].weather[0].main}`}</Text> */}
                  </View>
                  {/* <Text style={[styles.text, { fontSize: 20 }]}>{`${weathermapReportCity?.name}, ${weathermapReportCity?.sys?.country}`}</Text> */}
                </View>
                <View style={{height: 100}}>
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    {weathermapReport?.hourly?.map((data, index) => {
                      const new_date = new Date(data.dt * 1000)
                        .toLocaleString('en-US', options)
                        .split(' ');
                      return (
                        <View
                          key={index}
                          style={{alignItems: 'center', marginHorizontal: 10}}>
                          <Text style={styles.text}>
                            {new_date[1].split(':')[0].length == 2
                              ? new_date[1].substring(0, 5)
                              : new_date[1].substring(0, 4)}
                            {new_date[2]}
                          </Text>
                          <Image
                            source={{
                              uri: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                            }}
                            style={{width: 60, height: 50}}
                          />
                          <Text style={styles.text}>
                            {data.temp.toFixed(0)} °C{' '}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {weathermapReport?.daily?.map((data, index) => {
                    return (
                      <View key={index} style={{width: '100%'}}>
                        <TouchableOpacity
                          key={index}
                          style={styles.tbody}
                          onPress={() => {
                            collapsing(data.dt);
                          }}>
                          <Text
                            style={[styles.text, {width: '33%', fontSize: 14}]}>
                            {/* {index == 0 && 'Today'}{index == 1 && 'Tomorrow'} {index != 0 && index != 1 && days[new Date(data.dt_txt).getDay()]} */}
                            {new Date(data.dt * 1000)
                              .toUTCString()
                              .substring(-1, 11)}
                          </Text>
                          <View>
                            {/* https://openweathermap.org/img/wn/10d@2x.png */}
                            <Image
                              source={{
                                uri: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                              }}
                              style={{width: 60, height: 60}}
                            />
                          </View>
                          <Text
                            style={[styles.text, {width: '33%', fontSize: 14}]}>
                            {data.weather[0].main}
                          </Text>
                          <Text
                            style={[styles.text, {width: '33%', fontSize: 14}]}>
                            {data.temp.max.toFixed(0)}/
                            {data.temp.min.toFixed(0)}'°C'
                          </Text>
                        </TouchableOpacity>
                        {open == data.dt ? (
                          <View
                            style={{
                              marginHorizontal: '10%',
                              borderTopWidth: 1,
                              borderBlockColor: '#FFF',
                              justifyContent: 'space-between',
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                borderBottomWidth: 1,
                                borderColor: '#FFF',
                              }}>
                              <View
                                style={{
                                  width: '46%',
                                  marginHorizontal: '2%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View>
                                  <Text style={styles.text_texp}>Max Temp</Text>
                                  <Text style={styles.text_texp}>
                                    {data.temp.max.toFixed(0)} '°C'
                                  </Text>
                                </View>
                                <View style={{flexDirection: 'column'}}>
                                  <Image
                                    source={require('../../Common/images/min_temp.png')}
                                    style={{width: 40, height: 40}}
                                  />
                                </View>
                              </View>
                              <View
                                style={{
                                  borderRightWidth: 1,
                                  borderColor: '#FFF',
                                  width: 1,
                                  height: 50,
                                  marginHorizontal: 10,
                                  marginVertical: 5,
                                }}></View>
                              <View
                                style={{
                                  width: '46%',
                                  marginHorizontal: '2%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View>
                                  <Text style={styles.text_texp}>Min Temp</Text>
                                  <Text style={styles.text_texp}>
                                    {data.temp.min.toFixed(0)} '°C'
                                  </Text>
                                </View>
                                <View style={{flexDirection: 'column'}}>
                                  <Image
                                    source={require('../../Common/images/max_temp.png')}
                                    style={{width: 40, height: 40}}
                                  />
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                borderBottomWidth: 1,
                                borderColor: '#FFF',
                              }}>
                              <View
                                style={{
                                  width: '46%',
                                  marginHorizontal: '2%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View>
                                  <Text style={styles.text_texp}>Wind</Text>
                                  <Text
                                    style={
                                      styles.text_texp
                                    }>{`${data.wind_speed}`}</Text>
                                </View>
                                <View style={{flexDirection: 'column'}}>
                                  <Image
                                    source={require('../../Common/images/nnw_wind.png')}
                                    style={{width: 40, height: 40}}
                                  />
                                </View>
                              </View>
                              <View
                                style={{
                                  borderRightWidth: 1,
                                  borderColor: '#FFF',
                                  width: 1,
                                  height: 50,
                                  marginHorizontal: 10,
                                  marginVertical: 5,
                                }}></View>
                              <View
                                style={{
                                  width: '46%',
                                  marginHorizontal: '2%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View>
                                  <Text style={styles.text_texp}>Rain</Text>
                                  <Text
                                    style={
                                      styles.text_texp
                                    }>{`${data.clouds} %`}</Text>
                                </View>
                                <View style={{flexDirection: 'column'}}>
                                  <Image
                                    source={require('../../Common/images/rain.png')}
                                    style={{width: 40, height: 40}}
                                  />
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                borderBottomWidth: 1,
                                borderColor: '#FFF',
                              }}>
                              <View
                                style={{
                                  width: '46%',
                                  marginHorizontal: '2%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View>
                                  <Text style={styles.text_texp}>humidity</Text>
                                  <Text style={styles.text_texp}>
                                    {data.humidity} %
                                  </Text>
                                </View>
                                <View style={{flexDirection: 'column'}}>
                                  <Image
                                    source={require('../../Common/images/humidity.png')}
                                    style={{width: 40, height: 40}}
                                  />
                                </View>
                              </View>
                              <View
                                style={{
                                  borderRightWidth: 1,
                                  borderColor: '#FFF',
                                  width: 1,
                                  height: 50,
                                  marginHorizontal: 10,
                                  marginVertical: 5,
                                }}></View>
                              <View
                                style={{
                                  width: '46%',
                                  marginHorizontal: '2%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                <View>
                                  <Text style={styles.text_texp}>Pressure</Text>
                                  <Text style={styles.text_texp}>
                                    {data.pressure} pa
                                  </Text>
                                </View>
                                <View style={{flexDirection: 'column'}}>
                                  <Image
                                    source={require('../../Common/images/nnw_wind.png')}
                                    style={{width: 40, height: 40}}
                                  />
                                </View>
                              </View>
                            </View>
                          </View>
                        ) : (
                          ''
                        )}
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          )}
        </ImageBackground>
      </View>
    </Root>
  );
};

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
    opacity: 0.9,
  },
  headerText: {
    textAlign: 'right',
    color: '#FFF',
    fontSize: 25,
    margin: 5,
  },
  table: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  thead: {
    width: '80%',
    marginHorizontal: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  th: {
    marginHorizontal: '16%',
    flexDirection: 'row',
    // justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
  },
  text: {
    fontSize: 15,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
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
    resizeMode: 'cover',
    // justifyContent: "center"
  },
  text_texp: {
    fontSize: 13,
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
    lineHeight: 30,
  },
  loadingScreen: {
    position: 'absolute',
    top: 300,
    zIndex: 999,
    left: '45%',
  },
});
