<template>
  <el-row v-loading="loading" style="padding: 5px 0 0 0">
    <el-row style="margin-bottom: 15px">
      <el-button size="small" type="success" :loading="loading" @click="loadData">刷新</el-button>
      <el-button size="small" type="primary" :loading="saveLoading" @click="save" v-if="isAdmin">保存本页</el-button>
    </el-row>
    <el-form label-width="90px">
      <el-form-item label="复读开关">
        <el-switch v-model="setting['repeatOn']"
                   :disabled="!isAdmin"
                   active-color="#13ce66"
                   inactive-color="#ff4949"
                   active-text="启用"
                   inactive-text="禁用"></el-switch>
      </el-form-item>
      <el-form-item label="图片复读">
        <el-switch v-model="setting['imgRepeatOn']"
                   :disabled="!isAdmin"
                   active-color="#13ce66"
                   inactive-color="#ff4949"
                   active-text="启用"
                   inactive-text="禁用"></el-switch>
      </el-form-item>
      <el-form-item label="触发次数">
        <el-checkbox v-model="setting['isRandom']" :label="setting['isRandom']?'随机':'固定'" :disabled="!isAdmin"
                     style="margin-right: 10px"></el-checkbox>
        <span v-if="!setting['isRandom']">
          <el-input-number :controls="false" v-model="setting['repeatCount']" size="small" :min="2" :max="5"
                           :disabled="!isAdmin" style="width: 60px"></el-input-number>
          次
        </span>
        <span v-else>
          <el-input-number :controls="false" v-model="setting['repeatRange'][0]" size="small" :min="2"
                           :disabled="!isAdmin" :max="Number(setting['repeatRange'][1])-1" style="width: 60px"></el-input-number>
          -
          <el-input-number :controls="false" v-model="setting['repeatRange'][1]" size="small"
                           :disabled="!isAdmin" :min="Number(setting['repeatRange'][0])+1" :max="5" style="width: 60px"></el-input-number>
          次
        </span>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script>
  import * as api_repeat from '../../../api/repeat'

  export default {
    name: "repeat-setting",
    data() {
      return {
        loading: false,
        setting: {},
        saveLoading: false
      }
    },
    computed:{
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    methods: {
      save() {
        this.saveLoading = true
        api_repeat.saveRepeatSetting(this.setting).then(res=>{
          this.$message({
            message:res['msg'],
            type:res['code']===0?'success':'error'
          })
          this.saveLoading = false
        }).catch(()=>{this.saveLoading = false})
      },
      loadData(){
        this.loading = true
        api_repeat.getRepeatSetting().then(res => {
          this.loading = false
          if (res['code'] !== 0) return
          this.setting = res.data
        }).catch(() => {
        })
      }
    },
    created() {
      this.loadData()
    }
  }
</script>

<style scoped>

</style>
