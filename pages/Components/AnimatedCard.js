import { useEffect, useRef, memo } from "react";
import { Animated} from "react-native";
const AnimatedCard = ({ item, child, index }) => {

    const cardAnimation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(cardAnimation, {
            toValue: 1,
            duration: 500,
            delay: index * 150,
            useNativeDriver: true,
        }).start();
    }, []);
    return (
        <Animated.View style={[

            {
                opacity: cardAnimation,
                transform: [{
                    translateY: cardAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                    }),
                }],

            }
        ]}>
            {child}
        </Animated.View>
    );
}
export default memo(AnimatedCard);