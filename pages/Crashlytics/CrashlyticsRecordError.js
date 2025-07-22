import crashlytics from "@react-native-firebase/crashlytics";
import axios from "axios";
import DeviceInfo from 'react-native-device-info';
import { getItem } from "../../config/getDataFromStorage";
import instance from "../../config/commonAxios";
export const CrashlyticsRecordError = async (error,screen_name="",api="") => {
  const [loginUser_data, device_model, navigationRef] = await Promise.all([
    getItem('loginUser_data'),
    DeviceInfo.getDeviceName(),
    getItem('navigationRef'),
  ])
  const {
    dbname = "",
    contactNumber = ""
  } = loginUser_data;
  const data = JSON.stringify({
    error: JSON.stringify(error),
    device_model: device_model,
    db_name: dbname,
    phone_number: contactNumber,
    api: api||'',
    screen_name: screen_name||navigationRef,
    source: "gq- greenqube"
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://gqwa-327583164679.asia-south1.run.app/issue/save',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    console.log("response",response)
    crashlytics().recordError(error, 'api_error');
  } catch (err) {
    console.error("Error sending crash report:", err);
  }
};
