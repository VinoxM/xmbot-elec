import Vue from 'vue'
import App from './App'
import {checkAuth, checkIsAdmin, router} from './router'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import {addAjaxInterceptors, ajax, changeAjaxBaseUrl, urlConf} from './api'
import store from './store/index'
import {createWs, socket} from './socket/index'
import VueECharts from 'v-charts'
import {getBotApi} from './api/base'
import VueCookies from 'vue-cookies'
import {Cookies,initCookies} from './cookies/index'

Vue.component('xm-tags', () => import('./components/xmElement/xm-tags'))
Vue.component('xm-info-box', () => import('./components/xmElement/xm-info-box'))
Vue.component('xm-menu-item', () => import('./components/xmElement/xm-menu-item'))
Vue.component('xm-affix', () => import('./components/xmElement/xm-affix'))

Vue.config.productionTip = false
Vue.use(ElementUi)
Vue.use(VueECharts)

// Vue.prototype.$cookies = Cookies

if (process.env.IS_ELECTRON && process.env.NODE_ENV === 'production') {
    initCookies()
    Vue.prototype.$cookies = Cookies
} else {
    Vue.use(VueCookies)
}

Vue.prototype.$ajax = ajax
Vue.prototype.$urlConf = urlConf
Vue.prototype.$ws = socket

const vue = new Vue({
    router,
    store,
    components: {App},
    template: '<App/>'
})

Vue.prototype.checkAuth = () => checkAuth(vue)
Vue.prototype.updateBaseUrl = (prefix) => {
    changeAjaxBaseUrl(prefix, vue)
}

addAjaxInterceptors(vue)

changeAjaxBaseUrl(vue.$cookies.get('curUrlPrefix'), vue)

checkIsAdmin(vue).then(() => {
    vue.$store.commit('updateIsAdmin', true)
}).catch(() => {
    vue.$store.commit('updateIsAdmin', false)
})

createWs(vue)

getBotApi().then(res => {
    Vue.prototype.$botApi = res.data
})

vue.$store.commit('updateIsLogin', !!vue.$cookies.get('user_id'))

// addRouterInterceptor()

// 最后再绑定页面,确保前面所有操作已经完成后,再加载页面
vue.$mount('#app')
