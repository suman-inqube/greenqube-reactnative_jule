import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import ImageForm from '../Common/ImageForm';

export const BoxDisplay = ({ text, text1, imageurl,onpress, testID }) => {
    return (
        <TouchableOpacity testID={testID} accessibilityLabel={testID} onPress={onpress} style={styles.boxContainer}>
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
                    <Text style={styles.box1_1}>{text}</Text>
                    <Text style={styles.box1_1}>{text1}</Text>
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
                <Text style={styles.box1_1}>{name}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    boxContainer: {
        flex: 1
    },
    box1:
    {
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        backgroundColor: 'white',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        margin: 5,
    },

    box1_1: {
        marginLeft: 20,
        fontWeight: 'bold'
    }

})

