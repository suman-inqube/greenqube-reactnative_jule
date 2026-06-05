import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  Linking,
  Image,
  ScrollView,
} from 'react-native';
import PlotMap from './PlotMap';
import FilterModal from './FilterModal';
import { userCreateContext } from '../../Context/usersCreateContext';

import { getHighAccuracyLocation } from '../../utils/getHighAccuracyLocation';
import { getDistance } from 'geolib';
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { axiosGet } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import { SafeAreaView } from 'react-native-safe-area-context';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
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
  const { carbonFlag } = loginUser_data;
  const { dbname, lan_id, token, user_id, FcmUserToken, owner } = loginUser_data;
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

  const [expandedSections, setExpandedSections] = useState({});
  const [activityData, setActivityData] = useState(null);

  // useEffect(() => {
  //   if (
  //     Platform.OS === 'android' &&
  //     UIManager.setLayoutAnimationEnabledExperimental
  //   ) {
  //     UIManager.setLayoutAnimationEnabledExperimental(true);
  //   }
  // }, []);

  const formatDate = dateStr => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // 🔹 GROUP DATA
  const groupedData = useMemo(() => {
    if (!activityData?.rows) return {};

    return activityData.rows.reduce((acc, item) => {
      const category = item?.typeActivity?.categoryName || 'Unknown Activity';

      if (!acc[category]) acc[category] = [];

      acc[category].push({
        pipeId: item?.uActivityPipe?.pipe_name || '-',
        date: formatDate(item?.act_perform_date),
      });

      return acc;
    }, {});
  }, [activityData]);

  // Open first section by default
  useEffect(() => {
    const keys = Object.keys(groupedData);
    if (keys.length > 0) {
      setExpandedSections({ [keys[0]]: true });
    }
  }, [groupedData]);

  // Toggle
  const toggleSection = category => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const loadStates = async () => {
    const response = await axiosGet(ROUTES.GET.STATE_API(), '', {
      information: `${dbname},${lan_id}`,
    });
    if (response?.status === 200) {
      const data = response.data.data.rows.map(item => ({
        label: item.state_name,
        value: item.fid,
      }));
      setStates(data);
    }
  };

  const loadDistricts = async state => {
    const response = await axiosGet(
      ROUTES.GET.DISTRICT_API({ stateID: state.value }),
      '',
      { information: `${dbname},${lan_id}` },
    );

    if (response?.status === 200) {
      const data = response.data.data.rows.map(item => ({
        label: item.district_name,
        value: item.fid,
      }));
      setDistricts(data);
    }
  };

  const loadPanchayats = async district => {
    const response = await axiosGet(
      ROUTES.GET.BLOCK_API({ districtID: district.value }),
      '',
      { information: `${dbname},${lan_id}` },
    );

    if (response?.status === 200) {
      const data = response.data.data.rows.map(item => ({
        label: item.subdiv_name,
        value: item.fid,
      }));
      setPanchayats(data);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('✅ PlotWiseMap Focused - Start Location');

      startWatchingLocation();

      return () => {
        console.log('❌ PlotWiseMap Unfocused - Stop Location');

        stopWatchingLocation();
      };
    }, []),
  );
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
      { information: `${dbname}` },
    );

    if (res?.status == 200) {
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
        { information: `${dbname}` },
      );
      if (response?.status === 200) {
        // const formattedData = transformData(response);
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
      setActivityData(null);
      const found = plotData.find(p => p.id === polygon.id);
      if (found) {
        const [farmerDetails, actRes] = await Promise.all([
          axiosGet(
            ROUTES.GET.PLOT_MAP_DETAILS({
              user_id: found.farmer_id,
              land_unit_id: found.land_unit_id,
            }),
            token,
            { information: `${dbname}` },
          ),
          axiosGet(
            ROUTES.GET.PLOTWISE_ACTIVITY({
              plot_id: found.id,
              cropStatus: 'ACTIVE',
            }),
            token,
            {
              Information: `${dbname},${lan_id},${found.farmer_id}`,
            },
          ),
        ]);
        if (actRes?.status === 200) {
          setActivityData(actRes?.data?.data);
        }
        if (farmerDetails?.status == 200) {
          const userData = farmerDetails?.data?.data?.userData;
          const unitData = farmerDetails?.data?.data?.unitData;
          const district = farmerDetails?.data?.data?.userData?.userAdd?.districtDetails?.district_name;
          const subDivision = farmerDetails?.data?.data?.userData?.userAdd?.subDivDetails?.subdiv_name;
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
    <FarmerDrawerScreenWrapper1>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Root>
          <MyErrorBoundary>
            <View style={{ flex: 1 }}>
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
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {t('User')}
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
                      style={{ alignItems: 'flex-end' }}>
                      <MaterialIcons name="phone" size={20} color="#2563EB" />

                      <Text style={{ fontSize: 14, color: '#2563EB' }}>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* <MaterialIcons name="landscape" size={20} color="#16A34A" /> */}
                      <Image
                        source={require('../../Common/images/management.png')}
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />

                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {t('plot_name')}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '500' }}>
                          {selectedPlot.plotName}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>Area</Text>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons
                        name="location-city"
                        size={20}
                        color="#F59E0B"
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {regionaldatas.district == ''
                            ? t('pre_district_county')
                            : t(`${regionaldatas.district}`)}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '500' }}>
                          {selectedPlot.district}
                        </Text>
                      </View>
                    </View>

                    {/* PANCHAYAT */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="place" size={20} color="#DC2626" />
                      <View style={{ marginLeft: 10, alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>
                          {regionaldatas.block == ''
                            ? t('select_block_sub_county_upzila')
                            : t(`${regionaldatas.block}`)}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '500' }}>
                          {selectedPlot.subDivision}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {activityData && (
                    <View
                      style={{
                        marginTop: 15,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                      }}>
                      {/* 🔹 HEADER */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          alignSelf: 'center',
                        }}>
                        <MaterialIcons
                          name="insights"
                          size={18}
                          color="#4F46E5"
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            marginLeft: 6,
                            color: '#111827',
                          }}>
                          {t('my_activities')}
                        </Text>
                      </View>

                      {/* 🔹 CONTENT */}
                      <ScrollView
                        style={{ maxHeight: 220 }}
                        showsVerticalScrollIndicator={true}>
                        {Object.keys(groupedData).length === 0 && (
                          <Text style={{ textAlign: 'center', color: '#6B7280' }}>
                            {t('no_activity_found')}
                          </Text>
                        )}

                        {Object.keys(groupedData).map((category, index) => (
                          <View
                            key={index}
                            style={{
                              marginBottom: 12,
                              backgroundColor: '#FFFFFF',
                              borderRadius: 10,
                              padding: 10,
                              borderWidth: 1,
                              borderColor: '#F3F4F6',
                            }}>
                            {/* 🔹 CATEGORY TITLE */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 6,
                              }}>
                              {category === 'Pipe Installation' && (
                                <Image
                                  source={require('../../Common/images/pipes.png')}
                                  style={{ width: 15, height: 15 }}
                                  resizeMode="contain"
                                />
                              )}
                              {category.toLowerCase().includes('dry') && (
                                <Image
                                  source={require('../../Common/images/pipes.png')}
                                  style={{ width: 15, height: 15 }}
                                  resizeMode="contain"
                                // tintColor={'red'}
                                />
                              )}

                              <Text
                                style={{
                                  fontWeight: '600',
                                  marginLeft: 6,
                                  color: '#374151',
                                }}>
                                {category}
                              </Text>
                            </View>

                            {/* 🔹 LIST */}
                            {groupedData[category].map((item, i) => (
                              <View
                                key={i}
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  paddingVertical: 6,
                                  borderBottomWidth:
                                    i !== groupedData[category].length - 1
                                      ? 0.5
                                      : 0,
                                  borderColor: '#E5E7EB',
                                }}>
                                {/* LEFT */}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  {(category === 'Pipe Installation' ||
                                    category.toLowerCase().includes('dry')) && (
                                      <View
                                        style={{
                                          backgroundColor:
                                            category === 'Pipe Installation'
                                              ? '#157037'
                                              : '#3B82F6',
                                          width: 20,
                                          height: 20,
                                          borderRadius: 10,
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                        }}>
                                        <Text
                                          style={{ color: '#fff', fontSize: 11 }}>
                                          {i + 1}
                                        </Text>
                                      </View>
                                    )}

                                  <Text
                                    style={{
                                      marginLeft:
                                        category === 'Pipe Installation' ||
                                          category.toLowerCase().includes('dry')
                                          ? 8
                                          : 0,
                                      color: '#111827',
                                    }}>
                                    {item.pipeId}
                                  </Text>
                                </View>

                                {/* RIGHT */}
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <MaterialIcons
                                    name="event"
                                    size={16}
                                    color="#6B7280"
                                  />
                                  <Text
                                    style={{
                                      marginLeft: 4,
                                      fontSize: 13,
                                      color: '#6B7280',
                                    }}>
                                    {item.date}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  {carbonFlag && (
                    <TouchableOpacity
                      onPress={() => {
                        stopWatchingLocation();
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
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        {t('activity_nreporting')}
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
    </FarmerDrawerScreenWrapper1>
  );
};

export default PlotWiseMap;
