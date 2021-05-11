export const ajax = require('axios').default

const devServer = process.env["VUE_APP_DEV_SERVER"] || '127.0.0.1'
const proServer = process.env["VUE_APP_PRO_SERVER"] || '127.0.0.1'
const ajaxPort = process.env["VUE_APP_AJAX_PORT"] || 9221

export const urlConf = {
    base_url: '/',
    dev_url: `http://${devServer}:${ajaxPort}/`,
    pro_url: `http://${proServer}:${ajaxPort}/`,
}

// const defaultPrefix = 'base'
let defaultPrefix = 'dev'
// const defaultPrefix = 'pro'

const env = process.env
if (env.NODE_ENV === 'production' && !env.IS_ELECTRON) {
    defaultPrefix = 'base'
} else if (env.NODE_ENV === 'development') {
    defaultPrefix = 'dev'
} else {
    defaultPrefix = 'pro'
}

console.log(`Running ENV:[${defaultPrefix}] ${urlConf[defaultPrefix + '_url']}`)

export function changeAjaxBaseUrl(prefix, vue) {
    prefix = prefix ? prefix : defaultPrefix
    ajax.defaults.baseURL = urlConf[prefix + '_url']
    console.log(`Get ENV from cookies:[${prefix}] ${urlConf[prefix + '_url']}`)
    vue.$cookies.set('curUrlPrefix', prefix)
}

export function addAjaxInterceptors(vue) {
    ajax.interceptors.request.use(config => {
        let salt = vue.$cookies.get('salt')
        let token = vue.$cookies.get('token')
        let user_id = vue.$cookies.get('user_id')
        config.headers.token = token ? token : ''
        config.headers.salt = salt ? salt : ''
        config.headers.user_id = user_id ? user_id : ''
        // config.data = Qs.stringify(config.data)
        return config
    }, err => {
        vue.$message({
            type: 'error',
            message: '请求出错'
        })
        return Promise.reject(err)
    })

    ajax.interceptors.response.use(res => {
        if (res.data['code'] === 400 || res.data['code'] === 403) {
            vue.$message({
                type: 'error',
                message: res.data['msg'],
                duration: 1000,
                onClose: async () => {
                    await vue.$router.push('/login')
                }
            })
            return Promise.reject('')
        } else {
            return res.data
        }
    }, err => {
        vue.$message({
            type: 'error',
            message: '服务器出错'
        })
        return Promise.reject(err)
    })
}
