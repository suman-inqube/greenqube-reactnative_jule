import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useContext } from 'react';
import SoilHealthManagementController from '../../ViewController/SoilHealthManagementController';
import SampleRequested from './SampleRequested';
import SampleReport from './SampleReport';
import { userCreateContext } from '../../Context/usersCreateContext';
const MySoil = () => {
    //GQR-67
    const { t, CustomHeader, FormsTitle, logoImage, topBanner } = useContext(userCreateContext);
    //GQR-67
    const {
        activeBtn,
        setActiveBtn,
        sampaleRequested,
        newFromDate,
        setOpenFromDate,
        openFromDate,
        onPressDateContainer,
        handlecycleStart,
        startDate,
        onChangeByID,
        onPressByID,
        sampaleReportList,
        onChangeActiveBtn,
        isLoading,
        HandlerGoBack
    } = SoilHealthManagementController('sampale');
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader HandlerGoBack={() => HandlerGoBack('SoilHealthManagement')} logoImage={logoImage} topBanner={topBanner} />
            <FormsTitle title={t('my_soil')} />
            <View style={styles.btnContainer}>
                <View style={activeBtn === 1 ? styles.btnActive : styles.btn}>
                    <TouchableOpacity onPress={() => onChangeActiveBtn(1)}>
                        <Text style={activeBtn === 1 ? styles.btnActiveTitle : styles.btnTitle}>{t('sample_request')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={activeBtn === 2 ? styles.btnActive : styles.btn}>
                    <TouchableOpacity onPress={() => onChangeActiveBtn(2)}>
                        <Text style={activeBtn === 2 ? styles.btnActiveTitle : styles.btnTitle}>{t('sample_report')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {
                activeBtn === 1 ?
                    <SampleRequested
                        data={sampaleRequested}
                        newdate={newFromDate}
                        opencycleStarts={openFromDate}
                        onPressDateContainer={onPressDateContainer}
                        setOpenFromDate={setOpenFromDate}
                        handlecycleStart={handlecycleStart}
                        selectedDate={startDate}
                        onChangeByID={onChangeByID}
                        onPressByID={onPressByID}
                        isLoading={isLoading}
                    />
                    :
                    <SampleReport
                        data={sampaleReportList}
                        newdate={newFromDate}
                        opencycleStarts={openFromDate}
                        onPressDateContainer={onPressDateContainer}
                        setOpenFromDate={setOpenFromDate}
                        handlecycleStart={handlecycleStart}
                        selectedDate={startDate}
                        onChangeByID={onChangeByID}
                        onPressByID={onPressByID}
                        isLoading={isLoading}
                    />
            }
        </View>
    )
}

export default MySoil

const styles = StyleSheet.create({
    btnContainer: {
        marginHorizontal: '2.5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        width: '50%',
        elevation: 10,
        backgroundColor: '#C8C8C8',
        paddingHorizontal: 10,
        justifyContent: 'center',
        // padding: 7,
    },
    btnActive: {
        backgroundColor: '#2B7D05',
        elevation: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        // padding: 7,
        width: '50%'
    },
    btnActiveTitle: {
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        padding: 10,
    },
    btnTitle: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        padding: 10,
    }
})