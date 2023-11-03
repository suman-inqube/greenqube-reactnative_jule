import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native'
import React from 'react'


const RecordComp = ({
    selectedRecord,
    onPress
}) => {
    return (
        <>
            <Text style={styles.title}>Record Your comment (Optional)</Text>
            <View style={styles.container}>
                <TouchableOpacity style={styles.item} onPress={onPress}>
                    {selectedRecord.firstItemRecord == "" ? <Image
                        source={require('../../Common/images/microphone.jpeg')}
                        style={{width:100,height:100}}
                    />  :
                        <Image
                            source={{ uri: `${selectedRecord.firstItemRecord}` }}
                            // style={styles.image}
                            style={{ width: "100%", height: 100 }}
                            resizeMode="contain"
                        />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} >
                    {selectedRecord.secondItemRecord == "" ? <Image
                        source={require('../../Common/images/microphone.jpeg')}
                        style={{width:100,height:100}}
                    />  :
                        <Image
                            source={{ uri: `${selectedRecord.secondItemRecord}` }}
                            // style={styles.image}
                            style={{ width: "100%", height: 100 }}
                            resizeMode="contain"
                        />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.item} >
                    {selectedRecord.thirdItemRecord == "" ? <Image
                        source={require('../../Common/images/microphone.jpeg')}
                        style={{width:100,height:100}}
                    />  :
                        <Image
                            source={{ uri: `${selectedRecord.thirdItemRecord}` }}
                            // style={styles.image}
                            style={{ width: "100%", height: 100 }}
                            resizeMode="contain"
                        />}
                </TouchableOpacity>
            </View>

        </>
    )
}

export default RecordComp

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10
    },
    item: {
        // backgroundColor: '#e9e9e9',
        width: '30%',
        paddingVertical: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        TouchableOpacityAlign: 'center'
    },
    title: {
        paddingVertical: 10,
        color: '#000'
    }

})
