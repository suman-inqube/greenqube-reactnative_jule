import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useState, useContext} from 'react';
import HeadDropDown from './FarmerHeadDropDown';
import {useFocusEffect} from '@react-navigation/native';
import {
  farmaccountsIncomeListAPI,
  problemPlotAgainstFarmerAPI,
  problemProduceAgainstPlotAPI,
  farmIncomeExpenceSaveAPI,
  addModuleForView,
} from '../../../config/apiHere';
import DropdownForm from '../../Common/DropdownForm';
import MessageDialog from '../../Common/MessageDialog';
import axios from 'axios';
import {userCreateContext} from '../../Context/usersCreateContext';
import {plotHook} from '../../hooks/plotHook';
import { Colors,Fonts } from '../../utils/Constants';
const FarmerAddIncome = ({navigation}) => {
  //GQR-67
  const {
    loginUser_data,
    FormsTitle,
    ButtonForm,
    CustomHeader,
    DatePickerComp,
    t,
    getItem,
    logoImage,
    topBanner,
    effective_dates,
    onBackPress,
    Root,
    Toast,
    AlertMesg,
    isOnline,
  } = useContext(userCreateContext);
  const {dbname, lan_id, token, user_id, owner} = loginUser_data;
  //GQR-67
  const {problemPlotAgainstFarmer, plotAll, setplotAll} = plotHook(
    dbname,
    lan_id,
    token,
    user_id,
    isOnline,
  );
  const [showingMenu, setShowingMenu] = useState(false);
  const [nameVarityStartEnd, setNameVarityStartEnd] = useState({
    name: '',
    varity: '',
  });
  const [saveData, setSaveData] = useState({
    land_rel_id: '',
    crop_name_id: '',
    sowing_date: '',
    harvesting_date: '',
    createdBy: '',
    type: 'cost_production',
    plot_size: '',
    grand_total: '',
    expense_total: '',
    cost_head: '',
  });
  const [farmerID, setfarmerID] = useState();
  const [InComeAll, setInComeAll] = useState([]);
  const [isIndex, setIndex] = useState(0);
  const [data, setData] = useState([
    {type: 'cost_production', cat_id: '', amount: '', date: ''},
  ]);
  const [newFromDate, setnewFromDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [fromDate, setfromDate] = useState('');
  const [currency, setCurrency] = useState('');
  const addMoreExpense = () => {
    setIndex(isIndex + 1);
    setData([
      ...data,
      {type: 'cost_production', cat_id: '', amount: '0', date: ''},
    ]);
  };
  const handleChangeAddExpense = (index, text, name) => {
    const values = [...data];
    values[index][name] = text;
    setData(values);
  };
  const handleChangeAddCatID = (index, text, name) => {
    const values = [...data];
    values[index][name] = text.value;
    setData(values);
  };
  const handleChangeAddDate = (index, text, name) => {
    const values = [...data];
    values[index][name] = text;
    setData(values);
  };
  const handleDatePicker = item => {
    const effective_date = effective_dates(item);
    setfromDate(effective_date);
    handleChangeAddDate(isIndex, effective_date, 'date');
  };
  function handleClear() {
    setData([{type: 'cost_production', cat_id: '', amount: '', date: ''}]);
    setplotAll([]);
    setShowingMenu(false);
    setInComeAll([]);
    setfromDate('');
  }
  const onPageLoad = async () => {
    handleClear();
    const curr = await getItem('currency');
    setCurrency(curr);
    setfarmerID(user_id);
    problemPlotAgainstFarmer();
  };
  useFocusEffect(
    React.useCallback(() => {
      onPageLoad();
      onBackPress(() => {
        navigation.navigate('FarmerFarmIncomeExpenseList');
        return true;
      });
    }, []),
  );
  const handlePlot = async relId => {
    const response = await problemProduceAgainstPlotAPI(
      dbname,
      lan_id,
      farmerID,
      relId.value,
    );
    if (response?.status == 200) {
      setNameVarityStartEnd({
        ...nameVarityStartEnd,
        name: response.data.data.crop_name?.name,
        varity: response.data.data.crop_variety?.name,
      });
      const dateString = response?.data?.data?.harvesting_date;
      const harvesting_date = new Date(dateString);
      const currentDate = new Date();
      if (harvesting_date > currentDate) {
        setShowingMenu(true);
        setSaveData({
          ...saveData,
          land_rel_id: relId.value,
          crop_name_id: response.data.data.crop_name_id,
          harvesting_date: response.data.data.harvesting_date,
          sowing_date: response.data.data.sowing_date,
          // plot_size: response.data.data.land_info.land_size,
          // plot_size: response.data.data.land_info.land_unit.name,
          plot_size:
            response.data.data.land_info.land_size +
            ' ' +
            response.data.data.land_info.land_unit?.name,
          createdBy: user_id,
        });
        const response_farmIncome = await farmaccountsIncomeListAPI(
          dbname,
          lan_id,
          farmerID,
        );
        if (response_farmIncome?.status == 200) {
          addModuleForView(
            dbname,
            lan_id,
            farmerID,
            token,
            'IncomeExpense User',
            'module_hit',
            'incomeExpense_user',
            1,
          );
          const dataArray = response_farmIncome?.data?.data?.rows.map(data => ({
            value: data.fid,
            label: data.categoryName,
          }));
          setInComeAll(dataArray);
        }
      } else {
        // MessageDialog({ title: 'Importent', message: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}` })
        Toast.show({
          time: 3,
          text: `${t('your_previous_crop_hervested')} ${t('add_a_new_crop')}`,
          ...AlertMesg[0],
        });
        setplotAll([]);
        setTimeout(() => {
          navigation.navigate('FarmerDashboard');
        }, 1300);
      }
    }
  };
  const handleSave = async () => {
    // return console.log(data);
    let grand_total = 0;
    data.forEach(element => {
      grand_total += parseInt(element.amount);
    });
    const allFieldsFilled = data.every(
      item =>
        item.type.trim() !== '' &&
        item.cat_id.trim() !== '' &&
        item.amount.trim() !== '' &&
        item.date.trim() !== '',
    );
    // return console.log("grand_total", grand_total);
    const qs = require('qs');
    let save_data = qs.stringify({
      land_rel_id: saveData.land_rel_id,
      crop_name_id: saveData.crop_name_id,
      harvesting_date: saveData.harvesting_date.substring(0, 10),
      sowing_date: saveData.sowing_date,
      createdBy: saveData.createdBy,
      type: 'cost_production',
      plot_size: saveData.plot_size,
      grand_total: grand_total,
      expense_total: '0',
      cost_head: JSON.stringify(data),
    });
    if (allFieldsFilled) {
      const response = await farmIncomeExpenceSaveAPI(
        dbname,
        lan_id,
        token,
        farmerID,
        save_data,
      );
      if (response?.status == 200) {
        navigation.navigate('FarmerFarmIncomeExpenseList');
      }
    } else {
      Toast.show({
        time: 2,
        text: `Please indent data properly`,
        ...AlertMesg[0],
      });
    }
  };
  const HandlerGoBack = () =>
    navigation.navigate('FarmerFarmIncomeExpenseList');
  return (
    <Root>
      <View style={{flex: 1}}>
        <DatePickerComp
          openDate={openFromDate}
          newDate={newFromDate}
          setOpenDate={setOpenFromDate}
          handleDatePicker={handleDatePicker}
        />

        <CustomHeader
          path="FarmerFarmIncomeExpenseList"
          HandlerGoBack={HandlerGoBack}
          logoImage={logoImage}
          topBanner={topBanner}
        />

        <FormsTitle title={t('add_income')} />

        <View style={styles.formContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <DropdownForm
              label={t('plot')}
              data={plotAll}
              color="red"
              onChange={relId => handlePlot(relId)}
            />

            {showingMenu && (
              <View style={styles.plotContainer}>
                <View style={styles.plotItem}>
                  <Text style={styles.plotItemText}>{t('produce_name')}</Text>
                  <Text style={styles.plotItemText}>
                    {t('prodece_vareity')}
                  </Text>
                </View>
                <View style={styles.plotItem}>
                  <Text style={styles.plotItemText}>
                    {nameVarityStartEnd.name}
                  </Text>
                  <Text style={styles.plotItemText}>
                    {nameVarityStartEnd.varity}
                  </Text>
                </View>
              </View>
            )}

            {data.map((dataItem, index) => (
              <View style={styles.AddExpenseContainer} key={index}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.AddExpenseInput}
                    onChangeText={text =>
                      handleChangeAddExpense(index, text, 'amount')
                    }
                    name="amount"
                    placeholder={`${t('amount')} (${currency})`}
                    value={dataItem.amount}
                    keyboardType="numeric"
                    placeholderTextColor="#000"
                  />
                  <View style={styles.iconContainer}>
                    <MaterialIcons
                      name="currency-rupee"
                      size={25}
                      color="#107808ff"
                    />
                  </View>
                </View>

                <View style={styles.AddExpenseItemContainer}>
                  <View style={styles.AddExpenseItem}>
                    <HeadDropDown
                      label={t('add_income_head')}
                      data={InComeAll}
                      name="cat_id"
                      onChange={text =>
                        handleChangeAddCatID(index, text, 'cat_id')
                      }
                      color="#000"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => setOpenFromDate(true)}
                    style={styles.AddExpenseItemDate}>
                    <Text style={styles.title}>
                      {dataItem.date === '' ? t('date') : dataItem.date}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={addMoreExpense}
                  style={styles.addMore}>
                  <MaterialIcons name="add-circle" color="white" size={25} />
                  <Text style={styles.addMoreText}>{t('add_more')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <ButtonForm
          label={t('submit')}
          onPress={handleSave}
          iconName="check-circle"
          iconColor="#fff"
          iconSize={30}
        />
      </View>
    </Root>
  );
};
export default FarmerAddIncome;

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginTop: 20,
  },
  iconView: {
    alignSelf: 'center',
    marginBottom: 15,
    //   backgroundColor: 'white',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: Colors.secondary,
  },
  scrollContent: {
    paddingBottom: 30, // Extra padding at bottom
  },
  mainView: {
    //   width: '90%',
    marginHorizontal: '5%',
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 20,
    backgroundColor: Colors.containerGreen,
  },
  AddExpenseContainer: {
    flex: 1,
    marginVertical: 30,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F7FCFF',
    elevation: 5,
    marginBottom: 10,
  },
  card: {
    width: '100%',
    // alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  inputContainer: {
    position: 'relative', // Needed for absolute positioning of icon
  },
  iconContainer: {
    position: 'absolute',
    left: 10,
    top: '42%',
    transform: [{translateY: -10}], // Vertically center the icon
  },
  AddExpenseInput: {
    paddingLeft: 40,
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    borderRadius: 20,
    marginVertical: 10,
    fontSize: 18,
    color: Colors.borderGreen,
    fontFamily: 'Poppins-Regular',
    backgroundColor: 'white',
  },
  AddExpenseItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  AddExpenseItem: {
    width: '60%',
    marginTop: 12,
  },
  AddExpenseItemDate: {
    width: '35%',
    borderWidth: 1,
    borderColor: Colors.borderGreen,
    padding: 8,
    borderRadius: 8,
    marginTop: 30,
    height: 45,
    backgroundColor: 'white',
  },
  addMore: {
    // position: 'absolute',
    // right: '-4%',
    // // bottom: 0,
    // top: '75%',
    zIndex: 999,
    backgroundColor: Colors.secondary,
    width: '60%',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,

    // borderTopLeftRadius: 30,
    // borderBottomLeftRadius: 30,
  },
  addMoreText: {
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    paddingLeft: 10,
  },
  plotContainer: {
    flexDirection: 'row',
    borderColor: '#000',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F7FCFF',

    elevation: 5,
    marginBottom: 20,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotItem: {
    width: '50%',
  },
  plotItemText: {
    color: Colors.text,
    marginVertical: 5,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  plotItemValText: {
    color: Colors.text,
    marginVertical: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },

  flatlisttitle: {
    padding: 10,
    color: '#000',
  },

  flatlistHeight: {
    height: Dimensions.get('window').height / 2.5,
  },
  title: {
    color: Colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
});
