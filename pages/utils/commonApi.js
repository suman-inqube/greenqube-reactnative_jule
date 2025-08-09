import { ROUTES } from './Routes'
import axios from '../utils/axios/auth'

const getColumnSize=async(table)=>{
  try{
    const response=await axios.get(`${ROUTES.GET.TABLE_MANAGEMENT}?table_name=${table}`)
    return response
  }catch(error){
    return Promise.reject(error)
  }
}

const updateColumnSize=async(payload)=>{
  try{
    const response=await axios.post(ROUTES.POST.TABLE_MANAGEMENT,payload)
    return response
  }catch(error){
    return Promise.reject(error)
  }
}

const deleteAttachmentFromCloudApi = async (payload) => {
  try {
    const response = await axios.delete(ROUTES.DELETE.REMOVE_ATTACHMENT, { data: payload })
    return response
  } catch (error) {
    return Promise.reject(error)
  }
}

export {
  deleteAttachmentFromCloudApi,
  updateColumnSize,
  getColumnSize
}