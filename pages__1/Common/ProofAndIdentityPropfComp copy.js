import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import React, {memo} from 'react';
import {useTranslation} from 'react-i18next';
import {Root, SPSheet, Popup, Toast} from 'react-native-popup-confirm-toast';
const ProofAndIdentityPropfComp = ({
  identityProofIdentityPropf,
  handleDocumentSelection,
  handleDocumentSelectionRemove,
  title,
}) => {
  console.log('aaaa');
  const {t} = useTranslation();
  const component = props => {
    const openURL = async propsData => {
      // const supported = await Linking.canOpenURL(propsData?.data?.file_path);
      let uri = '';
      if (propsData?.data?.file_path) {
        await Linking.openURL(propsData?.data?.file_path);
        propsData.spSheet.hide();
      } else {
        await Linking.openURL(propsData?.data?.uri);
        propsData.spSheet.hide();
      }
      // } else {
      //   // Alert.alert(`Unable to open URL: ${url}`);
      // }
    };

    return (
      <>
        {props?.data && (
          <View style={{flexDirection: 'column'}}>
            <View>
              {props?.data?.file_path ? (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'green',
                    margin: 10,
                    borderRadius: 5,
                  }}
                  onPress={() => openURL(props)}>
                  <Text>{t('view_phote')}</Text>
                </TouchableOpacity>
              ) : props?.data?.uri ? (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'green',
                    margin: 10,
                    borderRadius: 5,
                  }}
                  onPress={() => openURL(props)}>
                  <Text>{t('view_phote')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View>
              <TouchableOpacity
                style={{
                  padding: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'green',
                  margin: 10,
                  borderRadius: 5,
                }}
                onPress={() => {
                  handleDocumentSelection(
                    props?.data.ImageType,
                    props?.index,
                    props?.identityProofIdentityPropf,
                    identityProofIdentityPropf,
                  );
                  props.spSheet.hide();
                }}>
                <Text>{t('take_photo')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
    // props.spSheet.hide();
    // props.spSheet.setHeight(150, () => alert('nice'));
  };

  return (
    <View style={styles.idcontainer}>
      <Text style={[styles.title, {fontSize: 14, color: '#000'}]}>
        {t('address_proofAndIdentityPropf')}
        {/* {title} */}
      </Text>
      <View style={styles.idItemContainer}>
        {identityProofIdentityPropf &&
          identityProofIdentityPropf?.map((data, index) => {
            return (
              <TouchableOpacity
                style={styles.idItem}
                // onPress={() => handleDocumentSelection(data.ImageType, index)}
                onPress={() => {
                  const spSheet = SPSheet;
                  spSheet.show({
                    component: () =>
                      component({
                        data,
                        index,
                        identityProofIdentityPropf,
                        ...this.props,
                        spSheet,
                      }),
                    dragFromTopOnly: true,
                    onCloseComplete: () => {
                      // alert('onCloseComplete');
                    },
                    onOpenComplete: () => {
                      // alert('onOpenComplete');
                    },
                    // height: 185,
                    height: 230,
                  });
                }}
                key={index}>
                <View>
                  {data?.name != '' ? (
                    <TouchableOpacity
                      onPress={() => handleDocumentSelectionRemove(index)}>
                      <Image
                        source={require('./images/cross50.png')}
                        style={{
                          position: 'absolute',
                          width: 20,
                          height: 20,
                          left: 45,
                          top: -15,
                        }}
                      />
                    </TouchableOpacity>
                  ) : (
                    ''
                  )}
                  <Image
                    source={require('./images/document.png')}
                    style={styles.idImage}
                  />
                </View>
                <Text style={{height: 100}}>
                  {data?.name == '' || data?.name == undefined
                    ? data.file_name
                    : data.name}
                  {data.name}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  idItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 200,
  },
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  idImage: {
    width: 60,
    height: 60,
  },
});
export default memo(ProofAndIdentityPropfComp);
