import React, { useState } from 'react';
import { problemPlotAgainstFarmerAPI } from '../../config/apiHere';
import { setItem } from '../../config/getDataFromStorage';
export const plotHook = (dbname, lan_id, token, user_id, isOnline) => {
    const [plotAll, setplotAll] = useState([]);
    const problemPlotAgainstFarmer = async (props) => {
        if (isOnline) {
            responsePlot = await problemPlotAgainstFarmerAPI(dbname, lan_id, token, user_id);
            await setItem('problemPlotAgainstFarmer' + user_id, responsePlot);
        } else {
            responsePlot = await getItem('problemPlotAgainstFarmer' + user_id);
        }
        if (responsePlot != null) {
            const dataArray = responsePlot?.data?.data.map(data => ({ value: data.rel_id, label: data.plot_no, user_id: data.user_id }));
            setplotAll(dataArray);
        }
    }
    return {
        problemPlotAgainstFarmer,
        plotAll,
        setplotAll,
    }
}
