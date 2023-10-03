import { StyleSheet, Text,TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
const WidgetsSide = ({
    location,
    title
}) => {
  const { navigate } = useNavigation();
  return (
    <TouchableOpacity style={styles.WidgetsContainer} onPress={() => navigate(location)}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  )
}

export default WidgetsSide

const styles = StyleSheet.create({
    WidgetsContainer:{
        position:'absolute',
        left:"65%",
        bottom:100,
        backgroundColor:'#009200',
        paddingLeft:5,
        paddingRight:20,
        paddingVertical:5,
       borderTopLeftRadius:20,
       borderBottomLeftRadius:20,
        zIndex:99
    },
    text:{
        color:'#fff',
        fontWeight:'500',
        fontSize:16,
        marginLeft:5,
    }
})