import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';
import DatePickerComp from '../../Common/DatePickerComp';
import LoadingScreen from '../../Common/LoadingScreen';
const SampleReport = ({ data, newdate, opencycleStarts,
    onPressDateContainer, setOpenFromDate,
    handlecycleStart, selectedDate, onChangeByID, onPressByID, isLoading }) => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <DatePickerComp newDate={newdate}
                openDate={opencycleStarts}
                setOpenDate={setOpenFromDate}
                handleDatePicker={handlecycleStart}
            />
            <TouchableOpacity style={styles.searchByDateContainer} onPress={onPressDateContainer}>
                <Text style={styles.title}>{selectedDate == "" ? t('search_by_date') : selectedDate}</Text>
                <Image source={require('../../Common/images/calendar.png')} style={styles.calendarIcon} />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
                <TextInput placeholder={t('search_by_sample_id')} style={styles.textInput} placeholderTextColor="#000" onChangeText={(text) => onChangeByID(text, "sampleRequested")} />
                <TouchableOpacity onPress={() => onPressByID("SampleReport")}>
                    <Image source={require('../../Common/images/search.png')} style={styles.calendarIcon} />
                </TouchableOpacity>
            </View>
            {isLoading ? <View style={styles.loadingScreen}><LoadingScreen /></View> : null}
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data}
                renderItem={({ item }) => {
                    const { agri_land_user_rel, test_id, created_at } = item;
                    return (
                        <View style={styles.listContainer}>
                            <View style={styles.listItem}>
                                <Text style={styles.title}>{test_id}</Text>
                                <Text style={styles.title}>{agri_land_user_rel?.plot_no}</Text>
                            </View>
                            <Text style={styles.title}>{created_at.substring(0, 10)}</Text>
                        </View>
                    )
                }}
                keyExtractor={item => item.id}
            />
        </View>
    )
}

export default SampleReport;
const styles = StyleSheet.create({
    container: {
        marginHorizontal: '2.5%',
        marginTop: 20,
        flex: 1,
    },
    searchByDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 45,
        backgroundColor: '#FFF'
    },
    calendarIcon: {
        width: 30,
        height: 30
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: "#FFF",
        marginVertical: 20,
    },
    textInput: {
        width: '90%',
        height: 45,
        color: '#000',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    },
    listContainer: {
        padding: '2.5%',
        paddingHorizontal: '5%',
        backgroundColor: "#FFF",
        borderRadius: 10,
        elevation: 2,
        borderBottomWidth: 2,
        color: '#000'

    },
    title: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    loadingScreen: {
        position: 'absolute',
        top: '30%',
        zIndex: 999,
        left: '45%'
    },
})