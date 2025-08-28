import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect, useContext, useCallback} from 'react';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import {farmerProblemListAPI} from '../../../config/apiHere';
import {useFocusEffect} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {ROUTES} from '../../utils/Routes';
import {axiosGet} from '../../utils/api';
import PaginationNav from '../../Components/PaginationNav';
import SkeletonProblemCard from '../../Components/Skeleton/SkeletonProblemCard';
import {getActionsProblemSupervisor} from '../../utils/options';
import AnimatedCard from '../../Components/AnimatedCard';
import {FloatingAction} from 'react-native-floating-action';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {Colors, Fonts} from '../../utils/Constants';

const FarmerListProblem = ({navigation}) => {
  //GQR-67
  const {
    handlePageList,
    FormsTitle,
    dbLanTokUsr,
    setdbLanTokUsr,
    loginUser_data,
    LoadingScreen,
    CustomHeader,
    t,
    onBackPress,
    getItem,
    setItem,
    logoImage,
    topBanner,
    DeviceInfo,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id} = loginUser_data;
  const {farmerId, pageNo} = dbLanTokUsr;
  //GQR-67
  const {netConnection} = DeviceInfo();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [activeBtn, setActiveBtn] = useState(1);
  const [problemAll, setProblemAll] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigateToPages = async (pageName, fid) => {
    await setItem('problem_id_data', fid);
    navigation.navigate(pageName);
  };
  const myProblemList = async () => {
    setActiveBtn(1);
    setdbLanTokUsr({...dbLanTokUsr, pageNo: 1});
    if (netConnection) {
      var response = await farmerProblemListAPI(
        dbname,
        lan_id,
        token,
        farmerId,
        1,
        1,
        'crop_problem',
      );
      await setItem('farmerProblemList', response);
    } else {
      var response = await getItem('farmerProblemList');
    }
    if (response?.status == 200) {
      setProblemAll(response.data.data.rows);
      setItem('problem_Data', response.data.data);
    }
  };
  const otherProblemList = async () => {
    setActiveBtn(2);
    if (netConnection) {
      var response = await farmerProblemListAPI(
        dbname,
        lan_id,
        token,
        farmerId,
        1,
        2,
        'crop_problem',
      );
      await setItem('otherFarmerProblemList', response);
    } else {
      var response = await getItem('otherFarmerProblemList');
    }
    if (response?.status == 200) {
      setProblemAll(response.data.data.rows);
      setItem('problem_Data', response.data.data);
    }
  };
  const handlePage = async value => {
    setIsLoading(true);
    handlePageList(
      value,
      setIsLoading,
      token,
      pageNo,
      farmerProblemListAPI,
      setProblemAll,
      dbname,
      lan_id,
      farmerId,
      activeBtn,
      'crop_problem',
    );
  };
  const onPageLoad = async () => {
    setActiveBtn(1);
    setdbLanTokUsr({...dbLanTokUsr, pageNo: 1});
    if (netConnection) {
      var response = await farmerProblemListAPI(
        dbname,
        lan_id,
        token,
        farmerId,
        1,
        1,
        'crop_problem',
      );
      await setItem('farmerProblemList', response);
    } else {
      var response = await getItem('farmerProblemList');
    }
    if (response?.status == 200) {
      const totalPage = Math.ceil(response.data.data.count / 20);
      setdbLanTokUsr({...dbLanTokUsr, totalPage: totalPage});
      setProblemAll(response.data.data.rows);
      setItem('problem_Data', response.data.data);
      setIsLoading(false);
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    requestAnimationFrame(async () => {
      // await handleProblem(page);
      setRefreshing(false);
    });
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      if (isFocused) {
        setIsLoading(true);
      } else {
        setIsLoading(true);
      }
      onPageLoad();
      onBackPress(handleBackPress);
    }, [netConnection]),
  );
  const filterOptionShow = () => {};
  //
  const handleBackPress = () => {
    navigation.navigate('FarmerDashboard');
    return true;
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <SafeAreaView style={{flex: 1, backgroundColor: Colors.background_light}}>
        <CustomHeader
          path="FarmerDashboard"
          logoImage={logoImage}
          topBanner={topBanner}
          // filterOptionShow={filterOptionShow}
          t={t}
        />

        {/* <View style={styles.btnContainer}>
          <TouchableOpacity
            style={activeBtn === 1 ? styles.btnActive : styles.btn}
            onPress={() => myProblemList()}>
            <Text
              style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>
              {t('my_question')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeBtn === 2 ? styles.btnActive : styles.btn}
            onPress={() => otherProblemList()}>
            <Text
              style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>
              {t('other_question')}
            </Text>
          </TouchableOpacity>
        </View> */}
        {isLoading ? (
          <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
        ) : (
          <>
            {problemAll?.length > 0 ? (
              <>
                <FlatList
                  nestedScrollEnabled={true}
                  data={isLoading ? Array.from({length: 5}) : problemAll}
                  renderItem={({item, index}) =>
                    isLoading ? (
                      <SkeletonProblemCard Colors={Colors} Fonts={Fonts} />
                    ) : (
                      <AnimatedCard
                        item={item}
                        child={
                          <TouchableOpacity
                            style={styles.problemCard}
                            onPress={() =>
                              navigateToPages('FarmerViewProblem', item.fid)
                            }
                            activeOpacity={0.7}>
                            <View style={styles.cardHeader}>
                              <Text
                                style={styles.problemTitle}
                                numberOfLines={2}>
                                {t('problem_title')} :{' '}
                                {item.question_title?.length > 30
                                  ? `${item.question_title.substring(0, 30)}...`
                                  : item.question_title}
                              </Text>
                            </View>
                            <View style={styles.cardContent}>
                              <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>
                                  {t('date')} :
                                </Text>
                                <Text
                                  style={styles.infoValue}
                                  numberOfLines={1}>
                                  {formatDateToMMDDYYYY(item.updated_at)}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        }
                        index={index}
                      />
                    )
                  }
                  keyExtractor={(item, index) => index}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[Colors.green]}
                      tintColor={Colors.green}
                    />
                  }
                  onEndReachedThreshold={0.5}
                  contentContainerStyle={styles.listContainer}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={5}
                  updateCellsBatchingPeriod={20}
                  windowSize={5}
                />
                <View style={styles.prevNextPage}>
                  <TouchableOpacity onPress={() => handlePage('previous')}>
                    <Text style={styles.infoPageLabel}>{t('prev_page')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handlePage('next')}>
                    <Text style={styles.infoPageLabel}>{t('next_page')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <MaterialIcons
                  name="sentiment-dissatisfied"
                  size={50}
                  color="#767676ff"
                />
                <Text style={styles.noDataText}>
                  {activeBtn === 1
                    ? t('no_my_questions')
                    : t('no_other_questions')}
                </Text>
              </View>
            )}
          </>
        )}

        <FloatingAction
          position="right"
          actions={[
            {
              text: t('add_crop_problem'),
              name: 'create_problem',
              icon: <MaterialIcons name="add" size={24} color="white" />,
              color: Colors.useGreen,
            },
            {
              text: activeBtn === 1 ? t('other_question') : t('my_question'),
              name: activeBtn === 1 ? 'other_questions' : 'my_questions',
              icon: (
                <MaterialIcons
                  name={activeBtn === 1 ? 'swap-horiz' : 'swap-horiz'}
                  size={24}
                  color="white"
                />
              ),
              color: Colors.useGreen,
            },
          ]}
          color={Colors.useGreen}
          onPressItem={name => {
            if (name === 'create_problem') {
              navigateToPages('FarmerCreateProblem', 123);
            } else if (name === 'other_questions') {
              otherProblemList();
            } else if (name === 'my_questions') {
              myProblemList();
            }
          }}
          showBackground={true}
          overlayColor="rgba(22, 17, 17, 0.35)"
          distanceToEdge={{vertical: 80, horizontal: 25}}
        />
        {/* <TouchableOpacity
          style={styles.plusIconContainer}
          onPress={() => navigateToPages('FarmerCreateProblem', 123)}>
          <Image
            source={require('../../Common/images/plus.png')}
            resizeMode="cover"
            style={{width: 50, height: 50}}
          />
        </TouchableOpacity> */}
      </SafeAreaView>
    </FarmerDrawerScreenWrapper1>
  );
};
export default FarmerListProblem;
const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  // },
  // item: {
  //   backgroundColor: '#f9c2ff',
  //   padding: 20,
  //   marginVertical: 8,
  //   marginHorizontal: 16,
  // },
  // title: {
  //   color: '#000',
  //   fontFamily: 'Poppins-Regular',
  //   fontSize: 14,
  // },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: '2%',
  },
  btn: {
    elevation: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: '47%',
  },
  btnActive: {
    backgroundColor: '#a1dc17',
    elevation: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    width: '47%',
  },
  btnActiveTitle: {
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  btnTitle: {
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  prevNextPage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    position: 'relative',
    bottom: 0,
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
  infoPageLabel: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Fonts.Medium,
    flex: 2,
    textAlign: 'right',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: Colors.text,
    textAlign: 'center',
  },
});
