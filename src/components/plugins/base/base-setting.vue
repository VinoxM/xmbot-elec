<template>
  <el-row style="padding: 5px 0 0 0" v-loading="loading">
    <el-row v-if="isAdmin" style="margin-bottom: 15px">
      <el-button size="small" type="success" :loading="loading" @click="loadData">刷新</el-button>
      <el-button size="small" type="primary" @click="saveSetting" :loading="saveLoading">保存本页</el-button>
    </el-row>
    <el-form v-if="setting" label-width="120px" class="ws-form">
      <xm-info-box retractable title="Bot基本设置" style="padding-top: 20px">
        <xm-info-box retractable v-if="setting.api" v-for="(val,key,i) of setting.api" :key="i">
          <span slot="title">
            {{String(key).toUpperCase()}}
          </span>
          <el-row>
            <el-form-item label="启用API" :label-width="val.ws?'100px':''">
              <el-switch v-model="val.on"
                         :disabled="!isAdmin"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="启用"
                         inactive-text="禁用"></el-switch>
            </el-form-item>
          </el-row>
          <el-row v-if="val.token&&isAdmin">
            <el-form-item label="token" label-width="100px">
              <el-input v-model="val.token"></el-input>
            </el-form-item>
          </el-row>
          <el-row v-if="val.ws">
            <el-row>
              <el-form-item label="Host" class="ws-inline" label-width="100px">
                <el-input v-model="val.ws.host" :readonly="!isAdmin"></el-input>
              </el-form-item>
              <el-form-item label="Port" class="ws-inline" label-width="100px">
                <el-input v-model="val.ws.port" :readonly="!isAdmin"></el-input>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="API接口" class="ws-inline" label-width="100px">
                <el-switch v-model="val.ws['enableAPI']"
                           :disabled="!isAdmin"
                           active-color="#13ce66"
                           inactive-color="#ff4949"
                           active-text="启用"
                           inactive-text="禁用"></el-switch>
              </el-form-item>
              <el-form-item label="Event接口" class="ws-inline" label-width="100px">
                <el-switch v-model="val.ws['enableEvent']"
                           :disabled="!isAdmin"
                           active-color="#13ce66"
                           inactive-color="#ff4949"
                           active-text="启用"
                           inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="自动重连" class="ws-inline" label-width="100px">
                <el-switch v-model="val.ws['reconnection']"
                           :disabled="!isAdmin"
                           active-color="#13ce66"
                           inactive-color="#ff4949"
                           active-text="启用"
                           inactive-text="禁用"></el-switch>
              </el-form-item>
              <el-form-item v-if="val.ws['reconnection']" label="最大重连次数" class="ws-inline" label-width="100px">
                <el-input-number v-model="val.ws['reconnectionAttempts']" controls-position="right" style="width: 100px"
                                 :max="20" :min="5" :disabled="!isAdmin"></el-input-number>
              </el-form-item>
              <el-form-item v-if="val.ws['reconnection']" label="重连延迟" class="ws-inline" label-width="100px">
                <el-input-number v-model="val.ws['reconnectionDelay']" controls-position="right" style="width: 120px"
                                 :max="5000" :min="500" :step="100" :disabled="!isAdmin"></el-input-number>
                <span style="padding: 0 0 0 10px">ms</span>
              </el-form-item>
            </el-row>
          </el-row>
          <el-row>
            <el-form-item label="匹配前缀" class="ws-inline">
              <el-switch v-model="val['prefixOn']"
                         :disabled="!isAdmin"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="启用"
                         inactive-text="禁用"></el-switch>
            </el-form-item>
            <el-form-item v-if="val['prefixOn']" label="前缀词" class="ws-inline-last">
              <xm-tags :value.sync="val.prefix" label="Prefix" :disabled="!isAdmin"></xm-tags>
            </el-form-item>
          </el-row>
          <el-form-item label="主人QQ">
            <xm-tags :value.sync="val['master']" label="Master" :disabled="!isAdmin"></xm-tags>
          </el-form-item>
          <xm-info-box title="聊天设置" retractable>
            <el-row>
              <el-form-item label="过滤群聊" class="ws-inline" label-width="100px">
                <el-switch v-model="val['isBlackGroup']"
                           :disabled="!isAdmin"
                           active-color="#000000"
                           active-text="黑名单"
                           inactive-text="白名单"></el-switch>
              </el-form-item>
              <el-form-item v-if="val['isBlackGroup']" label="黑名单" class="ws-inline-last" label-width="100px">
                <xm-tags :value.sync="val['blackGroup']" label="Black" type="info" :disabled="!isAdmin"></xm-tags>
              </el-form-item>
              <el-form-item v-else label="白名单" class="ws-inline" label-width="100px">
                <xm-tags :value.sync="val['whiteGroup']" label="White" type="success" :disabled="!isAdmin"></xm-tags>
              </el-form-item>
            </el-row>
            <el-row>
              <el-form-item label="私聊" class="ws-inline" label-width="100px">
                <el-switch v-model="val['enablePrivate']"
                           :disabled="!isAdmin"
                           active-color="#13ce66"
                           inactive-color="#ff4949"
                           active-text="启用"
                           inactive-text="禁用"></el-switch>
              </el-form-item>
            </el-row>
          </xm-info-box>
          <el-form-item label="启动反馈主人">
            <el-switch v-model="val['readyFeedBack']"
                       :disabled="!isAdmin"
                       active-color="#13ce66"
                       inactive-color="#ff4949"
                       active-text="启用"
                       inactive-text="禁用"></el-switch>
          </el-form-item>
        </xm-info-box>
      </xm-info-box>
      <el-form-item label="代理地址">
        <el-input v-model="setting['proxy']" :readonly="!isAdmin"></el-input>
      </el-form-item>
      <el-form-item label="访问网址">
        <el-input v-model="setting['base_url']" :readonly="!isAdmin"></el-input>
      </el-form-item>
      <xm-info-box title="WebSocket 设置" retractable style="padding-top: 15px">
        <el-form-item label="Host" class="ws-inline" label-width="100px">
          <el-input v-model="setting.socket.host" :readonly="!isAdmin"></el-input>
        </el-form-item>
        <el-form-item label="Port" class="ws-inline" label-width="100px">
          <el-input v-model="setting.socket.port" :readonly="!isAdmin"></el-input>
        </el-form-item>
      </xm-info-box>
    </el-form>
  </el-row>
</template>

<script>
  import * as api_base from '../../../api/base'

  export default {
    name: "base-setting",
    data() {
      return {
        loading: true,
        setting: null,
        saveLoading: false
      }
    },
    computed: {
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    methods:{
      saveSetting(){
        this.saveLoading = true
        api_base.saveBaseSetting(this.setting).then(res=>{
          this.saveLoading = false
          this.$message({
            type: res['code'] === 0 ? 'success' : 'error',
            message: res['msg']
          })
        }).catch(()=>{
          this.saveLoading = false
        })
      },
      loadData(){
        this.loading = true
        api_base.getBaseSetting().then(res => {
          if (res['code'] === 0) {
            this.loading = false
            this.setting = res.data
          } else {
            this.$message.error(`加载失败:${res['msg']}`)
          }
        }).catch(()=>{})
      }
    },
    created() {
      this.loadData()
    }
  }
</script>

<style scoped>
  .ws-form {
    padding-top: 5px;
  }

  .ws-form >>> .ws-inline {
    vertical-align: top;
    display: inline-block;
    margin-bottom: 5px;
    width: 340px;
  }

  .ws-form >>> .ws-inline-last {
    vertical-align: top;
    display: inline-block;
    margin-bottom: 5px;
  }
</style>
