import React, { useEffect, useState } from 'react'
import { getItem } from '../../config/getDataFromStorage';
const loginUserDataController = () => {
    const [loginUserData, setloginUserData] = useState({
        dbname: "",
        lan_id: "",
        token: "",
        user_id: ""
    });
    const GetLoginUserData = async () => {
        const [loginUser_data] = await Promise.all([
            getItem('loginUser_data')
        ]);
        if (loginUser_data) {
            const { dbname, lan_id, token, user_id, owner } = loginUser_data;
            setloginUserData({
                ...loginUserData,
                dbname: dbname,
                lan_id: lan_id,
                token: token,
                user_id: user_id,
                owner: owner
            });
            return {
                dbname, lan_id, token, user_id, owner
            }
        }
    }
    // useEffect(() => {
    //     onPageLoad();
    // }, [])
    return {
        GetLoginUserData,
        loginUserData
    }
}

export default loginUserDataController