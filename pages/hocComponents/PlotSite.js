import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DropdownForm from '../Common/DropdownForm';
import PlotHoc from './PlotHoc';
const PlotSite = (props) => {
    const { plotAll, t } = props;
    return (<DropdownForm label={t('plot')} data={plotAll} color="red" onChange={relId => props.onChange(relId)} />)
}

export default PlotHoc(PlotSite);

const styles = StyleSheet.create({})