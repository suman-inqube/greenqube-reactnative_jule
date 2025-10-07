import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React from 'react';

const LivelihoodFilterModal = props => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={() => {
        props.setModalVisible(!props.modalVisible);
      }}
      // propagateSwipe={true}
      // presentationStyle='fullScreen'
    >
      <TouchableOpacity
        style={[styles.container, props.style]}
        activeOpacity={1}
        onPress={() => props.setModalVisible(!props.modalVisible)}>
        <View style={styles.modalView}>
          <View>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={props.data}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.flatlistItem}
                  onPress={() => props.productFilter(item)}>
                  <Text style={[styles.title, {color: '#000'}]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              //Setting the number of column
              numColumns={1}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LivelihoodFilterModal;

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 5,
    paddingVertical: 5,
    backgroundColor: '#B0D9B1',
    borderRadius: 20,
  },
  modalView: {
    // borderRadius: 20,
    backgroundColor: '#faf6f6',
    width: '95%',
    marginHorizontal: '5.8%',
    borderRadius: 15,
    overflow: 'hidden',
    // marginTop: 100,
    // marginBottom: 50,
    // paddingVertical:15
    // height: height/3.5,
  },
  modelTitleContainer: {
    // width: '95%',
    // height: '80%',
    margin: '2.5%',
    borderRadius: 10,
  },
  item: {
    // flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    alignItems: 'center',
    marginBottom: 5,
  },

  itemText: {
    width: '100%',
    textAlign: 'center',
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  flatContainer: {
    width: '100%',
    // height: height / 1.5
  },
  flatContainerLengthUp: {
    // height: height / 3
  },
  flatlistItem: {
    // margin: 1,
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: 40,
    backgroundColor: '#B0D9B1',
    elevation: 1,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // margin: 5
  },
});
