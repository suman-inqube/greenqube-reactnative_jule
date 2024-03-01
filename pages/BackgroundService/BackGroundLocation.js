import BackgroundService from 'react-native-background-actions';
import FusedLocation from 'react-native-fused-location';
import { Linking, Alert, AppState } from 'react-native';
import { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { getItem, removeItem } from '../../config/getDataFromStorage';
import { UserRegisterAPI } from '../admin/UserRegistation/UserRegistationAPI';
import { problemSaveAPI, activitySaveAPI } from '../../config/apiHere';
const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));
import DeviceInfo from '../DeviceInfo';
const BackGroundLocation = () => {
  const { netConnection } = DeviceInfo();
  const [appState, setAppState] = useState(AppState.currentState);
  const isFocused = useIsFocused();
  const data = async () => {
    const datata = await getItem('offlineUserRegistrationData');
    console.log(datata.length);
  };
  useEffect(() => {
    // data();
    offlineApiCall();
    // console.log("isFocused");
    // console.log(appState)
    // if (appState == 'active') {
    //     getCurrentLatLong();
    // } else {
    //     stop();
    // }
    const handleAppStateChange = nextAppState => {
      console.log('App State Changed To:', nextAppState);
      setAppState(nextAppState);
      // offlineApiCall();
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [isFocused, netConnection]);
  const offlineApiCall = async () => {
    const [
      loginUser_data,
      offlineUserRegistrationData,
      offlineFarmerProblemData,
      offlineActivityDataArr,
      offlineProblemDataArr,
      offlineSupervisorActivityDataArr
    ] = await Promise.all([
      getItem('loginUser_data'),
      getItem('offlineUserRegistrationData'),
      getItem('offlineFarmerProblemData'),
      getItem('offlineFarmerActivityData'),
      getItem('offlineSupervisorProblemData'),
      getItem('offlineSupervisorActivityData'),
    ]);
    const { dbname, lan_id, token, user_id } = loginUser_data;
    if (netConnection) {
      if (offlineFarmerProblemData != null) {
        const myArray = offlineFarmerProblemData.split(',');
        // await removeItem('offlineFarmerProblemData');
        if (myArray.length > 1) {
          for (let i = 1; i < myArray.length; i++) {
            console.log(await getItem(myArray[i]));
            const locat_data = await getItem(myArray[i]);
            const formData = new FormData();
            for (let j = 0; j < locat_data._parts.length; j++) {
              if (locat_data._parts[j][0] === 'photo') {
                console.log(locat_data._parts[j][1].uri);
                formData.append('photo', {
                  uri: `${locat_data._parts[j][1].uri}`,
                  type: `${locat_data._parts[j][1].type}`,
                  name: `${locat_data._parts[j][1].name}`,
                });
              }
              if (locat_data._parts[j][0] === 'audio') {
                formData.append('audio', {
                  name: `${locat_data._parts[j][1].name}`,
                  type: `${locat_data._parts[j][1].type}`,
                  uri: `${locat_data._parts[j][1].uri}`,
                });
              }
            }
            const addPhoto = newPhoto => {
              setmyPhotoAll([...myphotoAll, newPhoto]);
            };
            const entries = new Map(locat_data._parts);
            const obj = Object.fromEntries(entries);
            let array = [];
            formData.append('file_title', obj.file_title);
            formData.append('post_meta_info', JSON.stringify(array));
            formData.append('agent_fcm', obj.agent_fcm);
            formData.append('farmer_fcm', obj.farmer_fcm);
            formData.append('latitude', obj.latitude);
            formData.append('longitude', obj.longitude);
            formData.append('question_type', obj.question_type);
            formData.append('land_unit_id', obj.land_unit_id);
            formData.append('category_id', obj.category_id);
            formData.append('affected_area', obj.affected_area);
            formData.append('crop_season_id', obj.crop_season_id);
            formData.append('crop_type_id', obj.crop_type_id);
            formData.append('crop_variety_id', obj.crop_variety_id);
            formData.append('crop_name_id', obj.crop_name_id);
            formData.append('plot_id', obj.plot_id);
            formData.append('harvesting_date', obj.harvesting_date);
            formData.append('sowing_date', obj.sowing_date);
            formData.append('production_system', obj.production_system);
            formData.append('agent_id', obj.agent_id);
            formData.append('growth_stage_id', obj.growth_stage_id);
            formData.append('problem_type_id', obj.problem_type_id);
            formData.append('problem_name_id', obj.problem_name_id);
            formData.append('affected_date', obj.affected_date);
            formData.append('question_title', obj.question_title);
            formData.append('question_desc', obj.question_desc);
            formData.append('severity_id', obj.severity_id);
            const database_res = await problemSaveAPI(
              dbname,
              lan_id,
              token,
              user_id,
              formData,
            );
          }
        }
        await removeItem('offlineFarmerProblemData');
      }
      if (offlineActivityDataArr != null) {
        const myArrayaActivity = offlineActivityDataArr.split(',');
        if (myArrayaActivity.length > 0) {
          for (let i = 0; i < myArrayaActivity.length; i++) {
            const locat_dataActivity = await getItem(myArrayaActivity[i]);
            const formData = new FormData();
            for (let j = 0; j < locat_dataActivity._parts.length; j++) {
              if (locat_dataActivity._parts[j][0] === 'photo') {
                console.log(locat_dataActivity._parts[j][1].uri);
                formData.append('photo', {
                  uri: `${locat_dataActivity._parts[j][1].uri}`,
                  type: `${locat_dataActivity._parts[j][1].type}`,
                  name: `${locat_dataActivity._parts[j][1].name}`,
                });
              }
              if (locat_dataActivity._parts[j][0] === 'audio') {
                formData.append('audio', {
                  name: `${locat_dataActivity._parts[j][1].name}`,
                  type: `${locat_dataActivity._parts[j][1].type}`,
                  uri: `${locat_dataActivity._parts[j][1].uri}`,
                });
              }
            }
            const entries = new Map(locat_dataActivity._parts);
            const obj = Object.fromEntries(entries);
            formData.append('act_title', '');
            formData.append('type', 'user_activity');
            formData.append('latitude', obj.latitude);
            formData.append('longitude', obj.longitude);
            formData.append('user_id', obj.user_id);
            formData.append('plot_id', obj.plot_id);
            formData.append('crop_name', obj.crop_name);
            formData.append('crop_variety', obj.crop_variety);
            formData.append('cycle_start_date', obj.cycle_start_date);
            formData.append('growth_stage', obj.growth_stage);
            formData.append('act_perform_date', obj.act_perform_date);
            formData.append('act_pattern', obj.act_pattern);
            if (obj.act_pattern === 'schedule') {
              formData.append('act_ref_type', obj.act_ref_type);
              formData.append('act_to_date', obj.act_to_date);
              formData.append('act_start_date', obj.act_start_date);
              formData.append('act_ref', obj.act_ref);
            }
            formData.append('act_desc', obj.act_desc);
            formData.append('material_used', obj.material_used);
            formData.append('water_used', obj.water_used);
            formData.append('power_used', obj.power_used);
            const database_res = await activitySaveAPI(
              dbname,
              lan_id,
              token,
              user_id,
              formData,
            );
          }
        }
        await removeItem('offlineFarmerActivityData');
      }
      if (offlineUserRegistrationData != null) {
        offlineUserRegistrationData.map(async (data, index) => {
          const formData = new FormData();
          formData.append('data', data._parts[0][1]);
          if (data._parts[1] != undefined) {
            formData.append('photo', data._parts[1][1]);
          }
          const database_res = await UserRegisterAPI(
            dbname,
            lan_id,
            token,
            user_id,
            formData,
          );
        });
        await removeItem('offlineUserRegistrationData')
      }
      if (offlineProblemDataArr != null) {
        const myproblemArray = offlineProblemDataArr.split(',');
        if (myproblemArray.length > 0) {
          for (let i = 0; i < myproblemArray.length; i++) {
            console.log(await getItem(myproblemArray[i]));
            const locat_Probdata = await getItem(myproblemArray[i]);
            const formData = new FormData();
            console.log(locat_Probdata._parts.length);
            for (let j = 0; j < locat_Probdata._parts.length; j++) {
              if (locat_Probdata._parts[j][0] === 'photo') {
                console.log(locat_Probdata._parts[j][1].uri);
                formData.append('photo', {
                  uri: `${locat_Probdata._parts[j][1].uri}`,
                  type: `${locat_Probdata._parts[j][1].type}`,
                  name: `${locat_Probdata._parts[j][1].name}`,
                });
              }
              if (locat_Probdata._parts[j][0] === 'audio') {
                formData.append('audio', {
                  name: `${locat_Probdata._parts[j][1].name}`,
                  type: `${locat_Probdata._parts[j][1].type}`,
                  uri: `${locat_Probdata._parts[j][1].uri}`,
                });
              }
            }
            const entries = new Map(locat_Probdata._parts);
            const obj = Object.fromEntries(entries);
            console.log(obj.latitude);
            // console.log(obj)
            let array = [];
            formData.append('file_title', obj.file_title);
            formData.append('post_meta_info', JSON.stringify(array));
            formData.append('agent_fcm', obj.agent_fcm);
            formData.append('farmer_fcm', obj.farmer_fcm);
            formData.append('latitude', obj.latitude);
            formData.append('longitude', obj.longitude);
            formData.append('question_type', obj.question_type);
            formData.append('land_unit_id', obj.land_unit_id);
            formData.append('category_id', obj.category_id);
            formData.append('affected_area', obj.affected_area);
            formData.append('crop_season_id', obj.crop_season_id);
            formData.append('crop_type_id', obj.crop_type_id);
            formData.append('crop_variety_id', obj.crop_variety_id);
            formData.append('crop_name_id', obj.crop_name_id);
            formData.append('plot_id', obj.plot_id);
            formData.append('harvesting_date', obj.harvesting_date);
            formData.append('sowing_date', obj.sowing_date);
            formData.append('production_system', obj.production_system);
            formData.append('agent_id', obj.agent_id);
            formData.append('growth_stage_id', obj.growth_stage_id);
            formData.append('problem_type_id', obj.problem_type_id);
            formData.append('problem_name_id', obj.problem_name_id);
            formData.append('affected_date', obj.affected_date);
            formData.append('question_title', obj.question_title);
            formData.append('question_desc', obj.question_desc);
            formData.append('severity_id', obj.severity_id);
            const database_res = await problemSaveAPI(
              dbname,
              lan_id,
              token,
              obj.farmerID,
              formData,
            );
            console.log(database_res);
          }

        }
        await removeItem('offlineSupervisorProblemData');
      }
      console.log(offlineSupervisorActivityDataArr)
      if (offlineSupervisorActivityDataArr != null) {
        // await removeItem('offlineFarmerActivityData');
        const myArrayaActivity = offlineSupervisorActivityDataArr.split(',');

        if (myArrayaActivity.length > 0) {
          for (let i = 0; i < myArrayaActivity.length; i++) {
            console.log(await getItem(myArrayaActivity[i]));
            const locat_dataActivity = await getItem(myArrayaActivity[i]);
            const formData = new FormData();

            console.log(locat_dataActivity._parts.length);
            for (let j = 0; j < locat_dataActivity._parts.length; j++) {
              if (locat_dataActivity._parts[j][0] === 'photo') {
                console.log(locat_dataActivity._parts[j][1].uri);
                formData.append('photo', {
                  uri: `${locat_dataActivity._parts[j][1].uri}`,
                  type: `${locat_dataActivity._parts[j][1].type}`,
                  name: `${locat_dataActivity._parts[j][1].name}`,
                });
              }
              if (locat_dataActivity._parts[j][0] === 'audio') {

                formData.append('audio', {
                  name: `${locat_dataActivity._parts[j][1].name}`,
                  type: `${locat_dataActivity._parts[j][1].type}`,
                  uri: `${locat_dataActivity._parts[j][1].uri}`,
                });
              }
            }
            const entries = new Map(locat_dataActivity._parts);
            const obj = Object.fromEntries(entries);
            formData.append("act_title", "");

            formData.append('type', 'user_activity');
            formData.append('latitude', obj.latitude);
            formData.append('longitude', obj.longitude);
            formData.append('user_id', obj.user_id);
            formData.append('plot_id', obj.plot_id);
            formData.append('crop_name', obj.crop_name);
            formData.append('crop_variety', obj.crop_variety);
            formData.append('cycle_start_date', obj.cycle_start_date);
            formData.append('growth_stage', obj.growth_stage);
            formData.append('act_perform_date', obj.act_perform_date);
            formData.append('act_pattern', obj.act_pattern);

            if (obj.act_pattern === 'schedule') {
              formData.append('act_ref_type', obj.act_ref_type);
              formData.append('act_to_date', obj.act_to_date);
              formData.append('act_start_date', obj.act_start_date);
              formData.append('act_ref', obj.act_ref);
            }
            formData.append('act_desc', obj.act_desc);
            formData.append('material_used', obj.material_used);
            formData.append('water_used', obj.water_used);
            formData.append('power_used', obj.power_used);
            const activity_res = await activitySaveAPI(dbname, lan_id, token, obj.farmerID, formData);
          }
        }
        await removeItem('offlineSupervisorActivityData');
      }

    }
  };
  const options = {
    taskName: 'GPS',
    taskTitle: 'GPS',
    taskDesc: 'GPS',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
      delay: 4000,
    },
    indeterminate: false,
  };
  const veryIntensiveTask = async taskDataArguments => {
    const { delay } = taskDataArguments;
    await new Promise(async resolve => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        // console.log(i);
        try {
          const location = await FusedLocation.getFusedLocation();
          // console.log(location)
        } catch (error) {
          // Alert.alert("GreenQube",
          //     "Your GPS seems to be disabled, do you want to enable it?",
          //     [
          //         { text: 'Yes', onPress: this._doSomethingSerious, style: 'destructive' },
          //         { text: 'No' },
          //     ],
          //     { cancelable: false }
          // )
          // Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
          console.log('error');
        }
        await sleep(delay);
      }
    });
  };
  const getCurrentLatLong = async () => {
    await BackgroundService.start(veryIntensiveTask, options);
  };
  const stop = async () => {
    await BackgroundService.stop(veryIntensiveTask);
    console.warn('stop');
  };
  // return {
  //     getCurrentLatLong,
  //     currentlatlongData
  // };
};
export default BackGroundLocation;
