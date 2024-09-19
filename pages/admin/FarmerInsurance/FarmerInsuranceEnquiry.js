import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import FarmerRequestForInsurance from './FarmerRequestForInsurance';
import FarmerViewPastRequested from './FarmerViewPastRequested';
import { userCreateContext } from '../../Context/usersCreateContext';
const FarmerInsuranceEnquiry = ({ navigation }) => {
    //GQR-67
    const { FormsTitle, onBackPress, CustomHeader, t, logoImage, topBanner } = useContext(userCreateContext);
    //GQR-67
    const [activeBtn, setActiveBtn] = useState(2);
    const HandlerGoBack = () => navigation.navigate("FarmerDashboard");
    useEffect(() => {
        onBackPress(() => { navigation.navigate("FarmerDashboard"); return true; });
    }, [])
    return (
        <View style={{ flex: 1, height: Dimensions.get('window').height / 2 }}>
            <CustomHeader path={'FarmerDashboard'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={t('insurance_inquiry')} />
            <View style={styles.container}>
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('request_for_ninsurance')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('view_insurance_nrequested')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {
                activeBtn === 1 ? <>
                    <FarmerRequestForInsurance setActiveBtn={setActiveBtn} />
                </> :
                    <FarmerViewPastRequested />

            }
        </View>
    )
}
export default FarmerInsuranceEnquiry;
const styles = StyleSheet.create({
    container: {
        marginHorizontal: '3%',
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        backgroundColor: '#FFF',
        width: '45%',
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 10,
        elevation: 5
    },
    btnActive: {
        backgroundColor: '#a1dc17',
        width: '45%',
        alignItems: 'center',
        paddingVertical: 5,
        borderRadius: 10,
        elevation: 5
    },
    btnActiveTitle: {
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#FFF',
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        // fontWeight: 'bold'
    }
})