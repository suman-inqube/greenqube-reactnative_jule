import React, { useState, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    BackHandler,ImageBackground
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import qs from "qs";

import ButtonForm from "../../Common/ButtonForm";
import { AlertMesg } from "../../Common/ToastAlert";
import { NewForgotPassword } from "../../../config/apiHere";
import { getItem } from "../../../config/getDataFromStorage";
import { userCreateContext } from "../../Context/usersCreateContext";
import { Colors, Fonts } from "../../utils/Constants";

const PasswordInput = ({ value, onChangeText, placeholder, visible, toggleVisible }) => (
    <View style={styles.passwordContainer}>
        <TextInput
            secureTextEntry={!visible}
            style={styles.inputText}
            // placeholder={placeholder}
            placeholderTextColor="#777"
            value={value}
            onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={toggleVisible}>
            <Image
                source={
                    visible
                        ? require("../../Common/images/show.png")
                        : require("../../Common/images/hide.png")
                }
                style={styles.eyeIcon}
            />
        </TouchableOpacity>
    </View>
);

const ForgotPassword = () => {
    const {
        loginUser_data,
        dbLanTokUsr,
        setdbLanTokUsr,
        t,
        CustomHeader,
        logoImage,
        topBanner,
        Root,
        Toast,
    } = useContext(userCreateContext);

    const navigation = useNavigation();
    const route = useRoute();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [cPasswordVisible, setCPasswordVisible] = useState(false);
    const [form, setForm] = useState({ password: "", cpassword: "" });
    const [isLoading, setIsLoading] = useState(true);
    const showToast = (msg) => Toast.show({ text: msg, ...AlertMesg[0] });
    const handleSave = async () => {
        const { password, cpassword } = form;

        if (!password) return showToast(t("enter_new_password"));
        if (!cpassword) return showToast(t("enter_conf_pass"));
        if (password !== cpassword) return showToast(t("same_con_password"));
        setIsLoading(true);
        const saveData = qs.stringify({ newPassword: password, userType: 2 });
        const res = await NewForgotPassword(
            dbLanTokUsr.dbName,
            dbLanTokUsr.languageID,
            dbLanTokUsr.farmeruserID,
            saveData
        );
        setIsLoading(false);

        if (res.status === 200) {
            setForm({ password: "", cpassword: "" });
            showToast(t("password_change_successfully"));
            navigation.navigate("userList");
        }
    };

    const onPageLoad = async () => {
        setIsLoading(true);
        let farmeruserID = route.params?.farmeruserID || "";
        const loginUser = await getItem("loginUser_data");
        if (loginUser) {
            setdbLanTokUsr({
                dbName: loginUser.dbname,
                languageID: loginUser.agri_language.id,
                userID: loginUser.user_id,
                farmeruserID,
                token: loginUser.token,
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        onPageLoad();
    }, []);

    return (
        <Root>
            <View style={styles.container}>
                <CustomHeader
                    path="userList"
                    HandlerGoBack={() => navigation.navigate("userList")}
                    logoImage={logoImage}
                    topBanner={topBanner}
                />

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.forgotContainer}>
                        {/* <Text style={styles.title}>{t("forgot_password")}</Text> */}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                source={require('../../Common/images/changepass.png')}
                                style={{ width: '80%', height: 100 }}
                            />
                        </View>
                        <Text style={styles.label}>{t("enter_pass")}</Text>
                        <PasswordInput
                            value={form.password}
                            onChangeText={(password) => setForm({ ...form, password })}
                            placeholder={t("enter_new_password")}
                            visible={passwordVisible}
                            toggleVisible={() => setPasswordVisible(!passwordVisible)}
                        />

                        <Text style={styles.label}>{t("enter_conf_pass")}</Text>
                        <PasswordInput
                            value={form.cpassword}
                            onChangeText={(cpassword) => setForm({ ...form, cpassword })}
                            placeholder={t("enter_conf_pass")}
                            visible={cPasswordVisible}
                            toggleVisible={() => setCPasswordVisible(!cPasswordVisible)}
                        />
                    </View>
                </ScrollView>
                {/* <View style={styles.btnWrapper}> */}
                <ButtonForm label={t("submit")} onPress={handleSave} loading={isLoading} />
                {/* </View> */}
            </View>
        </Root>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    scrollContainer: {
        flexGrow: 1,
        // justifyContent: 'center',
        margin: 16,
        // backgroundColor: Colors.background,
        // borderWidth: 1,
        // borderColor: Colors.border,
        // borderRadius: 12,
        // borderStyle: 'dashed',
    },
    forgotContainer: {

        padding: 16,


        paddingVertical: 40,



    },
    title: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "600",
        color: "#037e03",
        marginBottom: 20,
        fontFamily: Fonts.Medium,
    },
    label: {
        color: "#333",
        fontSize: 14,
        marginTop: 12,
        marginBottom: 6,
        fontFamily: "Poppins-Regular",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
        backgroundColor: "#fff",
        // elevation: 2,
    },
    inputText: {
        flex: 1,
        height: 48,
        color: Colors.text,
        fontSize: 14,
        fontFamily: Fonts.Regular,
    },
    eyeIcon: {
        width: 24,
        height: 24,
        tintColor: "#888",
    },
    btnWrapper: {
        padding: 15,
    },
});
