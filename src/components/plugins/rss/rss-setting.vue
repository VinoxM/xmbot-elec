<template>
  <el-row v-loading="loading" class="position-relative">
    <div class="tool-btn">
      <el-button v-if="isAdmin" size="small" type="primary" @click="rssSave">保存本页</el-button>
    </div>
    <el-form v-if="!loading" :model="setting" ref="form" label-width="100px">
      <el-form-item label="初始化时间">
        <el-input-number :controls="false" size="small" v-model="setting['initial_time']['time']" style="width: 100px"
                         :disabled="!isAdmin"></el-input-number>
        <el-select v-model="setting['initial_time']['units']" style="width: 60px" size="small" :disabled="!isAdmin">
          <el-option label="时" value="hours"></el-option>
          <el-option label="分" value="minutes"></el-option>
          <el-option label="秒" value="seconds"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="循环时间">
        <el-input-number :controls="false" size="small" v-model="setting['interval']['time']" style="width: 100px"
                         :disabled="!isAdmin"></el-input-number>
        <el-select v-model="setting['interval']['units']" style="width: 60px" size="small" :disabled="!isAdmin">
          <el-option label="时" value="hours"></el-option>
          <el-option label="分" value="minutes"></el-option>
          <el-option label="秒" value="seconds"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="推送列表">
        <xm-info-box v-for="(val,key,i) of setting.push_list" :key="i" :title="String(key).toUpperCase()" retractable style="padding-top: 20px">
          <xm-info-box title="群聊" retractable :retract="val['group'].length===0">
            <xm-tags :value.sync="val['group']" :disabled="!isAdmin"></xm-tags>
          </xm-info-box>
          <xm-info-box title="私聊" retractable :retract="val['private'].length===0">
            <xm-tags :value.sync="val['private']" :disabled="!isAdmin"></xm-tags>
          </xm-info-box>
        </xm-info-box>
      </el-form-item>
      <el-form-item>
        <span slot="label">
          <span class="icon-new-label">订阅源</span>
          <i v-if="isAdmin" @click="rssAdd" class="el-icon-circle-plus-outline icon-new-button"></i>
        </span>
        <xm-info-box :editable="isAdmin" retractable v-for="(item,key) of setting.rss" :key="key"
                     :title.sync="item.title">
          <div class="tool-btn" v-if="isAdmin">
            <el-tooltip content="删除" placement="left">
              <el-link type="danger" @click="rssDel(key)"><i class="el-icon-delete-solid"></i></el-link>
            </el-tooltip>
          </div>
          <el-form label-width="80px" class="rss-form-box">
            <el-form-item label="启用" class="display-inline-block" style="width: 200px">
              <el-switch v-model="item.on" active-color="#13ce66" :disabled="!isAdmin"></el-switch>
            </el-form-item>
            <el-form-item label="启用代理" class="display-inline-block">
              <el-switch v-model="item.proxy" active-color="#13ce66" :disabled="!isAdmin"></el-switch>
            </el-form-item>
            <el-form-item label="源网址">
              <el-input v-model="item.source" :readonly="!isAdmin">
                <el-button slot="append" icon="el-icon-s-promotion" @click="sourceTest(item.source,item.proxy)"
                           :loading="testLoading">测试
                </el-button>
              </el-input>
            </el-form-item>
            <el-form-item label="键名">
              <el-input v-model="item.name" readonly></el-input>
            </el-form-item>
            <el-form-item label="关键词">
              <xm-tags :value.sync="item['name_filter']" :disabled="!isAdmin"></xm-tags>
            </el-form-item>
            <el-form-item label="提取链接">
              <el-input v-model="item['link_replace']" :readonly="!isAdmin"></el-input>
            </el-form-item>
            <el-form-item label="推送列表" class="not-margin">
              <xm-info-box v-for="(val,k,i) of item.push_list" :key="i" :title="String(k).toUpperCase()" retractable style="padding-top: 20px">
                <xm-info-box title="群聊">
                  <el-checkbox :disabled="!isAdmin"
                               :checked="val.group==='all'||!val.group instanceof Array"
                               @change="val.group=$event?'all':[]" label="全局推送"></el-checkbox>
                  <xm-tags v-if="val.group!=='all'" :value.sync="val.group"
                           :disabled="!isAdmin"></xm-tags>
                </xm-info-box>
                <xm-info-box title="私聊">
                  <el-checkbox :disabled="!isAdmin"
                               :checked="val.private==='all'||!val.private instanceof Array"
                               @change="val.private=$event?'all':[]" label="全局推送"></el-checkbox>
                  <xm-tags v-if="val.private!=='all'" :value.sync="val.private"
                           :disabled="!isAdmin"></xm-tags>
                </xm-info-box>
              </xm-info-box>
            </el-form-item>
          </el-form>
        </xm-info-box>
      </el-form-item>
    </el-form>
    <el-dialog :visible.sync="testVisible" :title="testTitle" center>
      <el-collapse class="test-box">
        <el-collapse-item title="body">
          <pre>{{testResult.body}}</pre>
        </el-collapse-item>
        <el-collapse-item title="line">
          <pre>{{testResult.line}}</pre>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
    <el-dialog :visible.sync="addVisible" title="添加RSS" center @closed="addFormInit" :close-on-click-modal="false">
      <el-form label-width="90px" :model="addForm" :rules="rules" ref="addForm">
        <el-form-item label="标题" prop="title">
          <el-input v-model="addForm.title" placeholder="输入标题"></el-input>
        </el-form-item>
        <el-form-item label="启用" class="display-inline-block" style="width: 200px">
          <el-switch v-model="addForm.on" active-color="#13ce66"></el-switch>
        </el-form-item>
        <el-form-item label="启用代理" class="display-inline-block">
          <el-switch v-model="addForm.proxy" active-color="#13ce66"></el-switch>
        </el-form-item>
        <el-form-item prop="source">
          <span slot="label" style="height: 24px;line-height: 24px">
            <el-tooltip content="网址例子:https://docs.rsshub.app/" placement="top">
              <el-link href="https://docs.rsshub.app/" target="_blank">源网址<i class="el-icon-question"></i></el-link>
            </el-tooltip>
          </span>
          <el-input v-model="addForm.source" placeholder="输入源rss网址">
            <el-button slot="append" icon="el-icon-s-promotion" @click="sourceTest(addForm.source,addForm.proxy)"
                       :loading="testLoading">测试
            </el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="键名" prop="name">
          <el-input v-model="addForm.name" placeholder="输入键名,勿与已有rss重复"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <xm-tags :value.sync="addForm['name_filter']"></xm-tags>
        </el-form-item>
        <el-form-item label="提取链接" prop="link_replace">
          <el-input v-model="addForm['link_replace']" placeholder="输入提取链接"></el-input>
        </el-form-item>
        <el-form-item label="推送列表">
          <xm-info-box v-for="(val,key,i) of addForm.push_list" :key="i" :title="String(key).toUpperCase()" retractable>
            <xm-info-box title="群聊">
              <el-checkbox :checked="val.group==='all'||!val.group instanceof Array"
                           @change="val.group=$event?'all':[]" label="全局推送"></el-checkbox>
              <xm-tags v-if="val.group!=='all'" :value.sync="val.group"
                       :disabled="!isAdmin"></xm-tags>
            </xm-info-box>
            <xm-info-box title="私聊">
              <el-checkbox :checked="val.private==='all'||!val.private instanceof Array"
                           @change="val.private=$event?'all':[]" label="全局推送"></el-checkbox>
              <xm-tags v-if="val.private!=='all'" :value.sync="val.private"
                       :disabled="!isAdmin"></xm-tags>
            </xm-info-box>
          </xm-info-box>
        </el-form-item>
      </el-form>
      <el-row class="text-center">
        <el-button size="small" type="primary" @click="addSubmit" :loading="submitLoading">提交</el-button>
        <el-button size="small" @click="addVisible=false">取消</el-button>
      </el-row>
    </el-dialog>
  </el-row>
</template>

<script>
  import * as api_rss from '../../../api/rss'

  export default {
    name: "rss-setting",
    data() {
      const botApi = this.$botApi
      let pushList = {}
      botApi.map(o=>{
        pushList[o] = {private:[],group:[]}
      })
      return {
        botApi,
        setting: {},
        loading: false,
        testLoading: false,
        testVisible: false,
        testTitle: '',
        testResult: {body: '', line: ''},
        addVisible: false,
        addForm: {
          title: '',
          on: true,
          proxy: true,
          source: '',
          name: '',
          name_filter: [],
          link_replace: '',
          push_list:pushList,
          last_id: ''
        },
        rules: {
          title: [{required: true, message: '请输入标题', trigger: 'blur'}],
          source: [{required: true, message: '请输入源网址', trigger: 'blur'}],
          name: [{required: true, message: '请输入键名', trigger: 'blur'}],
          link_replace: [{required: true, message: '请输入提取链接', trigger: 'blur'}],
        },
        submitLoading:false
      }
    },
    computed:{
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    methods: {
      sourceTest(source, proxy) {
        if (!source || source === '') return
        this.testLoading = true
        api_rss.rssSourceTest({source, proxy}).then(res => {
          if (res['code'] === 0) {
            this.testTitle = source
            this.testResult = res.data
            this.testVisible = true
          } else this.$message.error(res['msg'])
          this.testLoading = false
        }).catch(e => {
          this.testLoading = false
        })
      },
      getJsonFormat(data) {
        return data && data !== '' ? JSON.stringify(data, null, 4) : ''
      },
      rssAdd() {
        this.addVisible = true
      },
      rssDel(index) {
        this.setting.rss.splice(index,1)
      },
      addSubmit(){
        this.submitLoading = true
        this.$refs.addForm.validate(v=>{
          if (!v) {
            this.submitLoading = false
            return
          }
          this.setting.rss.push(this.addForm)
          this.addVisible = false
        })
      },
      addFormInit() {
        let pushList = {}
        this.botApi.map(o=>{
          pushList[o] = {private:[],group:[]}
        })
        this.addForm = {
          title: '',
          on: true,
          proxy: true,
          source: '',
          name: '',
          name_filter: [],
          link_replace: '',
          push_list: pushList,
          last_id: ''
        }
      },
      rssSave(){
        api_rss.saveRssSetting(this.setting).then(res=>{
          this.$message[res['code']===0?'success':'error'](res['msg'])
        })
      }
    },
    created() {
      this.loading = true
      api_rss.getRssSetting().then(res => {
        this.setting = res.data
        this.loading = false
      }).catch(e => {
      })
    }
  }
</script>

<style scoped>
  .tool-btn{
    position: absolute;
    top: 8px;
    right: 20px;
    z-index: 10;
    height: 24px;
    line-height: 24px;
  }

  .rss-form-box >>> .el-form-item:not(.not-margin) {
    margin: 10px 0;
  }

  .test-box >>> .el-collapse-item .el-collapse-item__content {
    height: 600px;
    width: 100%;
    overflow: auto;
  }

  .icon-new-label {
    line-height: 18px;
    display: inline-block;
    vertical-align: middle;
  }

  .icon-new-button {
    font-size: 18px;
    vertical-align: middle;
    cursor: pointer;
    padding: 0 3px;
  }

  .icon-new-button:hover {
    color: #66b1ff;
  }
</style>
