import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
const SampleRequested = () => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.searchByDateContainer}>
                <Text>{t('search_by_date')}</Text>
                <Image source={require('../../Common/images/calendar.png')} style={styles.calendarIcon} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>{t('search_by_sample_id')}</Text>
                <Image source={require('../../Common/images/search.png')} />
            </TouchableOpacity>
        </View>
    )
}

export default SampleRequested

const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2.5%',
        marginTop: 20
    },
    searchByDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 0.5,
        borderColor: '#000'
    },
    calendarIcon: {
        width: 40,
        height: 40
    }
})