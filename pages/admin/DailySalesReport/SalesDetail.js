import { StyleSheet, Text, View, ScrollView, Image, BackHandler } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
const SalesDetail = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    const { salesUser, createdAt, ord_rcv, pay_rcv, comment, srFiles, srProducts } = route.params;
    const images = [1, 2, 3];
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate('DailySalesReport');
                return true;
            };
            BackHandler.addEventListener(
                'hardwareBackPress', onBackPress
            );
            return () =>
                BackHandler.removeEventListener(
                    'hardwareBackPress', onBackPress
                );
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('DailySalesReport');
    }
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path='DailySalesReport' HandlerGoBack={HandlerGoBack} />
            <FormsTitle title={t('sales_detail')} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <InputTextForm label={t('dealer_name')} value={salesUser.userName} />
                    <InputTextForm label={t('date')} value={createdAt.toString().substring(-1, 10)} />
                    {srProducts[0] !== undefined ?
                        srProducts[0].salesProduceName != null ?
                            <View style={styles.srProducts}>
                                <Text style={styles.srProductsTitle}>{t('produce_name')}:  {srProducts[0].salesProduceName.name}</Text>
                                <Text style={styles.srProductsTitle}>{t('prodece_vareity')}:  {srProducts[0].salesProduceVariety.name}</Text>
                            </View> : null
                        : null
                    }
                    {ord_rcv != null ? <InputTextForm label={t('order_received')} value={ord_rcv} /> : null}
                    <View>
                        {srProducts && srProducts.map((data, index) => {
                            if (data.salesProductCategory != null) {
                                return (
                                    <View style={styles.srProducts} key={index}>
                                        <Text style={styles.srProductsTitle}>{data.salesProductCategory.name}</Text>
                                        <Text style={styles.srProductsTitle}>{data.salesProductSubCategory.name}</Text>
                                        <Text style={styles.srProductsTitle}>{data.salesProduct.product_name}</Text>
                                        <Text style={styles.srProductsTitle}>{data.qty} {data.unit}</Text>
                                    </View>
                                )
                            }
                        })
                        }
                    </View>
                    {ord_rcv != null ? <InputTextForm label={t('payment_mode')} value={pay_rcv} /> : null}
                    <InputTextForm label={t('comments')} value={comment} />
                    <Text style={{ color: '#000', marginVertical: 10 }}>{t('view_phote')}</Text>
                    <View style={styles.photoContainer}>
                        {
                            images.map((data, index) => {
                                if (typeof srFiles[index] !== 'undefined') {
                                    return (<Image key={index}
                                        source={{ uri: `${srFiles[index].file_path}` }}
                                        style={{ width: 100, height: 100 }}
                                    />)
                                } else {
                                    return (<Image key={index}
                                        source={require('../../Common/images/camera.jpeg')}
                                        style={{ width: 100, height: 100 }}
                                    />
                                    )
                                }
                            })
                        }
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default SalesDetail

const styles = StyleSheet.create({
    formContainer: {
        width: '90%',
        marginHorizontal: '5%'
    },
    photoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    srProducts: {
        backgroundColor: '#c7d98de0',
        marginVertical: 10,
        padding: 10,
        borderRadius: 10,
    },
    srProductsTitle: {
        fontFamily: 'Poppins-Regular',
        color: '#000'
    }
})