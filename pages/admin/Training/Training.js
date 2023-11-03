import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ImageBackground } from 'react-native'
import React, { useState, useEffect } from 'react'
import { noticeDetailsAPI } from '../../../config/apiHere';

import { WebView } from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { getItem } from '../../../config/getDataFromStorage';
// import HTMLView from 'react-native-htmlview';


const Training = () => {
    const [noticeDetails, setNoticeDetails] = useState([]);
    const [noticeFiles, setNoticeFiles] = useState([]);
    const { width } = useWindowDimensions();

    const detailItem = async (itemId) => {
         console.log(itemId);
        <WebView
            source={{ uri: `${itemId}` }}
            

        />

    }

    const DocumentDisplay = (props) => {
        return (
            <View> 
                <ImageBackground source={props.item3 === "gen_info_pdf"
                    ? require("../../Common/images/icons8-pdf-50.png")
                    : require("../../Common/images/icons8-image-50.png") }
                    style={{
                        width: '100%',
                        alignItems: 'center',
                        height: 100, }}
                    resizeMode="contain">  
                </ImageBackground>  
                <Text style={styles.textOne}>{props.item2}</Text> 
            </View>
        );
    }


    const source = {
        html: `${noticeDetails.post_desc}`
    };
    const onPageLoad = async () => {
        const noticeId = await getItem('userNoticeId');
        const loginUser_data = await getItem('loginUser_data');
        if (noticeId) {
            const dbName = loginUser_data.dbname;
            const languageID = loginUser_data.lan_id;
            const token = loginUser_data.token;
            let response = await noticeDetailsAPI(dbName, languageID, token, noticeId);
            if (response) {
            
                setNoticeDetails(response.data.data[0])
                setNoticeFiles(response.data.data[0].agri_files)
                //  console.log(JSON.stringify(response.data.data[0], null, 2));  
            }
        }
    };
    useEffect(() => {
        onPageLoad();
    }, []);
    return (
        <View style={{ marginHorizontal: 7, marginTop: 20, }}>

            <View style={styles.titleContainer}>
                <Text style={[styles.title, {
                    paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontWeight: 'bold', color: "black",
                    fontFamily: "Arial", fontSize: 18
                }]}>
                    {noticeDetails.post_name}
                </Text>
            </View>
            <View style={{ marginHorizontal: 7, }}>
                <RenderHtml
                    contentWidth={width}
                    source={source}
                />
            </View>

            <View>
                {
                    noticeFiles ?
                
                <FlatList
                    data={noticeFiles}
                    keyExtractor={(item) => item.file_id}
                    renderItem={({ item, index }) => (
                        <View style={{ marginBottom: 10 }}>
                            <TouchableOpacity onPress={() => detailItem(item.file_path)}>
                                        <DocumentDisplay
                                            item={item.file_path}
                                            item2={item.file_name}
                                            item3={item.term_type}
                                        />
                                    </TouchableOpacity>
                        </View>
                    )} />
                :
                ""
                }
            </View>

           

        </View>
    )

}

export default Training

const styles = StyleSheet.create({
    header:
    {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    box1:
    {
        // marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    box1_1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
    },
    boxMenu:
    {
        // marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },

    titleContainer: {
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    textOne:{
        alignItems: 'center',
        width: '100%',
        marginLeft: 25,
        

    }
})
