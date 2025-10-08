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
import MyErrorBoundary from '../../Common/MyErrorBoundary';
import PaginationNav from '../../Components/PaginationNav';
import { userCreateContext } from '../../Context/usersCreateContext';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
import { Colors, Fonts } from '../../utils/Constants';
import { axiosGet } from '../../utils/api';
import { ROUTES } from '../../utils/Routes';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import ModernUserCard from '../../Components/ModernUserCard';

const UserList = ({ navigation }) => {
  const {
    loginUser_data,
    CustomHeader,
    t,
    setItem,
    Root,
    navigationBarHeight,
    farmerData,
  } = useContext(userCreateContext);
  const flatListRef = useRef(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);
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
        setState(prev => ({ ...prev, isLoading: pageNo === 1, isLoading: true }));
        const { dbname, lan_id, token, user_id } = loginUser_data;
        const response = await axiosGet(
          ROUTES.GET.AGENT_ROUTE({
            page: pageNo,
            search_key: search_key_phone,
          }),
          token,
          { information: `${dbname},${lan_id},${user_id}` },
        );
        if (response.status === 200) {
          const { count, no_of_item_per_page, rows } = response.data || {};
          const totalPages = Math.ceil(count / no_of_item_per_page);
          setTotalPages(totalPages);
          setCount(count);
          await setItem('userListData', rows);
          setState(prev => ({
            ...prev,
            userList: rows,
            isLoading: false,
            expandedItem: null,
          }));
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
          if (!initialLoadComplete) {
            setInitialLoadComplete(true);
          }
        }
      } catch (error) {
        CrashlyticsRecordError(error, 'UserList', 'fetchUserList');
        setState(prev => ({ ...prev, isLoading: false }));
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
    setState(prev => ({ ...prev, refreshing: true, expandedItem: null }));
    await fetchUserList(1, '');
    setState(prev => ({ ...prev, refreshing: false }));
    setPage(1);
  }, []);

  useEffect(() => {
    fetchUserList(page);
  }, [page]);

  const UserItemCard = useCallback(
    ({ item, index }) => (
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

  const filterOptionShow = useCallback(async () => {
    const { openFilterSheet } = await import('../../Components/FilterSheet');
    openFilterSheet({
      options: ['', 'phone', '', ''],
      t: t,
      dropdownData: farmerData,
      filterItem: filterItem,
      setFilterItem: setFilterItem,
      setSearchFarmerPhone: setSearchFarmerPhone,
      searchFarmerPhone: searchFarmerPhone,
      title: 'Choose Status',
      handleFilterResult: handleFilterResult,
      handleFilterRemove: handleFilterRemove,
      navigationBarHeight: 0,
      height: 100
    });
  },[filterItem,searchFarmerPhone]);

  const handleFilterResult = useCallback(
    ({ filter, fromDate, toDate, farmerName, farmerPhone, sheetCarbonType }) => {
      setFilterItem(filter);
      setSearchFarmerPhone({
        label: farmerPhone?.label,
        value: farmerPhone?.value,
      });
      fetchUserList(1, farmerPhone?.label);
      setPage(1);
    },
    [],
  );
  const handleFilterRemove = useCallback(() => {
    setSearchFarmerPhone({ label: '', value: '' });
    setFilterItem('');
    fetchUserList(1, '', '', '', '', '');
    setPage(1);
  }, []);
  const renderCustomHeader = useMemo(() => <CustomHeader t={t} filterOptionShow={filterOptionShow} />, [filterOptionShow]);
  return (
    <FarmerDrawerScreenWrapper1>
      <MyErrorBoundary>
        <Root>
          <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
          <View style={styles.container}>
            {renderCustomHeader}
            {/* <View style={styles.header}>
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <ImageForm source={require('../../Common/images/farmer.png')} resizeMode="cover" height={40} width={40} />
                <Text style={[{color:Colors.text,fontFamily:Fonts.Medium,fontWeight:700 }]}>{count} {t('farmers')}</Text>
              </View>
              <Text style={[{color:Colors.text,fontFamily:Fonts.Medium,fontWeight:700 }]}>{t('farmer_list')}</Text>
            </View> */}
            {/* <View style={styles.headerStats}>
              <View style={styles.statsContainer}>
                <View style={styles.statsIcon}>
                  <Icon name="group" size={24} color="#4CAF50" />
                </View>
                <View style={styles.statsText}>
                  <Text style={[{ color: Colors.text, fontFamily: Fonts.Medium, fontWeight: 700 }]}>{count} {t('farmers')}</Text>
                </View>
              </View>
            </View> */}
            <FlatList
              ref={flatListRef}
              data={
                state?.isLoading ? Array.from({ length: 6 }) : state?.userList
              }
              renderItem={({ item, index }) =>
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
              scrollEventThrottle={16}
              maxToRenderPerBatch={8}
              windowSize={5}
              initialNumToRender={6}
              updateCellsBatchingPeriod={50}
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
    </FarmerDrawerScreenWrapper1>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  headerStats: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginTop: 16,
    // marginBottom: 8,
    // padding: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 16,
    paddingVertical: 12,
  },
  statsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    shadowOffset: { width: 0, height: -2 },
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
    shadowOffset: { width: 0, height: 6 },
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
