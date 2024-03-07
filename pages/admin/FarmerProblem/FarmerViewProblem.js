import { BackHandler, StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput, FlatList, Linking } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import ImagePlaceHolderCircleWithoutAddButton from '../../Common/ImagePlaceHolderCircleWithoutAddButton';
import FormsTitle from '../../Common/FormsTitle';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import TakePhoto from '../Activity/TakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { problemAnswerListAPI, problemCommentListAPI, problemCommentSaveAPI, farmerProblemDetailApi } from '../../../config/apiHere';
import CustomHeader from '../CustomHeader';
import MessageDialog from '../../Common/MessageDialog';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { useTranslation } from 'react-i18next';
import DeviceInfo from '../../DeviceInfo';
const FarmerViewProblem = ({ navigation }) => {
    const netConnection = DeviceInfo();
    const route = useRoute();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [btnColor, setBtnColor] = useState(1);
    const [farmerProblem, setFarmerProblem] = useState({});
    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [comment1, setComment1] = useState("");
    const [showComment, setshowComment] = useState(false);
    const [commentAll, setcommentAll] = useState([]);
    const [answerAll, setAnswerAll] = useState([]);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({});
    const [selectedRecord, setSelectedRecord] = useState({
        firstItemRecord: "",
        secondItemRecord: "",
        thirdItemRecord: "",
    });
    const openImagePicker = (item) => {
    };
    const saveCommet = async () => {
        if (comment1) {
            const formData = new FormData();
            formData.append("comment_qid", dbLanTokUsr.question_id);
            formData.append("comment_content", comment1);
            formData.append("comment_type", "2");
            formData.append("comment_approved", "1");
            formData.append("comment_parent", "");
            formData.append("farming_type", "crop");
            // formData.append("farmer_fcm", dbLanTokUsr.question_user_fcm);
            formData.append("agent_fcm", dbLanTokUsr.question_user_agent_fcm);
            formData.append("photo", "");
            const database_res = await problemCommentSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.farmerID, formData);
            console.log(formData);
            console.log("****");
            if (database_res) {
                MessageDialog({ title: 'Successful', message: "Successfull Add Comments" })
                setComment1("")
                const commnetList = await problemCommentListAPI(dbLanTokUsr.dbName, dbLanTokUsr.farmerID, dbLanTokUsr.question_id)
                if (commnetList.data) {
                    setcommentAll(commnetList.data.data.rows);
                    navigation.navigate('FarmerViewProblem');
                }
            }
        }
        else {
            return;
        }
    }

    const onPageLoad = async () => {
        setSelectedImage({
            // ...selectedImage,
            firstItem: "",
            secondItem: "",
            thirdItem: "",
        })
        const [problemData, problemIdData, loginUser_data] = await Promise.all([
            getItem('problem_Data'),
            getItem('problem_id_data'),
            getItem('loginUser_data')
        ])
        const dbName = loginUser_data.dbname;
        const languageId = loginUser_data.lan_id;
        const token = loginUser_data.token;
        const farmerID = loginUser_data.user_id;
        if (netConnection) {
            if (route.params != undefined) {
                var response = await farmerProblemDetailApi(dbName, languageId, route.params.comment_qid);
            } else {
                var response = await farmerProblemDetailApi(dbName, languageId, problemIdData);
                // await setItem('farmerProblemDetail' + problemIdData, response);
            }
            await setItem('farmerProblemDetail' + problemIdData, response);
        } else {
            var response = await getItem('farmerProblemDetail' + problemIdData);
        }
        if (response.status === 200) {
            const { agri_user, agent_details } = response.data.data[0];
            setFarmerProblem(response.data.data[0]);
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                farmerID: farmerID,
                question_id: problemIdData,
                question_user_fcm: agri_user.FcmUserToken,
                question_user_agent_fcm: agent_details.FcmUserToken
            });
            const commnetList = await problemCommentListAPI(dbName, farmerID, problemIdData)
            // console.log(JSON.stringify(commnetList.data.data, null, 2));
            if (commnetList.data) {
                setcommentAll(commnetList.data.data.rows);
            }
            const answerList = await problemAnswerListAPI(dbName, languageId, token, problemIdData)
            //  console.log(JSON.stringify(answerList.data.data, null, 2));
            if (answerList) {
                setAnswerAll(answerList.data.data);
            }
            // console.log(JSON.stringify(answerList.data.data, null, 2));
            // if (response.data.agri_files) {
            let Imag1 = ''
            let Imag2 = ''
            let Imag3 = ''
            let audio1 = '';
            let audio2 = '';
            let audio3 = '';
            if (response.data.data[0].agri_files[0]) {
                Imag1 = response.data.data[0].agri_files[0].file_path
            } else {
                Imag1 = "";
            }
            if (response.data.data[0].agri_files[1]) {
                Imag2 = response.data.data[0].agri_files[1].file_path
            } else {
                Imag2 = "";
            }
            if (response.data.data[0].agri_files[2]) {
                Imag3 = response.data.data[0].agri_files[2].file_path
            } else {
                Imag3 = "";
            }
            if (response.data.data[0].agri_audio_files[0]) {
                audio1 = response.data.data[0].agri_audio_files[0].file_path
            } else {
                audio1 = "";
            }
            if (response.data.data[0].agri_audio_files[1]) {
                audio2 = response.data.data[0].agri_audio_files[1].file_path
            } else {
                audio2 = "";
            }
            if (response.data.data[0].agri_audio_files[2]) {
                audio3 = response.data.data[0].agri_audio_files[2].file_path
            } else {
                audio3 = "";
            }
            setSelectedRecord({
                firstItemRecord: audio1,
                secondItemRecord: audio2,
                thirdItemRecord: audio3,
            });
            setSelectedImage({
                firstItem: Imag1,
                secondItem: Imag2,
                thirdItem: Imag3,
            })
            setIsLoading(false)
        }
        // }
    }
    useEffect(() => {
        // onPageLoad();
    }, []);
    useFocusEffect(
        useCallback(() => {
            onPageLoad();
            const onBackPress = () => { navigation.navigate('FarmerListProblem'); return true; };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );
    const HandlerGoBack = () => {
        navigation.navigate('FarmerListProblem');
    }
    return (
        <>
            {isLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    <CustomHeader path="FarmerListProblem" HandlerGoBack={HandlerGoBack} />
                    <FormsTitle title={t('plot_and_crop_problem')} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View >
                            {
                                farmerProblem && farmerProblem.agri_user ?
                                    <View style={styles.container}>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('farmer_name')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_user.userName}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('farmer_number')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_user.contactNumber}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('enter_problem_title')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.question_title}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('question_details')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.question_desc}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('plot')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_land_user_rel.plot_no}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('addcrop_croptype')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.crop_type && farmerProblem.crop_type.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('crop_name')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.crop_name && farmerProblem.crop_name.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('crop_veriety')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.crop_variety && farmerProblem.crop_variety.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('growth_stage')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.growth_stage && farmerProblem.growth_stage.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{t('affect_date')}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.affected_date ?? ''}</Text>
                                        </View>
                                        <View style={styles.itemPhoto}>
                                            <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} title={t('view_phote')} />
                                        </View>
                                        <View style={{ marginHorizontal: 20 }}>
                                            <Text style={styles.title}>{t('listen_to_the_problem')}</Text>
                                            <View style={styles.photoContainer}>
                                                {
                                                    selectedRecord.firstItemRecord != "" ?
                                                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.firstItemRecord)}>
                                                            <Image
                                                                source={require('../../Common/images/play.png')}
                                                                style={{ width: 70, height: 70 }}

                                                            />
                                                        </TouchableOpacity> :
                                                        <Image
                                                            source={require('../../Common/images/microphone.png')}
                                                            style={{ width: 70, height: 70, opacity: 0.7 }}
                                                        />
                                                }
                                                {
                                                    selectedRecord.secondItemRecord != "" ?
                                                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.secondItemRecord)}>
                                                            <Image
                                                                source={require('../../Common/images/play.png')}
                                                                style={{ width: 70, height: 70 }}
                                                            />
                                                        </TouchableOpacity> :
                                                        <Image
                                                            source={require('../../Common/images/microphone.png')}
                                                            style={{ width: 70, height: 70, opacity: 0.7 }}
                                                        />
                                                }
                                                {
                                                    selectedRecord.thirdItemRecord != "" ?
                                                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.thirdItemRecord)}>
                                                            <Image
                                                                source={require('../../Common/images/play.png')}
                                                                style={{ width: 70, height: 70 }}

                                                            />
                                                        </TouchableOpacity> :
                                                        <Image
                                                            source={require('../../Common/images/microphone.png')}
                                                            style={{ width: 70, height: 70, opacity: 0.7 }}
                                                        />
                                                }
                                            </View>
                                        </View>

                                    </View>
                                    :
                                    ''
                            }
                            {btnColor === 2 ?
                                <View style={styles.commentsContainer}>
                                    <TextInput
                                        multiline={true}
                                        numberOfLines={4}
                                        style={[styles.textarea, { color: '#000' }]}
                                        value={comment1}
                                        onChangeText={(item) => setComment1(item)}
                                    />
                                    <TouchableOpacity onPress={() => saveCommet()}>
                                        <Text style={[styles.btn, { backgroundColor: '#023a02', color: '#FFF', fontSize: 10 }]}>{t('add_comments')}</Text>
                                    </TouchableOpacity>
                                </View>
                                :
                                ""}
                            <View style={styles.btnContainer}>
                                <TouchableOpacity style={btnColor === 1 ? styles.btnActive : styles.btn} onPress={() => setBtnColor(1)}>
                                    <Text style={btnColor === 1 ? styles.btnTitleActive : styles.btnTitle}>{t('answers')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={btnColor === 2 ? styles.btnActive : styles.btn} onPress={() => setBtnColor(2)}>
                                    <Text style={btnColor === 2 ? styles.btnTitleActive : styles.btnTitle}>{t('comments')}</Text>
                                </TouchableOpacity>
                            </View>
                            {btnColor === 1 ?
                                <View style={styles.AnsContainer}>
                                    {
                                        answerAll.length > 0
                                            ?
                                            <View style={styles.AnsItem}>
                                                {
                                                    answerAll.map((value, index) => (
                                                        <View style={styles.AnsTextContainer} key={index}>
                                                            <Text style={styles.AnsTitle}>{t('role_col')} : Super Admin</Text>
                                                            <Text style={styles.AnsTitle}>{t('date')} : {formatDateToMMDDYYYY(value.created_at)}</Text>
                                                            <Text style={styles.AnsTitle}>{t('comments')} :{value.optional_solution} </Text>
                                                        </View>
                                                    ))
                                                }
                                            </View>
                                            : ""
                                    }
                                </View> :
                                <View style={styles.AnsContainer}>
                                    {commentAll
                                        ?
                                        commentAll.map((value, index) => (
                                            <View style={styles.AnsItem} key={index}>
                                                <View style={{ width: '20%' }}>
                                                    {
                                                        value.agri_user.agri_files.length > 0 ?
                                                            value.agri_user.agri_files.map((value1, index1) => (
                                                                value1.term_type === "1" ?
                                                                    <View key={index1}>
                                                                        <ImagePlaceHolderCircleWithoutAddButton imageurl={{ uri: value1.file_path }} />
                                                                        {/* <Image
                                                                        source={{ uri: value1.file_path }}
                                                                        resizeMode="cover" style={{ width: 50, height: 50 }}
                                                                    /> */}
                                                                    </View>
                                                                    :
                                                                    <View>
                                                                        <Image
                                                                            source={require('../../Common/images/avatar.png')}
                                                                            resizeMode="cover" style={{ width: 50, height: 50 }}
                                                                        />
                                                                    </View>
                                                            )) : <View style={{ marginVertical: 10 }}>
                                                                <ImagePlaceHolderCircleWithoutAddButton imageurl={require('../../Common/images/avatar.png')} />
                                                            </View>
                                                    }
                                                </View>
                                                <View style={styles.AnsTextContainer}>
                                                    {
                                                        value.agri_user.agri_files.forEach(element => {
                                                            <Text style={styles.AnsTitle}>{element}</Text>
                                                        })
                                                    }
                                                    <Text style={styles.AnsTitle}>{t('name')} : {value.agri_user.userName}
                                                        {value.agri_user.userType === 3 ? <Text>({t('retailer')}) </Text> : <Text> ({t('login_farmer')})</Text>}
                                                    </Text>
                                                    <Text style={styles.AnsTitle}>{t('date')}: {formatDateToMMDDYYYY(value.CreateDateTime)}</Text>
                                                    <Text style={styles.AnsTitle}>{t('comments')} : {value.comment_content}</Text>

                                                </View>
                                            </View>
                                        ))
                                        : ""
                                    }
                                </View>
                            }
                        </View>
                    </ScrollView >
                </>
            )
            }
        </>

    )
}

export default FarmerViewProblem

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2.5%',
        backgroundColor: '#FFF',
        borderRadius: 8
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginVertical: 10
    },
    itemPhoto: {

        marginLeft: 20,

    },
    itemTitle: {
        width: '50%',
        color: '#000'
    },
    photoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10
    },
    title: {
        color: '#000'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10
    },
    btn: {
        // width: '40%',
        padding: 15,
        borderRadius: 10
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000000',
        fontSize: 18
    },
    btnTitleActive: {
        textAlign: 'center',
        color: '#FFF',
        fontSize: 18
    },
    btnActive: {
        backgroundColor: '#023a02',
        width: '40%',
        padding: 15,
        borderRadius: 10
    },
    commentsContainer: {
        marginHorizontal: '2.5%',
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textarea: {
        borderWidth: 0.5,
        width: '70%',
        borderRadius: 10,
        backgroundColor: '#FFF'
    },
    AnsContainer: {
        backgroundColor: '#FFF',
        padding: 8, borderRadius: 10, elevation: 5,
        width: '90%', marginHorizontal: '5%',
    },
    AnsItem: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 10
    },
    AnsTextContainer: {
        marginHorizontal: '5%',
        borderBottomWidth: 0.5,
        width: '80%',
        marginRight: 50,
        borderColor: 'green'
    },
    AnsTitle: {
        color: '#000',
        marginBottom: 7
    }
})