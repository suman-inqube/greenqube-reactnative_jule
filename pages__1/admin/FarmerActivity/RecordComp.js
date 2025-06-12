import { StyleSheet, View, TouchableOpacity, Image, Text, Linking } from 'react-native'
import React from 'react'


const RecordComp = ({
    selectedRecord,
    onPress,
    setModalVisibleRecordFirstItem,
    setModalVisibleRecordSecoundItem,
    setModalVisibleRecordThirdItem,
    soundRecordFirstItem,
    soundRecordSecoundItem,
    soundRecordThirdItem,
    title
}) => {
    return (
        <>
            <Text style={styles.title_recording}>{title}</Text>
            <View style={styles.container_recording}>
                <TouchableOpacity style={styles.item_recording} onPress={() => setModalVisibleRecordFirstItem && setModalVisibleRecordFirstItem(true)}>
                    {selectedRecord.firstItemRecord == "" ?
                        soundRecordFirstItem && soundRecordFirstItem.result != "" && soundRecordFirstItem.isLoggingIn == false ? <>
                            <Image
                                source={require('../../Common/images/microphone.png')}
                                style={{ width: 70, height: 80 }}
                            />
                        </> :
                            <Image
                                source={require('../../Common/images/microphone.png')}
                                style={{ width: 70, height: 80, opacity: 0.7 }}
                            /> :
                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.firstItemRecord)}>
                            <Image
                                source={require('../../Common/images/play.png')}
                                // style={styles.image}
                                style={{ width: 70, height: 70 }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    }
                </TouchableOpacity>
                <TouchableOpacity style={styles.item_recording} onPress={() => setModalVisibleRecordSecoundItem(true)}>
                    {selectedRecord.secondItemRecord == "" ?
                        soundRecordSecoundItem && soundRecordSecoundItem.result != "" && soundRecordSecoundItem.isLoggingIn == false ? <>
                            <Image
                                source={require('../../Common/images/microphone.png')}
                                style={{ width: 70, height: 80 }}
                            />
                        </> :
                            <Image
                                source={require('../../Common/images/microphone.png')}
                                style={{ width: 70, height: 80, opacity: 0.7 }}
                            /> :
                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.secondItemRecord)}>
                            <Image
                                source={require('../../Common/images/play.png')}
                                // style={styles.image}
                                style={{ width: 70, height: 70 }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    }
                </TouchableOpacity>

                <TouchableOpacity style={styles.item_recording} onPress={() => setModalVisibleRecordThirdItem(true)}>
                    {selectedRecord.thirdItemRecord == "" ?
                        soundRecordThirdItem && soundRecordThirdItem.result != "" && soundRecordThirdItem.isLoggingIn == false ? <>
                            <Image
                                source={require('../../Common/images/microphone.png')}
                                style={{ width: 70, height: 80 }}
                            />
                        </> :
                            <Image
                                source={require('../../Common/images/microphone.png')}
                                style={{ width: 70, height: 80, opacity: 0.7 }}
                            /> :
                        <TouchableOpacity onPress={() => Linking.openURL(selectedRecord.thirdItemRecord)}>
                            <Image
                                source={require('../../Common/images/play.png')}
                                // style={styles.image}
                                style={{ width: 70, height: 70 }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    }
                </TouchableOpacity>

            </View>

        </>
    )
}

export default RecordComp

const styles = StyleSheet.create({
    container_recording: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10
    },
    item_recording: {
        // backgroundColor: '#e9e9e9',
        width: '30%',
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        TouchableOpacityAlign: 'center'
    },
    title_recording: {
        paddingVertical: 10,
        color: '#000'
    }

})
