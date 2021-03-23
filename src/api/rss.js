import ajax from './index'

export const getRssSetting = () => ajax({url: '/setting/rss.json', method: 'get'})
export const rssSourceTest = (params) => ajax({url: '/rss/source/test.do', method: 'get', params:params})

export const saveRssSetting  = (params) => {return ajax({url:'/setting/rss.save',method:'post',data:params})}
