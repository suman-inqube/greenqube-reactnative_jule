import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import ImagePlaceHolderCircle from '../Common/ImagePlaceHolderCircle'
import InputTextForm from '../Common/InputTextForm'
import RadioForm from '../Common/RadioForm'
import DropdownForm from '../Common/DropdownForm'
import ButtonForm from '../Common/ButtonForm'

const UserRegistration = () => {
    const [dbName, setdbName] = useState();
    const [languageData, setlanguageData] = useState([]);
    const [stateInfoData, setstateInfoData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [blockData, setBlockData] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [storePersnolInfo, setstorePersnolInfo] = useState({
        language: '',
        stateInfo: '',
        district: '',
        block: '',
        name: '',
        gender: 'male',
        userType: 'large Grower',
        age: '',
        address: '',
        zip: ''
    });
    return (
        <>
            <ScrollView style={{ backgroundColor: '#D5FFD0' }}>
                <View style={{ backgroundColor: '#D5FFD0' }}>
                    <View style={{ paddingHorizontal: 20 }}>

                        <ImagePlaceHolderCircle openImagePicker={openImagePicker} selectedImage={selectedImage} />
                        <InputTextForm label="Name" color="red" value={storePersnolInfo.name ?? name} onChangeText={name => { setstorePersnolInfo({ ...storePersnolInfo, name: name }) }} />
                        <View>
                            <Text style={{ fontSize: 16 }}>Gender</Text>
                            <RadioForm
                                label="Male"
                                selected={storePersnolInfo.gender === 'male'}
                                onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, gender: 'male' })}
                            />
                            <RadioForm
                                label="female"
                                selected={storePersnolInfo.gender === 'female'}
                                onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, gender: 'female' })}
                            />
                        </View>

                        <View style={{ marginBottom: 15, }}>
                            <Text style={{ fontSize: 16, marginTop: 15, }}>User Type</Text>
                            <RadioForm
                                label="large Grower"
                                selected={storePersnolInfo.userType === 'large Grower'}
                                onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, userType: 'large Grower' })}

                            />
                            <RadioForm
                                label="Small Holder"
                                selected={storePersnolInfo.userType === 'small holder'}
                                onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, userType: 'small holder' })}

                            />
                            <RadioForm
                                label="na"
                                selected={storePersnolInfo.userType === 'na'}
                                onSelect={() => setstorePersnolInfo({ ...storePersnolInfo, userType: 'na' })}

                            />
                        </View>

                        <InputTextForm label="Age" color="red" value={storePersnolInfo.age ?? age} onChangeText={age => { setstorePersnolInfo({ ...storePersnolInfo, age: age }) }} keyboardType="numeric" />

                        <DropdownForm label="Language" color="red" data={languageData} onChange={item => { handleLanguage(item) }} val={storePersnolInfo.language} />

                        <DropdownForm label="State/Division/Zone" color="red" data={stateInfoData} onChange={item => { handleStateInfo(item) }} val={storePersnolInfo.stateInfo} />

                        <DropdownForm label="District/Country" color="red" data={districtData} onChange={item => { handleDistrict(item) }} val={storePersnolInfo.district} />

                        <DropdownForm label="Block/Sub Country/UpZila" color="red" data={blockData} onChange={item => { setstorePersnolInfo({ ...storePersnolInfo, block: item }) }} val={storePersnolInfo.block} />

                        <InputTextForm label="Address" value={storePersnolInfo.address ?? address} onChangeText={address => { setstorePersnolInfo({ ...storePersnolInfo, address: address }) }} />

                        <InputTextForm label="ZIP/PIN Code" value={storePersnolInfo.zip ?? zip} onChangeText={zip => { setstorePersnolInfo({ ...storePersnolInfo, zip: zip }) }} />
                    </View>
                </View>
            </ScrollView>
            <View style={{ marginTop: 10, backgroundColor: '#D5FFD0' }}>
                <ButtonForm label='Next' onPress={() => handleSave('Financial')} />
            </View>

        </>
    )
}

export default UserRegistration

const styles = StyleSheet.create({})
