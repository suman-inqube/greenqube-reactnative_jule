import { useState, useEffect, useContext } from "react";
import { userCreateContext } from "../Context/usersCreateContext";
import { problemPlotAgainstFarmerAPI } from "../../config/apiHere";
const PlotHoc = (Component, incrmentBy = 1) => {
    return function EnhanceComponent(props) {
        const { t, plotAll } = useContext(userCreateContext);
        return (
            <Component {...props} plotAll={plotAll} t={t} />
        )
    }
}

export default PlotHoc;