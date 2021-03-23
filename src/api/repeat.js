import ajax from './index'

export const getRepeatSetting = () => ajax({url:'/setting/repeat.json',method:'get'})

export const saveRepeatSetting = (json) => ajax({url:'/setting/repeat.save',method:'post',data:json})
