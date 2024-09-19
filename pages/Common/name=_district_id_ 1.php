"user_id": "c8e666ba-5046-48ba-8561-27c3c22be0cc",
     "userName": "Sahin Firdous",

biki : farmer_id : e5869ff0-37a8-4fd4-bd79-e66a70a47721


Get all output list

URL:GET http://142.93.208.31:4003/inputOutputRoute/list/1/0/2?&
farmer_id=&transaction_type=2&from_date=&to_date=&agent_id=c8e666ba-5046-48ba-8561-27c3c22be0cc&farmer_mobile=

header 
information: greenqube_farm_sme_demo_1,1,c8e666ba-5046-48ba-8561-27c3c22be0cc
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM4ZTY2NmJhLTUwNDYtNDhiYS
04NTYxLTI3YzNjMjJiZTBjYyIsImlhdCI6MTY5ODIwOTgxMiwiZXhwIjoxNjk4ODE0NjEyfQ.yFbPTbsOdJRpMm-DSHngKT0voAqMG3fMG6TTwOqU6BE



Get all output deatails
URL:GET http://142.93.208.31:4003/inputOutputRoute/protofdetails/3f9d2d7a-eeef-4f32-893d-6c13e0ef58a1 (fid)
header 
information: greenqube_farm_sme_demo_1,1,c8e666ba-5046-48ba-8561-27c3c22be0cc
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM4ZTY2NmJhLTUwNDYtNDhiYS
04NTYxLTI3YzNjMjJiZTBjYyIsImlhdCI6MTY5ODIwOTgxMiwiZXhwIjoxNjk4ODE0NjEyfQ.yFbPTbsOdJRpMm-DSHngKT0voAqMG3fMG6TTwOqU6BE



Get plot by farmer id
URL:GET http://142.93.208.31:4003/landRoute/userLandDetails/e5869ff0-37a8-4fd4-bd79-e66a70a47721
header 
 Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM4ZTY2NmJhLTUwNDYtNDhiYS04NTYxLTI3YzNjMjJiZ
TBjYyIsImlhdCI6MTY5ODIxMDA1MSwiZXhwIjoxNjk4ODE0ODUxfQ.d7CKNTSAgIkSZsS09fZLR68J8w-IiWU0oG_-B0-l8qg
information: greenqube_farm_sme_demo_1,1



Get livelihood, produce name produce variety by farmer id and land rel id
URL:GET 
http://142.93.208.31:4003/cropRoute/listUserCrop/1/0/1?user_id=e5869ff0-37a8-4fd4-bd79-e66a70a47721&land_rel_id=a9445241-a55b-4ace-9984-ded1db455716

http://142.93.208.31:4003/cropRoute/listUserCrop/1/0/1?user_id=e5869ff0-37a8-4fd4-bd79-e66a70a47721&land_rel_id=a9445241-a55b-4ace-9984-ded1db455716 


header 
information: greenqube_farm_sme_demo_1,1


Get unit by 
URL:GET http://142.93.208.31:4003/unitRoute/list/1/0/5?unit_type=product_unit&search_key=
header 
information: greenqube_farm_sme_demo_1,1



submit output query
URL:POST http://142.93.208.31:4003/inputOutputRoute/add
header
information: greenqube_farm_sme_demo_1,1,c8e666ba-5046-48ba-8561-27c3c22be0cc
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImM4ZTY2NmJhLTUwNDYtNDhiYS04NTYxLTI3YzNjMjJiZTBjYyIsImlhd
CI6MTY5ODIxMDA1MSwiZXhwIjoxNjk4ODE0ODUxfQ.d7CKNTSAgIkSZsS09fZLR68J8w-IiWU0oG_-B0-l8qg

 name="farmer_id"   e5869ff0-37a8-4fd4-bd79-e66a70a47721
name="state_id"  1
name="district_id"  1
 name="block_id"  1
 name="date"  2023-10-25
name="transaction_type"  2
name="type"
 name="entity_type_id"  23faed48-942a-4d85-84cf-2c25cdf4640a
 name="entity_name_id"  4143d209-ccb7-4e48-91ca-51614645d774
name="entity_variety_id"  a555a329-b535-490c-a096-fd1d17fed401
name="unit_id" 10 kg
 name="quantity" 45
 name="user_name" biki
name="user_contact_number" 2666699999
 name="fulfill_status" 0
name="land_rel_id"  a9445241-a55b-4ace-9984-ded1db455716
 name="others" 
 name="ref_code" 2268925240952
 name="photo"




let farmer_id=currentfarmerId;
        let fromDate="";
        let toDate="";
        let mobileNo="";

        const outputList = await outputListAPI(dbLanTokUsr.dbName, dbLanTokUsr.languageId, dbLanTokUsr.token, dbLanTokUsr.supervisorId,farmer_id,fromDate,toDate,mobileNo);
        if (outputList) {
            setOutputListAll(outputList.data.data.rows)
            setItem("output_data", outputList.data.data.rows)
        }





        
name="district_id"  1
name="entity_type_id"  23faed48-942a-4d85-84cf-2c25cdf4640a
 name="entity_name_id"  4143d209-ccb7-4e48-91ca-51614645d774
name="entity_variety_id"  a555a329-b535-490c-a096-fd1d17fed401
name="farmer_id"   e5869ff0-37a8-4fd4-bd79-e66a70a47721
 name="fulfill_status" 0
name="land_rel_id"  a9445241-a55b-4ace-9984-ded1db455716
name="quantity" 45
name="ref_code" 2268925240952
name="state_id"  1
 name="block_id"  1
name="transaction_type"  2
name="type"
name="user_contact_number" 2666699999
 name="user_name" biki
name="date"  2023-10-25
name="unit_id" 10 kg
 name="others" 
 name="photo"


 {
   "block_id": 181, 
   "date": "2023-10-30", 
   "district_id": 87, 
   "district_name": "Bankura", 
   "entity_name_id": "d967043a-3d2c-44cb-b6e4-de13185aa984", 
   "entity_type_id": "47711603-6921-4ea8-b769-ed819c142f9d", 
   "entity_variety_id": "766cc139-01e7-4640-b514-3c83d3e62353",
    "farmer_id": "fd7c2478-2cef-46ca-8ac8-39ecd19eeda2", 
    "fulfill_status": 0, 
    "land_rel_id": "ebfc997d-2ad2-43bc-a915-bb63c5c8eef6", 
    "quantity": "10", 
    "ref_code": 6991515384800, 
    "state_id": 43,
    "state_name": "West Bengal", 
    "subdiv_name": "Bankura-I", 
    "transaction_type": 2,
     "type": "",
      "unit_id": "50 kg",
       "user_contact_number": "9732138126", 
       "user_name": "Maitri Ghosh"}