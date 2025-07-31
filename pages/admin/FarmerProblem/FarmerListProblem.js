import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import {farmerProblemListAPI} from '../../../config/apiHere';
import {useFocusEffect} from '@react-navigation/native';
import {useIsFocused} from '@react-navigation/native';
import {userCreateContext} from '../../Context/usersCreateContext';
import FarmerDrawerScreenWrapper1 from '../FarmerDrawerScreenWrapper1';
import {ROUTES} from '../../utils/Routes';
import {axiosGet} from '../../utils/api';
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
  const HandlerGoBack = () => navigation.navigate('FarmerDashboard');
  const handleBackPress = () => {
    navigation.navigate('FarmerDashboard');
    return true;
  };
  return (
    <FarmerDrawerScreenWrapper1>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          <CustomHeader
            path="FarmerDashboard"
            HandlerGoBack={HandlerGoBack}
            logoImage={logoImage}
            topBanner={topBanner}
          />
          <FormsTitle title={t('problem_reporting')} />
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={activeBtn === 1 ? styles.btnActive : styles.btn}
              onPress={() => myProblemList()}>
              <Text
                style={
                  activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle
                }>
                {t('my_question')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={activeBtn === 2 ? styles.btnActive : styles.btn}
              onPress={() => otherProblemList()}>
              <Text
                style={
                  activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle
                }>
                {t('other_question')}
              </Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View style={styles.loadingScreen}>
              <LoadingScreen />
            </View>
          ) : (
            <>
              <FlatList
                data={problemAll}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.wrapper}
                    onPress={() =>
                      navigateToPages('FarmerViewProblem', item.fid)
                    }>
                    <Text style={styles.title}>
                      {t('problem_title')} : {item.question_title}
                    </Text>
                    <Text style={styles.title}>
                      {' '}
                      {t('date')} : {formatDateToMMDDYYYY(item.updated_at)}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index}
              />
              <View style={styles.prevNextPage}>
                <TouchableOpacity onPress={() => handlePage('previous')}>
                  <Text style={styles.title}>{t('prev_page')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handlePage('next')}>
                  <Text style={styles.title}>{t('next_page')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        <TouchableOpacity
          style={styles.plusIconContainer}
          onPress={() => navigateToPages('FarmerCreateProblem', 123)}>
          <Image
            source={require('../../Common/images/plus.png')}
            resizeMode="cover"
            style={{width: 50, height: 50}}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </FarmerDrawerScreenWrapper1>
  );
};
export default FarmerListProblem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
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
  wrapper: {
    marginHorizontal: '2.5%',
    backgroundColor: '#FFF',
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
  },
  flatListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  plusIconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 50,
    elevation: 5,
    zIndex: 99,
    width: 60,
    height: 60,
    backgroundColor: '#4BAE4F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    elevation: 3,
  },

  flatContainer: {
    // backgroundColor: '#ffffff',
    // position: 'absolute',
    // zIndex: 999,
    // bottom: '100%',
    // left: 0,
    // marginHorizontal: '5%',
    // width: '90%',
    // elevation: 10,
    // borderRadius: 10,
    // padding: 10,
    // bottom:100
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    left: 0,
    // top:30,
    marginTop: 60,
    bottom: '65%',
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatContainerLengthUp: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    zIndex: 999,
    left: 0,
    // top: 30,
    bottom: '45%',
    marginHorizontal: '5%',
    width: '90%',
    elevation: 10,
    borderRadius: 10,
    padding: 10,
  },
  flatlistHeight: {
    height: Dimensions.get('window').height / 4,
  },

  flatlisttitle: {
    color: '#000',
    marginVertical: 6,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  flatlistitem: {},
  loadingScreen: {
    position: 'relative',
    top: 100,
  },
});
