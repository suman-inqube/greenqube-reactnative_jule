import axios from 'axios';
import config from '../../../config';
import { CrashlyticsRecordError } from '../../Crashlytics/CrashlyticsRecordError';
export const TterrainTypeAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language}`,
            'Accept': 'application/json'
        },
    };
    try {
        let response = await axios.get(config.terraintypeAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}
export const landTypeAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language}`,
            'Accept': 'application/json'
        },
    };
    try {
        let response = await axios.get(config.landtypeAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}
export const soilTypeAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language}`,
            'Accept': 'application/json'
        },
    };
    try {
        let response = await axios.get(config.soiltypeAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}

export const landUnitAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language}`,
            'Accept': 'application/json'
        },
    };
    try {
        let response = await axios.get(config.landunitAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}
export const ProducceSeasionAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName}`,
            'Accept': 'application/json'
        },
    };
    try {
        const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language + config.prodctionSeasionAPI2;
        let response = await axios.get(prodctionSeasionAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}
export const livelihoodTypeAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName}`,
            'Accept': 'application/json'
        },
    };
    try {
        const prodctionSeasionAPI = config.prodctionSeasionAPI1 + language + config.prodctionSeasionAPI2;
        let response = await axios.get(prodctionSeasionAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }
}
export const produceNameDataListAPI = async (dbName, languag, livelihoodType) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName}`,
            'Accept': 'application/json'
        },
    };
    try {
        const produceNameAPI = config.produceNameAPI1 + languag + config.produceNameAPI2 + livelihoodType + config.produceNameAPI3;
        let response = await axios.get(produceNameAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }
}
export const produceVarietyAPI = async (dbName, languag, livelihoodType, produceName) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName}`,
            'Accept': 'application/json'
        },
    };
    try {
        const produceVarietyAPI = config.produceVarietyAPI1 + languag + config.produceVarietyAPI2 + livelihoodType + config.produceVarietyAPI3 + produceName;
        let response = await axios.get(produceVarietyAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }
}

export const ProductionProcessDataAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language}`,
            'Accept': 'application/json'
        },
    };
    try {
        let response = await axios.get(config.productionProcessAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}
export const ProduceProductionUnitDataAPI = async (dbName, language) => {
    const axiosHeaders = {
        headers: {
            'information': `${dbName},${language}`,
            'Accept': 'application/json'
        },
    };
    try {
        let response = await axios.get(config.produceProductionUnitAPI, axiosHeaders);
        return response;
    } catch (error) {
        CrashlyticsRecordError(error.response)
        return error.response;
    }

}

export const UserRegisterAPI = async (dbName, language, token, userId, inputData, plot_count) => {
    const axiosHeaders = {
        headers: {
            'authorization': `${token}`,
            'information': `${dbName},${language},${userId}`,
            'Content-Type': 'multipart/form-data',
            'plot_count': plot_count
        },
    };
    try {
        let response = await axios.post(`${config.BASE_URL}greenZownRoute/growerRegistration`, inputData, axiosHeaders);
        return response;
    } catch (error) {
        // CrashlyticsRecordError(error.response)
        return error.response;
    }

}
// export const UserRegisterAPI = async (dbName, language, token, userId, inputData, plot_count) => {
//     const axiosHeaders = {
//         headers: {
//             'authorization': `${token}`,
//             'information': `${dbName},${language},${userId}`,
//             'Content-Type': 'multipart/form-data',
//             'plot_count': plot_count
//         },
//     };
//     try {
//         let response = await axios.post(`${config.BASE_URL}greenZownRoute/growerRegistration`, inputData, axiosHeaders);
//         return response;
//     } catch (error) {
//         CrashlyticsRecordError(error.response)
//         return error.response;
//     }

// }








