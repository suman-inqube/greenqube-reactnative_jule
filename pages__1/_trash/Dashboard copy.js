import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import ImageForm from '../Common/ImageForm';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import { getItem } from '../../config/getDataFromStorage';
import { BoxDisplay } from './dashboardComp';
import UserList from './UserList';
import Signup from '../Signup';



const Dashboard = () => {
  const [topBanner, settopBanner] = useState();
  const [userName, setuserName] = useState();
  const [profileImg, setprofileImg] = useState();
  const [bottomBanner, setbottomBanner] = useState();
  const [userListShow, setuserListShow] = useState(true);
  const [isMenuShow, setisMenuShow] = useState('userList');

  const handleUserList = async (item) => {
    setisMenuShow(item)
  }
  const handleBackPage = async (item) => {
    setisMenuShow(item)
  }

  const onPageLoad = async () => {
    const topBannerData = await getItem('topBannerData');
    settopBanner(topBannerData);
    const userNameData = await getItem('userNameData');
    setuserName(userNameData);
    const profileImgData = await getItem('profileImgData');
    setprofileImg(profileImgData);
    const bottomBannerData = await getItem('bottomBannerData');
    setbottomBanner(bottomBannerData);
    // console.log(JSON.stringify(topBannerData, null, 2));
  };
  useEffect(() => {
    onPageLoad();
  }, []);

  return (
    <>
      <View>
        {topBanner ?
          <ImageForm
            source={{ uri: topBanner }}
            resizeMode="cover"
            height={200}
            width={'100%'}
          /> : ''}

        <View style={styles.containerimg}>
          {profileImg ?
            <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: profileImg }} />
            : ""
          }
        </View>
        <Text style={{ fontSize: 18, textAlign: 'center', marginTop: -15, }}>Welcome {userName}</Text>
      </View>
      {/* --------------- fix values-------------------- */}

      <View style={{ paddingHorizontal: 8 }}>
        {
          isMenuShow === 'userList'
            ?
            <UserList backPageValue={handleBackPage} />
            :
            isMenuShow === 'userRegistration'
              ?
              <Signup />
              : <View id="dashboar_menu">
                <View style={styles.container}>
                  <View style={styles.container1}>
                    <TouchableOpacity onPress={() => handleUserList('userRegistration')}>
                      <BoxDisplay name="User" name1="Registration" imageurl={require('../Common/images/logo.png')} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.container1}>
                    <TouchableOpacity onPress={() => handleUserList('userList')}>
                      <BoxDisplay name="User" name1="List" imageurl={require('../Common/images/logo.png')} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.bottomContainer}>
                  {bottomBanner ?
                    <ImageForm
                      source={{ uri: bottomBanner }}
                      resizeMode="cover"
                      height={200}
                      width={'100%'}
                    /> : ''}
                </View>
              </View>
        }

      </View>
    </>

  )
}

export default Dashboard

const styles = StyleSheet.create({
  containerimg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container:
  {
    flex: 1,
    flexDirection: 'row'
  },
  container1:
  {
    flex: 1,
    padding: 5,
  },
  bottomContainer:
  {
    flex: 1,
    marginTop: 100,
  },


})
