import { DEFAULT } from '@sentry/react-native/dist/js/tracing';

export const ROUTES = {
  POST: {
    LOGIN: 'sessionRoute/login',
    ADD_ID_ADDRESS_IMGS: () => `farmerRoute/addIdAddressImgs`,
    NEAREST_LATLONG: `settingsRoute/nearestPlots`,
    ADD_LAND_CROP_DETAIL: () => `landRoute/multiLatLong`,
    PROBLEM_SAVE: () => `questionRoute/add`,
    ADD_USER_PIPE_ACTIVITY: `inputOutputRoute/addUserPipeActivity`,
    UPDATE_PIPE_ACTIVITY: `inputOutputRoute/updatePipeActivity`,
    ADD_LOAN: () => `loanRoute/add`,
    ADD_INSURANCE: () => `insuranceRoute/add`,
    FARMER_INCOME_EXPENSE_SAVE: () => `cropRoute/addUserCropRels`,
    DEALER_DAILY_SALES_REPORT_ADD: () => `optionRoute/salesReport`,
    // ADD_USER_PIPE_ACTIVITY: `inputOutputRoute/addUserPipeActivity`,
    // UPDATE_PIPE_ACTIVITY: `inputOutputRoute/updatePipeActivity`,
    ACTIVITY_SAVE: `inputOutputRoute/addUserActivity`,
    SAVE_CO_FARMERS: `settingsRoute/saveCoFarmers`,
    FARMER_SIGNUP_BY_AGENT: `agentRoute/farmerSignupByAgent`,
    ADD_PLOTI_MGS: `landRoute/addPlotImgs`,
    NEW_FORGOT_PASSWORD: 'loginSignupRoute/newForgotPassword',
    UP_CARBON_AGR_DOC: 'landRoute/uploadCarbonAgrDocs',
    ADD_CROP_INOUT: 'carbonRoute/addCropInput',
    NEWFORGOT_PASSWORD: `loginSignupRoute/newForgotPassword`,
    ADD_ACTIVITY_IMG: `landRoute/uploadPipeImages`,
    PROBLEM_COMMENT_SAVE: `questionRoute/addComment`,
    INPUT_OUTPUT_SAVE: `inputOutputRoute/add`,
    CHECK_PLOT_DOCS: `loanEntityRoute/checkPlotDocs`,
  },

  GET: {
    REGIONAL_DATA: `categoryRoute/list/1/0/2?search_key=&categoryType=regionaldata`,
    DEFAULT_CURR: `optionRoute/currList/1/0/5?search_key=&is_default=1`,
    LIST_USER: ({ user_id = '' }) =>
      `loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=${user_id}`,
    PLOT_AGAINST_FARMER: ({ user_id }) => `landRoute/userLandDetails/${user_id}`,
    SHOW_CARBON_FLAG: `optionRoute/showCarbonFlag`,
    PHONE_DIGIT_CHECK: ({ country_id }) =>
      `locationRoute/getContactNoDigitByCountryID/${country_id}`,
    USER_ACTIVITY: ({
      pageNO,
      carbonType,
      userID,
      searchItem = '',
      from_date = '',
      to_date = '',
    }) =>
      `inputOutputRoute/listUserActivity/1/${pageNO}/2?type=${carbonType}&user_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&sowing_date=${from_date}&harvesting_date=${to_date}`,

    USER_ACTIVITY_DETAILS: ({ uact_id }) =>
      `settingsRoute/detailsUserActivity?uact_id=${uact_id}`,
    PIPE_LIST_DETAILS: ({ plot_id, act_master_id, cu_rel_id, pipe_id }) =>
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

    FARMER_PROFILE_INFO: ({ user_id }) => `loginSignupRoute/details/${user_id}`,

    FARMER_DOC: ({ user_id }) => `loginSignupRoute/onlydetails/${user_id}`,

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
      supervisorId = '',
      search_key = '',
      from_date = '',
      to_date = '',
    }) =>
      `inputOutputRoute/listUserActivity_v2/1/${pageNO}/2?type=${carbonType}&user_id=${userID}&agent_id=${supervisorId}&crop_type=&crop_name=&crop_variety=&search_key=${search_key}&sowing_date=${from_date}&harvesting_date=${to_date}`,

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
    AGENT_ROUTE: ({ page = 1, search_key = '', seasonId = '' }) =>
      `agentRoute/onlyFarmerList_e/1/${page}/2?search_key=${search_key}&season_fid=${seasonId}`,
    Fenced_Rejected_Plot_List: ({
      page,
      status_level,
      geo_type,
      searchBy = '',
      supervisor_id = '',
    }) =>
      `landRoute/plotNotification/1/${page}/3?supervisor=${supervisor_id}&user_id=&plot_status=${status_level}&geo_type=${geo_type}&search_key=${searchBy}`,
    USER_ACTIVITY_DETAILS: ({ uact_id }) =>
      `inputOutputRoute/detailsUserActivity_e?uact_id=${uact_id}`,
    INPUT_LIST_API: ({ category_id = '' }) =>
      `marketRoute/listproduct/1/0/2?search_key=&category_id=${category_id}`,
    INPUT_CATEGORY_API: () => `inputOutputEntityRoute/listEntityTypes/1/0/2`,
    INPUT_SUB_CATEGORY_API: ({ category_id = '' }) =>
      `inputOutputEntityRoute/listEntities/1/0/2?entity_type_id=${category_id}`,
    NOTICE_DETAILS: ({ noticeId }) => `generalInfoRoute/details/${noticeId}`,
    SUPERVISOR_OUTPUT_VIEW: ({ id }) => `inputOutputRoute/protofdetails/${id}`,
    OUTPUT_LIST: ({
      farmer_id = '',
      fromDate = '',
      toDate = '',
      userId = '',
      mobileNo = '',
    }) =>
      `inputOutputRoute/list/1/0/2?&farmer_id=${farmer_id}&transaction_type=2&from_date=${fromDate}&to_date=${toDate}&agent_id=${userId}&farmer_mobile=${mobileNo}`,
    FARMER_AGAINST_SUPERVISOR: () =>
      `loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=`,
    FARMER_BY_NAME: ({ userID = '' }) =>
      `loginSignupRoute/listuser/1/0/2?search_key=&userType=2&createdBy=${userID}`,
    PROBLEM_PLOT_AGAINST_FARMER: ({ farmerID = '' }) =>
      `landRoute/userLandDetails/${farmerID}`,
    PROBLEM_PRODUCE_AGAINST_PLOT: ({ relID = '' }) =>
      `cropRoute/currentCropStatus?land_rel_id=${relID}`,
    UNIT_BY_LIST: ({ is_default = '', sub_type = '' }) =>
      `unitRoute/list/1/0/5?search_key=&is_default=${is_default}&sub_type=${sub_type}&unit_type=product_unit`,
    FARMER_PROBLEM_DETAILS: ({ quesId = '' }) =>
      `questionRoute/details/${quesId}`,
    INPUT_ENQUIRY_VIEW: ({ farmer_id = '' }) =>
      `inputOutputRoute/stofdetails/${farmer_id}`,
    INPUT_PAST_ENQUIRY_LIST: ({
      farmer_id = '',
      from_date = '',
      to_date = '',
      farmer_mobile = '',
    }) =>
      `inputOutputRoute/list/1/0/2?farmer_id=${farmer_id}&transaction_type=1&entity_type_id=&from_date=${from_date}&to_date=${to_date}&farmer_mobile=${farmer_mobile}&agent_id=`,
    ACTIVITY_SCHEDULE_API: ({
      type = '',
      plotId = '',
      cropId = '',
      cu_rel_id = '',
    }) =>
      `settingsRoute/activitySchedule?type=${type}&plot_id=${plotId}&crop_name=${cropId}&cu_rel_fid=${cu_rel_id}`,
    ACTIVITY_INFO: ({ cropType = '', cropName = '', actTypeID = '' }) =>
      `inputOutputRoute/listActivity/1/0/1?crop_type=${cropType}&crop_name=${cropName}&act_type_id=${actTypeID}`,
    ACTIVITY_TYPE: () =>
      `categoryRoute/list/1/1/2?categoryType=activity_type_master&search_key=`,
    PRODUCTION_STAGE: ({ languageID = '', cropTypeId = '', cropNameID = '' }) =>
      `cropRoute/getCropRelationDropdown/${languageID}?crop_type_id=${cropTypeId}&crop_name_id=${cropNameID}`,
    PROBLEM_SEVERITY: () => `cropRoute/list/1/0/1?type=severity&search_key`,
    PROBLEM_TYPE_NAME: () => `problemRoute/problemtypename?farming_type=crop`,
    PRODUCTION_SEASON: ({ lanId = '', crop_type_id = '', crop_name_id = '' }) =>
      `cropRoute/getCropRelationDropdown/${lanId}?crop_type_id=${crop_type_id}&crop_name_id=${crop_name_id}`,
    PRODUCTION_PROCESS: () =>
      `farmerRoute/listfardata/1/0/2?type=production_system&search_key=`,
    PRODUCTION_UNIT: () =>
      `unitRoute/list/1/0/5?unit_type=yield_unit&search_key=`,
    PLOT_SIDE_USER_LAND_DETAILS: ({ farmeruserID = '' }) =>
      `landRoute/userLandDetails/${farmeruserID}`,
    UNIT_CONVERSION_DEFAULT: () =>
      `unitRoute/list/1/0/5?search_key=&unit_type=land_unit`,
    LAND_UNIT_AREA: () =>
      `unitRoute/list/1/0/5?search_key=&unit_type=land_unit&is_default=1&sub_type=land_area`,
    LAND_UNIT_SQUARE: () =>
      `unitRoute/list/1/0/5?search_key=&unit_type=land_unit&sub_type=land_area&unit_slug=square_metre`,
    LAND_ROUTE: ({ type = '' }) =>
      `landRoute/list/1/0/1?type=${type}&search_key=`,
    DISTRICT_API: ({ stateID = '' }) =>
      `locationRoute/listDistrict/1/0/1?search_key=&state_id=${stateID}`,
    STATE_API: () => `locationRoute/stateList/1/0/1?search_key=&country_id=1`,
    BLOCK_API: ({ districtID = '' }) =>
      `locationRoute/listAllSubdiv/1/0/1?search_key=&district_id=${districtID}`,
    CHECK_PHONE_DIGIT: ({ countryId = '' }) =>
      `locationRoute/getContactNoDigitByCountryID/${countryId}`,
    TERRAIN_TYPE: () => `landRoute/list/1/0/1?type=terrain_type&search_key=`,
    LAND_TYPE: () => `landRoute/list/1/0/1?type=land_type&search_key=`,
    SOIL_TYPE: () => `landRoute/list/1/0/1?type=soil_type&search_key=`,
    LAND_UNIT: () => `unitRoute/list/1/0/5?search_key=&unit_type=land_unit,`,
    PRODUCTION_SEASON_REG: ({
      languageId,
      crop_type_id = '',
      crop_name_id = '',
    }) =>
      `cropRoute/getCropRelationDropdown/${languageId}?crop_type_id=${crop_type_id}&crop_name_id=${crop_name_id}`,
    PRODUCE_SEASON: ({ from_date = '', to_date = '' }) =>
      `cropRoute/getSeasonDate?from_date=${from_date}&to_date=${to_date}`,

    PRODUCE_NAME_LIST: ({ languag = '', livelihoodType = '' }) =>
      `cropRoute/getCropRelationDropdown/${languag}?crop_type_id=${livelihoodType}&crop_name_id=`,

    ACTIVITY_LIST_INSTRUMENTWISE: ({
      pageNO = '',
      userID = '',
      searchItem = '',
      from_date = '',
      to_date = '',
    }) =>
      `settingsRoute/listPipeActivity/1/${pageNO}/2?type=carbon_activity&agent_id=${userID}&crop_type=&crop_name=&crop_variety=&search_key=${searchItem}&from_date=${from_date}&to_date=${to_date}`,

    LOAN_PURPOSE_API: () =>
      `loanEntityRoute/list/1/0/1?entity_type=loan_purpose`,

    LOAN_LIST: ({
      farmer_id = '',
      from_date = '',
      to_date = '',
      farmer_mobile = '',
    }) =>
      `loanRoute/list/1/0/2?&user_id=${farmer_id}&farming_type=crop&from_date=${from_date}&to_date=${to_date}&agent_id=&farmer_mobile=${farmer_mobile}`,

    INSURANCE_LIST: ({
      farmer_id = '',
      from_date = '',
      to_date = '',
      user_id = '',
      farmer_mobile = '',
    }) =>
      `insuranceRoute/list/1/0/2?&user_id=${farmer_id}&from_date=${from_date}&to_date=${to_date}&agent_id=${user_id}&farmer_mobile=${farmer_mobile}`,

    FARMER_ACCOUNT_LIST: ({
      pageNo = '',
      farmerId = '',
      fromDate = '',
      toDate = '',
    }) =>
      `cropRoute/listUserCropRelsNew/1/${pageNo}/2/?search_key=&agent_id=&user_id=${farmerId}&from_date=${fromDate}&to_date=${toDate}`,

    FARMER_ACCOUNT_EXPENSE_LIST: () =>
      `categoryRoute/list/1/0/2?search_key=&categoryType=expense`,

    FARMER_ACCOUNT_INCOME_LIST: () =>
      `categoryRoute/list/1/0/2?search_key=&categoryType=income`,

    DAILY_SALES_REPORT: () =>
      `optionRoute/srList/1/0/1?search_key=&user_fid=&from_date=&to_date=`,

    CHOOSE_DEALER: () =>
      `loginSignupRoute/listDealerAdmin/1/1/2?userType=9&search_key=&createdBy=`,

    ALL_PRODUCT_CATEGORY_LIST: () =>
      `inputOutputEntityRoute/listEntityTypes/1/0/1`,

    LOC_DIFFERENCE_LANGUAGE: ({
      state_fid = '',
      district_fid = '',
      subdiv_fid = '',
    }) =>
      `locationRoute/locDiffLang/?state_fid=${state_fid}&district_fid=${district_fid}&subdiv_fid=${subdiv_fid}`,

    ALL_PRODUCT_SUB_CATEGORY_LIST: ({ categoryID = '' }) =>
      `inputOutputEntityRoute/listEntityNames/1/0/1?entity_type_id=${categoryID}`,

    ALL_PRODUCT_NAME_LIST: ({ subCategoryID = '' }) =>
      `marketRoute/listproduct/1/0/2?search_key=&category_id=${subCategoryID}`,

    INPUT_OUTPUT_ROUTE_PIPE_IMG_LAT_LONG: ({
      plot_fid = '',
      cropfid = '',
      cu_rel_id = '',
    }) =>
      `landRoute/plotPipesLatLong?plot_fid=${plot_fid}&act_name_fid=&crop_name=${cropfid}&cu_rel_fid=${cu_rel_id}`,

    UNIQUE_PIPE_NAME: ({ plot_id = '', cu_rel_id = '', act_name_fid = '' }) =>
      `inputOutputRoute/getUniquePipeNames?plot_fid=${plot_id}&cu_rel_fid=${cu_rel_id}&act_name_fid=${act_name_fid}`,

    ACTIVITY_TYPE_AWD: () =>
      `categoryRoute/list/1/0/2?categoryType=carbon_activity_type&search_key=`,
    ACTIVITY_TYPE_MANG: ({
      type = '',
      plot_fid = '',
      cycle_start_date = '',
      cu_rel_fid = '',
      season_date_fid = '',
    }) =>
      `loanEntityRoute/seqActivities?type=${type}&plot_fid=${plot_fid}&cycle_start_date=${cycle_start_date}&cu_rel_fid=${cu_rel_fid}&season_date_fid=${season_date_fid}`,
    DETAILS_COMPANY: (db_company_id = '') =>
      `locationRoute/detailsCompany/${db_company_id}`,

    DEFAULT_CURRENCY: () =>
      `optionRoute/currList/1/0/5?search_key=&is_default=1`,

    FPO_DETAILS: ({ compCode = '' }) =>
      `loginSignupRoute/fpodetails_e/${compCode}`,

    REGINAL_DATA_SERVICE: () =>
      `categoryRoute/list/1/0/2?search_key=&categoryType=regionaldata`,

    DATABASE_LIST: () => `hostRoute/databaseList`,
    LANGUAGE_LIST: `locationRoute/getLang?status=1&search`,
    COUNTRY_DATA_LIST: () => `locationRoute/countryList/1/0/2?search_key=`,

    COMPANY_DATA_LIST: ({ country_id = '', language_id = '' }) =>
      `locationRoute/locationHierarchy/${country_id}/${language_id}`,

    SUPERVISOR_DATA_LIST: ({ company_id = '' }) =>
      `agentRoute/listAgentByCompanyID/${company_id}`,

    // PRODUCE_SEASON: ({from_date = '', to_date = ''}) =>
    //   `cropRoute/getSeasonDate?from_date=${from_date}&to_date=${to_date}`,

    PRODUCE_SEASON: ({ crop_name_fid = '', sd_id = '' }) =>
      `cropRoute/getSeasonDate?crop_name_fid=${crop_name_fid}&sd_id=${sd_id}`,

    // Get--/cropRoute/getSeasonDate?crop_name_fid=77eed63c-4afb-4e9a-991f-3ec7c354b0d1&season_fid=94ef09a9-d9e2-445c-9798-1de2a7951660

    ALL_ACTIVITY_SCHEDULE: ({ type = '', supervisor_id = '', farmer_id = '' }) =>
      `settingsRoute/allActivitySchedule?type=${type}&supervisor_id=${supervisor_id}&farmer_id=${farmer_id}`,
    INPUT_OUTPUT_ROUTE: ({ userId = '', fromDate = '', toDate = '' }) =>
      `inputOutputRoute/list/1/0/2?farmer_id=${userId}&transaction_type=1&entity_type_id=&from_date=${fromDate}&to_date=${toDate}`,
    INPUT_OUTPUT_ROUTE_OUTPUT: ({
      farmer_id = '',
      from_date = '',
      to_date = '',
      agent_id = '',
      farmer_mobile = '',
    }) =>
      `inputOutputRoute/list/1/0/2?&farmer_id=${farmer_id}&transaction_type=2&from_date=${from_date}&to_date=${to_date}&agent_id=${agent_id}&farmer_mobile=${farmer_mobile}`,
    LIST_CO_FARMERS: ({ land_fid, pageNo = '', searchKey = '' }) =>
      // console.log(
      //   'rr',
      //   pageNo,
      // ),
      `settingsRoute/listCoFarmers/1/${pageNo}/2?search_key=${searchKey}&land_fid=${land_fid}`,

    UNIQUE_SCAN_CODE: ({ unique_id = '', sDId = '' }) =>
      `categoryRoute/pipeQrDetails?unique_id=${unique_id}&act_type=new&season_date_fid=${sDId}`,
    GET_CROP_HISTORY: ({ plot_id = '' }) =>
      `carbonRoute/cropHistory?land_rel_id=${plot_id}`,
    GET_CROP_DETAILS: ({ plot_id = '' }) =>
      `landRoute/landActiveCrop_e?land_rel_id=${plot_id}`,
    USERLANDLIST_E: ({ farmer_id = '' }) =>
      `landRoute/userLandList_e/${farmer_id}`,
    LANDACTIVECROP_E: ({ rel_id = '' }) =>
      `landRoute/landActiveCrop_e?land_rel_id=${rel_id}`,
    PEST_DETAILS: ({ cu_rel_fid = '' }) =>
      `carbonRoute/cropInputDetails?cu_rel_fid=${cu_rel_fid}`,

    PLOTWISE_ACTIVITY: ({ plot_id = '', cropStatus = '' }) =>
      `ioRoute/listUserActivity_v3/1/1/2?search_key=&type=carbon_activity&plot_id=${plot_id}&crop_status=${cropStatus}`,

    USER_ACTIVITY_DETAILS_V3: ({ uact_id = '' }) =>
      `ioRoute/userActivityDetails_v3?uact_id=${uact_id}`,
    DETAILS_V2: ({ user_id = '' }) => `loginSignupRoute/detailsv2/${user_id}`,
    PLOT_VIEW_MAP: ({
      createdBy = '',
      latitude = '',
      longitude = '',
      distance = '10000',
      state = '',
      district = '',
      subdivision = '',
    }) =>
      `loanEntityRoute/polygonList_v2?pageNo=1&pageLimit=500&createdBy=${createdBy}&latitude=${latitude}&longitude=${longitude}&distance=${distance}&state=${state}&district=${district}&subdivision=${subdivision}`,

    PLOT_MAP_DETAILS: ({ user_id = '', land_unit_id = '' }) =>
      `loanEntityRoute/polygonDetails_v2?user_id=${user_id}&land_unit_id=${land_unit_id}`,

    GET_PLOT_DOC: ({ plotId = '' }) => `landRoute/getPlotImgs_e/${plotId}`,

    ACTIVITY_PIPE_IMG: ({ rel_id_plot = '', act_name_fid = '', pipe_id = '' }) =>
      `inputOutputRoute/pipeImages_e2?plot_fid=${rel_id_plot}&act_name_fid=${act_name_fid}&pipe_id=${pipe_id}`,

    PROBLEM_ANS_LIST: ({ problem_id = '' }) =>
      `solutionRoute/viewQuestionSolution/${problem_id}`,

    PROBLEM_COMMENTS_LIST: ({ questionId = '' }) =>
      `questionRoute/listComment/1/0/2?search_key=&comment_type=2&comment_qid=${questionId}&farming_type=crop`,
    CHECK_PIPE_COUNT: ({ plot_fid = "", activity_id = "", season_date_fid = "" }) => `loanEntityRoute/checkPipeCount?plot_fid=${plot_fid}&activity_id=${activity_id}&season_date_fid=${season_date_fid}`,
    GET_PHONE_BY_SEASON: ({ seasonSid = '' }) =>
      `loginSignupRoute/newlistuser/1/0/2?search_key=&season_fid=${seasonSid}&userType=2`,
  },

  PUT: {
    USER_PROFILE_UPDATE: ({ user_id = '' }) =>
      `loginSignupRoute/update/${user_id}`,
    UPDATE_LAND_CROP_DETAILS: ({ land_rel_id = '', crop_rel_id = '' }) =>
      `landRoute/editUserLandCrop?land_rel_id=${land_rel_id}&crop_rel_id=${crop_rel_id}`,

    UPLOAD_FARMER_ID_ADD: `settingsRoute/uploadFarmerIdAdd`,
    UP_DATE_OWNER_SHIP: `settingsRoute/updateOwnership`,
    EDIT_CO_FARMER: `settingsRoute/editCofarmer`,
    SET_CYCLE_DATE: ({ cuRelID = '' }) => `cropRoute/editUserCrop/${cuRelID}`,
    ONLY_UPDATE_ID_ADDRESS: `settingsRoute/onlyUpdateIdAddrFile`,
  },

  DELETE: {
    DEL_PLOT_IMG: () => `optionRoute/deleteFile`,
  },
};
