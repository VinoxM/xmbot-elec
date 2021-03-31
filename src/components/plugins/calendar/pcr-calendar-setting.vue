<template>
  <el-row v-loading="loading" style="padding: 5px 0 0 0">
    <el-row v-if="isAdmin" style="margin-bottom: 15px">
      <el-button size="small" type="success" :loading="loading" @click="loadData">刷新</el-button>
      <el-button size="small" type="primary" @click="save" :loading="saveLoading">保存本页</el-button>
    </el-row>
    <el-form label-width="100px" v-if="!loading">
      <el-form-item label="获取源" style="margin-bottom: 0">
        <xm-info-box v-for="(item,key,index) in setting['calendar_source']" :key="index" :title="item.title" retractable
                     retract>
          <el-form label-width="80px">
            <el-form-item label="源URL">
              <el-input v-model="item.url" :readonly="!isAdmin">
                <el-button slot="append" icon="el-icon-s-promotion" @click="urlTest(item.url,item['needProxy'])"
                           :loading="testLoading">测试
                </el-button>
              </el-input>
            </el-form-item>
            <el-form-item label="使用代理">
              <el-switch v-model="item['needProxy']" active-color="#13ce66" :disabled="!isAdmin"></el-switch>
            </el-form-item>
            <xm-info-box title="键名" style="margin-top: 7px">
              <div class="prop-box">
                <span class="prop-label">活动名称</span>
                <el-input v-model="item.props.name" size="small" class="prop-value" :readonly="!isAdmin"></el-input>
              </div>
              <div class="prop-box">
                <span class="prop-label">开始时间</span>
                <el-input v-model="item.props['start_time']" size="small" class="prop-value"
                          :readonly="!isAdmin"></el-input>
              </div>
              <div class="prop-box">
                <span class="prop-label">结束时间</span>
                <el-input v-model="item.props['end_time']" size="small" class="prop-value"
                          :readonly="!isAdmin"></el-input>
              </div>
            </xm-info-box>
          </el-form>
        </xm-info-box>
      </el-form-item>
      <el-form-item label="默认区服">
        <el-select v-model="setting['default_area']" :disabled="!isAdmin">
          <el-option v-for="(item,key,index) in setting['calendar_source']" :key="index" :label="item.title"
                     :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="推送列表">
        <xm-info-box v-for="(val,key,i) of setting.push_list" :key="i" retractable :title="String(key).toUpperCase()" style="padding-top: 20px">
          <xm-info-box title="群组" retractable :retract="val.group.length===0">
            <xm-tags :disabled="!isAdmin" :value.sync="val.group" label="Group"></xm-tags>
          </xm-info-box>
          <xm-info-box title="私聊" retractable :retract="val['private'].length===0">
            <xm-tags :disabled="!isAdmin" :value.sync="val['private']" label="Private"></xm-tags>
          </xm-info-box>
        </xm-info-box>
      </el-form-item>
      <el-form-item>
        <span slot="label">
          <span class="icon-new-label">推送规则</span>
          <i v-if="isAdmin" @click="ruleVisible=true" class="el-icon-circle-plus-outline icon-new-button"></i>
        </span>
        <xm-info-box v-for="(item,key) of setting['rules']" :key="key" :title="item.title" retractable retract editable>
          <div class="tool-btn" v-if="isAdmin">
            <el-tooltip content="删除" placement="left">
              <el-link type="danger" @click="ruleDel(key)"><i class="el-icon-delete-solid"></i></el-link>
            </el-tooltip>
          </div>
          <el-form label-width="80px">
            <el-form-item label="开启" class="display-inline-block" style="margin-right: 20px">
              <el-switch :disabled="!isAdmin" v-model="item.on" active-color="#13ce66"></el-switch>
            </el-form-item>
            <el-form-item label="刷新日历" class="display-inline-block">
              <el-switch :disabled="!isAdmin" v-model="item.needFlush" active-color="#13ce66"></el-switch>
            </el-form-item>
            <el-form-item label="键名" class="display-inline-block">
              <el-input v-model="item.name" readonly style="width: 160px"></el-input>
            </el-form-item>
            <el-form-item label="关键词">
              <xm-tags :disabled="!isAdmin" type="info" :value.sync="item['filter']" label="Filter"></xm-tags>
            </el-form-item>
            <el-form-item label="推送类型">
              <el-select :disabled="!isAdmin" v-model="item.type" size="small" style="width: 120px">
                <el-option value="yesterday" label="昨日活动"></el-option>
                <el-option value="today" label="今日活动"></el-option>
                <el-option value="tomorrow" label="明日活动"></el-option>
                <el-option value="lastWeek" label="上周活动"></el-option>
                <el-option value="thisWeek" label="本周活动"></el-option>
                <el-option value="nextWeek" label="下周活动"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="推送" style="margin-top: 10px">
              <xm-info-box v-for="(val,t,i) of item.push_list" :key="i" retractable :title="String(t).toUpperCase()" style="padding-top: 20px">
                <xm-info-box title="群聊" retractable>
                  <el-checkbox :disabled="!isAdmin" :checked="val.group==='all'"
                               @change="val.group = $event?'all':[]">全局推送
                  </el-checkbox>
                  <xm-tags :disabled="!isAdmin" v-if="val.group!=='all'"
                           :value.sync="val.group"
                           label="Group"></xm-tags>
                </xm-info-box>
                <xm-info-box title="私聊" retractable style="margin-bottom: 10px">
                  <el-checkbox :disabled="!isAdmin" :checked="val['private']==='all'"
                               @change="val['private'] = $event?'all':[]">全局推送
                  </el-checkbox>
                  <xm-tags :disabled="!isAdmin" v-if="val['private']!=='all'"
                           :value.sync="val['private']"
                           label="Private"></xm-tags>
                </xm-info-box>
              </xm-info-box>
            </el-form-item>
            <xm-info-box title="推送时间" retractable retract style="margin: 10px 0 10px 0">
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('year')" label="年"
                             @change="timeCheck($event,item,key,'year')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['year']" :value.sync="item.time['year']" label="Year"
                         :disabled="!isAdmin"></xm-tags>
              </el-row>
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('month')" label="月"
                             @change="timeCheck($event,item,key,'month')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['month']" :value.sync="item.time['month']" label="Month"
                         :disabled="!isAdmin"></xm-tags>
              </el-row>
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('date')" label="日"
                             @change="timeCheck($event,item,key,'date')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['date']" :value.sync="item.time['date']" label="Date"
                         :disabled="!isAdmin"></xm-tags>
              </el-row>
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('dayOfWeek')" label="星期"
                             @change="timeCheck($event,item,key,'dayOfWeek')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['dayOfWeek']" :value.sync="item.time['dayOfWeek']"
                         label="DayOfWeek" :disabled="!isAdmin"></xm-tags>
              </el-row>
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('hour')" label="时"
                             @change="timeCheck($event,item,key,'hour')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['hour']" :value.sync="item.time['hour']" label="Hour"
                         :disabled="!isAdmin"></xm-tags>
              </el-row>
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('minute')" label="分"
                             @change="timeCheck($event,item,key,'minute')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['minute']" :value.sync="item.time['minute']" label="Minute"
                         :disabled="!isAdmin"></xm-tags>
              </el-row>
              <el-row>
                <el-checkbox :checked="item.time.hasOwnProperty('second')" label="秒"
                             @change="timeCheck($event,item,key,'second')" :disabled="!isAdmin"></el-checkbox>
                <xm-tags v-if="!!item.time['second']" :value.sync="item.time['second']" label="Second"
                         :disabled="!isAdmin"></xm-tags>
              </el-row>
            </xm-info-box>
          </el-form>
        </xm-info-box>
      </el-form-item>
    </el-form>
    <el-dialog :visible.sync="testVisible" :title="testForm.url" center :close-on-click-modal="false"
               @closed="testForm={url:'',json:''}">
      <el-collapse>
        <el-collapse-item title="JSON">
          <pre style="max-height: 500px;overflow: auto">
            {{testForm.json}}
          </pre>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
    <el-dialog :visible.sync="ruleVisible" title="新增推送规则" center :close-on-click-modal="false" @closed="initRuleForm">
      <el-form label-width="90px" :model="ruleForm" ref="ruleForm" :rules="rules">
        <el-form-item label="标题" prop="title">
          <el-input v-model="ruleForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="开启" class="display-inline-block" style="margin-right: 20px" prop="on">
          <el-switch v-model="ruleForm.on" active-color="#13ce66"></el-switch>
        </el-form-item>
        <el-form-item label="刷新日历" class="display-inline-block" prop="needFlush">
          <el-switch v-model="ruleForm.needFlush" active-color="#13ce66"></el-switch>
        </el-form-item>
        <el-form-item label="键名" class="display-inline-block" prop="name">
          <el-input v-model="ruleForm.name" style="width: 160px" placeholder="请输入键名"></el-input>
        </el-form-item>
        <el-form-item label="关键词">
          <xm-tags type="info" :value.sync="ruleForm['filter']" label="Filter"></xm-tags>
        </el-form-item>
        <el-form-item label="推送类型" prop="type" placeholder="请选择推送类型">
          <el-select v-model="ruleForm.type" size="small" style="width: 120px">
            <el-option value="yesterday" label="昨日活动"></el-option>
            <el-option value="today" label="今日活动"></el-option>
            <el-option value="tomorrow" label="明日活动"></el-option>
            <el-option value="lastWeek" label="上周活动"></el-option>
            <el-option value="thisWeek" label="本周活动"></el-option>
            <el-option value="nextWeek" label="下周活动"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="推送" style="margin-top: 25px">
          <xm-info-box v-for="(val,t,i) of ruleForm.push_list" :key="i" retractable :title="String(t).toUpperCase()" style="padding-top: 20px">
            <xm-info-box title="群聊" retractable>
              <el-checkbox :checked="val.group==='all'"
                           @change="val.group = $event?'all':[]">全局推送
              </el-checkbox>
              <xm-tags v-if="val.group!=='all'"
                       :value.sync="val.group"
                       label="Group"></xm-tags>
            </xm-info-box>
            <xm-info-box title="私聊" retractable style="margin-bottom: 10px">
              <el-checkbox :checked="val['private']==='all'"
                           @change="val['private'] = $event?'all':[]">全局推送
              </el-checkbox>
              <xm-tags v-if="val['private']!=='all'"
                       :value.sync="val['private']"
                       label="Private"></xm-tags>
            </xm-info-box>
          </xm-info-box>
        </el-form-item>
        <el-form-item prop="time" label-width="0">
          <xm-info-box title="推送时间" retractable retract style="margin: 10px 0 10px 0">
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('year')" label="年"
                           @change="formTimeCheck($event,ruleForm,'year')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['year']" :value.sync="ruleForm.time['year']" label="Year"></xm-tags>
            </el-row>
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('month')" label="月"
                           @change="formTimeCheck($event,ruleForm,'month')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['month']" :value.sync="ruleForm.time['month']" label="Month"></xm-tags>
            </el-row>
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('date')" label="日"
                           @change="formTimeCheck($event,ruleForm,'date')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['date']" :value.sync="ruleForm.time['date']" label="Date"></xm-tags>
            </el-row>
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('dayOfWeek')" label="星期"
                           @change="formTimeCheck($event,ruleForm,'dayOfWeek')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['dayOfWeek']" :value.sync="ruleForm.time['dayOfWeek']"
                       label="DayOfWeek"></xm-tags>
            </el-row>
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('hour')" label="时"
                           @change="formTimeCheck($event,ruleForm,'hour')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['hour']" :value.sync="ruleForm.time['hour']" label="Hour"></xm-tags>
            </el-row>
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('minute')" label="分"
                           @change="formTimeCheck($event,ruleForm,'minute')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['minute']" :value.sync="ruleForm.time['minute']" label="Minute"></xm-tags>
            </el-row>
            <el-row>
              <el-checkbox :checked="ruleForm.time.hasOwnProperty('second')" label="秒"
                           @change="formTimeCheck($event,ruleForm,'second')"></el-checkbox>
              <xm-tags v-if="!!ruleForm.time['second']" :value.sync="ruleForm.time['second']" label="Second"></xm-tags>
            </el-row>
          </xm-info-box>
        </el-form-item>
      </el-form>
      <el-row class="text-center">
        <el-button size="small" type="primary" :loading="addLoading" @click="ruleAdd">保存</el-button>
        <el-button size="small" @click="ruleVisible=false">取消</el-button>
      </el-row>
    </el-dialog>
  </el-row>
</template>

<script>
  import * as api_pcr from '../../../api/calendar-pcr'

  export default {
    name: "pcr-calendar",
    data() {
      const valid = (rule, value, callback) => {
        let keys = Object.keys(value)
        if (keys.length>0){
          let flag = false
          for (let key of keys) {
            if (value[key].length > 0) flag = true
          }
          if (!flag) callback(new Error('请输入至少一个'))
          else callback()
        }else{
          callback(new Error('请选择至少一个'))
        }
      }
      const botApi = this.$botApi
      let pushList = {}
      botApi.map(o=>{
        pushList[o] = {private:[],group:[]}
      })
      return {
        botApi,
        setting: {},
        loading: true,
        saveLoading: false,
        testLoading: false,
        testForm: {
          url: '',
          json: ''
        },
        testVisible: false,
        ruleVisible: false,
        ruleForm: {
          on: false,
          title: '',
          type: '',
          name: '',
          time: {},
          filter: [],
          push_list: pushList,
          needFlush: false
        },
        rules: {
          title: [{required: true, message: '请输入标题', trigger: 'blur'}],
          type: [{required: true, message: '请选择推送类型', trigger: 'blur'}],
          name: [{required: true, message: '请输入键名', trigger: 'blur'}],
          time: [{validator: valid, trigger: 'change'}]
        },
        addLoading:false
      }
    },
    computed: {
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    methods: {
      timeCheck(val, item, index, key) {
        let setting_ = JSON.parse(JSON.stringify(this.setting))
        if (val) {
          setting_.rules[index].time[key] = []
        } else {
          delete setting_.rules[index].time[key]
        }
        this.setting = setting_
      },
      formTimeCheck(val, item, key) {
        let setting_ = JSON.parse(JSON.stringify(this.ruleForm))
        if (val) {
          setting_.time[key] = []
        } else {
          delete setting_.time[key]
        }
        this.ruleForm = setting_
      },
      save() {
        this.saveLoading = true
        api_pcr.savePcrSetting(this.setting).then(res => {
          this.saveLoading = false
          this.$message({
            type: res['code'] === 0 ? 'success' : 'error',
            message: res['msg']
          })
        }).catch(() => {
          this.saveLoading = false
        })
      },
      urlTest(url, needProxy) {
        if (url === '') return
        this.testLoading = true
        api_pcr.calendarTest(url, needProxy).then(res => {
          this.testLoading = false
          if (res['code'] === 0) {
            this.testVisible = true
            this.testForm = {url: url, json: JSON.stringify(res['data'], null, 4)}
          } else
            this.$message.error(res['msg'])
        }).catch(() => {
          this.testLoading = false
        })
      },
      initRuleForm() {
        let pushList = {}
        this.botApi.map(o=>{
          pushList[o] = {private:[],group:[]}
        })
        this.ruleForm = {
          on: false,
          title: '',
          type: '',
          name: '',
          time: {},
          filter: [],
          push_list: pushList,
          needFlush: false
        }
        this.$refs.ruleForm.clearValidate()
      },
      ruleAdd(){
        this.addLoading = true
        this.$refs.ruleForm.validate(v=>{
          this.addLoading = false
          if(!v) return
          this.setting.rules.push(this.ruleForm)
          this.ruleVisible = false
        })
      },
      ruleDel(key){
        this.setting.rules.splice(key,1)
      },
      loadData(){
        this.loading = true
        api_pcr.getPcrSetting().then(res => {
          this.loading = false
          if (res['code'] === 0) this.setting = res.data
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
  .prop-box {
    display: inline-block;
    padding-right: 10px;
  }

  .prop-label:after {
    content: ":";
  }

  .prop-value {
    width: 160px;
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

  .tool-btn{
    position: absolute;
    top: 8px;
    right: 20px;
    z-index: 10;
    height: 24px;
    line-height: 24px;
  }
</style>
