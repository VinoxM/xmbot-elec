<template>
  <el-container v-loading="loading">
    <el-header>
      <h2>XmBot</h2>
    </el-header>
    <el-main class="text-center">
      <el-card class="reset-box display-inline-block">
        <el-row><span class="reset-title">重置密码({{curUser}})</span></el-row>
        <el-form :model="resetForm" label-width="auto" :rules="rules" class="reset-form" ref="resetForm">
          <el-form-item label="新密码" prop="password">
            <el-input v-model="resetForm.password" type="password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="密码确认" prop="password_twice">
            <el-input v-model="resetForm.password_twice" type="password" placeholder="请再次输入密码"></el-input>
          </el-form-item>
        </el-form>
        <el-row>
          <el-button type="primary" icon="el-icon-check" size="small" :loading="resetLoading" @click="resetSubmit">确认
          </el-button>
        </el-row>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    name: "reset-pwd",
    data() {
      let validPwd = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('密码不能为空'))
        } else if (value.length < 6) {
          callback(new Error('密码位数不能小于6位'))
        } else {
          callback()
        }
      }
      let validPwdTwice = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('密码不能为空'))
        } else if (value !== this.resetForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      };
      return {
        loading: true,
        resetForm: {
          password: '',
          password_twice: ''
        },
        rules: {
          password: [{required: true, message: '请输入密码', trigger: 'blur'}, {validator: validPwd, trigger: 'blur'}],
          password_twice: [
            {required: true, message: '请再次输入密码', trigger: 'blur'},
            {validator: validPwdTwice, trigger: 'blur'}
          ],
        },
        resetLoading: false,
        curUser: ''
      }
    },
    methods: {
      async checkQuery(query) {
        let result = null
        if (query.hasOwnProperty('user') && query.hasOwnProperty('salt')) {
          this.curUser = query.user
          await this.$ajax({
            url: '/salt-valid',
            params: query
          }).then(res => {
            if (res['code'] === 0) {
              this.loading = false
              result = true
            } else this.errorAndToIndex(res['msg'])
          }).catch(err => {
            this.errorAndToIndex()
          })
        } else result = false
        return result
      },
      errorAndToIndex(msg) {
        this.$message({
          type: "error",
          message: `${msg},即将跳转到首页`,
          duration: 1000,
          onClose: () => {
            this.$router.push('/index')
          }
        })
      },
      resetSubmit() {
        this.resetLoading = true
        this.$refs.resetForm.validate(v => {
          if (v) {
            this.$ajax({
              url: '/reset-pwd',
              params: {user_id: this.curUser, password: this.resetForm.password}
            }).then(res => {
              this.resetLoading = false
              if (res['code'] === 0) {
                this.$cookies.remove('user_info')
                this.$cookies.remove('token')
                this.$message({
                  message: res['msg'],
                  type: 'success',
                  duration: 1000,
                  onClose: () => {
                    this.$router.push('/login')
                  }
                })
              } else {
                this.$message.error(res['msg'])
              }
            })
          } else {
            this.resetLoading = false
            this.$message.warning('表单验证未通过')
          }
        })
      }
    },
    async mounted() {
      let query = this.$route.query
      if (!await this.checkQuery(query)) {
        this.errorAndToIndex('参数不正确')
      }
    }
  }
</script>

<style scoped>
  h2 {
    text-align: center;
  }

  .reset-box {
    width: 400px;
  }

  .reset-title {
    font-size: 18px;
    line-height: 32px;
    height: 32px;
    display: inline-block;
  }

  .reset-form {
    margin-top: 15px;
    padding: 0 20px;
  }
</style>
