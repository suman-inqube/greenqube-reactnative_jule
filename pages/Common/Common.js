import { Alert } from 'react-native'


export const alertBoxMsg = async ({title,msg}) => {
    console.log(title);
    Alert.alert(
        // 'Custom Alert Title',
        title.charAt(0).toUpperCase() + title.slice(1),
        msg.charAt(0).toUpperCase() + msg.slice(1),
        // 'Please enter a phone number.',
        [
            {
                text: 'OK',
                style: 'default', 
            },
        ],
        {
            cancelable: true,
            style: 'default', 
        }
    );
    return false;
}


