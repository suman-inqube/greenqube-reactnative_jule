import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import React, {memo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {SPSheet} from 'react-native-popup-confirm-toast';

const ProofAndIdentityPropfComp = ({
  identityProofIdentityPropf,
  handleDocumentSelection,
  handleDocumentSelectionRemove,
}) => {
  const {t} = useTranslation();

  // Memoize the handleDocumentSelection function
  const onHandleDocumentSelection = useCallback(
    (imageType, index, identityList, currentList) => {
      handleDocumentSelection(imageType, index, identityList, currentList);
    },
    [handleDocumentSelection],
  );
  // Memoize the document selection remove function
  const onHandleDocumentSelectionRemove = useCallback(
    (index,
    identityProofIdentityPropf) => {
      handleDocumentSelectionRemove(index, identityProofIdentityPropf);
    },
    [handleDocumentSelectionRemove],
  );
  const component = useCallback(
    props => {
      const openURL = async propsData => {
        const {file_path, uri} = propsData?.data || {};
        if (file_path) {
          await Linking.openURL(file_path);
        } else if (uri) {
          await Linking.openURL(uri);
        }
        propsData?.spSheet?.hide();
      };

      return (
        <View style={{flexDirection: 'column'}}>
          <View>
            {(props?.data?.file_path || props?.data?.uri) && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => openURL(props)}>
                <Text>{t('view_phote')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                onHandleDocumentSelection(
                  props?.data.ImageType,
                  props?.index,
                  props?.identityProofIdentityPropf,
                  identityProofIdentityPropf,
                );
                props.spSheet.hide();
              }}>
              <Text>Attach Document</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [onHandleDocumentSelection, identityProofIdentityPropf, t],
  );
  return (
    <View style={styles.idcontainer}>
      <Text style={[styles.title, {fontSize: 14, color: '#000'}]}>
        {t('address_proofAndIdentityPropf')}
      </Text>
      <View style={styles.idItemContainer}>
        {identityProofIdentityPropf &&
          identityProofIdentityPropf.map((data, index) => (
            <TouchableOpacity
              style={styles.idItem}
              key={index}
              onPress={() => {
                const spSheet = SPSheet;
                spSheet.show({
                  component: () =>
                    component({
                      data,
                      index,
                      identityProofIdentityPropf,
                      spSheet,
                    }),
                  height: 230,
                });
              }}>
              <View>
                {data?.name !== '' && (
                  <TouchableOpacity
                    onPress={() =>
                      onHandleDocumentSelectionRemove(
                        index,
                        identityProofIdentityPropf,
                      )
                    }>
                    <Image
                      source={require('./images/cross50.png')}
                      style={styles.closeIcon}
                    />
                  </TouchableOpacity>
                )}
                <Image
                  source={require('./images/document.png')}
                  style={styles.idImage}
                />
              </View>
              <Text style={styles.text}>
                {data?.name === '' || data?.name === undefined
                  ? data.file_name
                  : data.name}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  idcontainer: {margin: 10, flex: 1},
  idItemContainer: {flexDirection: 'row', flexWrap: 'wrap'},
  idItem: {
    padding: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  idImage: {width: 60, height: 60},
  text: {height: 50},
  button: {
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'green',
    margin: 10,
    borderRadius: 5,
  },
  closeIcon: {
    position: 'absolute',
    width: 20,
    height: 20,
    left: 45,
    top: -15,
  },
});

export default memo(ProofAndIdentityPropfComp);
