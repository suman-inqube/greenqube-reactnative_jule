import React, { createContext, useEffect, useState, lazy } from 'react'
import { getItem, setItem, removeItem } from '../../config/getDataFromStorage';
// const { netConnection } = DeviceInfo();
const userCreateContext = createContext();
import { farmerByNameAPI, problemPlotAgainstFarmerAPI, showCarbonFlag } from '../../config/apiHere';
import { useTranslation } from 'react-i18next';
import { AlertMesg } from '../Common/ToastAlert';
import { Root, Toast, Popup, SPSheet } from 'react-native-popup-confirm-toast';
import { onBackPress } from '../Common/BackPressHandler';
import DeviceInfo from '../DeviceInfo';
import i18next from 'i18next';
const ImagePlaceHolderCircle = lazy(() => import('../Common/ImagePlaceHolderCircle'));
const InputTextForm = lazy(() => import('../Common/InputTextForm'));
const RadioForm = lazy(() => import('../Common/RadioForm'));
const PasswordComp = lazy(() => import('../Common/PasswordComp'));
const ButtonForm = lazy(() => import('../Common/ButtonForm'));
const DropdownForm = lazy(() => import('../Common/DropdownForm'));
const CustomHeader = lazy(() => import('../admin/CustomHeader'));
const LoadingScreen = lazy(() => import('../Common/LoadingScreen'));
const FormsTitle = lazy(() => import('../Common/FormsTitle'));
const DatePickerComp = lazy(() => import('../Common/DatePickerComp'));
const ButtonFormBottom = lazy(() => import('../Common/ButtonFormBottom'));
const Filter = lazy(() => import('../Common/Filter'));
// const DeviceInfo = lazy(() => import('../DeviceInfo'));
const DatePicker = lazy(() => import('react-native-date-picker'));
const config = lazy(() => import('../../config'));
const axios = lazy(() => import('axios'));
const UserCreateContextProvider = (props) => {
    const { netConnection } = DeviceInfo();
    const { t } = useTranslation();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        pageNo: 1, dbName: '', languageId: '', token: '', supervisorId: '', country: '', company: '', agri_user_addresses: '',
        currentPage: '', totalPage: '', userType: '', FcmUserToken: '', owner: '', farmerId: ''
    });
    const [farmerData, setFarmerData] = useState([]);
    const [loginUser_data, setloginUser_data] = useState({});
    const [logoImage, setlogoImage] = useState("");
    const [topBanner, settopBanner] = useState("");
    const [plotAll, setplotAll] = useState([]);
    const AllFarmerList = async () => {
        try {
            var farmer_response = [];
            var responsePlot = [];
            let resCarbonFlag = [];
            const [loginUser_data, logoImageData, topBannerData, companyLanguage_data] = await Promise.all([
                getItem('loginUser_data'),
                getItem('logoImageData'),
                getItem('topBannerData'),
                getItem('companyLanguage_data')
            ]);
            i18next.changeLanguage(loginUser_data?.lan_id.toString());
            if (netConnection && loginUser_data?.token) {
                [farmer_response, responsePlot, resCarbonFlag] = await Promise.all([
                    farmerByNameAPI(loginUser_data?.dbname, loginUser_data?.lan_id, loginUser_data?.token, loginUser_data?.user_id),
                    problemPlotAgainstFarmerAPI(loginUser_data?.dbname, loginUser_data?.lan_id, loginUser_data?.token, loginUser_data?.user_id),
                    showCarbonFlag(loginUser_data?.token, loginUser_data?.dbname, loginUser_data?.lan_id, loginUser_data?.user_id)
                ]);
                if (farmer_response?.status == 200) {
                    await Promise.all([
                        setItem('farmerByNameAPI', farmer_response),
                        setItem('problemPlotAgainstFarmer' + loginUser_data?.user_id, responsePlot),
                        setItem('carbonFlag', resCarbonFlag)
                    ])
                }
            } else {
                [farmer_response, responsePlot, resCarbonFlag] = await Promise.all([
                    getItem('farmerByNameAPI'),
                    getItem('problemPlotAgainstFarmer' + loginUser_data?.user_id),
                    getItem('carbonFlag')
                ]);
            }
            if (farmer_response?.status == 200) {
                let supervisorId = '';
                if (loginUser_data?.userType == 2) {
                    supervisorId = loginUser_data?.owner?.user_id
                } else if (loginUser_data?.userType == 3) {
                    supervisorId = loginUser_data?.user_id
                }
                const { company, country_id, language } = companyLanguage_data;
                const { option_value } = resCarbonFlag?.data?.data || {};
                setlogoImage(logoImageData);
                settopBanner(topBannerData);
                setloginUser_data({ ...loginUser_data, ... { carbonFlag: true } });
                setdbLanTokUsr({
                    ...dbLanTokUsr,
                    dbName: loginUser_data?.dbname,
                    languageId: loginUser_data?.lan_id,
                    token: loginUser_data?.token,
                    supervisorId: supervisorId,
                    farmerId: loginUser_data?.user_id,
                    agri_user_addresses: loginUser_data?.agri_user_addresses,
                    country: loginUser_data?.agri_user_addresses[0].country,
                    company: loginUser_data?.db_company_id,
                    owner: loginUser_data?.owner?.FcmUserToken,
                    FcmUserToken: loginUser_data?.FcmUserToken,
                    languageConpany: company,
                    country_id: country_id,
                    carbonFlag: option_value
                });
                const dataArray = farmer_response?.data?.data?.rows.map(data => ({ value: data.user_id, label: data.userName, phone: data.contactNumber, aadharNumber: data?.aadhar_number, kccNumber: data?.kcc_number }))
                setFarmerData(dataArray);
                const PlotArray = responsePlot?.data?.data.map(data => ({ value: data.rel_id, label: data.plot_no }));
                setplotAll(PlotArray);
            }
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        AllFarmerList();
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
        setIsLoading(true);
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
    const handlePageList = async (value, setIsLoading, token = '', pageNo, Api, setDataAll, dbname, lan_id, user_id, farmer_type = '', question_type = '',fromDate='',toDate='',carbonType) => {
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
                const response = await Api(dbname, lan_id, token, user_id, nextPage, farmer_type, question_type,fromDate,toDate,carbonType)
                if (response?.status == 200) {
                    if (response.data.data.rows.length == 0) {
                        Toast.show({ time: 3, text: `${t('no_data_found')}`, ...AlertMesg[0] });
                    } else {
                        setdbLanTokUsr({ ...dbLanTokUsr, pageNo: nextPage });
                    }
                    setDataAll(response.data.data.rows)
                    await setItem("problem_Data", response.data.data)
                    setIsLoading(false);
                }
            }
        }
        if (value === 'previous') {
            if (pageNo >= 1) {
                if (currentPageNo === 1) {
                    const prePage = currentPageNo - 1
                    const response = await Api(dbname, lan_id, token, user_id, 1, farmer_type, question_type,fromDate,toDate,carbonType);
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
                    const prePage = currentPageNo - 1;
                    setdbLanTokUsr({ ...dbLanTokUsr, pageNo: prePage });
                    const response = await Api(dbname, lan_id, token, user_id, prePage, farmer_type, question_type,fromDate,toDate,carbonType);
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
        }
        setIsLoading(false);
    }
    return (
        <userCreateContext.Provider value={{
            dbLanTokUsr: dbLanTokUsr,
            setdbLanTokUsr: setdbLanTokUsr,
            AllFarmerList: AllFarmerList,
            farmerData: farmerData,
            loginUser_data: loginUser_data,
            isOnline: netConnection,
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
            handlePageList: handlePageList,
            plotAll: plotAll,
            setplotAll: setplotAll,
        }}>
            {props.children}
        </userCreateContext.Provider>
    );
}
const userListContext = createContext("adduser");
export { userListContext, UserCreateContextProvider, userCreateContext }