export const ROUTES = {
  POST: {
    LOGIN: 'sessionRoute/login',

    ADD_ID_ADDRESS_IMGS: () => `farmerRoute/addIdAddressImgs`,
  },

  GET: {
    LIST_USER_ACTIVITY: ({
      pageNO,
      carbonType,
      userID,
      searchItem = '',
      from_date = '',
      to_date = '',
    }) =>
      `inputOutputRoute/listUserActivity/1/${pageNO}/2?type=${carbonType}&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,

    PIPE_LIST_DETAILS: ({plot_id, act_master_id, cu_rel_id, pipe_id}) =>
      `landRoute/plotPipes?plot_fid=${plot_id}&act_name_fid=${act_master_id}&cu_rel_fid=${cu_rel_id}&pipe_id=`,

    CROP_LIST: ({
      pageNO,
      carbonType,
      userID,
      searchItem = '',
      from_date = '',
      to_date = '',
    }) =>
      `inputOutputRoute/listUserActivity/1/${pageNO}/2?type=${carbonType}&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,
    FARMER_PROFILE_INFO: ({user_id}) => `loginSignupRoute/details/${user_id}`,
    FARMER_DOC: ({user_id}) => `loginSignupRoute/onlydetails/${user_id}`,
    FIRST_LAN_LIST: () => 'locationRoute/getLang?status=1&search',
    FARMER_USEFULL_INFO_LIST: ({
      userId,
      userType,
      post,
      state_id,
      district_id,
      subdiv_id,
      newCropId,
    }) =>
      `generalInfoRoute/list/1/0/2?user_id=${userId}&search_key=&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=${newCropId}`,
  LIST_USER_ACITYLIST_E:({
      pageNO=1,
      carbonType="",
      userID="",
      search_key="",
      from_date="",
      to_date="",
    })=>`inputOutputRoute/listUserActivity_e/1/${pageNO}/2?type=${carbonType}&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${search_key}&sowing_date=${from_date}&harvesting_date=${to_date}`
    },

  PUT: {
    USER_PROFILE_UPDATE: ({user_id}) => `loginSignupRoute/update/${user_id}`,
  },

  DELETE: {
    DEL_PLOT_IMG: () => `optionRoute/deleteFile`,
  },
};
