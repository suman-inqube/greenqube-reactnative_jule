import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { memo } from 'react'
const PastEnquiriesModel = (props) => {
    function formatDateToMMDDYYYY(inputDate) {
        const date = new Date(inputDate);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }
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
                <TouchableOpacity style={[styles.container, props.style]} activeOpacity={1} onPress={() => props.setModalVisible(!props.modalVisible)} >
                    <View style={styles.modalView}>
                        <View style={styles.modelContainer}>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('farmer_name')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.user_name}</Text>
                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('farmer_number')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.user_contact_number}</Text>
                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('plot')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.inout_plot_rel && props?.pastEnquirySingle?.inout_plot_rel.plot_no}</Text>
                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('category')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.io_entity_type && props?.pastEnquirySingle?.io_entity_type.name}</Text>
                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('sub_category')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.io_entity_name && props?.pastEnquirySingle?.io_entity_name.name}</Text>
                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('product_name')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.ioProduPrice && props?.pastEnquirySingle?.ioProduPrice.mk_product && props?.pastEnquirySingle?.ioProduPrice.mk_product.product_name}</Text>

                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('qty_amp_unit')}</Text>
                                <Text style={styles.modelItemTitle}>: {props?.pastEnquirySingle?.quantity} - {props?.pastEnquirySingle?.pp_qty} {props?.pastEnquirySingle?.unit_id}</Text>
                            </View>
                            <View style={styles.ModelTtem}>
                                <Text style={styles.modelItemTitle}>{props.t('required_date')}</Text>
                                <Text style={styles.modelItemTitle}>: {formatDateToMMDDYYYY(props?.pastEnquirySingle?.date)}</Text>
                            </View>
                            {
                                props.pastEnquiryView && props.pastEnquiryView.length > 0 ?
                                    <>
                                        <View style={{ backgroundColor: '#FFF', height: 3, borderRadius: 50 }}></View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('full_fill_status')}</Text>
                                        </View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('qty')}</Text>
                                            <Text style={styles.modelItemTitle}>: {props.qty.qty} - {props?.pastEnquiryView[0]?.farmerorder && props?.pastEnquiryView[0]?.farmerorder.unit_id}</Text>
                                            {/* <Text style={styles.modelItemTitle}>:  {props?.pastEnquiryView[0]?.farmerorder && props?.pastEnquiryView[0]?.farmerorder.unit_id}</Text> */}
                                        </View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('total_amount') + " (" + props.currency + ")"}</Text>
                                            {/* <Text style={styles.modelItemTitle}>:  {props?.pastEnquiryView[0]?.total_samount}</Text> */}
                                            <Text style={styles.modelItemTitle}>:  {props.qty.total}</Text>
                                        </View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('discount_amount') + " (" + props.currency + ")"}</Text>
                                            {/* <Text style={styles.modelItemTitle}>:  {props?.pastEnquiryView[0]?.sdiscount}</Text> */}
                                            <Text style={styles.modelItemTitle}>:  {props.qty.disTotal}</Text>
                                        </View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('grand_total')}</Text>
                                            {/* <Text style={styles.modelItemTitle}>:  {props?.pastEnquiryView[0]?.sgrand_total}</Text> */}
                                            <Text style={styles.modelItemTitle}>:  {props.qty.grandTotal}</Text>
                                        </View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('approved_date')}</Text>
                                            {/* <Text style={styles.modelItemTitle}>:  {formatDateToMMDDYYYY(props?.pastEnquiryView[0]?.sdate)}</Text> */}
                                            <Text style={styles.modelItemTitle}>:  {formatDateToMMDDYYYY(props.pastEnquiryView[props.pastEnquiryView.length - 1].sdate)}</Text>
                                        </View>
                                        <View style={styles.ModelTtem}>
                                            <Text style={styles.modelItemTitle}>{props.t('sta_')}</Text>
                                            {/* <Text style={styles.modelItemTitle}>:  {props?.pastEnquiryView[0]?.farmerorder.quantity - props?.pastEnquiryView[0]?.farmerorder.fulfill_quantity == 0 ? <Text>{props.t('closed')}</Text> : <Text>{props.t('pending')}</Text>}</Text> */}
                                            <Text style={styles.modelItemTitle}>:  {props?.pastEnquiryView[0]?.farmerorder.quantity - props?.pastEnquiryView[0]?.farmerorder.fulfill_quantity == 0 ? <Text>{props.t('closed')}</Text> : <Text>{props.t('pending')}</Text>}</Text>
                                        </View>
                                    </>
                                    : ''
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default memo(PastEnquiriesModel)

const styles = StyleSheet.create({
    container: {
        // position: 'absolute',

        // bottom: '55%',
        // width: '100%',
        // position:'relative'

    },
    modalView: {
        width: '90%',
        margin: 20,
        borderRadius: 10,
        elevation: 10,
        borderWidth: 10,
        borderColor: '#FFF',
        position: 'relative',
        backgroundColor: '#FFF',
        // bottom: '50',
        // height:'100%'

    },
    modelContainer: {
        backgroundColor: '#054e05',
        paddingHorizontal: 20,
        borderRadius: 10

    },
    button: {
        borderRadius: 20,
        padding: 10,

    },
    modelTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },
    ModelTtem: {
        flexDirection: 'row'
    },
    modelItemTitle: {
        width: '50%',
        color: '#FFF',
        marginVertical: 5,
        fontFamily: 'Poppins-Regular',
    }
})