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
        const [loginUser_data, logoImageData, topBannerData] = await Promise.all([
            getItem('loginUser_data'),
            getItem('logoImageData'),
            getItem('topBannerData')
        ]);
        setlogoImage(logoImageData);
        settopBanner(topBannerData);
        setloginUser_data(loginUser_data);
        const farmer_response = await farmerByNameAPI(loginUser_data?.dbname, loginUser_data?.lan_id, loginUser_data?.token, loginUser_data?.user_id);
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
    }, []);
    const effective_dates = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        return x1[0] + '-' + x1[1] + '-' + x1[2];
    }
    const handleFilter = (search, filterName, farmerData, problemAllRaw, setSearchFarmerPhone, setSearchFarmerName, setSearchResultsList, setProblemAll, setSearchResults) => {
        if (filterName === 'Farmer/Product Name') {
            setSearchFarmerPhone('');
            setSearchFarmerName(search);
            const result = farmerData.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
            if (search == "") {
                setSearchResultsList(false);
                setProblemAll(problemAllRaw);
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
                setProblemAll(problemAllRaw);
            } else {
                setSearchResultsList(true);
            }
            if (result) {
                setSearchResults(result);
            }
        }
    }
    const handleResultSelect = async (name, user_id, phone, setIsLoading, setSearchResultsList, setSearchFarmerPhone, setSearchFarmerName, setSearchResults, setProblemAll) => {
        setIsLoading(true)
        setSearchResultsList(false);
        setSearchFarmerPhone(phone)
        setSearchFarmerName(name);
        setSearchResults([]);
        if (name !== '') {
            let from_date = ''
            let to_date = ''
            let mobileNo = ''
            const response = await problemListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, user_id, 0, user_id, from_date, to_date, mobileNo)
            if (response?.status == 200) {
                setIsLoading(false)
                setProblemAll(response?.data?.data?.rows)
                // setProblemAllRaw(response.data.data.rows)
            }
        } else {
            let tempData = problemAll.filter(item => {
                return item.agri_user.contactNumber.toLowerCase().indexOf(phone.toLowerCase()) > -1;;
            });
            setProblemAll(tempData)
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
            handleResultSelect: handleResultSelect
        }}>
            {props.children}
        </userCreateContext.Provider>
    );
}
const userListContext = createContext("adduser");

export { userListContext, UserCreateContextProvider, userCreateContext }