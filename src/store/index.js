import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isLogin: false,
        isAdmin: false,
        calendar_setting: {},
        chatLog: {private: {}, group: {}},
        botReady: {
            ready: false,
            bot: [],
            api: {}
        }
    },
    mutations: {
        updateIsLogin(state, value) {
            state.isLogin = value
        },
        updateIsAdmin(state, value) {
            state.isAdmin = value
        },
        updateCalendar(state, value) {
            state.calendar_setting = value
        },
        flushChatLog(state, data) {
            let property = ['private', 'group']
            for (const prop of property) {
                if (data.hasOwnProperty(prop)) {
                    for (const key of Object.keys(data[prop])) {
                        let elem = data[prop][key]
                        if (!state.chatLog[prop].hasOwnProperty(key)) {
                            state.chatLog[prop][key] = elem
                        }
                    }
                }
            }
        },
        pushChatLog(state, data) {
            let r = data['tableName'].split('_')
            if (state.chatLog[r[0]][r[1] + '_' + r[2]]) {
                state.chatLog[r[0]][r[1] + '_' + r[2]].rows.push(data)
                state.chatLog[r[0]][r[1] + '_' + r[2]].hasNew = true
                state.chatLog[r[0]][r[1] + '_' + r[2]].newCount++
            } else state.chatLog[r[0]][r[1] + '_' + r[2]] = {rows: [data], noMore: false, hasNew: true, newCount: 1}
        },
        appendChatLog(state, data) {
            let r = data['tableName'].split('_')
            if (state.chatLog[r[0]][r[1] + '_' + r[2]]) {
                state.chatLog[r[0]][r[1] + '_' + r[2]].rows = [...data.rows, ...state.chatLog[r[0]][r[1] + '_' + r[2]].rows]
                state.chatLog[r[0]][r[1] + '_' + r[2]].noMore = data.rows.length < 20
            } else state.chatLog[r[0]][r[1] + '_' + r[2]] = {rows: [data], noMore: false, hasNew: false}
        },
        updateBotReady(state, data) {
            state.botReady = data
        }
    }
})
