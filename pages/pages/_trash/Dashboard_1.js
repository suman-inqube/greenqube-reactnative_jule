import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImageForm from '../Common/ImageForm';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import { getItem } from '../../config/getDataFromStorage';
import { dashboardDataListAPI } from '../../config/apiHere';


function BoxDisplay({ name, name1, imageurl }) {
  return (
    <View style={styles.box1}>
      <View style={styles.box1_1}>
        <ImageForm
          source={imageurl}
          resizeMode="cover"
          height={30}
          width={30}
        />
      </View>
      <View>
        <Text style={styles.box1_1}>{name}</Text>
        <Text style={styles.box1_1}>{name1}</Text>
      </View>
    </View>
  );
}
function BoxDisplaySingleLine({ name, imageurl }) {
  return (
    <View style={styles.box1}>
      <View style={styles.box1_1}>
        <ImageForm
          source={imageurl}
          resizeMode="cover"
          height={30}
          width={30}
        />
      </View>
      <View>
        <Text style={styles.box1_1}>{name}</Text>
      </View>
    </View>
  );
}


const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const [loginUser, setloginUser] = useState([]);
  const [dashboardData, setdashboardData] = useState();
  const handleUserList = async () => {
    // console.log(dashboardData)
  }


  let dashboardList = async (dbName, languageId, auth, user_id) => {

    // let response = await dashboardDataListAPI(dbName, languageId, auth, user_id);
    // console.log(response);
    // return;
    try {
      let response = await dashboardDataListAPI(dbName, languageId, auth, user_id);
      if (response.data.data) {
        setdashboardData(response.data.data[0]);
      }
    } catch (error) {
      console.error('dashboard APi error code with :', error.response);
    }
  }

  const onPageLoad = async () => {
    const storeSignup_data = await getItem('storeSignup_data');
    const storePersnolInfo_data = await getItem('storePersnolInfo_data');
    const storeFinancial_data = await getItem('storeFinancial_data');
    const storeProduceInfo_data = await getItem('storeProduceInfo_data');
    const loginUser_data = await getItem('loginUser_data');
    console.log(loginUser_data)

    if (loginUser_data) {
      setIsLoading(false);
      setloginUser(loginUser_data);
      dashboardList(loginUser_data.dbname, loginUser_data.lan_id, loginUser_data.token, loginUser_data.user_id);
    }
    else {
      setIsLoading(true);
    }
  };
  useEffect(() => {

    onPageLoad();
  }, []);


  return (
    <>
      {
        isLoading ?
          (
            <View style={styles.containeracti}>
              <ActivityIndicator size="large" color="#007ACC" />
            </View >
          ) :
          loginUser.microCompany ?
            (
              <View>
                <View id="fix header">
                  <ImageForm
                    source={require('../Common/images/dashboard.jpeg')}
                    resizeMode="cover"
                    height={200}
                    width={'100%'}
                  />
                  <Text style={styles.text}>Welcome To</Text>
                  <Text style={styles.text1}>{loginUser.microCompany.company_display_name}</Text>

                  <View style={styles.containerimg}>
                    <View style={styles.textContainerimg}>
                      {/* <Text style={styles.textimg}>Welcome {loginUser.userName}</Text> */}
                      <Text style={styles.textimg}>{loginUser.microCompany.company_display_name}</Text>

                    </View>
                    <View style={styles.imageContainerimg}>
                      <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: loginUser.agri_files[0].file_path }} />
                    </View>
                  </View>
                </View>
                {/* fix values */}
                {/* <View style={{ paddingHorizontal: 8 }}>

                  <View style={styles.container}>
                    <View style={styles.container1}>
                      <BoxDisplay name="User" name1="Registration" imageurl={require('../Common/images/logo.png')} />
                    </View>
                    <View style={styles.container1}>
                      <TouchableOpacity onPress={handleUserList}>
                        <BoxDisplay name="User" name1="List" imageurl={require('../Common/images/logo.png')} />
                      </TouchableOpacity>
                    </View>
                  </View>


                </View> */}

              </View>
            )
            : ''
      }

    </>

  )
}

export default Dashboard

const styles = StyleSheet.create({
  containeracti: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerimg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  textContainerimg: {
    flex: 1,
  },
  textimg: {
    paddingHorizontal: 30,
    fontSize: 18,
    color: 'black',
  },
  imageContainerimg: {
    marginLeft: 20,
    position: 'absolute',
  },

  text: {
    position: 'absolute',
    top: 130,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  text1: {
    position: 'absolute',
    top: 150,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  text2: {
    textAlign: 'center',
    fontSize: 20,
    padding: 5,
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

  box1:
  {
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.2)', // Shadow color (iOS)
    shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
    shadowOpacity: 0.8, // Shadow opacity (iOS)
    shadowRadius: 20, // Shadow radius (iOS)
  },

  box1_1: {
    marginLeft: 20,
    fontWeight: 'bold'
  }

})
