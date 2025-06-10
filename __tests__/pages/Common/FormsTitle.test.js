import {render} from "@testing-library/react-native";
import FormsTitle from "../../../pages/Common/FormsTitle";
describe('FormsTitle Heading', () => {
    it('Should render the title correctly', () => {
        const title = 'Test title'
        const { getByText,tree } = render(<FormsTitle title={title} />).toJSON();
        expect(tree).toMatchSnapshot();
        // expect(getByText(title)).toBeTruthy()
    })

    // it('should call goback when back button is pressed', () => {
    //     const { getByTestId } = render(<FormsTitle title='Test' />)
    //     const backButton = getByTestId('back-button')

    //     fireEvent.press(backButton)
    //     expect(goBack).toHaveBeenCalled()
    // })
})