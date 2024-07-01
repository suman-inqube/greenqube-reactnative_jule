import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import ViewPast from './ViewPast';
import PostNew from './PostNew';
import { useNavigation } from '@react-navigation/native';
import { userCreateContext } from '../../Context/usersCreateContext';
const OutPut = () => {
    //GQR-67
    const { CustomHeader, t, onBackPress, logoImage, topBanner, Root, FormsTitle } = useContext(userCreateContext);
    //GQR-67
    const navigation = useNavigation();
    const [activeBtn, setActiveBtn] = useState(2);
    const onDataReceived = (data) => setActiveBtn(data)
    const HandlerGoBack = () => {
        if (activeBtn == 2) {
            navigation.navigate("Dashboard");
        } else {
            setActiveBtn(2)
        }
    }
    useEffect(() => {
        onBackPress(() => { navigation.navigate("Dashboard"); return true });
    }, [])
    return (
        <Root>
            <View style={{ flex: 1 }}>
                <CustomHeader path={'Dashboard'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
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