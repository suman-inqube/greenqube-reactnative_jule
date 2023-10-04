import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { getItem } from '../../config/getDataFromStorage';
import { BoxDisplay } from './dashboardComp';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';


const Dashboard = ({ navigation }) => {

  const [bottomBanner, setbottomBanner] = useState();
  const [userListShow, setuserListShow] = useState(false);
  const [isMenuShow, setisMenuShow] = useState();
  const [userName, setuserName] = useState();
  const [profileImg, setprofileImg] = useState();


  const handleUserList = async (item) => {
    setisMenuShow(item)
  }
  const handleBackPage = async (item) => {

  }

  const navigateToPages = (pageName) => {
    navigation.navigate(pageName);
    console.warn(pageName);
  };
  const onPageLoad = async () => {
    const bottomBannerData = await getItem('bottomBannerData');
    setbottomBanner(bottomBannerData);
    const userNameData = await getItem('userNameData');
    setuserName(userNameData);
    const profileImgData = await getItem('profileImgData');
    setprofileImg(profileImgData);
    // console.log(JSON.stringify(topBannerData, null, 2));
  };
  useEffect(() => {
    onPageLoad();
  }, []);

  return (
    <>
      <View name="name">
        <View style={styles.containerimg}>
          {profileImg ?
            <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: profileImg }} />
            : ""
          }
        </View>
        <Text style={{ fontSize: 18, textAlign: 'center', marginTop: -15, }}>Welcome {userName}</Text>
      </View>

      <View style={styles.container}>
        <BoxDisplay text="User" text1="Registration" imageurl={require('../Common/images/logo.png')} onpress={() => navigateToPages('Signup')}/>
        <BoxDisplay text="User" text1="List" imageurl={require('../Common/images/logo.png')} onpress={() => navigateToPages('userList')}/>

      </View>
      <View style={styles.container}>
        <BoxDisplay text="" text1="Problem" imageurl={require('../Common/images/logo.png')} onpress={() => navigateToPages('Signup')}/>
        <BoxDisplay text="" text1="Activity" imageurl={require('../Common/images/logo.png')} onpress={() => navigateToPages('activityList')}/>
      </View>


    </>

  )
}

export default Dashboard

const styles = StyleSheet.create({
  container:
  {
   flexDirection:'row',
   justifyContent:'space-between'
  },

  bottomContainer:
  {
    flex: 1,
    marginTop: 100,
  },

  containerimg: {
    flex: 1,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
})
