import {
    StyleSheet, Text, View,
    TouchableOpacity, Image, Dimensions
} from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import FarmerRequestForInsurance from './FarmerRequestForInsurance';
import FarmerViewPastRequested from './FarmerViewPastRequested';
import { onBackPress } from '../../Common/BackPressHandler';
const FarmerInsuranceEnquiry = ({ navigation }) => {
    const [activeBtn, setActiveBtn] = useState(2);
    const HandlerGoBack = () => {
        navigation.navigate("FarmerDashboard");
    }
    function handleBackPress() {
        navigation.navigate("FarmerDashboard");
        return true;
    }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
    return (
        <View style={{ flex: 1, height: Dimensions.get('window').height / 2 }}>
            <CustomHeader path={'FarmerDashboard'} HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={'Insurance Enquiry'} />
            <View style={styles.container}>
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{'Request for \nInsurance'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{'View Past \n Requested'}</Text>
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

export default FarmerInsuranceEnquiry

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
        fontWeight: 'bold',
        fontSize: 18,
        color: '#FFF',
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold'
    }
})