<template>
  <el-row v-loading="loading" style="padding-top: 5px">
    <el-row v-if="isAdmin" style="margin-bottom: 15px">
      <el-button size="small" type="success" :loading="loading" @click="loadData">刷新</el-button>
      <el-button type="primary" size="small" @click="save">保存本页</el-button>
    </el-row>
    <xm-info-box title="Q&A" retractable style="padding-top: 20px">
      <el-row v-if="!!setting['Q&A']" v-for="(item,key) of setting['Q&A']" :key="key" class="qa-box">
        <el-col :span="2" style="height: 40px">
          <el-tag style="width: 100%;vertical-align: middle;height: 40px;line-height: 40px;text-align: center;font-size: 14px">{{item.apiName}}</el-tag>
        </el-col>
        <el-col :span="7">
          <el-input v-model="item.question" :readonly="!isAdmin"></el-input>
        </el-col>
        <el-col :span="1" class="text-center" style="line-height: 40px">
          <span style="line-height: 40px">：</span>
        </el-col>
        <el-col :span="isAdmin?12:14">
          <el-input v-model="item['answer']" :readonly="!isAdmin"></el-input>
        </el-col>
        <span v-if="isAdmin" class="text-right qa-btn">
          <el-col :span="2" class="text-right qa-btn">
            <el-button size="small" icon="el-icon-delete" type="danger" @click="delOne(key)">删除</el-button>
          </el-col>
        </span>
      </el-row>
      <el-row v-if="isAdmin">
        <el-form class="add-form" :model="form" ref="form" :rules="rules">
          <el-col :span="2">
            <el-form-item prop="apiName">
              <el-select v-model="form.apiName">
                <el-option v-for="(v,k) of botApi" :label="v" :value="v" :key="k"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item prop="question">
              <el-input v-model="form.question"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1" class="text-center" style="line-height: 40px">
            <span>：</span>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="answer">
              <el-input v-model="form['answer']"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-right qa-btn">
            <el-button size="small" icon="el-icon-plus" type="success" style="vertical-align: middle" @click="addOne">
              添加
            </el-button>
          </el-col>
        </el-form>
      </el-row>
    </xm-info-box>
  </el-row>
</template>

<script>
  import * as api_chat from '../../../api/chat'

  export default {
    name: "chat-setting",
    data() {
      const valid = (rule, value, callback) => {
        if (!this.setting['Q&A'].some(o => o.question === value)) {
          callback()
        } else {
          callback(new Error('与已有问题重复'))
        }
      }
      return {
        loading: false,
        setting: {},
        saveLoading: false,
        form: {
          apiName: '',
          question: '',
          answer: ''
        },
        rules: {
          apiName: [{required: true, message: '请选择API', trigger: 'change'}],
          question: [{required: true, message: '请输入问题', trigger: 'blur'}, {validator: valid, trigger: 'blur'}],
          answer: [{required: true, message: '请输入回答', trigger: 'blur'}]
        }
      }
    },
    computed: {
      botApi() {
        return this.$botApi
      },
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    methods: {
      delOne(index) {
        this.setting['Q&A'].splice(index, 1)
      },
      addOne() {
        this.$refs.form.validate(v => {
          if (!v) return
          this.setting['Q&A'].push(this.form)
          this.form = {
            question: '',
            answer: ''
          }
        })
      },
      save() {
        this.saveLoading = true
        api_chat.saveChatSetting(this.setting).then(res => {
          this.$message({
            message: res['msg'],
            type: res['code'] === 0 ? 'success' : 'error'
          })
          this.saveLoading = false
        }).catch(err => {
          this.saveLoading = false
        })
      },
      loadData(){
        this.loading = true
        api_chat.getChatSetting().then(res => {
          this.loading = false
          if (res['code'] !== 0) {
            this.$message.error(res['msg'])
            return
          }
          this.setting = res.data
        }).catch(() => {
          this.loading = false
        })
      }
    },
    created() {
      this.loadData()
    }
  }
</script>

<style scoped>
  .qa-box {
    margin-bottom: 10px;
  }

  .qa-btn {
    height: 40px;
    padding: 3px 0;
  }

  .add-form >>> .el-form-item {
    margin-bottom: 10px !important;
  }
</style>
