import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import ViewPast from './FarmerViewPast';
import PostNew from './FarmerPostNew';
import { useNavigation } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerOutPut = () => {
    //GQR-67
    const { CustomHeader, FormsTitle, t, onBackPress, logoImage, topBanner } = useContext(userCreateContext);
    //GQR-67
    const [activeBtn, setActiveBtn] = useState(2);
    const navigation = useNavigation();
    const onDataReceived = (data) => setActiveBtn(data);
    const onPageLoad = async () => setActiveBtn(2);
    useEffect(() => {
        onPageLoad();
    }, []);
    const HandlerGoBack = () => {
        if (activeBtn == 2) navigation.navigate("FarmerDashboard");
        else setActiveBtn(2);
    }
    function handleBackPress() { navigation.navigate("FarmerDashboard"); return true; }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'FarmerDashboard'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <View style={styles.container}>
                <FormsTitle title={t('want_to_sell')} />
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('post_output_n')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('view_output_nposted')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {
                activeBtn == 1 ? <PostNew sendDataToParent={onDataReceived} /> : <ViewPast />
            }
        </View>
    )
}

export default FarmerOutPut

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2.5%',
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    btn: {
        elevation: 10,
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        width: '47%',
        height: 55,
        justifyContent: 'center'
    },
    btnActive: {
        backgroundColor: '#a1dc17',
        elevation: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        width: '47%',
        height: 55,
        justifyContent: 'center'
    },
    btnActiveTitle: {
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15
    }
})