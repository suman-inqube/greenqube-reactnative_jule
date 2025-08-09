import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import ImageForm from '../Common/ImageForm';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export const BoxDisplay = ({
  text,
  text1,
  imageurl,
  onpress,
  iconName,
  weather,
  align = 'center',
  ...props
}) => {
  const scaleValue = new Animated.Value(1);

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8, // Scale down to 95%
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Return to original size
      useNativeDriver: true,
    }).start();
  };
  return (
    <View style={styles.mainView}>
      <TouchableOpacity
        onPress={onpress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.boxContainer}
        activeOpacity={0.7}>
        <Animated.View
          style={[
            styles.box1,
            {transform: [{scale: scaleValue}]},
            weather && {backgroundColor: 'white'},
          ]}>
          <View style={styles.box1_1}>
            {/* <MaterialIcons name={iconName} size={30} color="#4CAF50" /> */}
            <ImageForm
              source={imageurl}
              width={30}
              height={30}
              align={align}
              justify="center"
            />
          </View>

          <View
            style={[
              styles.textGlowContainer,
              weather && {width: 100, height: 27}, // Conditional background
            ]}>
            <Text
              style={[
                text != 'Market'
                  ? styles.boxText
                  : {
                      marginLeft: 20,
                      fontWeight: '400',
                      fontFamily: 'Poppins-Regular',
                      color: '#bbbbbb',
                      fontSize: 14,
                    },
                weather && {color: 'black'},
              ]}>
              {text}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export const BoxDisplayDeactive = ({text, text1, imageurl, onpress}) => {
  return (
    <View style={styles.mainView}>
      <TouchableOpacity onPress={onpress} style={styles.boxContainer}>
        <View style={styles.box1}>
          <View style={styles.box1_1}>
            <ImageForm
              source={imageurl}
              resizeMode="cover"
              height={35}
              width={35}
            />
          </View>
          <View style={styles.marketView}>
            <Text style={styles.box1_de}>{text}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const BoxDisplaySingleLine = ({name, imageurl}) => {
  return (
    <View style={styles.box1}>
      <View style={styles.box1_1}>
        <ImageForm
          source={imageurl}
          resizeMode="cover"
          height={30}
          width={30}
        />
      </View>
      <View>{/* <Text style={styles.box1_1}>{name}</Text> */}</View>
    </View>
  );
};
const styles = StyleSheet.create({
  textGlowContainer: {
    // backgroundColor: 'rgba(255, 255, 255, 0.58)', // light glow effect
    backgroundColor: 'white',
    borderRadius: 48,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 20,
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    alignSelf: 'center', // optional: centers text block
    width: 100,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    flex: 1,
    // backgroundColor: 'blue',
    // marginBottom: 200,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    width: '100%',
    marginHorizontal: 15,
    alignSelf: 'center',
    // backgroundColor: 'black',
  },
  boxContainer: {
    // flex: 1,
    // paddingTop: 20,
    // paddingLeft: 5,
    // backgroundColor: 'pink',
    marginLeft: 12,
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 40,
    alignItems: 'center',
  },
  box1: {
    borderRadius: 50,
    // flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    width: 52,
    backgroundColor: 'white',
    // shadowColor: 'rgba(0, 0, 0, 0.2)',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.8,
    // shadowRadius: 20,
    // marginTop: 30,
    marginLeft: 10,
    marginRight: 32,
    // elevation: 3,
    borderWidth: 0.2,
    borderBlockColor: 'green',
    alignSelf: 'center',
  },
  marketView: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // light glow effect
    borderRadius: 48,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 15,
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    alignSelf: 'center', // optional: centers text block
    width: 92,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textView: {
    marginTop: 22,
    width: 85,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#ebebeb',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    fontFamily: 'Poppins-Medium',
    color: 'black',
    fontSize: 12.5,
  },
  box1_1: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    fontWeight: '400',
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    marginTop: 10,
  },
  box1_de: {
    color: '#494a49',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    // marginTop: 10,
  },
});
