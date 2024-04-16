import { BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import loginUserDataController from './loginUserDataController';
import {
    PackageOfPracticesList,
    productionSeasonAndLivelyhoodTypeListAPI,
    productionStageAPI,
    POPDetails, POPStaticMenuList, POPStaticMenuListDetails
} from '../../config/apiHere';
import { onBackPress } from '../Common/BackPressHandler';
const PackageOfPracticesController = () => {
    const routename = useRoute().name;
    const { GetLoginUserData, loginUserData } = loginUserDataController();
    const { dbname, lan_id, token, user_id } = loginUserData;
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [livelihoodType, setLivelihoodType] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [packageList, setPackageList] = useState([]);
    const [POPDetailsList, setPOPDetailsList] = useState([]);
    const [livehoodTypeFilterData, setLivehoodTypeFilterData] = useState({
        name: '',
        value: ''
    });
    const HandlerGoBack = (path, paramsData) => {
        let paramsArr = [];
        const routes = navigation.getState()?.routes;
        routes.filter(item => {
            if (item.name == "PackageOfPracticesDetails") {
                paramsArr = item.params;
            }
        });
        navigation.navigate(path, paramsArr);
    }
    const onPageLoad = async () => {
        setIsLoading(true);
        const [GetLoginUserDataRes] = await Promise.all([
            GetLoginUserData()
        ]);
        if (GetLoginUserDataRes) {
            const { dbname, lan_id, token, user_id } = GetLoginUserDataRes;
            const [livehoodTypeRes, packageListRes] = await Promise.all([
                productionSeasonAndLivelyhoodTypeListAPI(dbname),
                PackageOfPracticesList(dbname, lan_id),
            ])
            let PackageListArr = [];
            let LivelihoodArr = [{
                value: "",
                label: "All"
            }];
            if (packageListRes.status == 200) {
                const { rows } = packageListRes.data.data;
                if (rows != null) {
                    rows.map((data, index) => {
                        const { fid, name, agri_files } = data;
                        PackageListArr.push({
                            value: fid,
                            label: name,
                            agri_files: agri_files
                        })
                    });
                }
            }
            setPackageList(PackageListArr);
            if (livehoodTypeRes.status == 200) {
                const { crop_type } = livehoodTypeRes.data.data;
                crop_type.map((data, index) => {
                    const { fid, name } = data;
                    LivelihoodArr.push({
                        value: fid,
                        label: name
                    })
                });
            }
            setLivelihoodType(LivelihoodArr);
        }
        setIsLoading(false);
    }
    useEffect(() => {
        onPageLoad();
    }, [])
    function handleBackPress() {
        let paramsArr = [];
        const routes = navigation.getState()?.routes;
        routes.filter(item => {
            if (item.name == "PackageOfPracticesDetails") {
                paramsArr = item.params;
            }
        });
        switch (routename) {
            case "PackageOfPractices":
                navigation.navigate("FarmerDashboard");
                break;
            case "PackageOfPracticesDetails":
                navigation.navigate("PackageOfPractices");
                break;
            case "PackageItemDetails":
                navigation.navigate("PackageOfPracticesDetails", paramsArr);
                break;
        }
        return true;
    }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
    const productFilter = async (item) => {
        let PackageListArr = [];
        const { label, value } = item;
        setLivehoodTypeFilterData({
            ...livehoodTypeFilterData,
            name: label,
            value: value
        });
        setIsLoading(true);
        setModalVisible(false);
        let fliterRes;
        if (label == "All") {
            fliterRes = await PackageOfPracticesList(dbname, lan_id)
        } else {
            fliterRes = await productionStageAPI(dbname, lan_id, value, '');
        }
        if (fliterRes.status == 200) {
            if (label == "All") {
                const { rows } = fliterRes.data.data;
                if (rows != null) {
                    rows.map((data, index) => {
                        const { fid, name, agri_files } = data;
                        PackageListArr.push({
                            value: fid,
                            label: name,
                            agri_files: agri_files
                        })
                    });
                }
            } else {
                const { crop_name } = fliterRes.data.data;
                if (crop_name != null) {
                    crop_name.map((data, index) => {
                        const { fid, name, agri_files } = data.crop_name;
                        PackageListArr.push({
                            value: fid,
                            label: name,
                            agri_files: agri_files
                        })
                    })
                }
            }
            setPackageList(PackageListArr);
        }
        setIsLoading(false);
    }
    const onChangeDetails = async (item) => {
        let POPDetailsListArr = [];
        const { value, agri_files } = item;
        const [popStaticMenuListRes, popRes] = await Promise.all([
            POPStaticMenuList(dbname, lan_id),
            POPDetails(dbname, lan_id, value)
        ]);
        if (popStaticMenuListRes.status == 200) {
            const { rows } = popStaticMenuListRes.data.data;
            rows.map((data, index) => {
                POPDetailsListArr.push(data);
            });
        }
        if (popRes.status == 200) {
            if (popRes.data.data.length > 0) {
                popRes.data.data.map((data, index) => {
                    if (data.static_menu_id != null && data.static_submenu_id != null && data.sf_static_menu.menu_type == "csm") {
                        POPDetailsListArr.push(data);
                    }
                });
            }
        }
        navigation.navigate('PackageOfPracticesDetails', { POPDetailsListArr: POPDetailsListArr, thumbnails: item, popResAll: popRes.data.data, crop_id: value })
    }
    const onPressPackageItemDetails = async (crop_id, staticMenuId, menu_name) => {
        const StaticMenuListDetails = await POPStaticMenuListDetails(dbname, lan_id, crop_id, staticMenuId);
        if (StaticMenuListDetails.status == 200) {
            const { package_of_practice_list } = StaticMenuListDetails.data.data[0];
            if (package_of_practice_list.length > 0) {
                navigation.navigate('PackageItemDetails', { package_of_practice_list: package_of_practice_list[0].content, menu_name: menu_name })
            }
        }
        // console.log(StaticMenuListDetails.data.data)
        // navigation.navigate('PackageItemDetails', { content: item, title: title, paramsData: paramsData })
    }
    return {
        HandlerGoBack,
        isLoading,
        livelihoodType,
        modalVisible,
        setModalVisible,
        navigation,
        packageList,
        productFilter,
        onChangeDetails,
        POPDetailsList,
        onPressPackageItemDetails,
        setPOPDetailsList,
        livehoodTypeFilterData
    }
}

export default PackageOfPracticesController;