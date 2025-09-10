export const ROUTES = {
  POST: {
    LOGIN: 'sessionRoute/login',
    ADD_ID_ADDRESS_IMGS: () => `farmerRoute/addIdAddressImgs`,
  },

  GET: {
    USER_ACTIVITY: ({
      pageNO,
      carbonType,
      userID,
      searchItem = '',
      from_date = '',
      to_date = '',
    }) =>
      `inputOutputRoute/listUserActivity/1/${pageNO}/2?type=${carbonType}&user_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,

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

    USEFULL_INFO_LIST: ({
      userId,
      titleSearch,
      userType,
      post,
      state_id,
      district_id,
      subdiv_id,
    }) =>
      `generalInfoRoute/list_e/1/0/2?user_id=${userId}&search_key=${titleSearch}&role_type=${userType}&post_type=${post}&state_id=${state_id}&district_id=${district_id}&subdiv_id=${subdiv_id}&crop_name_id=`,

    LIST_USER_ACITYLIST_E: ({
      pageNO = 1,
      carbonType = '',
      userID = '',
      search_key = '',
      from_date = '',
      to_date = '',
    }) =>
      `inputOutputRoute/listUserActivity_v2/1/${pageNO}/2?type=${carbonType}&user_id=${userID}&agent_id=&crop_type=&crop_name=&crop_variety=&search_key=${search_key}&sowing_date=${from_date}&harvesting_date=${to_date}`,
    QUESTION_ROUTE: ({
      pageNo = 1,
      user_id = '',
      from_date = '',
      to_date = '',
      agent_id = '',
      farmer_mobile = '',
    }) =>
      `questionRoute/list_e/1/${pageNo}/2?search_key=&user_id=${user_id}&from_date=${from_date}&to_date=${to_date}&agent_id=${agent_id}&problem_type_id=&problem_name_id=&farmer_mobile=${farmer_mobile}`,
    INPUT_OUTPUT_ROUTE: ({
      farmer_id = '',
      from_date = '',
      to_date = '',
      agent_id = '',
      farmer_mobile = '',
    }) =>
      `inputOutputRoute/list/1/0/2?&farmer_id=${farmer_id}&transaction_type=2&from_date=${from_date}&to_date=${to_date}&agent_id=${agent_id}&farmer_mobile=${farmer_mobile}`,
    AGENT_ROUTE: ({page = 1, search_key = ''}) =>
      `agentRoute/listFarmer_e/1/${page}/2?search_key=${search_key}`,

    Fenced_Rejected_Plot_List: ({page, status_level, geo_type, searchBy}) =>
      `landRoute/plotNotification/1/${page}/3?supervisor=&user_id=&status_level=${status_level}&geo_type=${geo_type}&search_key=${searchBy}`,
  },

  PUT: {
    USER_PROFILE_UPDATE: ({user_id}) => `loginSignupRoute/update/${user_id}`,
  },

  DELETE: {
    DEL_PLOT_IMG: () => `optionRoute/deleteFile`,
  },
};
