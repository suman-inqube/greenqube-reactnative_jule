import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import FormsTitle from '../../Common/FormsTitle';
import { getItem } from '../../../config/getDataFromStorage';
import { useFocusEffect } from '@react-navigation/native';
import TakePhoto from '../Activity/TakePhoto';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { problemAnswerListAPI, problemCommentListAPI, problemCommentSaveAPI } from '../../../config/apiHere';
import CustomHeader from '../CustomHeader';
import MessageDialog from '../../Common/MessageDialog';
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
const ViewProblem = ({ navigation }) => {
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
    const openImagePicker = (item) => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };
        launchCamera(options, response => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera Error: ', response.error);
            } else {
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setSelectedImage({ ...selectedImage, [item]: imageUri });
            }
        });
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
            formData.append("farmer_fcm", "");
            formData.append("agent_fcm", "");
            formData.append("photo", "");
            const database_res = await problemCommentSaveAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.supervisorId, formData);
            if (database_res) {
                MessageDialog({ title: 'Successful', message: "Successfull SignUp Data" })
                navigation.navigate('ProblemView');
            }

        }
        else {
            return;
        }
    }

    const onPageLoad = async () => {
        const problemData = await getItem('problem_Data');
        const problemIdData = await getItem('problem_id_data');
        if (problemData) {
            const farmerArray = problemData.rows
            const farmerFound = farmerArray.find(user => user.fid === problemIdData);
            setFarmerProblem(farmerFound);
            //  return  console.warn(JSON.stringify(farmerFound,null,2));
            const loginUser_data = await getItem('loginUser_data');
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId,
                question_id: farmerFound.question_id,
            });
            const commnetList = await problemCommentListAPI(dbName, supervisorId, farmerFound.question_id)
            if (commnetList.data) {
                setcommentAll(commnetList.data.data.rows);
            }


            const answerList = await problemAnswerListAPI(dbName, languageId, token, farmerFound.question_id)
            if (answerList) {
                //   console.log(JSON.stringify(answerList.data.data, null, 2));
                setAnswerAll(answerList.data.data);
            }

            // console.log(JSON.stringify(answerList.data.data, null, 2));

            if (farmerFound.agri_files) {
                let Imag1 = ''
                let Imag2 = ''
                let Imag3 = ''

                if (farmerFound.agri_files[0]) {
                    Imag1 = farmerFound.agri_files[0].file_path
                } else {
                    Imag1 = ""
                }

                if (farmerFound.agri_files[1]) {
                    Imag2 = farmerFound.agri_files[1].file_path
                } else {
                    Imag2 = ""
                }

                if (farmerFound.agri_files[2]) {
                    Imag3 = farmerFound.agri_files[2].file_path
                } else {
                    Imag3 = ""
                }

                setSelectedImage({
                    ...selectedImage,
                    firstItem: Imag1,
                    secondItem: Imag2,
                    thirdItem: Imag3,
                })

                setIsLoading(false)

            }

        }
    }
    useEffect(() => {
        onPageLoad();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();
        }, [])
    );


    return (
        <>
            {isLoading ? (
                <LoadingScreen />
            ) : (

                <>
                    <CustomHeader path="ProblemList" />
                    <FormsTitle title={'Plot/Site And Produce Problem'} />
                    <ScrollView>
                        <View >
                            {
                                farmerProblem && farmerProblem.agri_user ?
                                    <View style={styles.container}>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>{'Name of farmer/ \nProducer'}</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_user.userName}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Phone Number</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_user.contactNumber}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Problem Title</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.question_title}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Problem in Details</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.question_desc}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Plot/Site</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_user.userName}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Livelihood Type</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.agri_land_user_rel && farmerProblem.agri_land_user_rel.plot_no}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Produce Name in Details</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.crop_name && farmerProblem.crop_name.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Produce Variety</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.crop_variety && farmerProblem.crop_variety.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Production Stage</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.growth_stage && farmerProblem.growth_stage.name}</Text>
                                        </View>
                                        <View style={styles.item}>
                                            <Text style={styles.itemTitle}>Affected Date</Text>
                                            <Text style={styles.itemTitle}>:  {farmerProblem.affected_date ?? ''}</Text>
                                        </View>

                                        <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} title="View Photo" />

                                        <View style={{ marginHorizontal: 20 }}>
                                            <Text style={styles.title}>Listen to the Problem</Text>
                                            <View style={styles.photoContainer}>
                                                <Image
                                                    source={require('../../Common/images/play.png')}
                                                    style={{ width: 70, height: 70 }}
                                                />
                                                <Image
                                                    source={require('../../Common/images/play.png')}
                                                    style={{ width: 70, height: 70 }}
                                                />
                                                <Image
                                                    source={require('../../Common/images/play.png')}
                                                    style={{ width: 70, height: 70 }}
                                                />
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
                                        style={styles.textarea}
                                        value={comment1}
                                        onChangeText={(item) => setComment1(item)}
                                    />
                                    <TouchableOpacity onPress={() => saveCommet()}>
                                        <Text style={[styles.btn, { backgroundColor: '#023a02', color: '#FFF' }]}>Comments</Text>
                                    </TouchableOpacity>
                                </View>
                                :
                                ""}
                            <View style={styles.btnContainer}>
                                <TouchableOpacity style={btnColor === 1 ? styles.btnActive : styles.btn} onPress={() => setBtnColor(1)}>
                                    <Text style={btnColor === 1 ? styles.btnTitleActive : styles.btnTitle}>Answers</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={btnColor === 2 ? styles.btnActive : styles.btn} onPress={() => setBtnColor(2)}>
                                    <Text style={btnColor === 2 ? styles.btnTitleActive : styles.btnTitle}>Comments</Text>
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
                                                            <Text style={styles.AnsTitle}>Role : Super Admin</Text>
                                                            <Text style={styles.AnsTitle}>Date : {formatDateToMMDDYYYY(value.created_at)}</Text>
                                                            <Text style={styles.AnsTitle}>Comment :{value.optional_solution} </Text>
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
                                                        value.agri_user.agri_files.forEach(element => {
                                                            element.term_type === "3" ?

                                                                <Image
                                                                    source={{ uri: element.file_path }}
                                                                    resizeMode="cover" style={{ width: 50, height: 50 }}
                                                                />
                                                                :
                                                                <Image
                                                                    source={require('../../Common/images/plus.png')}
                                                                    resizeMode="cover" style={{ width: 50, height: 50 }}
                                                                />
                                                        })
                                                    }
                                                </View>
                                                <View style={styles.AnsTextContainer}>
                                                    {
                                                        value.agri_user.agri_files.forEach(element => {
                                                            <Text style={styles.AnsTitle}>{element}</Text>
                                                        })
                                                    }
                                                    <Text style={styles.AnsTitle}>{value.agri_user.userName}
                                                        {value.agri_user.userType === 3 ? <Text>(Supervisor)</Text> : <Text>(Farmer)</Text>}

                                                    </Text>
                                                    <Text style={styles.AnsTitle}>{value.comment_content}</Text>
                                                    <Text style={styles.AnsTitle}>{value.CreateDateTime}</Text>

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

export default ViewProblem

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginHorizontal: '5%',
        backgroundColor: '#FFF',
        borderRadius: 8
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginVertical: 10
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
        width: '90%',
        marginHorizontal: '5%',
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