import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import ImageForm from '../Common/ImageForm';
import { getItem, removeItem } from '../../config/getDataFromStorage';
import { BoxDisplay } from './dashboardComp';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import CustomHeader from './CustomHeader';

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
    // console.warn(pageName);
  };
  const onPageLoad = async () => {
    // await removeItem('companyLanguage_data')
    // await removeItem('loginUser_data')
    const bottomBannerData = await getItem('bottomBannerData');
    setbottomBanner(bottomBannerData);
    const userNameData = await getItem('userNameData');
    setuserName(userNameData);
    const profileImgData = await getItem('profileImgData');
    setprofileImg(profileImgData);
    // console.log(JSON.stringify(bottomBannerData, null, 2));
  };
  useEffect(() => {
    onPageLoad();
  }, []);

  return (
    <>

      <CustomHeader path="exit"/>
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
        <BoxDisplay text={"User\nRegistration"} imageurl={require('../Common/images/register_farmer.png')} onpress={() => navigateToPages('Signup')} />
        <BoxDisplay text={"User \nList"} imageurl={require('../Common/images/farmer_list.png')} onpress={() => navigateToPages('userList')} />
      </View>

      <View style={styles.container}>
        <BoxDisplay text="Problem" imageurl={require('../Common/images/raise_problem_only.png')} onpress={() => navigateToPages('ProblemList')} />
        <BoxDisplay text="Activity" imageurl={require('../Common/images/activity_report_only.png')} onpress={() => navigateToPages('activityList')} />
      </View>

      <View style={styles.container}>
        <BoxDisplay text="Inputs" imageurl={require('../Common/images/input_inqu_only.png')} onpress={() => navigateToPages('InputList')} />
        <BoxDisplay text="Output" imageurl={require('../Common/images/dash_sale_your_product.png')} onpress={() => navigateToPages('OutPutList')} />
      </View>

      <View style={styles.container}>
        <BoxDisplay text="Market" imageurl={require('../Common/images/market_information_only.png')} onpress={() => navigateToPages('problemReporting')} />
        <BoxDisplay text="Information" imageurl={require('../Common/images/dash_useful_information.png')} onpress={() => navigateToPages('UsefulInformationList')} />
      </View>
        
          
      {bottomBanner ?
                            <ImageForm
                                source={{ uri: bottomBanner }}
                                resizeMode="cover"
                                height={320}
                                width={'100%'}
                            />
                            : ''}

    </>

  )
}

export default Dashboard

const styles = StyleSheet.create({
  container:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8
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
