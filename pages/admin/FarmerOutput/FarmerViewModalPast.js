import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native'
import { formatDateToMMDDYYYY } from '../../Common/DateChanger';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react'
import { getItem } from '../../../config/getDataFromStorage';

const FarmerViewModalPast = (props) => {
    const { t } = useTranslation();
    const [currency, setcurrency] = useState("");
    function formatDateToMMDDYYYY(inputDate) {
        const date = new Date(inputDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
    const onPageLoad = async () => {
        const curr = await getItem('currency');
        setcurrency(curr)

    };
    useEffect(() => {
        onPageLoad();
    }, [])
    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={props.modalVisible}
                onRequestClose={() => {
                    props.setModalVisible(!props.modalVisible);
                }}
            >
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} onPress={() => props.setModalVisible(!props.modalVisible)}  >
                    <View style={styles.modalView}>
                        <View style={styles.modelTitleContainer}>
                            {
                                props.outputSingle ?
                                    <View style={styles.itemContainer}>
                                        {
                                            props.outputSingle.others ?
                                                <View style={styles.item}>
                                                    <Text style={styles.itemText}>{t('name')}</Text>
                                                    <Text style={styles.itemText}>: {props.outputSingle.others}</Text>
                                                </View>
                                                :
                                                <>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('agent_crop_problem_plot')}</Text>
                                                        <Text style={styles.itemText}>: {props.outputSingle.inout_plot_rel && props.outputSingle.inout_plot_rel.plot_no}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('crop_name')}</Text>
                                                        <Text style={styles.itemText}>: {props.outputSingle.io_crop_name && props.outputSingle.io_crop_name.name}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('crop_veriety')}</Text>
                                                        <Text style={styles.itemText}>: {props.outputSingle.io_crop_variety && props.outputSingle.io_crop_variety.name}</Text>
                                                    </View>
                                                </>
                                        }
                                        <>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>{t('qty_amp_unit')}</Text>
                                                <Text style={styles.itemText}>: {props.outputSingle.quantity && props.outputSingle.quantity}   {props.outputSingle.unit_id && props.outputSingle.unit_id}</Text>
                                            </View>

                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>{t('farmer_name')}</Text>
                                                <Text style={styles.itemText}>: {props.outputSingle.users && props.outputSingle.users.userName}</Text>
                                            </View>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>{t('farmer_number')}</Text>
                                                <Text style={styles.itemText}>: {props.outputSingle.users && props.outputSingle.users.contactNumber}</Text>
                                            </View>
                                            <View style={styles.item}>
                                                <Text style={styles.itemText}>{t('required_date')}</Text>
                                                <Text style={styles.itemText}>: {formatDateToMMDDYYYY(props.outputSingle.date)}</Text>
                                            </View>
                                        </>
                                        {
                                            props.pastEnquiryView && props.pastEnquiryView.length > 0 ?
                                                <>
                                                    <View style={{ backgroundColor: '#FFF', height: 3, borderRadius: 50 }}></View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.modelItemTitle}>{'Procure Fulfillment Status'}</Text>
                                                    </View>

                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('qty_amp_unit')}</Text>
                                                        <Text style={styles.itemText}>: {props.pastEnquiryView[0].pro_qty}  {props.pastEnquiryView[0].prod_unit}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('grand_total') + " (" + currency + ")"} </Text>
                                                        <Text style={styles.itemText}>: {props.pastEnquiryView[0].grand_total}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('approved_date')}</Text>
                                                        <Text style={styles.itemText}>: {formatDateToMMDDYYYY(props.pastEnquiryView[0].pro_date)}</Text>
                                                    </View>
                                                    <View style={styles.item}>
                                                        <Text style={styles.itemText}>{t('sta_')}</Text>
                                                        <Text style={styles.itemText}>: {props.pastEnquiryView[0].pro_status == 'partially' || props.pastEnquiryView[0].pro_status == 'moved_to_inventory' && t('pending_')} {props.pastEnquiryView[0].pro_status == 'fully' && t('closed')}</Text>
                                                    </View>
                                                </>
                                                : ''
                                        }
                                    </View>
                                    : ''
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default FarmerViewModalPast

const styles = StyleSheet.create({
    container: {

    },
    modalView: {
        backgroundColor: '#FFF',
        width: '90%',
        borderRadius: 10
    },
    modelTitleContainer: {
        backgroundColor: '#165A2B',
        width: '95%',
        margin: '2.5%',
        borderRadius: 10
    },
    itemContainer: {

    },
    item: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 5,
        alignItems: 'center'
    },
    itemText: {
        width: '50%',
        color: '#FFF'
    },
    line: {
        backgroundColor: '#FFF',
        height: 3,
        marginHorizontal: 3,
        borderRadius: 10
    },
    modelItemTitle: {
        width: '80%',
        color: '#FFF',
        fontSize: 15,
        marginVertical: 8
    }
})