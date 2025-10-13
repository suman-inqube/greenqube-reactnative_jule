
import { SafeAreaView } from 'react-native-safe-area-context';
const Container = ({ children }) => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            {children}
        </SafeAreaView>
    )
}

export default Container;