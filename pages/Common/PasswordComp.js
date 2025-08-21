import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Colors, Fonts} from '../utils/Constants';

const PasswordComp = ({
  setPasswordVisibility,
  color = '#4e4e4e',
  passwordVisibility,
  label,
  onChangeText,
  value,
  required = false,
  iconName = null,
  iconSize = 20,
  iconColor = null,
}) => {
  return (
    <>
      <View style={styles.labelContainer}>
        {iconName && (
          <MaterialIcons
            name={iconName}
            size={iconSize}
            color={iconColor || color}
            style={styles.labelIcon}
          />
        )}
        <Text style={[styles.formMargin, {color: color ?? 'black'}]}>
          {label}
        </Text>
        {required && <Text style={styles.requiredStar}> *</Text>}
      </View>
      <View style={styles.passwordMainContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={passwordVisibility ? false : true}
            style={styles.inputTextStyle}
            onChangeText={onChangeText}
            value={value}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisibility(!passwordVisibility)}
            style={{marginRight: 10}}
            opacity={0.5}>
            {passwordVisibility ? (
              <MaterialIcons name={'visibility'} color={'black'} size={20} />
            ) : (
              <MaterialIcons
                name={'visibility-off'}
                color={'black'}
                size={20}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default PasswordComp;

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  labelIcon: {
    marginRight: 8, // Space between icon and label
  },
  formMargin: {
    // marginHorizontal: 10,
    color: 'red',
    fontSize: 15,
    // marginBottom: 5,
  },
  requiredStar: {
    color: 'red',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  passwordMainContainer: {
    height: 48,
    borderWidth: 0.5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    color: '#000000',
    //  borderColor: '#d1d5db',
    borderColor: Colors.borderGreen,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    width: '100%',
    // paddingEnd: 8,
    backgroundColor: '#ffffff',
    // height: 50,
    // marginBottom: 15,
  },
  inputTextStyle: {
    flex: 1,
    height: 44,
    marginHorizontal: 10,
    borderColor: 'gray',
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
});
