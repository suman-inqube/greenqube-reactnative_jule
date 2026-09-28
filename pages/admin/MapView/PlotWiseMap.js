import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Linking,
  Image,
  ScrollView,
  LayoutAnimation,
  Alert,
} from 'react-native';
import PlotMap from './PlotMap';
import FilterModal from './FilterModal';
import { userCreateContext } from '../../Context/usersCreateContext';
import { getHighAccuracyLocation } from '../../utils/getHighAccuracyLocation';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { axiosGet } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import { SafeAreaView } from 'react-native-safe-area-context';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';

// Static date formatter to avoid allocations inside render
const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// Static response transformer
const transformData = apiResponse => {
  const rows = apiResponse?.data?.data?.rows;
  if (!Array.isArray(rows)) return [];

  return rows.map(item => {
    const coordinates =
      item.landLatLong
        ?.filter(c => c && c.latitude && c.longitude)
        .map(c => ({
          lat: Number(c.latitude),
          lng: Number(c.longitude),
        })) || [];

    return {
      id: item.rel_id,
      farmer_id: item.user_id,
      plotName: item.plot_no ? `${item.plot_no}` : 'unknown',
      landSize: item.land_convert_size || '0',
      land_unit_id: item.land_unit_id,
      center_lat: coordinates[0]?.lat || null,
      center_lng: coordinates[0]?.lng || null,
      coordinates: coordinates,
    };
  });
};

const PlotWiseMap = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const isMountedRef = useRef(true);

  const {
    CustomHeader,
    logoImage,
    topBanner,
    loginUser_data,
    t,
    getItem,
    Root,
  } = useContext(userCreateContext);

  const { carbonFlag, dbname, lan_id, token, user_id } = loginUser_data || {};

  const [plotData, setPlotData] = useState([]);
  const [baseLatLong, setBaseLatLong] = useState({ latitude: 0, longitude: 0 });
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);

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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 🔹 Memoize polygons directly from plotData and selectedPlot (Zero duplicated state in RAM)
  const polygons = useMemo(() => {
    if (!plotData || plotData.length === 0) return [];
    const selectedId = selectedPlot?.id;

    return plotData.map(p => ({
      id: p.id,
      isSelected: selectedId === p.id,
      coordinates: p.coordinates.map(c => ({
        latitude: c.lat,
        longitude: c.lng,
      })),
    }));
  }, [plotData, selectedPlot?.id]);

  // 🔹 Group activity data
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

  const toggleSection = useCallback(category => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const loadStates = useCallback(async () => {
    try {
      const response = await axiosGet(ROUTES.GET.STATE_API(), '', {
        information: `${dbname},${lan_id}`,
      });
      if (response?.status === 200 && isMountedRef.current) {
        const data = response.data.data.rows.map(item => ({
          label: item.state_name,
          value: item.fid,
        }));
        setStates(data);
      }
    } catch (_) { }
  }, [dbname, lan_id]);

  const loadDistricts = useCallback(async state => {
    try {
      const response = await axiosGet(
        ROUTES.GET.DISTRICT_API({ stateID: state.value }),
        '',
        { information: `${dbname},${lan_id}` },
      );
      if (response?.status === 200 && isMountedRef.current) {
        const data = response.data.data.rows.map(item => ({
          label: item.district_name,
          value: item.fid,
        }));
        setDistricts(data);
      }
    } catch (_) { }
  }, [dbname, lan_id]);

  const loadPanchayats = useCallback(async district => {
    try {
      const response = await axiosGet(
        ROUTES.GET.BLOCK_API({ districtID: district.value }),
        '',
        { information: `${dbname},${lan_id}` },
      );
      if (response?.status === 200 && isMountedRef.current) {
        const data = response.data.data.rows.map(item => ({
          label: item.subdiv_name,
          value: item.fid,
        }));
        setPanchayats(data);
      }
    } catch (_) { }
  }, [dbname, lan_id]);

  const loadNearbyPlots = useCallback(async (lat, lng) => {
    const targetLat = lat != null ? lat : baseLatLong.latitude;
    const targetLng = lng != null ? lng : baseLatLong.longitude;

    if (!targetLat || !targetLng) return;

    try {
      const response = await axiosGet(
        ROUTES.GET.PLOT_VIEW_MAP({
          lat: targetLat,
          lng: targetLng,
          createdBy: user_id,
          distance: "1000"
        }),
        token,
        { information: `${dbname}` },
      );
      if (response?.status === 200 && isMountedRef.current) {
        const formattedData = transformData(response);
        setPlotData(formattedData);
      }
    } catch (err) {
      console.log('Nearby error:', err);
    }
  }, [baseLatLong.latitude, baseLatLong.longitude, user_id, token, dbname]);

  // Initial load on mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        const [state, district, block] = await Promise.all([
          getItem('state'),
          getItem('district'),
          getItem('block'),
        ]);

        if (isMountedRef.current) {
          setregionaldatas({
            state: state || '',
            district: district || '',
            block: block || '',
          });
        }

        const highAcc = await getHighAccuracyLocation();
        const lat = highAcc?.latitude;
        const lon = highAcc?.longitude;

        if (!lat || !lon) {
          if (isMountedRef.current) {
            Alert.alert('Location Error', 'Unable to get valid GPS location.');
          }
          return;
        }

        if (isMountedRef.current) {
          setBaseLatLong({ latitude: lat, longitude: lon });
          loadNearbyPlots(lat, lon);
        }
      } catch (err) {
        console.log('Location error:', err);
      }
    };

    initLocation();
  }, [getItem, loadNearbyPlots]);

  const applyFilter = useCallback(async filters => {
    if (filters.isClear) {
      setIsFilterApplied(false);
      const highAcc = await getHighAccuracyLocation();
      const lat = highAcc?.latitude;
      const lon = highAcc?.longitude;

      if (!lat || !lon) {
        if (isMountedRef.current) {
          Alert.alert('Location Error', 'Unable to get valid GPS location.');
        }
        return;
      }

      if (isMountedRef.current) {
        setBaseLatLong({ latitude: lat, longitude: lon });
        loadNearbyPlots(lat, lon);
      }
      return;
    }

    setIsFilterApplied(true);
    try {
      const res = await axiosGet(
        ROUTES.GET.PLOT_VIEW_MAP({
          state: filters.state?.value,
          district: filters.district?.value,
          subdivision: filters.panchayats?.map(p => p.value),
          createdBy: user_id,
          latitude: '',
          longitude: '',
          distance: '5000',
        }),
        token,
        { information: `${dbname}` },
      );

      if (res?.status === 200 && isMountedRef.current) {
        const rows = res?.data?.data?.rows;
        if (rows && rows.length > 0) {
          const firstLat = rows[0]?.landLatLong?.[0]?.latitude;
          const firstLng = rows[0]?.landLatLong?.[0]?.longitude;
          if (firstLat && firstLng) {
            setBaseLatLong({
              latitude: Number(firstLat),
              longitude: Number(firstLng),
            });
          }
        }
        const formattedData = transformData(res);
        setPlotData(formattedData);
      }
    } catch (_) { }
  }, [user_id, token, dbname, loadNearbyPlots]);

  const handlePolygonPress = useCallback(async polygon => {
    try {
      if (isMountedRef.current) setActivityData(null);
      const found = plotData.find(p => p.id === polygon.id);
      if (!found) return;

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

      if (!isMountedRef.current) return;

      if (actRes?.status === 200) {
        setActivityData(actRes?.data?.data);
      }
      if (farmerDetails?.status === 200) {
        const userData = farmerDetails?.data?.data?.userData;
        const unitData = farmerDetails?.data?.data?.unitData;
        const district = userData?.userAdd?.districtDetails?.district_name;
        const subDivision = userData?.userAdd?.subDivDetails?.subdiv_name;
        const updatedFound = {
          ...found,
          userName: userData?.userName,
          contactNumber: userData?.contactNumber,
          unit_sname: unitData?.unit_sname,
          district: district,
          subDivision: subDivision,
        };
        setSelectedPlot(updatedFound);
      }
    } catch (error) {
      console.log('Polygon detail error:', error);
    }
  }, [plotData, token, dbname, lan_id]);

  const HandlerGoBack = useCallback(() => {
    navigation.navigate('Dashboard');
  }, [navigation]);

  const openFilter = useCallback(() => {
    setShowFilterModal(true);
    if (states.length === 0) {
      loadStates();
    }
  }, [states.length, loadStates]);

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
                isFocused={isFocused}
              />

              {/* Selected Plot Popup Card */}
              {selectedPlot && (
                <View style={styles.selectedPlotCard}>
                  {/* Close */}
                  <TouchableOpacity
                    onPress={() => setSelectedPlot(null)}
                    style={styles.closeCardBtn}>
                    <MaterialIcons name="close" size={24} color="#EF4444" />
                  </TouchableOpacity>

                  {/* Farmer + Phone */}
                  <View style={styles.farmerRow}>
                    <View style={styles.farmerInfo}>
                      <MaterialIcons name="person" size={22} color="#16A34A" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.labelMuted}>{t?.('User') || 'User'}</Text>
                        <Text style={styles.valBold}>{selectedPlot.userName}</Text>
                      </View>
                    </View>

                    {selectedPlot.contactNumber && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${selectedPlot.contactNumber}`)}
                        style={{ alignItems: 'flex-end' }}>
                        <MaterialIcons name="phone" size={20} color="#2563EB" />
                        <Text style={styles.phoneText}>{selectedPlot.contactNumber}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Plot + Area */}
                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image
                        source={require('../../Common/images/management.png')}
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.labelMuted}>{t?.('plot_name') || 'Plot Name'}</Text>
                        <Text style={styles.valMedium}>{selectedPlot.plotName}</Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.labelMuted}>Area</Text>
                      <Text style={styles.areaText}>
                        {selectedPlot.landSize} {selectedPlot.unit_sname}
                      </Text>
                    </View>
                  </View>

                  {/* District & Panchayat */}
                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="location-city" size={20} color="#F59E0B" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.labelMuted}>
                          {regionaldatas.district === ''
                            ? t?.('pre_district_county')
                            : t?.(`${regionaldatas.district}`)}
                        </Text>
                        <Text style={styles.valMedium}>{selectedPlot.district}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialIcons name="place" size={20} color="#DC2626" />
                      <View style={{ marginLeft: 10, alignItems: 'flex-end' }}>
                        <Text style={styles.labelMuted}>
                          {regionaldatas.block === ''
                            ? t?.('select_block_sub_county_upzila')
                            : t?.(`${regionaldatas.block}`)}
                        </Text>
                        <Text style={styles.valMedium}>{selectedPlot.subDivision}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Activities */}
                  {activityData && (
                    <View style={styles.activityBox}>
                      <View style={styles.activityHeader}>
                        <MaterialIcons name="insights" size={18} color="#4F46E5" />
                        <Text style={styles.activityTitle}>
                          {t?.('my_activities') || 'My Activities'}
                        </Text>
                      </View>

                      <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={true}>
                        {Object.keys(groupedData).length === 0 && (
                          <Text style={{ textAlign: 'center', color: '#6B7280' }}>
                            {t?.('no_activity_found') || 'No Activity Found'}
                          </Text>
                        )}

                        {Object.keys(groupedData).map((category, index) => (
                          <View key={`cat-${index}`} style={styles.catCard}>
                            <View style={styles.catHeader}>
                              {category === 'Pipe Installation' && (
                                <Image
                                  source={require('../../Common/images/pipes.png')}
                                  style={{ width: 15, height: 15 }}
                                  resizeMode="contain"
                                />
                              )}
                              <Text style={styles.catTitle}>{category}</Text>
                            </View>

                            {groupedData[category].map((item, i) => (
                              <View
                                key={`item-${i}`}
                                style={[
                                  styles.activityItemRow,
                                  i === groupedData[category].length - 1 && { borderBottomWidth: 0 },
                                ]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  {category === 'Pipe Installation' && (
                                    <View style={styles.badgeIndex}>
                                      <Text style={styles.badgeIndexText}>{i + 1}</Text>
                                    </View>
                                  )}
                                  <Text style={styles.pipeIdText}>{item.pipeId}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  <MaterialIcons name="event" size={15} color="#6B7280" />
                                  <Text style={styles.dateText}>{item.date}</Text>
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
                      style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>
                        {t?.('activity_nreporting') || 'Activity Reporting'}
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
                  regionaldatas.state === ''
                    ? t?.('pre_state_division_zone')
                    : t?.(`${regionaldatas.state}`)
                }
                districtsLabel={
                  regionaldatas.district === ''
                    ? t?.('pre_district_county')
                    : t?.(`${regionaldatas.district}`)
                }
                panchayatsLabel={
                  regionaldatas.block === ''
                    ? t?.('select_block_sub_county_upzila')
                    : t?.(`${regionaldatas.block}`)
                }
              />
            </View>
          </MyErrorBoundary>
        </Root>
      </SafeAreaView>
    </FarmerDrawerScreenWrapper1>
  );
};

const styles = {
  selectedPlotCard: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  closeCardBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
    zIndex: 5,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelMuted: {
    fontSize: 11,
    color: '#6B7280',
  },
  valBold: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  valMedium: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  phoneText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  areaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  activityBox: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    color: '#111827',
  },
  catCard: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  catTitle: {
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
    color: '#374151',
  },
  activityItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  badgeIndex: {
    backgroundColor: '#157037',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  badgeIndexText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pipeIdText: {
    fontSize: 12,
    color: '#111827',
  },
  dateText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
};

export default React.memo(PlotWiseMap);
