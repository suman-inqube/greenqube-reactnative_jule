import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import React from 'react';
import {useTranslation} from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';
const ViewPast = props => {
  const {t} = useTranslation();
  const {ins_plots, agri_user} = props.modalVisibleData;
  if (agri_user != undefined) {
    let mydate = new Date(agri_user.CreateDateTime.split('T')[0]);
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
          props.setModalVisible(!props.modalVisible);
        }}>
        <View style={styles.centeredView}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => props.setModalVisible(!props.modalVisible)}
          />

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
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="map" size={20} color="#165A2B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.labelText}>{t('pre_plot_name')}</Text>
                  <Text style={styles.valueText}>
                    {ins_plots &&
                      ins_plots.map((data, index) => {
                        return (
                          <Text key={index}>
                            {data.agri_land_user_rel.plot_no}
                            {ins_plots.length > 1 &&
                            ins_plots.length - 1 > index
                              ? ', '
                              : ''}
                          </Text>
                        );
                      })}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="grass" size={20} color="#165A2B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.labelText}>{t('addcrop_cropname')}</Text>
                  <Text style={styles.valueText}>
                    {ins_plots &&
                      ins_plots.map((data, index) =>
                        data.agri_land_user_rel.plot_crops.map(
                          (cropsData, cropsIndex) => {
                            return (
                              <Text key={cropsIndex}>
                                {cropsData.crop_name.name}
                                {ins_plots.length > 1 &&
                                ins_plots.length - 1 > index
                                  ? ', '
                                  : ''}
                              </Text>
                            );
                          },
                        ),
                      )}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="person" size={20} color="#165A2B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.labelText}>
                    {t('enter_farmer_s_name')}
                  </Text>
                  <Text style={styles.valueText}>{agri_user.userName}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="phone" size={20} color="#165A2B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.labelText}>{t('farmer_number')}</Text>
                  <Text style={styles.valueText}>
                    {agri_user.contactNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="event" size={20} color="#165A2B" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.labelText}>{t('required_date')}</Text>
                  <Text style={styles.valueText}>
                    {mydate.toString().substring(4, 15)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
};

export default ViewPast;

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
});
