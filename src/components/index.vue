<template>
  <el-container>
    <el-header height="48">
      <xm-affix :offset="0" class="text-center">
        <span class="xm-title xm-title-hover position-absolute" style="left: 15px" @click="toHome('/home')">xmBot</span>
        <span class="xm-title">{{centerTitle}}</span>
        <div class="position-absolute xm-login-box">
          <el-dropdown style="vertical-align: top" v-if="isLogin">
                              <span class="xm-title-user">
                                  {{ homeTitle }}
                                  <i class="el-icon-arrow-down el-icon--right"></i>
                              </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout(true)">切换用户</el-dropdown-item>
                <el-dropdown-item @click="handleLogout(false)">注销登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-else class="float-right xm-home-title" @click="$router.push('/login')">{{ homeTitle }}</span>
        </div>
      </xm-affix>
    </el-header>
    <el-main style="padding: 5px 0">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>

export default {
  name: "index",
  data() {
    return {
      user_id: '',
      centerTitle: ''
    }
  },
  computed: {
    isLogin() {
      return this.user_id && this.user_id !== ''
    },
    homeTitle() {
      if (this.isLogin) {
        return `${this.user_id}`
      } else {
        return '未登录'
      }
    },
  },
  beforeRouteUpdate(to, from, next){
    this.updateTitle(to)
    next()
  },
  methods: {
    updateTitle(to){
      this.centerTitle = to.meta.title
    },
    toHome(home) {
      if (this.$route.fullPath !== home) {
        this.$router.push(home)
      }
    },
    handleLogout(toLogin) {
      this.$confirm(`是否${toLogin ? '切换用户' : '注销登录'}`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$cookies.remove('token')
        this.$cookies.remove('user_id')
        this.$cookies.remove('salt')
        this.$cookies.remove('login_count')
        if (toLogin) {
          this.$router.push('/login')
        } else {
          window.location.reload()
        }
      }).catch(() => {
      })
    }
  },
  mounted() {
    let user_id = this.$cookies.get('user_id')
    if (user_id) {
      this.user_id = user_id
    }
  },
  created() {
    this.updateTitle(this.$route)
  }
}
</script>

<style scoped>
.el-header {
  padding: 0;
}

.xm-title {
  display: inline-block;
  margin: 12px 0;
  line-height: 24px;
  font-size: 18px;
  font-weight: bold;
}

.xm-title-hover:hover {
  cursor: pointer;
  color: dodgerblue;
  text-decoration: underline;
}

.xm-title-user {
  text-decoration: underline;
  display: inline-block;
  /*margin: 15px 0;*/
  line-height: 18px;
  cursor: pointer;
  color: #909399;
}

.xm-title-user:hover {
  color: #a6a9ad;
}

.xm-login-box {
  right: 5px;
  top: 0;
  margin: 8px 0;
}

.xm-home-title {
  text-decoration: underline;
  cursor: pointer;
  margin-right: 10px;
}

.xm-home-title:hover {
  color: #8c939d;
}
</style>
