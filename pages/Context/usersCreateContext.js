import React, { createContext, useEffect, useState, lazy } from 'react'
import { getItem, setItem, removeItem } from '../../config/getDataFromStorage';
// const { netConnection } = DeviceInfo();
const userCreateContext = createContext();
import { farmerByNameAPI } from '../../config/apiHere';
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
        setlogoImage(logoImageData)
        settopBanner(topBannerData);
        const { dbname, lan_id, token, user_id, agri_user_addresses,
            db_company_id } = loginUser_data;
        setloginUser_data(loginUser_data);
        const farmer_response = await farmerByNameAPI(dbname, lan_id, token, user_id);
        if (farmer_response?.status == 200) {
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbname,
                languageId: lan_id,
                token: token,
                supervisorId: user_id,
                agri_user_addresses: agri_user_addresses,
                country: agri_user_addresses[0].country,
                company: db_company_id
            });
            const dataArray = farmer_response?.data?.data.rows.map(data => ({ value: data.user_id, label: data.userName, phone: data.contactNumber }));
            setFarmerData(dataArray)
        }
    }
    useEffect(() => {
        AllFarmerList()
    }, [])
    const effective_dates = (item) => {
        const dt = new Date(item);
        const x = dt.toISOString().split('T');
        const x1 = x[0].split('-');
        return x1[0] + '-' + x1[1] + '-' + x1[2];
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
            DatePicker: DatePicker,
            LoadingScreen: LoadingScreen,
            DatePickerComp: DatePickerComp,
            ButtonFormBottom: ButtonFormBottom,
            effective_dates: effective_dates,
            Filter: Filter
        }}>
            {props.children}
        </userCreateContext.Provider>
    );
}
const userListContext = createContext("adduser");

export { userListContext, UserCreateContextProvider, userCreateContext }