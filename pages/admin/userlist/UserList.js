import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
  memo,
} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import SkeletonUserCard from '../../Components/Skeleton/SkeletonUserCard';
// Components
import ImageForm from '../../Common/ImageForm';
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import PaginationNav from '../../Components/PaginationNav';

// API & Context
import {userDataListAPI} from './UsersAPI';
import {userCreateContext} from '../../Context/usersCreateContext';
import {CrashlyticsRecordError} from '../../Crashlytics/CrashlyticsRecordError';
import {Colors, Fonts} from '../../utils/Constants';
import {Image} from 'moti';
import {axiosGet} from '../../utils/api';
import {ROUTES} from '../../utils/Routes';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const MENU_ITEMS = [
  {
    key: 'password',
    icon: require('../../Common/images/change_password_green.png'),
    labelKey: 'forgot_password',
    gradient: ['#FF6B6B', '#FF8E8E'],
    iconBg: '#FFE5E5',
  },
  {
    key: 'information',
    icon: require('../../Common/images/add_info_plus.png'),
    labelKey: 'far_list_information',
    gradient: ['#4ECDC4', '#7FDBDA'],
    iconBg: '#E5F9F8',
  },
  {
    key: 'livehood',
    icon: require('../../Common/images/add_plot_plus.png'),
    labelKey: 'farming_details',
    gradient: ['#45B7D1', '#74C7E3'],
    iconBg: '#E5F4FA',
  },
  {
    key: 'CrateProblemUser',
    icon: require('../../Common/images/add_qust_plus.png'),
    labelKey: 'q_a',
    gradient: ['#F9CA24', '#F0B90B'],
    iconBg: '#FEF5D3',
  },
];

// Modern Menu Button - Only animate menu buttons when expanded
const ModernMenuButton = memo(({item, onPress, t, index, isExpanded}) => {
  const buttonAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isExpanded) {
      const delay = index * 50;
      Animated.spring(buttonAnim, {
        toValue: 1,
        delay,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      buttonAnim.setValue(0);
    }
  }, [isExpanded, index]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(item.key);
    });
  }, [onPress, item.key]);

  if (!isExpanded) return null;

  return (
    <Animated.View
      style={[
        styles.modernMenuButton,
        {
          opacity: buttonAnim,
          transform: [
            {scale: buttonAnim},
            {
              translateY: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
              }),
            },
          ],
        },
      ]}>
      <TouchableOpacity
        style={[styles.menuButtonTouchable, {backgroundColor: item.iconBg}]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.modernIconContainer}>
          <ImageForm
            source={item.icon}
            resizeMode="cover"
            height={24}
            width={24}
          />
        </View>
        <Text style={styles.modernMenuText} numberOfLines={2}>
          {t(item.labelKey)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const ModernUserCard = memo(
  ({
    item,
    isExpanded,
    onToggle,
    onMenuPress,
    t,
    index,
    animationsEnabled,
    expandedItem,
    setState,
    state,
  }) => {
    const cardAnim = useRef(
      new Animated.Value(animationsEnabled ? 0 : 1),
    ).current;
    const expandAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const hasAnimated = useRef(false);
    useEffect(() => {
      const delay = index * 100;
      Animated.spring(cardAnim, {
        toValue: 1,
        delay,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }).start(() => {
        hasAnimated.current = true;
      });
    }, []);
    useEffect(() => {
      Animated.parallel([
        Animated.timing(expandAnim, {
          toValue: isExpanded ? 1 : 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: isExpanded ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isExpanded]);

    const handleMenuPress = useCallback(
      menuKey => {
        const plotData =
          item.agri_land_user_rels?.map(data => ({
            value: data.rel_id,
            label: data.plot_no,
          })) || [];
        const filePath = item.agri_files?.[0]?.file_path || '';
        onMenuPress(menuKey, {
          farmeruserID: item.user_id,
          agri_land_user_rels: plotData,
          userName: item.userName,
          contactNumber: item.contactNumber,
          profileImage: filePath,
          gender: item.gender,
          farmer_type: item.farmer_type,
        });
      },
      [item, onMenuPress],
    );

    const handleCardPress = useCallback(() => {
      onToggle(item.user_id);
      setState(prev => ({...prev, onPageLoad: true}));
    }, [onToggle, item.user_id]);
    const cardStyle =
      state.onPageLoad == false
        ? [
            styles.modernUserCard,
            {
              opacity: cardAnim,
              transform: [
                {scale: cardAnim},
                {
                  translateX: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_WIDTH * 0.3, 0],
                  }),
                },
              ],
            },
          ]
        : [styles.modernUserCard];
    return (
      <Animated.View style={cardStyle}>
        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.95}
          style={styles.cardTouchable}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.userAvatar}>
              {item.agri_files.length > 0 ? (
                <Image
                  source={{uri: item.agri_files[0].file_path}} // adjust key based on your data
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#ccc',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {item.userName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>

            <View style={styles.userDetails}>
              <Text style={styles.modernUserName} numberOfLines={1}>
                {item.userName}
              </Text>
              <View style={styles.contactRow}>
                <Text style={styles.phoneText}>{item.contactNumber}</Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                  {item.CreateDateTime?.substring(0, 10)}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <View style={styles.plotsBadge}>
                <Text style={styles.plotsCount}>
                  {item.agri_land_user_rels?.length || 0}
                </Text>
                <Text style={styles.plotsLabel}>{t('plots')}</Text>
              </View>
              {/* <Animated.View
                            style={[
                                styles.expandButton,
                                {
                                    transform: [
                                        {
                                            rotate: rotateAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '180deg'],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.expandButtonText}>▼</Text>
                        </Animated.View> */}
            </View>
          </View>
        </TouchableOpacity>

        {/* Fixed height container to prevent FlatList jumps */}
        <View
          style={[
            styles.menuPositionContainer,
            {
              height: isExpanded ? 120 : 0,
              borderTopWidth: isExpanded ? 1.5 : 0,
              borderColor: Colors.border,
              borderStyle: 'dotted',
            },
          ]}>
          <Animated.View
            style={[
              styles.modernMenuContainer,
              {
                opacity: expandAnim,
                transform: [
                  {
                    translateY: expandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-120, 0],
                    }),
                  },
                  {
                    scaleY: expandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.modernMenuGrid}>
              {MENU_ITEMS.map((menuItem, menuIndex) => (
                <ModernMenuButton
                  key={menuItem.key}
                  item={menuItem}
                  onPress={handleMenuPress}
                  t={t}
                  index={menuIndex}
                  isExpanded={isExpanded}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    );
  },
);
const UserList = ({navigation}) => {
  const {
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    CustomHeader,
    t,
    getItem,
    setItem,
    Root,
    Toast,
    navigationBarHeight,
    farmerData,
  } = useContext(userCreateContext);
  const flatListRef = useRef(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [filterItem, setFilterItem] = useState('');
  const [searchFarmerPhone, setSearchFarmerPhone] = useState({
    label: '',
    value: '',
  });
  const [state, setState] = useState({
    isLoading: true,
    userList: null,
    expandedItem: null,
    phoneNumber: '',
    refreshing: false,
    onPageLoad: false,
  });

  const userCount = useMemo(() => state.userList?.count || 0, [state.userList]);
  const hasUsers = useMemo(() => userCount > 0, [userCount]);

  // API calls with error handling
  const fetchUserList = useCallback(
    async (pageNo = 1, search_key_phone = '') => {
      try {
        setState(prev => ({...prev, isLoading: pageNo === 1, isLoading: true}));
        const {dbname, lan_id, token, user_id} = loginUser_data;
        // const response = await userDataListAPI(dbname, lan_id, token, user_id, pageNo, searchQuery);
        const response = await axiosGet(
          ROUTES.GET.AGENT_ROUTE({
            page: pageNo,
            search_key: search_key_phone,
          }),
          token,
          {information: `${dbname},${lan_id},${user_id}`},
        );
        if (response.status === 200) {
          const {count, no_of_item_per_page, rows} = response.data || {};
          const totalPages = Math.ceil(count / no_of_item_per_page);
          setTotalPages(totalPages);
          await setItem('userListData', rows);
          setState(prev => ({
            ...prev,
            userList: rows,
            isLoading: false,
            expandedItem: null, // Reset expanded item on new data
          }));
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({offset: 0, animated: true});
          }
          // Mark initial load complete after first successful fetch
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
        }
      } catch (error) {
        CrashlyticsRecordError(error, 'UserList', 'fetchUserList');
        setState(prev => ({...prev, isLoading: false}));
      }
    },
    [loginUser_data, setItem, initialLoadComplete],
  );

  const handleToggleItem = useCallback(itemId => {
    setState(prev => ({
      ...prev,
      expandedItem: prev.expandedItem === itemId ? null : itemId,
    }));
  }, []);

  const handleMenuPress = useCallback(
    (menuName, params) => {
      navigation.navigate(menuName, params);
    },
    [navigation],
  );

  const handleRefresh = useCallback(async () => {
    setState(prev => ({...prev, refreshing: true, expandedItem: null}));
    await fetchUserList(1, '');
    setState(prev => ({...prev, refreshing: false}));
  }, [fetchUserList]);

  useEffect(() => {
    fetchUserList(page);
  }, [page]);

  const UserItemCard = useCallback(
    ({item, index}) => (
      <ModernUserCard
        item={item}
        isExpanded={state.expandedItem === item.user_id}
        expandedItem={state.expandedItem}
        setState={setState}
        state={state}
        onToggle={handleToggleItem}
        onMenuPress={handleMenuPress}
        t={t}
        index={index}
        animationsEnabled={initialLoadComplete && !state.isLoading}
      />
    ),
    [
      state.expandedItem,
      handleToggleItem,
      handleMenuPress,
      t,
      initialLoadComplete,
      state.isLoading,
    ],
  );

  const keyExtractor = useCallback((item, index) => {
    return item?.user_id ? item.user_id.toString() : index.toString();
  }, []);

  const filterOptionShow = async () => {
    const {openFilterSheet} = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['', 'phone', '', ''],
      t: t,
      dropdownData: farmerData,
      filterItem: filterItem,
      setSearchFarmerPhone: setSearchFarmerPhone,
      searchFarmerPhone: searchFarmerPhone,
      title: 'Choose Status',
      handleFilterResult: handleFilterResult,
      handleFilterRemove: handleFilterRemove,
      navigationBarHeight: navigationBarHeight,
    });
  };

  const handleFilterResult = useCallback(
    ({filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType}) => {
      setFilterItem(filter);
      setSearchFarmerPhone({
        label: farmerPhone?.label,
        value: farmerPhone?.value,
      });
      fetchUserList(1, farmerPhone?.label);
    },
    [],
  );
  const handleFilterRemove = useCallback(() => {
    setSearchFarmerPhone({label: '', value: ''});
    setFilterItem('');
    fetchUserList(1, '', '', '', '', '');
    setPage(1);
  }, []);
  return (
    <MyErrorBoundary>
      <Root>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <View style={styles.container}>
          <CustomHeader t={t} filterOptionShow={filterOptionShow} />
          <FlatList
            ref={flatListRef}
            data={state?.isLoading ? Array.from({length: 6}) : state?.userList}
            renderItem={({item, index}) =>
              state?.isLoading ? (
                <SkeletonUserCard />
              ) : (
                <UserItemCard item={item} index={index} />
              )
            }
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={state.refreshing}
                onRefresh={handleRefresh}
                colors={['#4CAF50']}
                tintColor="#4CAF50"
              />
            }
            contentContainerStyle={styles.listContent}
            // onScrollBeginDrag={handleScrollBeginDrag}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
            scrollEventThrottle={16}
            // Prevent layout jumps with maintainVisibleContentPosition
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
          <PaginationNav
            isLoading={state.isLoading}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            t={t}
          />
        </View>
      </Root>
    </MyErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  titleSection: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins-Regular',
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  statsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins-Regular',
  },
  searchSection: {
    paddingHorizontal: 20,
  },
  modernSearchBar: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    color: '#999',
    fontSize: 16,
  },
  contentArea: {
    flex: 1,
    paddingTop: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardTouchable: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  userDetails: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
    fontFamily: Fonts.Medium,
  },
  contactRow: {
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: Colors.lightText,
    fontFamily: Fonts.Medium,
  },
  dateRow: {},
  dateText: {
    fontSize: 12,
    color: Colors.lightText,
    fontFamily: Fonts.Medium,
  },
  cardActions: {
    alignItems: 'center',
  },
  plotsBadge: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  plotsCount: {
    fontSize: 15,
    // fontWeight: 'bold',
    color: Colors.borderGreen,
    fontFamily: Fonts.SemiBold,
    marginRight: 4,
  },

  plotsLabel: {
    fontSize: 10,
    color: Colors.borderGreen,
    // marginTop: 5,
    fontFamily: Fonts.Medium,
  },

  expandButton: {
    padding: 8,
  },
  expandButtonText: {
    fontSize: 18,
    color: Colors.text,
  },
  menuPositionContainer: {
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  modernMenuContainer: {
    height: 120,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  modernMenuGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  modernMenuButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  menuButtonTouchable: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  modernIconContainer: {
    marginBottom: 8,
  },
  modernMenuText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    lineHeight: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  paginationWrapper: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modernHeader: {
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modernUserCard: {
    marginBottom: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
});
export default memo(UserList);
