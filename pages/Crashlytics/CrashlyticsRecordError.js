import crashlytics from "@react-native-firebase/crashlytics";
import { getItem } from "../../config/getDataFromStorage";
export const CrashlyticsRecordError = async (error) => {
    // crashlytics().setCrashlyticsCollectionEnabled(true);
    // const loginUser_data = await getItem('loginUser_data');
    // const { userName, contactNumber, company_id, dbname, db_company_id,userType } = loginUser_data;
    // crashlytics().log('App mounted.')
    crashlytics().recordError(error);
    // crashlytics().sendUnsentReports(error)
    // crashlytics().recordError(new Error(error))
}