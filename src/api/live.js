import ajax from './index'

export const getLiveSetting = () => ajax({url: '/setting/live.json', method: 'get'})
export const getBiliDynamic = (params) => ajax({url: '/bili/dynamic.json', method: 'get', params: params})

export const saveLiveSetting = (json) => ajax({url: '/setting/live.save', method: 'post', data: json})
export const delOneDynamic = (json) => ajax({url: '/bili/dynamic.delete', method: 'post', data: json})
