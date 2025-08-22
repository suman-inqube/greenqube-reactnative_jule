import React, { createContext, useEffect, useState, lazy } from "react";
import { getItem, setItem, removeItem } from "../../config/getDataFromStorage";
import { InteractionManager } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import {
  farmerByNameAPI,
  problemPlotAgainstFarmerAPI,
  showCarbonFlag,
} from "../../config/apiHere";
import { useTranslation } from "react-i18next";
import { AlertMesg } from "../Common/ToastAlert";
import { Root, Toast, Popup, SPSheet } from "react-native-popup-confirm-toast";
import { onBackPress } from "../Common/BackPressHandler";
import DeviceInfo from "../DeviceInfo";
import i18next from "i18next";
import { getNavigationBarHeight } from "react-native-android-navbar-height";

// Lazy imports
const ImagePlaceHolderCircle = lazy(() => import("../Common/ImagePlaceHolderCircle"));
const InputTextForm = lazy(() => import("../Common/InputTextForm"));
const RadioForm = lazy(() => import("../Common/RadioForm"));
const PasswordComp = lazy(() => import("../Common/PasswordComp"));
const ButtonForm = lazy(() => import("../Common/ButtonForm"));
const DropdownForm = lazy(() => import("../Common/DropdownForm"));
const CustomHeader = lazy(() => import("../admin/CustomHeader"));
const LoadingScreen = lazy(() => import("../Common/LoadingScreen"));
const FormsTitle = lazy(() => import("../Common/FormsTitle"));
const DatePickerComp = lazy(() => import("../Common/DatePickerComp"));
const ButtonFormBottom = lazy(() => import("../Common/ButtonFormBottom"));
const Filter = lazy(() => import("../Common/Filter"));
const DatePicker = lazy(() => import("react-native-date-picker"));
const config = lazy(() => import("../../config"));
const axios = lazy(() => import("axios"));


// ... keep all your imports the same
import { PermissionsAndroid, Platform } from "react-native";

const userCreateContext = createContext();
const userListContext = createContext("adduser");

const UserCreateContextProvider = (props) => {
  const { netConnection } = DeviceInfo();
  const { t } = useTranslation();

  // ---------- APP STATES ----------
  const [dbLanTokUsr, setdbLanTokUsr] = useState({
    pageNo: 1,
    dbName: "",
    languageId: "",
    token: "",
    supervisorId: "",
    country: "",
    company: "",
    agri_user_addresses: "",
    currentPage: "",
    totalPage: "",
    userType: "",
    FcmUserToken: "",
    owner: "",
    farmerId: "",
  });
  const [farmerData, setFarmerData] = useState([]);
  const [loginUser_data, setloginUser_data] = useState({});
  const [logoImage, setlogoImage] = useState("");
  const [topBanner, settopBanner] = useState("");
  const [plotAll, setplotAll] = useState([]);
  const [navigationBarHeight, setNavigationBarHeight] = useState(0);

  // ---------- LOCATION STATE ----------
  const [coords, setCoords] = useState({ latitude: "", longitude: "", accuracy: "", timestamp: "", });

  // ---------- LOCATION SETUP ----------
  useEffect(() => {
    let watchId;

    const requestPermission = async () => {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs to access your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };

    const startWatching = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.warn("Location permission not granted");
        return;
      }

      watchId = Geolocation.watchPosition(
        (pos) => {
          setCoords((prev) => ({
            ...prev, // keep previous values
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          }));
        },
        (err) => {
          console.log("Location error:", err);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // only update after 10 meters
          interval: 5000,
          fastestInterval: 2000,
          timeout: 20000,
          maximumAge: 1000,
        }
      );
    };

    startWatching();

    return () => {
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // ---------- API: Get Farmers ----------
  const AllFarmerList = async () => {
    try {
      let farmer_response = [];
      let responsePlot = [];
      let resCarbonFlag = [];

      const [
        loginUser_data,
        logoImageData,
        topBannerData,
        companyLanguage_data,
        getNavigationBar,
      ] = await Promise.all([
        getItem("loginUser_data"),
        getItem("logoImageData"),
        getItem("topBannerData"),
        getItem("companyLanguage_data"),
        getNavigationBarHeight(),
      ]);

      setNavigationBarHeight(getNavigationBar);
      i18next.changeLanguage(loginUser_data?.lan_id.toString());

      if (netConnection && loginUser_data?.token) {
        [farmer_response, responsePlot, resCarbonFlag] = await Promise.all([
          farmerByNameAPI(
            loginUser_data?.dbname,
            loginUser_data?.lan_id,
            loginUser_data?.token,
            loginUser_data?.user_id
          ),
          problemPlotAgainstFarmerAPI(
            loginUser_data?.dbname,
            loginUser_data?.lan_id,
            loginUser_data?.token,
            loginUser_data?.user_id
          ),
          showCarbonFlag(
            loginUser_data?.token,
            loginUser_data?.dbname,
            loginUser_data?.lan_id,
            loginUser_data?.user_id
          ),
        ]);

        if (farmer_response?.status == 200) {
          await Promise.all([
            setItem("farmerByNameAPI", farmer_response),
            setItem("problemPlotAgainstFarmer" + loginUser_data?.user_id, responsePlot),
            setItem("carbonFlag", resCarbonFlag),
          ]);
        }
      } else {
        [farmer_response, responsePlot, resCarbonFlag] = await Promise.all([
          getItem("farmerByNameAPI"),
          getItem("problemPlotAgainstFarmer" + loginUser_data?.user_id),
          getItem("carbonFlag"),
        ]);
      }

      if (farmer_response?.status == 200) {
        let supervisorId = "";
        if (loginUser_data?.userType == 2) {
          supervisorId = loginUser_data?.owner?.user_id;
        } else if (loginUser_data?.userType == 3) {
          supervisorId = loginUser_data?.user_id;
        }

        const { company, country_id } = companyLanguage_data;
        const { option_value } = resCarbonFlag?.data?.data || {};

        setlogoImage(logoImageData);
        settopBanner(topBannerData);
        setloginUser_data({
          ...loginUser_data,
          carbonFlag: option_value,
        });
        setdbLanTokUsr({
          ...dbLanTokUsr,
          dbName: loginUser_data?.dbname,
          languageId: loginUser_data?.lan_id,
          token: loginUser_data?.token,
          supervisorId: supervisorId,
          farmerId: loginUser_data?.user_id,
          agri_user_addresses: loginUser_data?.agri_user_addresses,
          country: loginUser_data?.agri_user_addresses[0]?.country,
          company: loginUser_data?.db_company_id,
          owner: loginUser_data?.owner?.FcmUserToken,
          FcmUserToken: loginUser_data?.FcmUserToken,
          languageConpany: company,
          country_id: country_id,
          carbonFlag: option_value,
        });

        const dataArrayName = farmer_response?.data?.data?.rows.map((data) => ({
          value: data.user_id,
          label: data.userName,
          phone: data.contactNumber,
          aadharNumber: data?.aadhar_number,
          kccNumber: data?.kcc_number,
          FcmUserToken: data?.FcmUserToken,
        }));

        const dataArrayPhone = farmer_response?.data?.data?.rows.map((data) => ({
          value: data.user_id,
          label: data.contactNumber,
          phone: data.contactNumber,
          aadharNumber: data?.aadhar_number,
          kccNumber: data?.kcc_number,
          FcmUserToken: data?.FcmUserToken,
        }));

        setFarmerData([dataArrayName, dataArrayPhone]);

        const PlotArray = responsePlot?.data?.data.map((data) => ({
          value: data.rel_id,
          label: data.plot_no,
        }));

        setplotAll(PlotArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- INIT ----------
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      AllFarmerList();
    });
    return () => task.cancel();
  }, [netConnection]);

  // ---------- HELPERS ----------
  const effective_dates = (item) => {
    if (!item) return "";
    const dt = new Date(item);
    return dt.toISOString().split("T")[0];
  };

  // ---------- PROVIDER ----------
  return (
    <userCreateContext.Provider
      value={{
        dbLanTokUsr,
        setdbLanTokUsr,
        AllFarmerList,
        farmerData,
        loginUser_data,
        isOnline: netConnection,
        coords,
        t,
        AlertMesg,
        onBackPress,
        getItem,
        setItem,
        removeItem,
        InputTextForm,
        RadioForm,
        PasswordComp,
        ButtonForm,
        axios,
        config,
        DeviceInfo,
        DropdownForm,
        Root,
        Toast,
        Popup,
        SPSheet,
        CustomHeader,
        FormsTitle,
        ImagePlaceHolderCircle,
        logoImage,
        topBanner,
        setlogoImage,
        settopBanner,
        DatePicker,
        LoadingScreen,
        DatePickerComp,
        ButtonFormBottom,
        effective_dates,
        Filter,
        plotAll,
        setplotAll,
        navigationBarHeight,
      }}
    >
      {props.children}
    </userCreateContext.Provider>
  );
};

export { userListContext, UserCreateContextProvider, userCreateContext };

