
const initialState = {
    user_id: "",
    id: "",
    status: "",
    agri_files: "",
    agri_user: "",
    apx_annual_income: "",
    loan_amount: "",
    agri_loan_entity: "",
    existing_loan_amount: "",
    loan_plots: ""
};
const LoanReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_LOAN':
            return {
                ...state,
                user_id: action.payload?.user_id,
                id: action.payload?.id,
                status: action.payload?.status,
                agri_files: action.payload?.agri_files,
                agri_user: action.payload?.agri_user,
                apx_annual_income: action.payload?.apx_annual_income,
                loan_amount: action.payload?.loan_amount,
                agri_loan_entity: action.payload?.agri_loan_entity,
                existing_loan_amount: action.payload?.existing_loan_amount,
                loan_plots: action.payload?.loan_plots
            };
        default:
            return state;
    }
};
export default LoanReducer;