import React, {useState, useEffect, useContext} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  Linking,
  Image,
} from 'react-native';
import PlotMap from './PlotMap';
import FilterModal from './FilterModal';
import {userCreateContext} from '../../Context/usersCreateContext';

import {getHighAccuracyLocation} from '../../utils/getHighAccuracyLocation';
import {getDistance} from 'geolib';
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import {SafeAreaView} from 'react-native-safe-area-context';
const PlotWiseMap = () => {
  const navigation = useNavigation();

  const {
    coords,
    startWatchingLocation,
    stopWatchingLocation,
    CustomHeader,
    logoImage,
    topBanner,
    loginUser_data,
    t,
    getItem,
    Root,
  } = useContext(userCreateContext);
  const {carbonFlag} = loginUser_data;
  const {dbname, lan_id, token, user_id, FcmUserToken, owner} = loginUser_data;
  const [polygons, setPolygons] = useState([]);
  const [baseLatLong, setBaseLatLong] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [plotData, setPlotData] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [regionaldatas, setregionaldatas] = useState({
    state: '',
    district: '',
    block: '',
  });

  const loadStates = async () => {
    const response = await axiosGet(ROUTES.GET.STATE_API(), '', {
      information: `${dbname},${lan_id}`,
    });

    if (response?.status === 200) {
      const data = response.data.data.rows.map(item => ({
        label: item.state_name,
        value: item.id,
      }));
      setStates(data);
    }
  };

  const loadDistricts = async state => {
    const response = await axiosGet(
      ROUTES.GET.DISTRICT_API({stateID: state.value}),
      '',
      {information: `${dbname},${lan_id}`},
    );
    if (response?.status === 200) {
      const data = response.data.data.rows.map(item => ({
        label: item.district_name,
        value: item.id,
      }));
      setDistricts(data);
    }
  };

  const loadPanchayats = async district => {
    const response = await axiosGet(
      ROUTES.GET.BLOCK_API({districtID: district.value}),
      '',
      {information: `${dbname},${lan_id}`},
    );

    if (response?.status === 200) {
      const data = response.data.data.rows.map(item => ({
        label: item.subdiv_name,
        value: item.id,
      }));
      setPanchayats(data);
    }
  };

  useEffect(() => {
    startWatchingLocation();

    return () => {
      stopWatchingLocation();
    };
  }, []);
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const state = await getItem('state');
        const district = await getItem('district');
        const block = await getItem('block');

        setregionaldatas({
          state,
          district,
          block,
        });
        let lat = coords?.latitude;
        let lon = coords?.longitude;

        if (!lat || !lon || lat === '' || lon === '') {
          const highAcc = await getHighAccuracyLocation();
          lat = highAcc.latitude;
          lon = highAcc.longitude;
        }

        setBaseLatLong({
          latitude: lat,
          longitude: lon,
        });
      } catch (err) {
        console.log('Location error:', err);
      }
    };

    loadLocation();
  }, []);

  const getCenter = plots => {
    if (plots.length === 0) return baseLatLong;

    const lat = plots.reduce((sum, p) => sum + p.center_lat, 0) / plots.length;

    const lng = plots.reduce((sum, p) => sum + p.center_lng, 0) / plots.length;

    return {
      latitude: lat,
      longitude: lng,
    };
  };
  const applyFilter = async filters => {
    if (filters.isClear) {
      setIsFilterApplied(false);

      setBaseLatLong({
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });

      // nearby plots reload
      loadNearbyPlots();

      return;
    }
    setIsFilterApplied(true);

    const res = await axiosGet(
      ROUTES.GET.PLOT_VIEW_MAP({
        state: filters.state?.value,
        district: filters.district?.value,
        subdivision: filters.panchayats.map(p => p.value),
        createdBy: user_id,
        latitude: '',
        longitude: '',
        distance: '',
      }),
      token,
      {information: `${dbname}`},
    );

    if (res?.status == 200) {
      console.log('res', JSON.stringify(res));
      if (res?.data?.data?.rows?.length > 0) {
        setBaseLatLong({
          latitude: res?.data?.data?.rows[0]?.landLatLong[0]?.latitude,
          longitude: res?.data?.data?.rows[0]?.landLatLong[0]?.longitude,
        });
      }
      const formattedData = transformData(res);
      setPlotData(formattedData);
      setPolygons(formatPolygonsForMap(formattedData, null));
    }
  };

  const formatPolygonsForMap = (plots, selected) => {
    return plots.map(p => ({
      id: p.id,
      // farmerName: p.farmerName,
      // panchayat: p.panchayat,
      // district: p.district,
      isSelected: selected?.id === p.id,
      coordinates: p.coordinates.map(c => ({
        latitude: c.lat,
        longitude: c.lng,
      })),
    }));
  };

  const transformData = apiResponse => {
    return apiResponse?.data?.data?.rows?.map((item, index) => {
      const coordinates =
        item.landLatLong
          ?.filter(c => c.latitude && c.longitude)
          .map(c => ({
            lat: c.latitude,
            lng: c.longitude,
          })) || [];

      return {
        id: item.rel_id,
        farmer_id: item.user_id,

        plotName: item.plot_no ? `${item.plot_no}` : `unknown`,
        landSize: item.land_convert_size || '0',
        land_unit_id: item.land_unit_id,
        center_lat: coordinates[0]?.lat || null,
        center_lng: coordinates[0]?.lng || null,
        // district: item.landUsrAdd?.district || 'N/A',
        // panchayat: item.landUsrAdd?.subdivision || 'N/A',
        coordinates: coordinates,
      };
    });
  };
  useEffect(() => {
    if (!baseLatLong?.latitude) return;

    if (!isFilterApplied) {
      loadNearbyPlots();
    }
  }, [baseLatLong]);
  useEffect(() => {
    if (coords?.latitude && coords?.longitude && !isFilterApplied) {
      setBaseLatLong({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }
  }, [coords]);
  const loadNearbyPlots = async () => {
    try {
      const response = await axiosGet(
        ROUTES.GET.PLOT_VIEW_MAP({
          lat: baseLatLong.latitude,
          lng: baseLatLong.longitude,
          createdBy: user_id,
        }),
        token,
        {information: `${dbname}`},
      );
      if (response?.status === 200) {
        console.log('response1', response);
        // const formattedData = transformData(response);
        console.log('formattedData', formattedData);
        // 🔥 500m FILTER
        // const nearbyPlots = formattedData.filter(plot => {
        //   if (!plot.center_lat || !plot.center_lng) return false;

        //   const distance = getDistance(
        //     {
        //       latitude: baseLatLong.latitude,
        //       longitude: baseLatLong.longitude,
        //     },
        //     {
        //       latitude: plot.center_lat,
        //       longitude: plot.center_lng,
        //     },
        //   );

        //   return distance <= 90000;
        // });
        // console.log('nearbyPlots', nearbyPlots);
        // setPlotData(nearbyPlots);
        // setPolygons(formatPolygonsForMap(nearbyPlots, null));
        const formattedData = transformData(response);
        setPlotData(formattedData);
        setPolygons(formatPolygonsForMap(formattedData, null));
      }
    } catch (err) {
      console.log('Nearby error:', err);
    }
  };
  const handlePolygonPress = async polygon => {
    try {
      const found = plotData.find(p => p.id === polygon.id);

      if (found) {
        const farmerDetails = await axiosGet(
          ROUTES.GET.PLOT_MAP_DETAILS({
            user_id: found.farmer_id,
            land_unit_id: found.land_unit_id,
          }),
          token,
          {information: `${dbname}`},
        );
        if (farmerDetails?.status == 200) {
          const userData = farmerDetails?.data?.data?.userData;
          const unitData = farmerDetails?.data?.data?.unitData;
          const district =
            farmerDetails?.data?.data?.userData?.userAdd?.districtDetails
              ?.district_name;
          const subDivision =
            farmerDetails?.data?.data?.userData?.userAdd?.subDivDetails
              ?.subdiv_name;

          const updatedFound = {
            ...found,
            userName: userData?.userName,
            contactNumber: userData?.contactNumber,
            unit_sname: unitData?.unit_sname,
            district: district,
            subDivision: subDivision,
          };

          setSelectedPlot(updatedFound);

          setPolygons(formatPolygonsForMap(plotData, updatedFound));
        }
      }
    } catch (error) {
      console.log('errorrrrr', error);
    }
  };
  const HandlerGoBack = () => {
    navigation.navigate('Dashboard');
  };
  const openFilter = () => {
    setShowFilterModal(true); // 🚀 instant open

    // 🔥 background API call
    if (states.length === 0) {
      loadStates();
    }
  };
  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
      <Root>
        <MyErrorBoundary>
          <View style={{flex: 1}}>
            <CustomHeader
              path="Dashboard"
              HandlerGoBack={HandlerGoBack}
              logoImage={logoImage}
              topBanner={topBanner}
            />
            <PlotMap
              polygons={polygons}
              center={baseLatLong}
              onPolygonPress={handlePolygonPress}
              onOpenFilter={openFilter}
              showRadius={!isFilterApplied}
            />
            {selectedPlot && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 15,
                  right: 15,
                  backgroundColor: '#FFFFFF',
                  padding: 18,
                  borderRadius: 12,
                  elevation: 10,
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  // marginTop: 10,
                }}>
                {/* ❌ CLOSE */}
                <TouchableOpacity
                  onPress={() => setSelectedPlot(null)}
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 2,
                    marginBottom: 10,
                  }}>
                  <MaterialIcons name="close" size={25} color="#EF4444" />
                </TouchableOpacity>

                {/* 👨 FARMER + PHONE */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                    marginTop: 15,
                  }}>
                  {/* LEFT SIDE */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}>
                    <MaterialIcons name="person" size={22} color="#16A34A" />
                    <View style={{marginLeft: 10}}>
                      <Text style={{fontSize: 12, color: '#6B7280'}}>
                        Farmer
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#111827',
                        }}>
                        {selectedPlot.userName}
                      </Text>
                    </View>
                  </View>

                  {/* RIGHT SIDE PHONE */}
                  <TouchableOpacity
                    onPress={() => {
                      Linking.openURL(`tel:${selectedPlot.contactNumber}`);
                    }}
                    style={{alignItems: 'flex-end'}}>
                    <MaterialIcons name="phone" size={20} color="#2563EB" />

                    <Text style={{fontSize: 14, color: '#2563EB'}}>
                      {' '}
                      {selectedPlot.contactNumber}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 🌱 PLOT + SIZE */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* <MaterialIcons name="landscape" size={20} color="#16A34A" /> */}
                    <Image
                      source={require('../../Common/images/management.png')}
                      style={{width: 20, height: 20}}
                      resizeMode="contain"
                    />

                    <View style={{marginLeft: 10}}>
                      <Text style={{fontSize: 12, color: '#6B7280'}}>
                        Plot Name
                      </Text>
                      <Text style={{fontSize: 14, fontWeight: '500'}}>
                        {selectedPlot.plotName}
                      </Text>
                    </View>
                  </View>

                  <View style={{alignItems: 'flex-end'}}>
                    <Text style={{fontSize: 12, color: '#6B7280'}}>Area</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#16A34A',
                      }}>
                      {selectedPlot.landSize} {selectedPlot.unit_sname}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}>
                  {/* DISTRICT */}
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons
                      name="location-city"
                      size={20}
                      color="#F59E0B"
                    />
                    <View style={{marginLeft: 10}}>
                      <Text style={{fontSize: 12, color: '#6B7280'}}>
                        {regionaldatas.district == ''
                          ? t('pre_district_county')
                          : t(`${regionaldatas.district}`)}
                      </Text>
                      <Text style={{fontSize: 14, fontWeight: '500'}}>
                        {selectedPlot.district}
                      </Text>
                    </View>
                  </View>

                  {/* PANCHAYAT */}
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons name="place" size={20} color="#DC2626" />
                    <View style={{marginLeft: 10, alignItems: 'flex-end'}}>
                      <Text style={{fontSize: 12, color: '#6B7280'}}>
                        {regionaldatas.block == ''
                          ? t('select_block_sub_county_upzila')
                          : t(`${regionaldatas.block}`)}
                      </Text>
                      <Text style={{fontSize: 14, fontWeight: '500'}}>
                        {selectedPlot.subDivision}
                      </Text>
                    </View>
                  </View>
                </View>
                {carbonFlag && (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('ActivityReportAWD', {
                        farmer: {
                          user_id: selectedPlot.farmer_id,
                          userName: selectedPlot.userName,
                          contactNumber: selectedPlot.contactNumber,
                        },
                        plot: {
                          rel_id: selectedPlot.id,
                          plot_no: selectedPlot.plotName,
                        },
                      });
                    }}
                    style={{
                      marginTop: 15,
                      backgroundColor: 'green',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>
                      Activity
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <FilterModal
              visible={showFilterModal}
              onClose={() => setShowFilterModal(false)}
              onApply={applyFilter}
              states={states}
              districts={districts}
              panchayats={panchayats}
              onStateChange={loadDistricts}
              onDistrictChange={loadPanchayats}
              statesLabel={
                regionaldatas.state == ''
                  ? t('pre_state_division_zone')
                  : t(`${regionaldatas.state}`)
              }
              districtsLabel={
                regionaldatas.district == ''
                  ? t('pre_district_county')
                  : t(`${regionaldatas.district}`)
              }
              panchayatsLabel={
                regionaldatas.block == ''
                  ? t('select_block_sub_county_upzila')
                  : t(`${regionaldatas.block}`)
              }
            />
          </View>
        </MyErrorBoundary>
      </Root>
    </SafeAreaView>
  );
};

export default PlotWiseMap;
