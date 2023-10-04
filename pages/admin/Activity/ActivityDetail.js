import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import InputTextForm from '../../Common/InputTextForm';
import TakePhoto from './TakePhoto';
import RecordComp from './RecordComp';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
const ActivityDetail = () => {
    const [selectedImage, setSelectedImage] = useState({
        firstItem: "",
        secondItem: "",
        thirdItem: "",
    });
    const [selectedRecord, setSelectedRecord] = useState({
        firstItemRecord: "",
        secondItemRecord: "",
        thirdItemRecord: "",
    });
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
                // Process the captured image
                let imageUri = response.uri || response.assets?.[0]?.uri;
                setSelectedImage({...selectedImage,[item]:imageUri});
            }
        });
    };
    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={[styles.title, { paddingBottom: 8, paddingTop: 4, fontWeight: '700', fontSize: 18 }]}>
                    Report Detail
                </Text>
            </View>
            <ScrollView>
                <View style={styles.fromContainer}>
                    <InputTextForm label="Farmer/Producer Name" />
                    <InputTextForm label="Phone Number" />
                    <InputTextForm label="Activity Type" />
                    <InputTextForm label="Activity Name" />
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        borderWidth: 0.5,
                        borderRadius: 5,
                        padding: 10,
                        backgroundColor:'#FFF',
                        marginVertical:12
                    }}>
                        <View style={{ width: '25%', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Text style={styles.title}>{'Activity \nDescription'}</Text>
                            <Text style={styles.title}>{'Activity \nScheduled Date'}</Text>
                        </View>
                        <View style={{
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            width: '50%',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={[styles.title]} >
                                Activity Description Activity Description Activity Description Activity Description Activity Description Activity Description Activity Description
                            </Text>
                            <Text style={[styles.title]}>
                                {'oct 14,2023-\noct 18,2023'}
                            </Text>
                        </View>

                    </View>
                    <InputTextForm label="Plot/Site Name" />
                    <InputTextForm label="Produce Name" />
                    <InputTextForm label="Production Stage" />
                    <InputTextForm label="Activity Performed Date" />
                    <InputTextForm label="Your Comment" />
                    <InputTextForm label="Material Used" />
                    <InputTextForm label="Water Used" />
                    <InputTextForm label="Power Used" />
                    <TakePhoto openImagePicker={openImagePicker} selectedImage={selectedImage} />
                    <RecordComp selectedRecord={selectedRecord} />
                </View>
            </ScrollView>
        </View>
    )
}

export default ActivityDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'#FFF'
    },
    titleContainer: {
        width: "95%",
        alignItems: 'flex-end',
        paddingVertical: 10,
    },
    title: {
        color: '#000',
        paddingVertical: 10
    },
    fromContainer: {
        width: '90%',
        marginHorizontal: '5%',
    },
})
