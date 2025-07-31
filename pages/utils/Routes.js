export const ROUTES = {
  POST: {LOGIN: 'sessionRoute/login'},

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

    QUESTION_LIST: 'questionRoute/questionList',
  },
};
