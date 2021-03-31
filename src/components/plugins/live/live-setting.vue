<template>
  <el-row v-loading="loading" style="padding-top: 5px">
    <el-row style="margin-bottom: 15px">
      <el-button size="small" type="success" :loading="loading" @click="getSettings">刷新</el-button>
      <el-button v-if="isAdmin" type="primary" size="small" :loading="saveLoading" @click="save">保存本页</el-button>
    </el-row>
    <el-form label-width="90px" ref="form" :model="setting">
      <el-form-item label="用户ID">
        <el-input v-model="setting.uid" :readonly="!isAdmin"></el-input>
      </el-form-item>
      <el-form-item label="直播间ID">
        <el-input v-model="setting['room_id']" :readonly="!isAdmin"></el-input>
      </el-form-item>
      <el-form-item label="csrf_token" v-if="isAdmin">
        <el-input v-model="setting['csrf_token']"></el-input>
      </el-form-item>
      <el-form-item label="Cookie" v-if="isAdmin">
        <el-input type="textarea" v-model="setting['cookie']" rows="5"></el-input>
      </el-form-item>
      <el-form-item label="YY房间号" v-if="isAdmin">
        <el-input v-model="setting['yy_room']"></el-input>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
  import * as api_live from '../../../api/live'

  export default {
    name: "live-setting",
    data() {
      return {
        setting: {},
        loading: false,
        saveLoading: false,
      }
    },
    computed: {
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    methods: {
      save() {
        this.saveLoading = true
        api_live.saveLiveSetting(this.setting).then(res => {
          this.$message({
            message: res['msg'],
            type: res['code'] === 0 ? 'success' : 'error'
          })
          this.saveLoading = false
        }).catch(err => {
          this.saveLoading = false
        })
      },
      getSettings() {
        this.loading = true
        api_live.getLiveSetting().then(res => {
          if (res['code'] !== 0) {
            this.loading = false
            this.$message.error(res['msg'])
            return
          }
          this.setting = res.data
          this.loading = false
        }).catch(err => {
          this.loading = false
        })
      }
    },
    created() {
      if (this.$route.meta.auth) {
        this.checkAuth()
          .then(() => {
            this.getSettings()
          })
          .catch(err => {
            this.$router.push('/index')
            this.$destroy(this.$options.name)
          })
      } else {
        this.getSettings()
      }
    }
  }
</script>

<style scoped>
</style>
