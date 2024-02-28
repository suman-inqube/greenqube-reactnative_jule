import {
    StyleSheet, Text, View,
    TouchableOpacity, Image, Dimensions
} from 'react-native'
import React, { useState } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import RequestForInsurance from './RequestForInsurance';
import ViewPastRequested from './ViewPastRequested';
const InsuranceEnquiry = () => {
    const [activeBtn, setActiveBtn] = useState(1);
    return (
        <View style={{ flex: 1, height: Dimensions.get('window').height / 2 }}>
            <CustomHeader path={'Dashboard'} />
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
                    <RequestForInsurance setActiveBtn={setActiveBtn} />
                </> :
                    <ViewPastRequested />

            }
        </View>
    )
}

export default InsuranceEnquiry

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