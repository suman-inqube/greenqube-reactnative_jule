import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Linking,BackHandler } from 'react-native'
import React, { useCallback,useEffect } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import InputTextForm from '../../Common/InputTextForm';
import DocumentPicker, { types } from 'react-native-document-picker';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect,useNavigation } from '@react-navigation/native';
const LoanEnquiryDetail = () => {
    const navigation=useNavigation();
    const route = useRoute();
    const { agri_files, agri_user, apx_annual_income,
        loan_amount, agri_loan_entity, existing_loan_amount, loan_plots } = route.params;
    const urlOpen = (path) => {
        Linking.openURL(path)
    }
    useFocusEffect(
        useCallback(() => {
          const onBackPress = () => {
            // Do Whatever you want to do on back button click
            // Return true to stop default back navigaton
            // Return false to keep default back navigaton
            navigation.navigate('Loan');
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
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader path={'Loan'} />
            <FormsTitle title={'Loan Enquiry Detail'} />
            <ScrollView>
                <View style={styles.container}>
                    <InputTextForm label={'Farmer/Producer Name'} value={agri_user.userName} />
                    <InputTextForm label={'Phone Number'} value={agri_user.contactNumber} />
                    <InputTextForm label={'New Loan Required (R.s)'} value={loan_amount} />
                    <InputTextForm label={'Expected Annual Income (R.s)'} value={apx_annual_income} />
                    <InputTextForm label={'Loan Purpose'} value={agri_loan_entity.entity_name} />
                    <InputTextForm label={'Existing Loan Amount (R.s)'} value={existing_loan_amount} />
                    <InputTextForm label={'Plot/Site'} value={loan_plots[0].agri_land_user_rel !== null ? loan_plots[0].agri_land_user_rel.plot_no : ""} />
                    <View style={styles.idcontainer}>
                        <Text>Attach Identity Proof</Text>
                        <View style={styles.idItemContainer}>
                            {
                                agri_files.map((data, index) => {
                                    if (data.term_type === "loan_identity") {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen(data.file_path)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.file_name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                    <View style={styles.idcontainer}>
                        <Text>Attach Address Proof</Text>
                        <View style={styles.idItemContainer}>
                            {
                                agri_files.map((data, index) => {
                                    if (data.term_type === "loan_address") {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen(data.file_path)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.file_name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                    <View style={styles.idcontainer}>
                        <Text>Attach Land Proof</Text>
                        <View style={styles.idItemContainer}>
                            {
                                agri_files.map((data, index) => {
                                    if (data.term_type === "loan_land") {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen(data.file_path)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.file_name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                })
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default LoanEnquiryDetail

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%'
    },
    idcontainer: {
        marginVertical: 10
    },
    idItemContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',

    },
    idItem: {
        padding: 10,
        width: '30%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    idImage: {
        width: 60,
        height: 60
    },
    imageTitle: {
        fontSize: 8
    }

})