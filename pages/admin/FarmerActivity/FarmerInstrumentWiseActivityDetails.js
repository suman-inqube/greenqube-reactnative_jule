import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import ButtonFormBottom from '../../Common/ButtonFormBottom'
import ProofAndIdentityPropfComp from '../../Common/ProofAndIdentityPropfComp'
import { userCreateContext } from '../../Context/usersCreateContext'
import { useRoute, useIsFocused } from '@react-navigation/native';
import { ActivityPipeImages, addActivityPipeImages } from '../../../config/apiHere'
const FarmerInstrumentWiseActivityDetails = ({ navigation }) => {
    const {
        loginUser_data,
        t,
        AlertMesg,
        onBackPress,
        getItem,
        Root,
        Toast,
        LoadingScreen,
        DatePickerComp,
        FormsTitle,
        CustomHeader,
        ButtonFormBottom,
        InputTextForm,
        DropdownForm,
        effective_dates,
        logoImage, topBanner,
    } = useContext(userCreateContext);
    const { dbname, lan_id, token, user_id } = loginUser_data;

    const route = useRoute();
    const isFocused = useIsFocused();
    const [addressProof, setAddressProof] = useState([
        { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' },
        { uri: '', name: '', type: '', fileName: '', id: '', pipe_id: '' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [photoDeletedValue, setPhotoDeletedValue] = useState([]);
    const HandlerGoBack = () => {
        navigation.navigate('FarmerInstrumentWiseActivityView')
    };
    const { params } = route;
    const onPageLoad = async () => {
        try {
            setIsLoading(true);
            const pipeRes = await ActivityPipeImages(token, dbname, lan_id, user_id, params?.pipeLand?.rel_id);
            if (pipeRes?.status == 200) {
                const { rows, count } = pipeRes?.data?.data;
                if (count > 0) {
                    const imgValue = [...addressProof];
                    rows.map((item) => {
                        if (item?.pipe_id === params?.pipe_id) {
                            item?.pipeFiles?.map((item, index) => {
                                imgValue[index] = {
                                    uri: item?.file_path,
                                    name: item?.file_name,
                                    type: item?.file_ext,
                                    fileName: item?.file_name,
                                    id: item?.file_id,
                                    pipe_id: params?.pipe_id
                                }
                            });
                        }
                    })
                    setAddressProof(imgValue);
                }
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        onPageLoad();
        onBackPress(() => { navigation.navigate('FarmerInstrumentWiseActivityView'); return true; });
    }, [isFocused]);
    const handleImgUpdate = async () => {
        setIsLoading(true);
        const formData = new FormData();
        let pipeIdAdded = false;

        addressProof.forEach((item) => {
            if (item.id === "" && item.uri !== "") {
                formData.append('pipe_image', {
                    uri: item.uri,
                    name: item.fileName,
                    type: item.type,
                });

                if (!pipeIdAdded && item.pipe_id !== "") {
                    formData.append('pipe_id', item.pipe_id);
                    pipeIdAdded = true;
                }
            }
        });
        const updateActivityPipeImages = await addActivityPipeImages(dbname, lan_id, user_id, token, formData);
        if (updateActivityPipeImages?.status === 200) {
            Toast.show({ text: t('Data_submitted_successfully'), ...AlertMesg[0] });
            setTimeout(() => {
                navigation.navigate('FarmerInstrumentWiseActivityView');
            }, 1500);
        } else {
            Toast.show({ text: updateActivityPipeImages?.data?.error?.errorMessage, ...AlertMesg[0] });
        }
        setIsLoading(false);
    }
    return (
        <Root>
            <View style={{ flex: 1 }}>
                {isLoading ? (
                    <View style={styles.LoadingScreen}>
                        <LoadingScreen />
                    </View>
                ) : null}
                <CustomHeader path="Dashboard" HandlerGoBack={HandlerGoBack} logoImage={logoImage} topBanner={topBanner} />
                <FormsTitle title={t('Activity Pipe Images')} />
                <View style={{ padding: 10, height: 200 }}>
                    <ProofAndIdentityPropfComp
                        title={t('Activity Pipe')}
                        setStateValue={setAddressProof}
                        stateValue={addressProof}
                        status_level={"APPROVED"}
                        disable={true}
                        InputTextFormEdit={params?.status_label == "REJECTED" ? true : false}
                        setPhotoDeletedValue={setPhotoDeletedValue}
                    />
                </View>
                {params?.status_label == "REJECTED" && <ButtonFormBottom label="Update" onPress={() => handleImgUpdate()} />}
            </View>
        </Root>
    )
}

export default FarmerInstrumentWiseActivityDetails

const styles = StyleSheet.create({
    LoadingScreen: {
        position: 'absolute',
        top: '52%',
        left: '45%',
        zIndex: 9999,
    },
})