
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
const SoilHealthManagementController = () => {
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
        navigateToPages
    }
}

export default SoilHealthManagementController;
