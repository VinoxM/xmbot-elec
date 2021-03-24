import {ajax} from './index'

export const getBaseSetting = () => ajax({url: '/setting/default.json', method: 'get'})
export const getBotApi = () => ajax({url: '/getBotApi.json', method: 'get'})
export const getBotReady = () => ajax({url: '/getBotReady.json', method: 'get'})

export const saveBaseSetting = (params) => ajax({url: '/setting/default.save', method: 'post', data: params})
