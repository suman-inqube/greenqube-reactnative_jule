import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Modal, Linking, BackHandler } from 'react-native'
import React, { useCallback, useEffect, useLayoutEffect, useState, memo, useContext } from 'react'
import DocumentPicker, { types } from 'react-native-document-picker';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LoanUpdate } from './LoanAPI';
import { userCreateContext } from '../../Context/usersCreateContext';
const LoanEnquiryDetail = () => {
    //GQR-67
    const { LoadingScreen, t, Toast,
        AlertMesg, getItem, Root, CustomHeader,
        FormsTitle, InputTextForm, ButtonForm, logoImage, topBanner, } = useContext(userCreateContext);
    //GQR-67
    const navigation = useNavigation();
    const route = useRoute();
    const [isLoading, setIsLoading] = useState(false);
    const [currency, setCurrencyt] = useState("");
    const [photo_to_be_deleted, set_photo_to_be_deleted] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [identityProof, setIdentityProof] = useState(
        { uri: "", id: "", name: "", type: "", fileName: "", value: "" }
    );
    const [addressProof, setAddressProof] = useState([
        { uri: "", id: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", id: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", id: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", id: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", id: "", name: "", type: "", fileName: "", value: "" }
    ]);
    const [landProof, setLandProof] = useState([
        { uri: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", name: "", type: "", fileName: "", value: "" },
        { uri: "", name: "", type: "", fileName: "", value: "" },
    ]);
    const [plotArr, setplotArr] = useState([]);
    // const { user_id, id,
    //     status,
    //     agri_files, agri_user, apx_annual_income,
    //     loan_amount, agri_loan_entity, existing_loan_amount, loan_plots } = loanData
    ;
    const { user_id, id,
        status,
        agri_files, agri_user, apx_annual_income,
        loan_amount, agri_loan_entity, existing_loan_amount, loan_plots, sanctioned_date, loan_ord_id, loan_sanctioned, comment } = route.params;
    const [saveData, setSaveData] = useState({
        user_id: "",
        loan_amount: "",
        loan_purpose: "",
        existing_loan_amount: "",
        apx_annual_income: "",
        farming_type: "crop",
        plot_id: "",
        farmerProducer: "",
        identityNo: "",
    });
    const [propsData, setPropsData] = useState('');
    const [propsIndex, setPropsIndex] = useState('');
    const [propsObjData, setPropsObjData] = useState({});
    const urlOpen = useCallback((data, index, objData) => {
        const { uri } = objData;
        setPropsData(data);
        setPropsIndex(index);
        setPropsObjData(objData);
        if (uri != "") {
            setModalVisible(!modalVisible);
        } else {
            handleDocumentSelection(data, index, objData);
        }
    }, []);
    const photo_to_be_deleted_value = [];
    const handleDocumentSelection = useCallback(async (data, index, objData) => {
        try {
            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
                type: [types.pdf, types.images]
            });
            if (data == "IdentityProof") {
                setIdentityProof(
                    {
                        uri: response[0].uri,
                        id: objData.id,
                        name: response[0].name,
                        type: response[0].type,
                        fileName: response[0].name,
                        value: "1"
                    }
                );
                const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(item =>
                    item == objData.id
                );
                if (photo_to_be_deleted_id.length == 0) {
                    photo_to_be_deleted_value.push(objData.id);
                }
            } else if (data == "AddressProof") {
                const addressProofVAlue = [...addressProof];
                addressProofVAlue[index]["uri"] = response[0].uri;
                addressProofVAlue[index]["id"] = objData.id;
                addressProofVAlue[index]["name"] = response[0].name;
                addressProofVAlue[index]["type"] = response[0].type;
                addressProofVAlue[index]["fileName"] = response[0].name;
                addressProofVAlue[index]["value"] = "1";
                setAddressProof(addressProofVAlue);
                const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(item =>
                    item == objData.id
                );
                if (photo_to_be_deleted_id.length == 0) {
                    photo_to_be_deleted_value.push(objData.id);
                }
            } else if (data == "LandProof") {
                const landProofValue = [...landProof];
                landProofValue[index]["uri"] = response[0].uri;
                landProofValue[index]["id"] = objData.id;
                landProofValue[index]["name"] = response[0].name;
                landProofValue[index]["type"] = response[0].type;
                landProofValue[index]["fileName"] = response[0].name;
                landProofValue[index]["value"] = "1";
                setLandProof(landProofValue);
                const photo_to_be_deleted_id = photo_to_be_deleted_value.filter(item =>
                    item == objData.id
                );
                if (photo_to_be_deleted_id.length == 0) {
                    photo_to_be_deleted_value.push(objData.id);
                }
            }
            set_photo_to_be_deleted(photo_to_be_deleted_value);
            setModalVisible(false);
            onPageLoad();
        } catch (err) {
            setModalVisible(false);
            console.error(err);
        }
    }, []);
    const handledataAdd = useCallback((name, text) => {
        // setSaveData({ ...saveData, [name]: text });
    }, [])
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
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
    const onPageLoad = async () => {
        setIsLoading(true);
        const address_proofArr = agri_files.filter(item => item.term_type === "loan_address");
        const loan_landArr = agri_files.filter(item => item.term_type === "loan_land");
        const currency_res = await getItem('currency');
        // const { dbname, lan_id, token, user_id } = loginUser_data;
        setCurrencyt(currency_res);
        setSaveData({
            ...saveData, ...{
                user_id: user_id,
                loan_amount: loan_amount,
                loan_purpose: agri_loan_entity?.entity_name,
                existing_loan_amount: existing_loan_amount,
                apx_annual_income: apx_annual_income,
                farming_type: "crop",
                plot_id: "",
                farmerProducer: "",
                identityNo: "",
            }
        });
        const addressProof_value = [...addressProof];
        addressProof.map((data, index) => {
            if (address_proofArr[index] != undefined && data.uri == "") {
                addressProof_value[index] = { uri: address_proofArr[index].file_path, id: address_proofArr[index].file_id, name: address_proofArr[index].file_name, type: "", fileName: address_proofArr[index].file_name };
            }
        });
        const landProofValue = [...landProof];
        landProof.map((data, index) => {
            if (loan_landArr[index] != undefined && data.uri == "") {
                landProofValue[index] = { uri: loan_landArr[index].file_path, id: loan_landArr[index].file_id, name: loan_landArr[index].file_name, type: "", fileName: loan_landArr[index].file_name };
            }
        });
        // store.dispatch(updateLoan({ landProofValue: landProofValue, addressProof_value: addressProof_value }));
        setLandProof(landProofValue);
        setAddressProof(addressProof_value);
        setIsLoading(false);
    }
    useEffect(() => {
        onPageLoad();
    }, []);
    useEffect(() => {
        const loan_identityArr = agri_files.filter(item => item.term_type === "loan_identity");
        if (loan_identityArr.length > 0) {
            if (loan_identityArr[0] != undefined) {
                setIdentityProof({
                    uri: loan_identityArr[0]?.file_path,
                    id: loan_identityArr[0]?.file_id,
                    name: loan_identityArr[0]?.file_name, type: "",
                    fileName: loan_identityArr[0]?.file_name
                });
            }
        }
        let plotDataArr = [];
        loan_plots.filter((data, index) => { plotDataArr.push(data?.agri_land_user_rel?.plot_no) })
        setplotArr(plotDataArr);
    }, []);
    const HandlerGoBack = () => {
        navigation.navigate('Loan');
    }
    const handleSave = async () => {
        setIsLoading(true);
        const deleted_id_arr = photo_to_be_deleted.filter(item => item != "");
        const { dbName, languageID, token, userID } = dbLanTokUsr;
        let updateStatus = null;
        const formData = new FormData();
        // formData.append("lan_id", saveData.user_id);
        // formData.append("loan_amount", saveData.loan_amount);
        // formData.append("existing_loan_amount", saveData.existing_loan_amount);
        // formData.append("farming_type", saveData.farming_type);
        if (deleted_id_arr.length > 0) {
            updateStatus = true;
            formData.append("photo_to_be_deleted", deleted_id_arr.toString());
        }
        if (identityProof.value === "1") {
            updateStatus = true;
            formData.append("loan_identity", identityProof);
        } else {
            formData.append("loan_identity", "");
        }
        addressProof.map((data, index) => {
            if (data.value === "1") {
                updateStatus = true;
                formData.append("loan_address", data);
            }
        });
        landProof.map((data, index) => {
            if (data.value === "1") {
                updateStatus = true;
                formData.append("loan_land", data);
            }
        });
        if (updateStatus == true) {
            formData.append("status", 1);
        }
        if (formData?._parts.length > 1) {
            const responseUpdate = await LoanUpdate(dbName, languageID, token, saveData.user_id, formData, id);
            if (responseUpdate?.status == 200) {
                Toast.show({ text: 'Successfull Data Submited', ...AlertMesg[0] });
                setTimeout(() => {
                    navigation.navigate('Loan', 2)
                }, 1200);
            }
            // else {
            //     const responseUpdate = await LoanUpdate(dbName, languageID, token, saveData.user_id, formData, id);
            //     if (responseUpdate?.status == 200) {
            //         Toast.show({ text: 'Successfull Data Submited', ...AlertMesg[0] });
            //         setTimeout(() => {
            //             navigation.navigate('Loan', 2)
            //         }, 1200);
            //     }
            // }
        }
        setIsLoading(false);
    }
    const openURL = (path) => {
        setModalVisible(false);
        Linking.openURL(path);
    }
    return (
        <Root>
            {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
            <View style={{ flex: 1 }}>
                {modalVisible && <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TouchableOpacity onPress={() => openURL(propsObjData.uri)}>
                                <Text style={[styles.title, { fontSize: 16, padding: 7 }]}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDocumentSelection(propsData, propsIndex, propsObjData)}>
                                <Text style={[styles.title, { fontSize: 16, padding: 7 }]} >Upload Document</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={[styles.title, { fontSize: 16, padding: 7 }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>}
                <CustomHeader path={'Loan'} HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <FormsTitle title={t('loan_enquiry_detail')} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        {
                            status == 3 &&
                            <View style={styles.commentContainer}>
                                <Text style={styles.title}>{comment}</Text>
                            </View>
                        }

                        <InputTextForm label={t('farmer_name')} value={agri_user.userName} editable={false} />
                        <InputTextForm label={t('farmer_number')} value={agri_user.contactNumber} editable={false} />
                        <InputTextForm label={t('loan_required_in_rupees') + ` (${currency})`} value={saveData.loan_amount} onChangeText={(text) => handledataAdd('loan_amount', text)} editable={false} />
                        <InputTextForm label={t('annual_income') + ` (${currency})`} value={saveData.apx_annual_income} onChangeText={(text) => handledataAdd('apx_annual_income', text)} editable={false} />
                        <InputTextForm label={t('loan_purpose')} value={saveData.loan_purpose} editable={false} />
                        <InputTextForm label={t('existing_loan_amount') + ` (${currency})`} value={existing_loan_amount} editable={false} />
                        <InputTextForm label={t('plot')} value={plotArr.join()} editable={false} />
                        {
                            status == 2 && <>
                                <InputTextForm label={t('LoanOrderID')} value={loan_ord_id} editable={false} />
                                <InputTextForm label={t('LoanSanctioned') + `(${currency})`} value={loan_sanctioned} editable={false} />
                                <InputTextForm label={t('SanctionedDate')} value={sanctioned_date} editable={false} />
                            </>
                        }
                        <View style={styles.idcontainer}>
                            <Text style={styles.title}>{t('identity_proof')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    <TouchableOpacity style={styles.idItem} onPress={() => urlOpen("IdentityProof", "", identityProof)} >
                                        <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                        <Text style={styles.imageTitle}>{identityProof.name}</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.title}>{t('address_proof')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    addressProof.map((data, index) => {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen("AddressProof", index, data)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>
                        <View style={styles.idcontainer}>
                            <Text style={styles.title}>{t('land_records')}</Text>
                            <View style={styles.idItemContainer}>
                                {
                                    landProof.map((data, index) => {
                                        return (
                                            <TouchableOpacity style={styles.idItem} onPress={() => urlOpen("LandProof", index, data)} key={index}>
                                                <Image source={require('../../Common/images/document.png')} style={styles.idImage} />
                                                <Text style={styles.imageTitle}>{data.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>
                {status != 2 && <ButtonForm label={t('submit')} onPress={() => handleSave()} />}

            </View>
        </Root>
    )
}

export default memo(LoanEnquiryDetail)

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '5%',
        marginBottom: 50,
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
        fontSize: 10,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    title: {
        color: '#000',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
    },
    centeredView: {
        // backgroundColor: '#FFF',
        // width: '90%',
        // left: '5%',
        // // justifyContent: 'center',
        // alignItems: 'center',
        // position: "absolute",
        // top: '50%'
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 4,
        padding: '2.5%'
    },
    loadingScreen: {
        position: 'absolute',
        top: "60%",
        zIndex: 999,
        left: '45%'
    },
    commentContainer: {
        padding: 12,
        // borderWidth: 1,
        elevation: 1,
        marginBottom: 10,
        borderColor: '#CA8586',
        backgroundColor: '#ECC8C5',
        borderRadius: 10
    }
})