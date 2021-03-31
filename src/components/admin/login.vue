<template>
  <el-container v-loading="loading">
    <el-header>
      <h2><span class="xm-link" @click="$router.push('/index')">XmBot</span></h2>
    </el-header>
    <el-main class="text-center">
      <el-card class="login-box display-inline-block">
        <el-row><span class="login-title">登录</span></el-row>
        <el-form :model="loginForm" label-width="auto" :rules="rules" class="login-form" ref="loginForm">
          <el-form-item label="账户" prop="username">
            <el-input @keypress.enter.native="loginSubmit" v-model="loginForm.username" placeholder="请输入账户">
              <el-select slot="prepend" v-model="loginForm.apiName" style="width: 70px">
                <el-option v-for="(val,k) of botApi" :value="val" :label="String(val).toUpperCase()"
                           :key="k"></el-option>
              </el-select>
            </el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input @keypress.enter.native="loginSubmit" v-model="loginForm.password" type="password"
                      placeholder="请输入密码"></el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-button type="primary" icon="el-icon-check" size="small" :loading="loginLoading" @click="loginSubmit">登录
          </el-button>
          <el-tooltip placement="top" content="请私聊机器人'登录'">
            <el-link type="info" class="login-forget-link">
              <el-icon class="el-icon-question"></el-icon>
              忘记密码
            </el-link>
          </el-tooltip>
        </el-row>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      botApi: this.$botApi,
      loading: true,
      loginForm: {
        apiName: this.$botApi[0],
        username: '',
        password: '',
        list: []
      },
      rules: {
        username: [{required: true, message: '请输入账户', trigger: 'blur'}],
        password: [{required: true, message: '请输入密码', trigger: 'blur'}]
      },
      loginLoading: false
    }
  },
  methods: {
    checkQuery(query) {
      if (query.hasOwnProperty('user') && query.hasOwnProperty('salt')) {
        this.curUser = query.user
        this.$ajax({
          url: '/login.salt',
          params: query
        }).then(res => {
          if (res['code'] === 0) {
            this.loginSuccess(res)
          } else if (res['code'] > 500) {
            this.$message({
              message: res['msg'],
              type: 'error',
              duration: 1000,
              onClose: () => {
                this.$router.push('/index')
              }
            })
          } else {
            this.$message({
              message: res['msg'],
              type: 'error',
              duration: 1000,
              onClose: () => {
                this.loading = false
              }
            })
          }
        }).catch(() => {
          this.loading = false
        })
      } else {
        this.loading = false
      }
    },
    loginSubmit() {
      this.loginLoading = true
      this.$refs.loginForm.validate(v => {
        if (v) {
          this.$ajax({
            url: '/login',
            params: {
              apiName: this.loginForm.apiName,
              user_id: this.loginForm.username,
              password: this.loginForm.password
            }
          }).then(res => {
            if (res['code'] === 0) {
              this.loginSuccess(res)
            } else {
              this.loginLoading = false
              this.$message.error(res['msg'])
            }
          }).catch(() => {
            this.loginLoading = false
          })
        } else {
          this.loginLoading = false
          this.$message.warning('表单验证未通过')
        }
      })
    },
    loginSuccess(res) {
      let query = res.data
      if (res.data['login_count'] === 0) {
        this.$message({
          type: 'success',
          message: '您是首次登录,请重置密码',
          duration: 1000,
          onClose: () => {
            this.$router.push({path: '/reset-pwd', query: {user: query.user_id, salt: query.salt}})
          }
        })
      } else {
        this.$store.commit('updateIsLogin', true)
        this.$cookies.set('token', res.data.token)
        this.$cookies.set('user_id', res.data.user_id)
        this.$cookies.set('salt', res.data.salt)
        this.$cookies.set('login_count', res.data['login_count'])
        this.$message({
          type: 'success',
          message: res['msg'],
          duration: 1000,
          onClose: () => {
            this.$router.push('/index').then(() => {
              window.location.reload()
            })
          }
        })
      }
    }
  },
  mounted() {
    let query = this.$route.query
    this.checkQuery(query)
  }
}
</script>

<style scoped>
.login-box {
  max-width: 400px;
  min-width: 300px;
}

.login-title {
  font-size: 18px;
  line-height: 32px;
  height: 32px;
  display: inline-block;
}

.login-form {
  margin-top: 15px;
  padding: 0 20px;
}

.login-forget-link {
  position: absolute;
  top: 0;
  bottom: 0;
  line-height: 24px;
  height: 24px;
  margin: auto;
  right: 0;
  font-size: 12px;
}

h2 {
  text-align: center;
}
</style>
