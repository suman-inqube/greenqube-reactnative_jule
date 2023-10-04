import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImageForm from '../Common/ImageForm';
import ImagePlaceHolderCircleWithoutAddButton from '../Common/ImagePlaceHolderCircleWithoutAddButton';
import { getItem } from '../../config/getDataFromStorage';
import UserList from './UserList';
import { dashboardDataListAPI, fpodetailsDataListAPI, userDataListAPI } from '../../config/apiHere';
import axios from 'axios';

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
  const [isActiveUserList, setisActiveUserList] = useState(true);
  const navigation = useNavigation();
  const [loginUser, setloginUser] = useState([]);
  const [userListData, setuserListData] = useState([]);
  const [fPODetailsData, setfPODetailsData] = useState([]);
  const [dashboardData, setdashboardData] = useState({});

  let userList = async (dbname, languageID, token, userID) => {
    let response = await userDataListAPI(dbname, languageID, token, userID);
    // console.log(JSON.stringify(response.data.data, null, 2));
    if (response.data) {
      setuserListData(JSON.stringify(response.data.data));
    }

  }


  let fpoDetailsList = async (dbName, languageID, token, userID, compCode) => {
    let response = await fpodetailsDataListAPI(dbName, languageID, token, userID, compCode);
    if (response.data) {
      setfPODetailsData(JSON.stringify(response.data.data))
      // console.log(JSON.stringify(response.data, null, 2));
    }

  }

  let dashboardList = async (dbName, languageID, token, userID) => {
    let response = await dashboardDataListAPI(dbName, languageID, token, userID);
    if (response) {
      setdashboardData(JSON.stringify(response.data.data))
      // console.log(JSON.stringify(response, null, 2));
    }
  }

  const handleUserList = async () => {
    setisActiveUserList(true)
  }
  const onPageLoad = async () => {
    const loginUser_data = await getItem('loginUser_data');
    // console.log('Readable log:', JSON.stringify(loginUser_data.sa_company[0].company_code, null, 2));
    if (loginUser_data) {
      const dbName = loginUser_data.dbname;
      const languageID = loginUser_data.lan_id;
      const token = loginUser_data.token;
      const userID = loginUser_data.user_id;
      const compCode = loginUser_data.sa_company[0].company_code;
      setIsLoading(false);
      setloginUser(loginUser_data);
      userList(dbName, languageID, token, userID);
      fpoDetailsList(dbName, languageID, token, userID, compCode);
      dashboardList(dbName, languageID, token, userID);
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
      <UserList />
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
    fontSize: 18
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
