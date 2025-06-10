import ButtonForm from "../../../pages/Common/ButtonForm";

import { fireEvent, render, screen } from '@testing-library/react-native'
describe('Custom Button', () => {
    const label = 'Test Button'
    it('should render with the correct title', () => {

        const tree =render(<ButtonForm onPress={() => { }} label={label} />).toJSON();
  
        expect(tree).toMatchSnapshot();

        // const buttonText = screen.getByText(label)
        // expect(buttonText).toBeTruthy()
    })

    // it('should show Activity indicator when loading is true', () => {
    //     render(<ButtonForm onPress={() => { }} label={label} loading={true} />)
    //     // const activityIndicator = screen.getByTestId('activity-indicator');
    //     // expect(activityIndicator).toBeOnTheScreen()
    // })
})
