import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import React, {useEffect, useState} from 'react';
import {getItem} from '../../../config/getDataFromStorage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';
const FarmerPastEnquiriesModel = props => {
  const {t} = useTranslation();
  const [currency, setcurrency] = useState('');
  function formatDateToMMDDYYYY(inputDate) {
    const date = new Date(inputDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }
  const onPageLoad = async () => {
    const curr = await getItem('currency');
    setcurrency(curr);
  };
  useEffect(() => {
    onPageLoad();
  }, []);
  return (
    <View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
          props.setModalVisible(!props.modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {t('farmer_pastEnq_details')}
              </Text>
              <TouchableOpacity
                onPress={() => props.setModalVisible(!props.modalVisible)}
                style={styles.closeButton}>
                <MaterialIcons name="close" size={25} color="#a61e1e" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
              <View style={styles.itemContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="map" size={20} color="#165A2B" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.valueText}>{t('plot')} : </Text>
                    <Text style={styles.labelText}>
                      {props.pastEnquirySingle.inout_plot_rel &&
                        props.pastEnquirySingle.inout_plot_rel.plot_no}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="grass" size={20} color="#165A2B" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.valueText}>{t('category')} : </Text>
                    <Text style={styles.labelText}>
                      {props.pastEnquirySingle.io_entity_type &&
                        props.pastEnquirySingle.io_entity_type.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="grass" size={20} color="#165A2B" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.valueText}>{t('sub_category')} : </Text>
                    <Text style={styles.labelText}>
                      {props.pastEnquirySingle.io_entity_name &&
                        props.pastEnquirySingle.io_entity_name.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="eco" size={20} color="#165A2B" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.valueText}>{t('product_name')}: </Text>
                    <Text style={styles.labelText}>
                      {props.pastEnquirySingle.ioProduPrice &&
                        props.pastEnquirySingle.ioProduPrice.mk_product &&
                        props.pastEnquirySingle.ioProduPrice.mk_product
                          .product_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons
                      name="production-quantity-limits"
                      size={20}
                      color="#165A2B"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.valueText}>{t('qty_amp_unit')} :</Text>
                    <Text style={styles.labelText}>
                      {props.pastEnquirySingle.quantity} /{' '}
                      {props.pastEnquirySingle.pp_qty}{' '}
                      {props.pastEnquirySingle.unit_id}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons name="event" size={20} color="#165A2B" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.valueText}>{t('required_date')}: </Text>
                    <Text style={styles.labelText}>
                      {formatDateToMMDDYYYY(props.pastEnquirySingle.date)}
                    </Text>
                  </View>
                </View>
                {props.pastEnquiryView && props.pastEnquiryView.length > 0 ? (
                  <>
                    <View
                      style={{
                        borderWidth: 3,
                        marginBottom: 10,
                        borderStyle: 'dotted',
                        borderColor: '#636363ff',
                      }}></View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="donut-large"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('full_fill_status')}
                        </Text>
                        <Text style={styles.labelText}></Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="production-quantity-limits"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>{t('qty')} :</Text>
                        <Text style={styles.labelText}>
                          {props.qty.qty} -{' '}
                          {props.pastEnquiryView[0].farmerorder &&
                            props.pastEnquiryView[0].farmerorder.unit_id}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="currency-rupee"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('total_amount') + ' (' + currency + ')'}:
                        </Text>
                        <Text style={styles.labelText}>{props.qty.total}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="percent"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('discount_amount') + ' (' + currency + ')'}:
                        </Text>
                        <Text style={styles.labelText}>
                          {props.qty.disTotal}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="currency-rupee"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('grand_total') + ' (' + currency + ')'}:
                        </Text>
                        <Text style={styles.labelText}>
                          {props.qty.grandTotal}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="calendar-month"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('approved_date')} :{' '}
                        </Text>
                        <Text style={styles.labelText}>
                          {formatDateToMMDDYYYY(
                            props.pastEnquiryView[
                              props.pastEnquiryView.length - 1
                            ].sdate,
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="cached"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>{t('sta_')} : </Text>
                        <Text style={styles.labelText}>
                          {props.pastEnquiryView[0].farmerorder.quantity -
                            props.pastEnquiryView[0].farmerorder
                              .fulfill_quantity ==
                          0 ? (
                            <Text>{t('closed')}</Text>
                          ) : (
                            <Text>{t('pending')}</Text>
                          )}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  ''
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FarmerPastEnquiriesModel;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
    backgroundColor: Colors.containerGreen,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerText: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#edd6d6',
    borderRadius: 50,
    alignItems: 'center',
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 170,
  },
  contentContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 5,
    // height: 62,
    elevation: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 140, 41, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    marginBottom: 2,
  },
  valueText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Poppins-Medium',
  },
  itemContainer: {},
  item: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  itemText: {
    width: '50%',
    color: '#FFF',
  },
});
