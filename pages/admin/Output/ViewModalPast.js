import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {getItem} from '../../../config/getDataFromStorage';
import {formatDateToMMDDYYYY} from '../../Common/DateChanger';
import {useTranslation} from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';
const ViewModalPast = props => {
  const {t} = useTranslation();
  const [currency, setcurrency] = useState('');
  function formatDateToMMDDYYYY(inputDate) {
    const date = new Date(inputDate);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
          {/* <TouchableOpacity
            style={[styles.overlay, props.style]}
            activeOpacity={1}
            onPress={() => props.setModalVisible(!props.modalVisible)}> */}
          <View style={styles.modalView}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerText}>
                  {t('farmer_pastEnq_details')}
                </Text>
                <TouchableOpacity
                  onPress={() => props.setModalVisible(!props.modalVisible)}
                  style={styles.closeButton}>
                  <MaterialIcons name="close" size={25} color="#a61e1e" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
              {props.outputSingle ? (
                <View style={styles.itemContainer}>
                  {props.outputSingle.inout_plot_rel == null ? (
                    <View style={styles.detailRow}>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>{t('name')} :</Text>
                        <Text style={styles.labelText}>
                          {props.outputSingle.others}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                          <MaterialIcons name="map" size={20} color="#165A2B" />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.valueText}>
                            {t('agent_crop_problem_plot')} :
                          </Text>
                          <Text style={styles.labelText}>
                            {props.outputSingle.inout_plot_rel &&
                              props.outputSingle.inout_plot_rel.plot_no}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                          <MaterialIcons
                            name="grass"
                            size={20}
                            color="#165A2B"
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.valueText}>
                            {t('crop_name')} :{' '}
                          </Text>
                          <Text style={styles.labelText}>
                            {props.outputSingle.io_crop_name &&
                              props.outputSingle.io_crop_name.name}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                          <MaterialIcons name="eco" size={20} color="#165A2B" />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.valueText}>
                            {t('crop_veriety')} :{' '}
                          </Text>
                          <Text style={styles.labelText}>
                            {props.outputSingle.io_crop_variety &&
                              props.outputSingle.io_crop_variety.name}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                  <>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="production-quantity-limits"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('qty_amp_unit')} :{' '}
                        </Text>
                        <Text style={styles.labelText}>
                          {props.outputSingle.quantity &&
                            props.outputSingle.quantity}{' '}
                          {props.outputSingle.unit_id &&
                            props.outputSingle.unit_id}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons
                          name="person"
                          size={20}
                          color="#165A2B"
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('farmer_name')} :{' '}
                        </Text>
                        <Text style={styles.labelText}>
                          {props.outputSingle.users &&
                            props.outputSingle.users.userName}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons name="phone" size={20} color="#165A2B" />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('farmer_number')} :{' '}
                        </Text>
                        <Text style={styles.labelText}>
                          {props.outputSingle.users &&
                            props.outputSingle.users.contactNumber}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <MaterialIcons name="event" size={20} color="#165A2B" />
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.valueText}>
                          {t('required_date')} :
                        </Text>
                        <Text style={styles.labelText}>
                          {formatDateToMMDDYYYY(props.outputSingle.date)}
                        </Text>
                      </View>
                    </View>
                  </>
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
                            {'Procure Fulfillment Status'}
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
                          <Text style={styles.valueText}>
                            {t('qty_amp_unit')}:
                          </Text>
                          <Text style={styles.labelText}>
                            {props.qty.qty}-{props.pastEnquiryView[0].prod_unit}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.detailRow}>
                        <View style={styles.iconContainer}>
                          <MaterialIcons
                            name="payment"
                            size={20}
                            color="#165A2B"
                          />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={styles.valueText}>
                            {t('grand_total') + ' (' + currency + ')'} :
                          </Text>
                          <Text style={styles.labelText}>
                            {props.pastEnquiryView[0].grand_total}
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
                              props.pastEnquiryView[0].pro_date,
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
                          <Text style={styles.valueText}>{t('sta_')}</Text>
                          <Text style={styles.labelText}>
                            {props.pastEnquiryView[
                              props.pastEnquiryView.length - 1
                            ].pro_status == 'fully'
                              ? t('closed')
                              : t('pending')}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    ''
                  )}
                </View>
              ) : (
                ''
              )}
            </ScrollView>
          </View>
          {/* </TouchableOpacity> */}
        </View>
      </Modal>
    </View>
  );
};
export default ViewModalPast;

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
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#edd6d6',
    borderRadius: 15,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
