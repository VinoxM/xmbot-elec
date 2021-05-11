import ajax from './index'

export const getPcrSetting = () => {return ajax({url:'/setting/gacha/pcr.json',method:'get'})}
export const getPcrPools = () => {return ajax({url:'/setting/gacha/pcr/pools.json',method:'get'})}
export const getPcrCharacter = () => {return ajax({url:'/setting/gacha/pcr/character.json',method:'get'})}
export const getPcrNickNames = () => {return ajax({url:'/setting/gacha/pcr/nickNames.json',method:'get'})}

export const savePcrSetting = (params) => {return ajax({url:'/setting/gacha/pcr-setting.save',method:'post',data:params})}
export const saveAllPcrSetting = (params) => {return ajax({url:'/setting/gacha/pcr-all.save',method:'post',data:params})}
export const savePcrPoolsSetting = (params) => {return ajax({url:'/setting/gacha/pcr-pools.save',method:'post',data:params})}
export const savePcrNickNames = (params) => {return ajax({url:'/setting/gacha/pcr-nickNames.save',method:'post',data:params,processData:false,contentType:false})}

export const deletePcrCharacter = (params) => {return ajax({url:'/setting/gacha/pcr/delCharacter.do',method:'post',data:params})}


export const onlinePcrGacha = (params) => {return ajax({url: '/gacha/pcr/online.do', method:'post', data:params})}
