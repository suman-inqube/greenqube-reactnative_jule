import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import ModalCompProduct from './ModalCompProduct';
import ProductOptionDropDown from '../../Common/ProductOptionDropDown';
import DropdownForm from '../../Common/DropdownForm1';
import SearchByCategoryModal from './SearchByCategoryModal';
import { inputCategoryAPI, inputListAPI, inputSubCategoryAPI } from '../../../config/apiHere';
import { getItem, setItem } from '../../../config/getDataFromStorage';
import { useFocusEffect } from '@react-navigation/native';
import LoadingScreen from '../../Common/LoadingScreen';
import SearchBy from './SearchBy';
import SearchSubBy from './SearchSubBy';

const InputList = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [dbLanTokUsr, setdbLanTokUsr] = useState({
        dbName: "",
        languageId: "",
        token: "",
        supervisorId: ""
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [inputListAll, setInputListAll] = useState([]);
    const [inputCategory, setInputCategory] = useState([]);
    const [inputSubCategory, setInputSubCategory] = useState([]);
    const [inputSingle, setInputSingle] = useState({});
    const [dataArray, setPrice] = useState([]);
    const [category, setCategory] = useState();
    const [subCategory, setSubCategory] = useState();

    const navigateToPages = async (fid) => {
        setIsLoading(true)
        const inputFound = inputListAll.find(user => user.fid === fid);
        await setItem('input_single_data', inputFound)
        setIsLoading(false)
        setInputSingle(inputFound);
        setModalVisible(true);
    };

    const handleCategory = async (item) => {
        setCategory(item.val)
        const inputSubCategoryList = await inputSubCategoryAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, item.value);
        // console.log(inputCategoryList.data.data);
        if (inputSubCategoryList) {
            const dataArray = [];
            inputSubCategoryList.data.data.rows.forEach(element => {
                dataArray.push({
                    value: element.fid,
                    label: element.product_name
                });
            });
            setInputSubCategory(dataArray)
            // setIsLoading(false)
        }

    }
    const handleSubCategory = async (item) => {
        setSubCategory(item.val)
        // setIsLoading(true)
        // console.log(item);
        // return;
        const inputSubCategoryList = await inputSubCategoryAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId, item.value);
        // console.log(inputCategoryList.data.data);
        if (inputSubCategoryList) {
            const dataArray = [];
            inputSubCategoryList.data.data.rows.forEach(element => {
                dataArray.push({
                    value: element.fid,
                    label: element.product_name
                });
            });
            setInputSubCategory(dataArray)
            setIsLoading(false)
        }

    }

    const onPageLoad = async () => {
        // console.log("nice");
        const loginUser_data = await getItem('loginUser_data');

        if (loginUser_data) {
            const dbName = loginUser_data.dbname;
            const languageId = loginUser_data.lan_id;
            const token = loginUser_data.token;
            const supervisorId = loginUser_data.user_id;
            setdbLanTokUsr({
                ...dbLanTokUsr,
                dbName: dbName,
                languageId: languageId,
                token: token,
                supervisorId: supervisorId
            });
            const inputList = await inputListAPI(dbName, languageId, token, supervisorId);
            setInputListAll(inputList.data.data.rows)
            setItem("input_data", inputList.data.data.rows)
            setIsLoading(false)
            if (inputList.data.data) {
                const inputCategoryList = await inputCategoryAPI(dbName, languageId, token, supervisorId);
                if (inputCategoryList) {
                    const dataArray1 = [];
                    inputCategoryList.data.data.rows.forEach(element => {
                        dataArray1.push({
                            value: element.fid,
                            label: element.name
                        });
                    });
                    setInputCategory(dataArray1)
                    setIsLoading(false)
                }
            }

        }
    };


    useEffect(() => {
        onPageLoad();
        const updatedArray = [];
        inputListAll.forEach((item) => {
            const emptyArray = [];
            item.agri_product_prices.forEach((element, index) => {
                // console.log(index);
                emptyArray.push({
                    value: index,
                    prod_price_id: element.prod_price_id,
                    label: element.discounted_price + "₹ / " + element.agri_unit.unit_name,
                });
            });
            updatedArray.push(emptyArray);
        });
        setPrice(updatedArray);
    }, [inputListAll]);


    useFocusEffect(
        React.useCallback(() => {
            onPageLoad();

        }, [])
    );


    return (
        <View>
            {isLoading ?
                <LoadingScreen />
                :
                <>
                    <CustomHeader path="Dashboard" />
                    <View style={styles.container}>
                        <FormsTitle title={'InputList'} />
                        <View style={styles.searchByCategoryContainer}>
                            <View style={styles.searchByCategoryItem}>
                                <SearchBy label={'Search by category'} data={inputCategory} onChange={(item) => handleCategory(item)} val={category} />
                            </View>
                            <View style={styles.searchByCategoryItem}>
                                <SearchSubBy label={'Search by category'} data={inputSubCategory} onChange={(item) => handleSubCategory(item)} val={subCategory} />
                            </View>
                        </View>


                        <ModalCompProduct setModalVisible={setModalVisible} modalVisible={modalVisible} inputSigle={inputSingle}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        />
                        <FlatList
                            data={inputListAll}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item, index }) => {
                                return (
                                    <TouchableOpacity onPress={() => navigateToPages(item.fid)} key={index}>
                                        <View style={styles.flatlistContainer} >
                                            <View style={styles.flatlistItem} >

                                                {
                                                    item.agri_files && item.agri_files.length > 0 ?
                                                        <Image
                                                            source={{ uri: item.agri_files[0].file_path }}
                                                            style={{ width: 100, height: 100 }}
                                                        />
                                                        :
                                                        <Image
                                                            source={require('../../Common/images/logo.png')}
                                                            style={{ width: 100, height: 100 }} />
                                                }
                                                <View style={{ justifyContent: 'flex-end' }}>
                                                    <Text style={styles.title}>{item.product_name}</Text>
                                                    <Text style={styles.title}>{item.productCategories[0].productCategory.name}</Text>
                                                    <Text style={styles.title}>{item.product_name}</Text>
                                                    <View style={{ width: 120, alignSelf: 'flex-end', marginBottom: 20, marginLeft: 50 }}>
                                                    <ProductOptionDropDown rate={dataArray[index]} val={0} />

                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index}
                        />
                        <View style={{
                            position: 'absolute',
                            right: '-6%',
                            top: '35%',
                            backgroundColor: '#009200',
                            paddingLeft: 5,
                            paddingRight: 20,
                            paddingVertical: 5,
                            borderTopLeftRadius: 20,
                            borderBottomLeftRadius: 25,
                            zIndex: 99
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('PastEnquiry')}>
                                <Text style={{ color: '#ffff', paddingLeft: 20 }}>{'VIEW PAST\nENQUIRIES'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            }


        </View>
    )
}

export default InputList

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginHorizontal: '5%'
    },
    title: {
        fontSize: 15,
        color: '#000'
    },
    flatlistContainer: {
        backgroundColor: '#FFFF',
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        shadowColor: "#000",
    },
    flatlistItem: {
        flexDirection: 'row',
        // justifyContent:'space-between',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    productImage: {
        width: 100,
        height: 100,
        marginRight: 20,
        borderRadius: 10,

    },
    searchByCategoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    searchByCategoryItem: {
        width: '45%'
    }
})