
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
const SoilHealthManagementController = () => {
    const [activeBtn, setActiveBtn] = useState(1);
    const navigation = useNavigation();
    const onPageLoad = async () => {

    }
    useEffect(() => {
        onPageLoad();
    }, []);
    const navigateToPages = (item) => {
        navigation.navigate(item);
    }
    return {
        navigateToPages,
        activeBtn,
        setActiveBtn
    }
}

export default SoilHealthManagementController;
