<template>
  <el-dialog :visible.sync="visible_" :title="title?title:'添加角色'" center @close="$emit('update:visible',false)"
             @closed="initForm" :width="width_"
             :close-on-click-modal="false" destroy-on-close @open="dialogOpen" :modal="true">
    <el-form :model="form" label-width="120px" ref="form" :rules="rules">
      <el-form-item prop="type" label="角色类型" :rules="[{required:true,message:'请选择角色类型',trigger:'blur'}]">
        <el-radio-group v-model="form.type" size="small">
          <el-radio-button label="normal">常驻</el-radio-button>
          <el-radio-button label="limited">限定</el-radio-button>
          <el-radio-button label="hidden">隐藏</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="star" label="角色星级" :rules="[{required:true,message:'请选择角色星级',trigger:'blur'}]">
        <el-radio-group v-model="form.star" size="small">
          <el-radio label="1">★</el-radio>
          <el-radio label="2">★★</el-radio>
          <el-radio label="3">★★★</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="num" label="数字代号" :rules="[{required:true,message:'请输入角色数字代号',trigger:'blur'}]">
        <el-input v-model="form.num" placeholder="请输入角色数字代号"></el-input>
      </el-form-item>
      <el-form-item prop="jp_name" label="日文名称" :rules="[{required:true,message:'请输入角色日文名称',trigger:'blur'}]">
        <el-input v-model="form.jp_name" placeholder="请输入角色日文名称"></el-input>
      </el-form-item>
      <el-form-item prop="cn_name" label="中文名称" :rules="[{required:true,message:'请输入角色中文名称',trigger:'blur'}]">
        <el-input v-model="form.cn_name" placeholder="请输入角色中文名称"></el-input>
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="form.nickNames" placeholder="请输入角色昵称,多个用分隔号'|'隔开"></el-input>
      </el-form-item>
      <el-form-item prop="imgUrl" label="角色预览图">
        <div v-show="uploadFile===null" class="upload-img-box" @mouseenter="imgBoxHover=true"
             @mouseleave="imgBoxHover=false">
          <el-image :src="form.imgUrl" fit="fill" class="img-view" @error="imgLoadError=true"
                    @load="imgLoadError=false">
            <div slot="placeholder" class="image-slot">
              加载中<span>...</span>
            </div>
            <div slot="error" class="image-slot">
              <span style="font-size: 12px">加载失败</span>
            </div>
          </el-image>
          <div v-show="imgBoxHover" class="upload-img-box-model">
            <el-row class="model-icon-box">
              <i class="el-icon-upload model-icon" @click="$refs.uploadInput.click()"></i>
            </el-row>
          </div>
        </div>
        <div v-show="uploadFile!=null" class="upload-img-box" @mouseenter="imgBoxHover=true"
             @mouseleave="imgBoxHover=false">
          <el-image :src="form.imgUrl" fit="fill" class="img-view"></el-image>
          <div v-show="imgBoxHover" class="upload-img-box-model">
            <el-row class="model-icon-box">
              <i class="el-icon-upload model-icon" @click="$refs.uploadInput.click()"></i>
              <i class="el-icon-delete model-icon" @click="uploadDelete"></i>
            </el-row>
          </div>
        </div>
        <span class="icon-box" v-if="width<900&&uploadFile===null">
          <i class="el-icon-upload model-icon" @click="$refs.uploadInput.click()"></i>
        </span>
        <span class="icon-box" v-if="width<900&&uploadFile!=null">
          <i class="el-icon-upload model-icon" @click="$refs.uploadInput.click()"></i>
          <i class="el-icon-delete model-icon" @click="uploadDelete"></i>
        </span>
        <input type="file" style="display: none" ref="uploadInput" accept="image/png,image/jpeg"
               @change="uploadChange"></input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="submit" icon="el-icon-check" size="small">提交</el-button>
      <el-button @click="visible_=false" size="small">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import * as api_pcr from '../../../api/gacha-pcr'

  export default {
    name: "pcr-character-add",
    props: ['visible', 'value', 'title','width'],
    data() {
      const validateImg = (rule, value, callback) => {
        if (value) {
          if (value === '') {
            callback(new Error('请上传缩略图'))
            return
          }
          if (value.startsWith('https://redive.estertion.win/icon/unit/') && this.imgLoadError) {
            callback(new Error('请上传缩略图'))
            return
          }
          callback()
        } else {
          callback()
        }
      }
      return {
        visible_: false,
        form: {
          type: 'normal',
          star: '1',
          num: '',
          jp_name: '',
          cn_name: '',
          nickNames: '',
          imgUrl: ''
        },
        imgLoadError: false,
        uploadFile: null,
        imgBoxHover: false,
        submitLoading: false,
        rules: {
          imgUrl: [{required: true, message: '请上传缩略图', trigger: 'change'}, {validator: validateImg, trigger: 'change'}]
        },
        isEdit: false,
        tempImgUrl: ''
      }
    },
    watch: {
      visible(val) {
        this.visible_ = val
      },
      'form.star'(val) {
        if (this.isEdit&&val===this.value[1].replace('star','')&&this.form.num===this.value[2]) {
          this.form.imgUrl = this.tempImgUrl
          return val
        }
        if (this.uploadFile) return val
        if (this.form.num === '') {
          this.form.imgUrl = ''
        }else {
          this.form.imgUrl = 'https://redive.estertion.win/icon/unit/' + this.form.num + (val === '3' ? '3' : '1') + '1.webp'
        }
        return val
      },
      'form.num'(val){
        if (this.isEdit&&val===this.value[2]&&this.form.star===this.value[1].replace('star','')) {
          this.form.imgUrl = this.tempImgUrl
          return val
        }
        if (this.uploadFile) return val
        if (val === '') {
          this.form.imgUrl = ''
        } else {
          this.form.imgUrl = 'https://redive.estertion.win/icon/unit/' + val + (this.form.star === '3' ? '3' : '1') + '1.webp'
        }
        return val
      },
    },
    computed:{
      width_(){
        if (this.width>900){
          return '50%'
        }else {
          return '100%'
        }
      }
    },
    methods: {
      dialogOpen() {
        if (this.value) {
          let value = this.value
          this.form = {
            type: value[0],
            star: value[1].replace('star', ''),
            num: value[2],
            jp_name: value[3],
            cn_name: value[4],
            nickNames: value.slice(5).join('|')
          }
          let curUrlPrefix = this.$cookies.get('curUrlPrefix')
          let urlPrefix = curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
          this.tempImgUrl = urlPrefix + 'xmbot/resource/icon/unit/' + value[2] + (value[1] === 'star3' ? '3' : '1') + '1.jpg'
          this.form.imgUrl = this.tempImgUrl
          this.isEdit = true
        }
      },
      initForm() {
        this.form = {
          type: 'normal',
          star: '1',
          num: '',
          jp_name: '',
          cn_name: '',
          nickNames: '',
          imgUrl: ''
        }
      },
      uploadChange(e) {
        let files = e.target.files
        if (files.length > 0 && files[0].type.substring(0, 5) === 'image') {
          this.uploadFile = files[0]
          this.form.imgUrl = URL.createObjectURL(files[0])
        } else {
          this.uploadDelete()
        }
      },
      uploadDelete() {
        this.uploadFile = null
        this.$refs.uploadInput.value = ''
        if (this.isEdit&&this.form.star===this.value[1].replace('star','')&&this.form.num===this.value[2]) {
          this.form.imgUrl = this.tempImgUrl
          return
        }
        if (this.form.num === '') {
          this.form.imgUrl = ''
        }else {
          this.form.imgUrl = 'https://redive.estertion.win/icon/unit/' + this.form.num + (this.form.star === '3' ? '3' : '1') + '1.webp'
        }
      },
      submit() {
        this.submitLoading = true
        this.$refs.form.validate((v) => {
          if (v) {
            let data = new FormData()
            data.append('type', this.form.type)
            data.append('star', 'star' + this.form.star)
            data.append('num', this.form.num)
            data.append('jp_name',this.form.jp_name)
            data.append('cn_name',this.form.cn_name)
            data.append('nickNames', this.form.nickNames.split('|'))
            data.append('isEdit',this.isEdit?1:0)
            if (!this.form.imgUrl.startsWith('https://redive.estertion.win/icon/unit/')) {
              data.append('image', this.uploadFile)
            }
            api_pcr.savePcrNickNames(data).then(res => {
              if (res['code'] === 0) {
                this.$message({
                  type: 'success',
                  message: res['msg'],
                  duration: 1000,
                  onClose: () => {
                    this.visible_ = false
                    this.$emit('success')
                  }
                })
              } else {
                this.$message({
                  type: 'error',
                  message: res['msg'],
                  duration: 1000,
                  onClose: () => {
                    this.submitLoading = false
                  }
                })
              }
            }).catch(err => {
              this.submitLoading = false
            })
          } else {
            this.$message.warning('表单验证未通过')
            this.submitLoading = false
          }
        })
      }
    }
  }
</script>

<style scoped>
  .img-view {
    text-align: center;
    width: 128px;
    height: 128px;
  }

  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
  }

  .upload-img-box {
    width: 128px;
    height: 128px;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    display: inline-block;
  }

  .upload-img-box-model {
    position: absolute;
    width: 128px;
    height: 128px;
    top: 0;
    left: 0;
    background-color: #8c939d;
    opacity: 0.6;
    text-align: center;
    display: flex;
    align-items: center;
  }

  .model-icon-box {
    display: inline-block;
    width: 128px;
    line-height: 48px;
    font-size: 20px;
  }

  .model-icon {
    cursor: pointer;
    display: inline-block;
    width: 32px;
    height: 32px;
    line-height: 32px;
    border-radius: 6px;
    color: #66b1ff;
  }

  .model-icon:hover {
    color: #ffffff;
    background-color: #66b1ff;
  }

  .icon-box{
    line-height: 48px;
    font-size: 20px;
    text-align: center;
    vertical-align: text-bottom;
  }
</style>
