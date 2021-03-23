import {ajax} from './index'

export const getPcrSetting = () => ajax({url:'/setting/calendar/pcr.json',method:'get'})
export const calendarTest = (url,needProxy) => ajax({url:'/calendar/url/test.do',method:'get',params:{url,needProxy}})
export const getAllCalendar = () => ajax({url:'/calendar/getAll.json',method:'get'})

export const savePcrSetting = (params) => ajax({url:'/setting/calendar/pcr.save',method:'post',data:params})
