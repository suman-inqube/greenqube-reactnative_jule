import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import FormsTitle from '../../Common/FormsTitle';
import Filter from '../../Common/Filter';
import DatePickerComp from '../../Common/DatePickerComp';
import ViewPast from './ViewPast';
import PostNew from './PostNew';
import CustomHeader from '../CustomHeader';
const OutPut = () => {
    const [activeBtn, setActiveBtn] = useState(2);
    const onDataReceived = (data) => {
        setActiveBtn(data)
    }

    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'Dashboard'} />
            <View style={styles.container}>
                <FormsTitle title={'Want to Sell'} />
                <View style={styles.btnContainer}>
                    <TouchableOpacity style={activeBtn === 1 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{'Post New \nProduce'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={activeBtn === 2 ? styles.btnActive : styles.btn} onPress={() => setActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{'View Past \nProduce'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {
                activeBtn == 1 ? <PostNew sendDataToParent={onDataReceived} /> : <View><ViewPast /></View>
            }
        </View>
    )
}

export default OutPut

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginHorizontal: '5%',
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    btn: {
        elevation: 10,
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        width: '45%'
    },
    btnActive: {
        backgroundColor: '#a1dc17',
        elevation: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        width: '45%'
    },
    btnActiveTitle: {
        textAlign: 'center',
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold'
    }
})