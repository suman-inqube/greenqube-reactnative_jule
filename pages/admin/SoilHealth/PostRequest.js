import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import CustomHeader from '../CustomHeader';
import FormsTitle from '../../Common/FormsTitle';
import { useTranslation } from 'react-i18next';
import ButtonForm from '../../Common/ButtonForm';
import DropdownForm from '../../Common/DropdownForm';
const PostRequest = () => {
    const { t } = useTranslation();
    return (
        <>
            <View style={styles.container}>
                <CustomHeader />
                <FormsTitle title={t('request_soil_testing')} />
                <DropdownForm label={t('agent_crop_problem_plot')} />
            </View>
            <ButtonForm label={t('submit')} />
        </>
    )
}

export default PostRequest

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})