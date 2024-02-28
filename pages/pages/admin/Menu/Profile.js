import {
    Button, FlatList, StyleSheet, Text, TouchableOpacity, View,
    ScrollView, Image, KeyboardAvoidingView
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { userDetailAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import InputTextForm from '../../Common/InputTextForm';
import DropdownForm1 from '../../Common/DropdownForm1';
import DropdownForm from '../../Common/DropdownForm';
import ButtonForm from '../../Common/ButtonForm';
import DatePickerComp from '../../Common/DatePickerComp';
// import { useNavigation, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import MessageDialog from '../../Common/MessageDialog';
import { updateUserInfoAPI,blockDataListAPI, districtDataListAPI1, districtDataListAPI, blockDataListAPI1, firstLanguageListAPI, stateListAPI, languageDataListAPI, stateInfoDataListAPI } from '../../../config/apiHere';
import CustomHeader from '../CustomHeader';

const Profile = () => {
    const navigation = useNavigation();
    const [dbName, setdbName] = useState();
    const [token, setToken] = useState();
    const [userDetail, setuserDetails] = useState({});
    const [languageData, setlanguageData] = useState([]);
    const [stateInfoData, setstateInfoData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [blockData, setBlockData] = useState([]);
    const [storePersnolInfo, setstorePersnolInfo] = useState({});


    const handleSave = async () => {
         console.log(storePersnolInfo);
        // return
         addressInfo = [{
            country: '1',
             state: storePersnolInfo.state,
             district: storePersnolInfo.district,
             subdivision: storePersnolInfo.block
    }];
        

       
        const formData = new FormData();
        
        formData.append("lan_id", storePersnolInfo.langId);
        formData.append("addressInfo", JSON.stringify(addressInfo));
        formData.append("status", "1");
        formData.append("userName", storePersnolInfo.userName);
        formData.append("date_of_birth", storePersnolInfo.date_of_birth);

        let submitRes = await updateUserInfoAPI(dbName, storePersnolInfo.language, storePersnolInfo.userId, token, formData);
        // console.log(submitRes);
        if (submitRes){
            // MessageDialog({ title: 'Successful', message: "Successfull SignUp Data" })
            navigation.navigate('Login', { pagename: 'Login', locale: storePersnolInfo.locale });
        }else{
        MessageDialog({ title: 'Error', message: error.response.data.error.errorMessage })
        navigation.navigate('Login', { pagename: 'Login' });

        }

    }


    let languageDataList = async (dbname) => {
        
        try {
            let languageArray = [];
            let language_res = await firstLanguageListAPI(dbname);
            // console.log(JSON.stringify(language_res, null, 2));
            if (language_res.data) {
                language_res.data.data.forEach(element => {
                  
                    languageArray.push({
                        value: element.id,
                        label: element.name,
                        sName: element.sname,
                    });
                });
                setlanguageData(languageArray);
            }
        } catch (error) {
            console.log("Error in language API", error.response);
        }
    }

    const handleLanguage = (language) => {
        setstorePersnolInfo({ ...storePersnolInfo, langId: language.value, locale: language.sName})
        console.log(storePersnolInfo);
        if (language.value !== storePersnolInfo.langId){
            setstorePersnolInfo({ ...storePersnolInfo, state: "", langId: language.value, locale: language.sName })
        }
        stateInfoDataList(dbName, language.value, token)
        
    }



    let stateInfoDataList = async (dbName, language, token) => {
       
        try {
            let stateArray = [];
            let state_res = await stateListAPI(dbName, language, token);
            if (state_res.data.data.count > 0) {
                state_res.data.data.rows.forEach(element => {
                    stateArray.push({
                        value: element.fid,
                        label: element.state_name,
                    });
                });
                setstateInfoData(stateArray);
            }
        } catch (error) {
            console.log("Error in state API", error.response);
        }
    }
    const handleStateInfo = (state) => {
        setstorePersnolInfo({ ...storePersnolInfo, state: state.value })
        districtDataList(dbName, storePersnolInfo.langId, state.value);
    }

    let districtDataList = async (dbName, language, state) => {
        try {
            let districtArray = [];
            let district_res = await districtDataListAPI1(dbName, language, state);
            if (district_res.data.data) {
                district_res.data.data.rows.forEach(element => {
                    districtArray.push({
                        value: element.fid,
                        label: element.district_name,
                    });
                });
                setDistrictData(districtArray);
            }
        } catch (error) {
            console.log("Error in district API", error.response);
        }
    }

    const handleDistrict = (district) => {
        setstorePersnolInfo({ ...storePersnolInfo, district: district.value })
        blockDataList(dbName, storePersnolInfo.langId, district.value);
    }
    let blockDataList = async (dbName, language, district) => {
        try {
            let blocktArray = [];
            let block_res = await blockDataListAPI1(dbName, language, district);
            if (block_res.data.data) {
                block_res.data.data.rows.forEach(element => {
                    blocktArray.push({
                        value: element.fid,
                        label: element.subdiv_name,
                    });
                });
                setBlockData(blocktArray);
            }
        } catch (error) {
            console.log("Error in Block API", error).response;
        }
    }

    const userDetails = async (dbName, languageId, token, user_id) => {

        let response = await userDetailAPI(dbName, languageId, token, user_id);
        
        //    console.log(JSON.stringify(response.data.data[0], null, 2));
        if (response.data) {
            setstorePersnolInfo({ ...storePersnolInfo, 
                userId: user_id,
                userName: response.data.data[0].userName,
                contactNumber: response.data.data[0].contactNumber,
                date_of_birth: response.data.data[0].date_of_birth,
                langId: response.data.data[0].agri_language.id,
                locale: response.data.data[0].agri_language.sname,
                state: response.data.data[0].agri_user_addresses[0].agri_state.fid,
                district: response.data.data[0].agri_user_addresses[0].agri_district.fid,
                block: response.data.data[0].agri_user_addresses[0].agri_subdivision.fid,
             })
           
            //  console.log(storePersnolInfo);


             


            languageDataList(dbName)
            if (response.data.data[0].agri_language.id){
           
                stateInfoDataList(dbName, response.data.data[0].agri_language.id, token)
            }
            if (response.data.data[0].agri_user_addresses[0].agri_state.fid) {

                districtDataList(dbName, response.data.data[0].agri_language.id, response.data.data[0].agri_user_addresses[0].agri_state.fid);
            }
            if (response.data.data[0].agri_user_addresses[0].agri_district.fid) {
                blockDataList(dbName, response.data.data[0].agri_language.id, response.data.data[0].agri_user_addresses[0].agri_district.fid);
            }
            
        

            // setuserDetails(response.data.data[0]);
            // setItem("userDetailData", response.data.data)
            
        
        }
        
        // }
    }

    const onPageLoad = async () => {
        const loginUser_data = await getItem('loginUser_data');
        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const userID = loginUser_data.user_id;
            setdbName(loginUser_data.dbname)
            setToken(loginUser_data.token)
             
             userDetails(dbName, languageID, token, userID)
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);

    // <DatePickerComp
    //     openDate={activityPreDate}
    //     newDate={newFromDate}
    //     setOpenDate={setActivityPreDate}
    //     handleDatePicker={handleDatePicker2}
    // />

    return (
        <View style={styles.container}>
            <CustomHeader />
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                    Profile
                </Text>
            </View>
            <ScrollView>
                <View style={styles.fromContainer}>
                    <InputTextForm label="Name" color="black" value={storePersnolInfo.userName} />
                    <InputTextForm label="Phone Number" color="black" value={storePersnolInfo.contactNumber} />
                        <View>
                            <Text style={{ color: 'black', marginLeft: 5, }}>Date of Birth</Text>
                            <TouchableOpacity style={styles.DateofBirth}>
                            <Text>{storePersnolInfo.date_of_birth} </Text>
                                <Image
                                    source={require('../../Common/images/calendar.png')}
                                    style={{ width: 20, height: 20 }}
                                />
                            </TouchableOpacity>
                        </View>
                
                    <DropdownForm label="Language" color="black" data={languageData} onChange={item => { handleLanguage(item) }} val={storePersnolInfo.langId} />

                    <DropdownForm label="State" color="black" data={stateInfoData} onChange={item => { handleStateInfo(item) }} val={storePersnolInfo.state} />

                    <DropdownForm label="District" color="black" data={districtData} onChange={item => { handleDistrict(item) }} val={storePersnolInfo.district} />

                    <DropdownForm label="Block/Subdivision" color="black" data={blockData} onChange={item => { setstorePersnolInfo({ ...storePersnolInfo, block: item.value }) }} val={storePersnolInfo.block} />



                </View>

            </ScrollView>
            <View style={{ marginTop: 10 }}>
                <ButtonForm label='Submit' onPress={() => handleSave()} />
            </View>
        </View>
    )


}


export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
    },
    fromContainer: {
        width: '90%',
        marginHorizontal: '5%'
    },
    DateofBirth: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderRadius: 8,
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        backgroundColor: 'white',
        width: '100%',
        paddingHorizontal: 10,
    }

})


