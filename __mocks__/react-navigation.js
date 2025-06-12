const reactNavigation = {
    createAppContainer: jest.fn().mockReturnValue(function NavigationContainer(props) {
        return props.children;
    }),
    createStackNavigator: jest.fn(),
};

module.exports = reactNavigation;