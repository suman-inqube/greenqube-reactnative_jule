import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import ImageForm from '../Common/ImageForm';

export const BoxDisplay = ({ text, text1, imageurl, onpress }) => {
    return (
        <TouchableOpacity onPress={onpress} style={styles.boxContainer} activeOpacity={0.7}>
            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <ImageForm
                        source={imageurl}
                        resizeMode="cover"
                        height={35}
                        width={35}
                    />
                </View>
                <View style={{ flexDirection: 'row', width: '70%' }}>
                    <Text style={text != "Market" ? styles.box1_1 : {
                        marginLeft: 20,
                        fontWeight: '400',
                        fontFamily: 'Poppins-Regular',
                        color: '#bbbbbb',
                        fontSize: 14,
                        flex: 1, flexWrap: 'wrap'
                    }}>{text}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export const BoxDisplayDeactive = ({ text, text1, imageurl, onpress }) => {
    return (
        <TouchableOpacity onPress={onpress} style={styles.boxContainer}>
            <View style={styles.box1}>
                <View style={styles.box1_1}>
                    <ImageForm
                        source={imageurl}
                        resizeMode="cover"
                        height={35}
                        width={35}
                    />
                </View>
                <View>
                    <Text style={styles.box1_de}>{text}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export const BoxDisplaySingleLine = ({ name, imageurl }) => {
    return (
        <View style={styles.box1}>
            <View style={styles.box1_1}>
                <ImageForm
                    source={imageurl}
                    resizeMode="cover"
                    height={30}
                    width={30}
                />
            </View>
            <View>
                {/* <Text style={styles.box1_1}>{name}</Text> */}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    boxContainer: {
        flex: 1,
    },
    box1:
    {
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 65,
        backgroundColor: '#ffffff',
        // shadowColor: 'rgba(0, 0, 0, 0.2)',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.8,
        shadowRadius: 20,
        margin: 10,
        elevation: 3,
    },
    box1_1: {
        marginLeft: 12,
        fontWeight: '400',
        color: '#000',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        fontSize: 15,
    },
    box1_de: {
        marginLeft: 20,
        fontWeight: 'bold',
        color: '#B2BEB5',
        fontFamily: 'Poppins-Regular',
        fontSize: 15,
    }

})

