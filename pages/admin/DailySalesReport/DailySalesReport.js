import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  BackHandler,
  Animated,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {DailySalesReportGetAPI} from '../../../config/apiHere';
import {useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import {Colors, Fonts} from '../../utils/Constants';
import {FloatingAction} from 'react-native-floating-action';
import {getActionsDealerReportSupervisor} from '../../utils/options';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ROUTES} from '../../utils/Routes';
import {axiosDelete, axiosGet, axiosPut, axiosPost} from '../../utils/api';

const DailySalesReport = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    FormsTitle,
    setItem,
    logoImage,
    topBanner,
    Toast,
    AlertMesg,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  //GQR-67
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailySalesReportData, setDailySalesReportData] = useState([]);
  const route = useRoute();

  const onPageLoad = async () => {
    setIsLoading(true);
    const response = await axiosGet(ROUTES.GET.DAILY_SALES_REPORT(), token, {
      information: `${dbname},${lan_id},${user_id}`,
    });
    // DailySalesReportGetAPI(
    //   dbname,
    //   lan_id,
    //   token,
    //   user_id,
    // );

    if (response?.status == 200) {
      setIsLoading(false);
      setDailySalesReportData(response.data.data.rows);
    }
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  useEffect(() => {
    if (route?.params?.action === 'addData') {
      Toast.show({text: t('Data_submitted_successfully'), ...AlertMesg[0]});

      onPageLoad('', '');
    }
  }, [route?.params]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await onPageLoad("refreshing");
      await onPageLoad();
      setRefreshing(false);
    });
  }, []);
  const CardItem = useCallback(({item, index, navigation}) => {
    const truncatedTitle =
      item.question_title?.length > 30
        ? `${item.question_title.substring(0, 30)}...`
        : item.question_title;
    const cardAnimation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }).start();
    }, []);
    return (
      <Animated.View
        style={[
          styles.activityCard,
          {
            opacity: cardAnimation,
            transform: [
              {
                translateY: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}>
        <TouchableOpacity
          style={styles.problemCard}
          onPress={() => navigation.navigate('SalesDetail', item)}
          activeOpacity={0.7}>
          <View style={styles.cardHeader}>
            <Text style={styles.problemTitle} numberOfLines={2}>
              {t('name')}: {item.salesUser.userName}
            </Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('number_caps')}:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {item.salesUser.contactNumber || ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {item.srProducts.length != 0 &&
                item.srProducts[0].salesProduct != null
                  ? `${t('product_name')}:`
                  : item.srProducts.length != 0 &&
                    item.srProducts[0].salesProduceName != null
                  ? `${t('product_name')}:`
                  : ''}
              </Text>
              <Text style={styles.infoValue}>
                {item.srProducts.length != 0 &&
                item.srProducts[0].salesProduct != null
                  ? `${item.srProducts[0].salesProduct.product_name}`
                  : item.srProducts.length != 0 &&
                    item.srProducts[0].salesProduceName != null
                  ? `${item.srProducts[0].salesProduceName.name}`
                  : ''}
              </Text>
            </View>
          </View>
          {/* <Text style={styles.flatTitle}>{item.srProducts.length != 0 ? item.srProducts[0].qty != null || item.srProducts[0].unit != null ? `${t('select_quantity_input')}: ${item.srProducts[0].qty != null ? item.srProducts[0].qty : ''}  ${item.srProducts[0].unit != null ? item.srProducts[0].unit.substring(-1, 2) + "..." : ''}` : null : null}
                                </Text> */}
        </TouchableOpacity>
      </Animated.View>
    );
  }, []);
  return (
    <FarmerDrawerScreenWrapper1>
      <SafeAreaView style={{flex: 1, backgroundColor: Colors.background_light}}>
        <View style={{flex: 1}}>
          <CustomHeader
            path="Dashboard"
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            data={isLoading ? Array.from({length: 5}) : dailySalesReportData}
            renderItem={({item, index}) =>
              isLoading ? (
                <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
              ) : (
                <CardItem item={item} index={index} navigation={navigation} />
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.green]}
                tintColor={Colors.green}
              />
            }
            keyExtractor={(item, index) => index}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContainer}
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={20}
            windowSize={5}
          />
        </View>
        <FloatingAction
          position="right"
          actions={getActionsDealerReportSupervisor(t, styles, Colors)}
          color={Colors.useGreen}
          onPressItem={name => {
            if (name == 'dealer_report') {
              navigation.navigate('DealerReport');
            } else {
              navigation.navigate('FarmerReport');
            }
          }}
          showBackground={true}
          overlayColor="rgba(22, 17, 17, 0.35)"
          distanceToEdge={{vertical: 80, horizontal: 25}}
        />
      </SafeAreaView>
    </FarmerDrawerScreenWrapper1>
  );
};
export default DailySalesReport;
const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: '3%',
    marginBottom: 10,
  },
  btn: {
    backgroundColor: '#49BB41',
    width: '45%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    color: '#FFF',
  },
  btnText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background_light,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    // paddingBottom: 100, // Space for FAB
  },
  problemCard: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 12,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cardHeader: {
    // backgroundColor: '#fa9e003b',
    backgroundColor: Colors.useGreen,
    // backgroundColor:Colors.lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  problemTitle: {
    // color: '#f59f0bff',
    color: Colors.background,
    fontSize: 16,
    fontFamily: Fonts.Medium,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 1,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 2,
    textAlign: 'right',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: Colors.secondary || '#e0e0e0',
  },
  nextButton: {
    backgroundColor: Colors.primary || '#4BAE4F',
  },
  paginationText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageInfoText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary || '#4BAE4F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: Colors.primary || '#4BAE4F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});
