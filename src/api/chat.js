import ajax from './index'

export const getChatSetting = () => ajax({url: '/setting/chat.json', method: 'get'})

export const saveChatSetting = (json) => ajax({url: '/setting/chat.save', method: 'post', data: json})
