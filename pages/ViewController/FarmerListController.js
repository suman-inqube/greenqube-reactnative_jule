
import React, { useEffect, useState } from 'react';
import loginUserDataController from './loginUserDataController';
import { farmerByNameAPI } from '../../config/apiHere';
const FarmerListController = () => {
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const [farmerList, setFarmerList] = useState([]);
    const GetFarmerList = async () => {
        const GetLoginUserDataRes = await GetLoginUserData();
        if (GetLoginUserDataRes) {
            const { dbname, lan_id, token, user_id } = GetLoginUserDataRes;
            const farmer_res = await farmerByNameAPI(dbname, lan_id, token, user_id);
            if (farmer_res.status == 200) {
                return farmer_res.data.data.rows;
            } else {
                return null;
            }
        }
    }
    // useEffect(() => {
    //     onPageLoad();
    // }, [])
    return {
        GetFarmerList,
        farmerList,
    }
}
export default FarmerListController
