import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const menuDict = [
  {
    title: '基础设置',
    icon: 'el-icon-setting',
    path: '/base-setting',
    name: 'base-setting',
    meta: {title: '基础设置'},
    component: () => import('../components/plugins/base/base-setting')
  },
  {
    title: '复读设置',
    icon: 'el-icon-printer',
    path: '/repeat-setting',
    name: 'repeat-setting',
    meta: {title: '复读设置'},
    component: () => import('../components/plugins/repeat/repeat-setting')
  },
  {
    title: 'Chat设置',
    icon: 'el-icon-chat-round',
    path: '/chat-setting',
    name: 'chat-setting',
    meta: {title: 'Chat设置'},
    component: () => import('../components/plugins/chat/chat-setting')
  },
  {
    title: 'RSS设置',
    icon: 'el-icon-paperclip',
    path: '/rss-setting',
    name: 'rss-setting',
    meta: {title: 'RSS设置'},
    component: () => import('../components/plugins/rss/rss-setting')
  },
  {
    title: 'Live设置',
    icon: 'el-icon-video-play',
    path: '/live-setting',
    name: 'live-setting',
    meta: {auth: true, noAuthHidden: true, title: 'Live设置'},
    component: () => import('../components/plugins/live/live-setting')
  },
  {
    title: 'プリンコネ',
    isGroup: false,
    children: [
      {
        title: '角色设置',
        icon: 'el-icon-s-custom',
        path: '/pcr/character-setting',
        name: 'pcr-character-setting',
        meta: {auth: false, title:'角色设置'},
        component: () => import('../components/plugins/gacha/pcr-character-setting')
      },
      {
        title: '卡池设置',
        icon: 'el-icon-thumb',
        path: '/pcr/pool-setting',
        name: 'pcr-pool-setting',
        meta: {auth: false, title: '卡池设置'},
        component: () => import('../components/plugins/gacha/pcr-pool-setting')
      },
      {
        title: '日历设置',
        icon: 'el-icon-date',
        path: '/pcr/calendar-setting',
        name: 'calendar-setting',
        meta: {title: '日历设置'},
        component: () => import('../components/plugins/calendar/pcr-calendar-setting')
      }
    ]
  }
]

const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/404',
    component: ()=> import('../components/404')
  },
  {
    path: '*',
    redirect: '/404'
  },
  {
    path: '/index',
    name: 'Index',
    redirect: '/home',
    component: () => import('../components/index'),
    children: [{
      path: '/home',
      name: 'Home',
      component: () => import('../components/home')
    }, {
      path: '/plugins-home',
      name: 'PluginsHome',
      redirect: '/base-setting',
      component: () => import('../components/plugins/plugins-home'),
      children: handleMenu(menuDict)
    }, {
      icon: 'el-icon-notebook-2',
      path: '/plugins-dict',
      name: 'plugins-dict',
      meta: {title: '插件命令'},
      component: () => import('../components/plugins/plugins-dict')
    }, {
      icon: 'el-icon-chat-round',
      path: '/bili-dynamic',
      name: 'bili-dynamic',
      meta: {auth: true, noAuthHidden: true, title: 'Bili动态管理'},
      component: () => import('../components/utils/bili-dynamic')
    }, {
      icon: 'el-icon-chat-line-square',
      path: '/chat-puppet',
      name: 'chat-puppet',
      meta: {auth: true, noAuthHidden: true, title: '聊天人偶'},
      component: () => import('../components/utils/socket-chat')
    }, {
      icon: 'el-icon-date',
      path: '/calendar-pcr',
      name: 'calendar-pcr',
      meta: {title: 'PCR活动日历'},
      component: () => import('../components/utils/pcr-calendar')
    },{
      icon: 'el-icon-thumb',
      path: '/pcr-online-gacha',
      name: 'pcr-online-gacha',
      meta: {title: 'PCR在线抽卡'},
      component: () => import('../components/utils/pcr-online-gacha')
    },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/admin/login')
  },
  {
    path: '/reset-pwd',
    name: 'resetPassword',
    component: () => import('../components/admin/reset-pwd')
  }
]

export const router = new Router({
  routes: routes
})

export function addRouterInterceptor() {
  router.beforeEach((to, from, next) => {
    if (to.matched.some(m => m.meta && m.meta.auth)) {
      checkAuth().then(() => next()).catch(err => next(err))
    } else {
      next()
    }
  })
}

function handleMenu(arr) {
  let menu = []
  arr.map(o => {
    if (o.children && o.children.length > 0) {
      let child = handleMenu(o.children)
      menu.push.apply(menu, child)
    } else {
      menu.push(o)
    }
  })
  return menu
}

export function checkAuth(vue) {
  return new Promise((resolve, reject) => {
    let token = vue.$cookies.get('token')
    let salt = vue.$cookies.get('salt')
    if (token && salt) {
      vue.$ajax({
        url: '/token.valid',
        params: {token: token, salt: salt}
      }).then(res => {
        if (res['code'] === 0) {
          resolve()
        } else {
          vue.$message({
            type: 'error',
            message: res['msg'],
            duration: 1000,
            onClose: () => {
              reject('/login')
            }
          })
        }
      }).catch(e => {
        reject('/index')
      })
    } else {
      vue.$message({
        type: 'error',
        message: '未登录',
        duration: 1000,
        onClose: () => {
          reject('/login')
        }
      })
    }
  })
}

export function checkIsAdmin(vue, userId) {
  return new Promise((resolve, reject) => {
    let user_id = userId ? userId : vue.$cookies.get('user_id')
    if (user_id) {
      vue.$ajax({url: '/checkIsAdmin.valid', params: {user_id: user_id}})
        .then(res => {
          if (res['code'] === 0) {
            resolve()
          } else reject()
        })
        .catch(err => {
          reject()
        })
    } else
      reject()
  })
}
