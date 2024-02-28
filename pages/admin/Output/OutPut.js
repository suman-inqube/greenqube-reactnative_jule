import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import FormsTitle from '../../Common/FormsTitle';
import ViewPast from './ViewPast';
import PostNew from './PostNew';
import CustomHeader from '../CustomHeader';
import { Root, Popup, Toast } from 'react-native-popup-confirm-toast';
import { useTranslation } from 'react-i18next';
import { useRoute, useFocusEffect, useNavigation, useIsFocused, useNavigationState } from '@react-navigation/native';
import { onBackPress } from '../../Common/BackPressHandler';
const OutPut = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [activeBtn, setActiveBtn] = useState(2);
    const onDataReceived = (data) => {
        setActiveBtn(data)
    }
    const HandlerGoBack = () => {
        if (activeBtn == 2) {
            navigation.navigate("Dashboard");
        } else {
            setActiveBtn(2)
        }
    }
    function handleBackPress() {
        navigation.navigate("Dashboard");
        return true;
    }
    useEffect(() => {
        onBackPress(handleBackPress);
    }, [])
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <CustomHeader path={'Dashboard'} HandlerGoBack={HandlerGoBack} />
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
                    activeBtn == 1 ? <PostNew sendDataToParent={onDataReceived} /> : <View><ViewPast sendDataToParent={onDataReceived} /></View>
                }
            </View>
        </Root>
    )
}

export default OutPut

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
        paddingVertical: 15,
        borderRadius: 10,
        width: '47%'
    },
    btnActive: {
        backgroundColor: '#a1dc17',
        elevation: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 10,
        width: '47%'
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