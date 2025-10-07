import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useContext} from 'react';
import {userCreateContext} from '../../Context/usersCreateContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors} from '../../utils/Constants';
const FarmerViewPast = props => {
  const {ins_plots, agri_user} = props.modalVisibleData;
  const {t} = useContext(userCreateContext);
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
              <DetailRow
                icon="map"
                label={t('far_list_plot')}
                value={
                  ins_plots &&
                  ins_plots.map((data, index) => {
                    return (
                      <Text key={index}>
                        {data.agri_land_user_rel.plot_no}
                        {ins_plots.length > 1 && ins_plots.length - 1 > index
                          ? ', '
                          : ''}
                      </Text>
                    );
                  })
                }
              />

              <DetailRow
                icon="grass"
                label={t('addcrop_cropname')}
                value={
                  ins_plots &&
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
                  )
                }
              />

              <DetailRow
                icon="person"
                label={t('crop_name')}
                value={agri_user.userName}
              />

              <DetailRow
                icon="phone"
                label={t('farmer_number')}
                value={agri_user.contactNumber}
              />

              <DetailRow
                icon="event"
                label={t('required_date')}
                value={mydate.toString().substring(4, 15)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }
};

const DetailRow = ({icon, label, value}) => (
  <View style={styles.detailRow}>
    <View style={styles.iconContainer}>
      <MaterialIcons name={icon} size={20} color="#165A2B" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.labelText}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  </View>
);

export default FarmerViewPast;

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
    height: 62,
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

  /////////////////////////////////////////////////////////////
  // container: {},
  // modalView: {
  //   backgroundColor: '#FFF',
  //   width: '90%',
  //   borderRadius: 10,
  // },
  // modelTitleContainer: {
  //   backgroundColor: '#165A2B',
  //   width: '95%',
  //   margin: '2.5%',
  //   borderRadius: 10,
  // },
  // itemContainer: {
  //   paddingVertical: 8,
  // },
  // item: {
  //   flexDirection: 'row',
  //   marginHorizontal: 10,
  //   marginVertical: 5,
  //   alignItems: 'center',
  // },
  // itemText: {
  //   width: '50%',
  //   color: '#FFF',
  // },
  // line: {
  //   backgroundColor: '#FFF',
  //   height: 3,
  //   marginHorizontal: 3,
  //   borderRadius: 10,
  // },
});
