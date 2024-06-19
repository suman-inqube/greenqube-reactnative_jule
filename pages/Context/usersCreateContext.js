import React, { createContext, useEffect, useState, lazy } from 'react'
import { getItem, setItem, removeItem } from '../../config/getDataFromStorage';
// const { netConnection } = DeviceInfo();
const userCreateContext = createContext();
import { farmerByNameAPI, problemListAPI } from '../../config/apiHere';
import { useTranslation } from 'react-i18next';
import { AlertMesg } from '../Common/ToastAlert';
import { Root, Toast, Popup, SPSheet } from 'react-native-popup-confirm-toast';
import { onBackPress } from '../Common/BackPressHandler';
import InputTextForm from '../Common/InputTextForm';
import RadioForm from '../Common/RadioForm';
import PasswordComp from '../Common/PasswordComp';
import ButtonForm from '../Common/ButtonForm';
import axios from 'axios';
import config from '../../config';
import DeviceInfo from '../DeviceInfo';
import DropdownForm from '../Common/DropdownForm';
import CustomHeader from '../admin/CustomHeader';
import FormsTitle from '../Common/FormsTitle';
import ImagePlaceHolderCircle from '../Common/ImagePlaceHolderCircle';
import DatePicker from 'react-native-date-picker';
import LoadingScreen from '../Common/LoadingScreen';
import DatePickerComp from '../Common/DatePickerComp';
import ButtonFormBottom from '../Common/ButtonFormBottom';
import Filter from '../Common/Filter';
const UserCreateContextProvider = (props) => {
    const { netConnection } = DeviceInfo();
    const { t } = useTranslation();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        pageNo: 1, dbName: '', languageId: '', token: '', supervisorId: '', country: '', company: '', agri_user_addresses: '',
        currentPage: '', totalPage: '', userType: '', FcmUserToken: '', owner: '',
    });
    const [farmerData, setFarmerData] = useState([]);
    const [loginUser_data, setloginUser_data] = useState({});
    const [logoImage, setlogoImage] = useState("");
    const [topBanner, settopBanner] = useState("");
    const AllFarmerList = async () => {
        var farmer_response = [];
        const [loginUser_data, logoImageData, topBannerData] = await Promise.all([
            getItem('loginUser_data'),
            getItem('logoImageData'),
            getItem('topBannerData')
        ]);
        setlogoImage(logoImageData);
        settopBanner(topBannerData);
        setloginUser_data(loginUser_data);
        if (netConnection) {
            farmer_response = await farmerByNameAPI(loginUser_data?.dbname, loginUser_data?.lan_id, loginUser_data?.token, loginUser_data?.user_id);
            if (farmer_response?.status == 200) {
                await setItem('farmerByNameAPI', farmer_response);
            }
        } else {
            farmer_response = await getItem('farmerByNameAPI');
        }
        if (farmer_response?.status == 200) {
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: loginUser_data?.dbname,
                languageId: loginUser_data?.lan_id,
                token: loginUser_data?.token,
                supervisorId: loginUser_data?.user_id,
                agri_user_addresses: loginUser_data?.agri_user_addresses,
                country: loginUser_data?.agri_user_addresses[0].country,
                company: loginUser_data?.db_company_id
            });
            const dataArray = farmer_response?.data?.data?.rows.map(data => ({ value: data.user_id, label: data.userName, phone: data.contactNumber }));
            setFarmerData(dataArray)
        }
    }
    useEffect(() => {
        AllFarmerList()
    }, [netConnection]);
    const effective_dates = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        return x1[0] + '-' + x1[1] + '-' + x1[2];
    }
    const handleFilter = (search, filterName, farmerData, AllRawData, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, setAllData, setSearchResults) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setAllData(AllRawData);
            } else {
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        } else if (filterName === 'PhoneNumber') {
            setSearchFarmerName('');
            setSearchFarmerPhone(search);
            const result = farmerData.filter(item => item.phone.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setAllData(AllRawData);
            } else {
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }
    const handleResultSelect = async (name, user_id, phone, allData, ListAPI, setIsLoading, setSearchResultsList, setSearchFarmerPhone, setSearchFarmerName, setSearchResults, setAllData) => {
        setIsLoading(true)
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            let from_date = ''
            let to_date = ''
            let mobileNo = ''
            const response = await ListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, user_id, 1, user_id, from_date, to_date, mobileNo)
            if (response?.status == 200) {
                setIsLoading(false);
                setAllData(response?.data?.data?.rows);
            }
        } else {
            let tempData = allData.filter(item => { return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1 });
            setAllData(tempData);
        }
    };
    const handlePageList = async (value, setIsLoading, token = '', pageNo, Api, setDataAll, dbname, lan_id, user_id) => {
        setIsLoading(true);
        const currentPageNo = pageNo
        const totalPage = totalPage;
        if (value === 'next') {
            if (totalPage === currentPageNo) {
                setDataAll([])
                Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
                setIsLoading(false)
                return;
            } else {
                const nextPage = currentPageNo + 1
                const response = await Api(dbname, lan_id, token, user_id, nextPage)
                if (response?.status == 200) {
                    if (response.data.data.rows.length == 0) {
                        Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
                    } else {
                        setdbLanTokUsr({ ...dbLanTokUsr, pageNo: nextPage });
                    }
                    setDataAll(response.data.data.rows)
                    setItem("problem_Data", response.data.data)
                    setIsLoading(false);
                }
            }
        }
        if (value === 'previous') {
            if (pageNo > 1) {
                if (currentPageNo === 1) {
                    const prePage = currentPageNo - 1
                    const response = await Api(dbname, lan_id, token, user_id, 1);
                    if (response?.status == 200) {
                        if (response.data.data.rows.length == 0) {
                            Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
                        } else {
                            setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage });
                        }
                        setDataAll(response.data.data.rows);
                        setItem("problem_Data", response.data.data);
                        setIsLoading(false);
                    }
                } else {
                    const prePage = currentPageNo - 1
                    setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage });
                    const response = await Api(dbname, lan_id, token, user_id, prePage);
                    if (response?.status == 200) {
                        if (response.data.data.rows.length == 0) {
                            Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
                        } else {
                            setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage });
                        }
                        setDataAll(response.data.data.rows);
                        setItem("problem_Data", response.data.data);
                        setIsLoading(false);
                    }
                }
            }
            setIsLoading(false);
        }
    }
    return (
        <userCreateContext.Provider value={{
            dbLanTokUsr: dbLanTokUsr,
            setdbLanTokUsr: setdbLanTokUsr,
            AllFarmerList: AllFarmerList,
            farmerData: farmerData,
            loginUser_data: loginUser_data,
            // isOnline: netConnection
            t: t,
            AlertMesg: AlertMesg,
            onBackPress: onBackPress,
            getItem: getItem,
            setItem: setItem,
            removeItem: removeItem,
            InputTextForm: InputTextForm,
            RadioForm: RadioForm,
            PasswordComp: PasswordComp,
            ButtonForm: ButtonForm,
            axios: axios,
            config: config,
            DeviceInfo: DeviceInfo,
            DropdownForm: DropdownForm,
            Root: Root,
            Toast: Toast,
            Popup: Popup,
            SPSheet: SPSheet,
            CustomHeader: CustomHeader,
            FormsTitle: FormsTitle,
            ImagePlaceHolderCircle: ImagePlaceHolderCircle,
            logoImage: logoImage,
            topBanner: topBanner,
            setlogoImage: setlogoImage,
            settopBanner: settopBanner,
            DatePicker: DatePicker,
            LoadingScreen: LoadingScreen,
            DatePickerComp: DatePickerComp,
            ButtonFormBottom: ButtonFormBottom,
            effective_dates: effective_dates,
            Filter: Filter,
            handleFilter: handleFilter,
            handleResultSelect: handleResultSelect,
            handlePageList: handlePageList
        }}>
            {props.children}
        </userCreateContext.Provider>
    );
}
const userListContext = createContext("adduser");

export { userListContext, UserCreateContextProvider, userCreateContext }