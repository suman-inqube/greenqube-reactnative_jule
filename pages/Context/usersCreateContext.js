import React, { createContext, useEffect, useState } from 'react'
import DeviceInfo from '../DeviceInfo';
import { getItem, setItem } from '../../config/getDataFromStorage';
// const { netConnection } = DeviceInfo();
const userCreateContext = createContext();
import { farmerByNameAPI } from '../../config/apiHere';
import { useTranslation } from 'react-i18next';
import { AlertMesg } from '../Common/ToastAlert';
import { onBackPress } from '../Common/BackPressHandler';
const UserCreateContextProvider = (props) => {
    const { t } = useTranslation();
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        pageNo: 1, dbName: '', languageId: '', token: '', supervisorId: '', country: '', company: '', agri_user_addresses: '',
        currentPage: '', totalPage: ''
    });
    const [farmerData, setFarmerData] = useState([]);
    const [loginUser_data, setloginUser_data] = useState({});
    const AllFarmerList = async () => {
        const loginUser_data = await getItem('loginUser_data');
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
            setItem: setItem
        }}>
            {props.children}
        </userCreateContext.Provider>
    );
}
const userListContext = createContext("adduser");

export { userListContext, UserCreateContextProvider, userCreateContext }