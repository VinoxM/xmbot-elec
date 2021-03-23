<template>
  <div :class="!retract_?'xm-info-box':'xm-info-box-retract'">
    <span :class="!retract_?'xm-info-title':'xm-info-title-retract'">
      <span @click="changeTitle"><slot name="title">{{title_}}</slot></span>
      <i v-if="retractable" @click="retract_=!retract_"
         :class="retract_?'el-icon-circle-plus-outline retract-icon':'el-icon-remove-outline retract-icon'"></i>
    </span>
    <div v-show="!retract_">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "xm-info-box",
    props: {
      title: {type: String, default: '列表'},
      editable: {type: Boolean, default: false},
      retractable: {type: Boolean, default: false},
      retract: {type:Boolean, default: false}
    },
    data() {
      return {
        title_: '',
        retract_: false
      }
    },
    watch: {
      title() {
        this.title_ = this.title
      }
    },
    methods: {
      changeTitle() {
        if (!this.editable) return
        let _title = this.title_
        this.$prompt('修改标题:', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: _title,
          inputValidator: function (e) {
            if (e !== '') {
              return true
            }
            return "请输入标题"
          }
        }).then(({value}) => {
          this.title_ = value
          this.$emit('update:title', this.title_)
        }).catch(() => {
        })
      }
    },
    created() {
      this.title_ = this.title
      this.retract_ = this.retract
    }
  }
</script>

<style scoped>
  .xm-info-box {
    position: relative;
    border: 1px solid #DCDFE6;
    padding: 10px 20px;
    border-radius: 4px;
    margin-bottom: 14px;
  }

  .xm-info-box-retract {
    position: relative;
    border-top: 1px solid #DCDFE6;
    height: 1px;
    margin-bottom: 32px;
  }

  .xm-info-title {
    position: absolute;
    background-color: white;
    top: 0;
    left: 20px;
    transform: translateY(-50%);
    line-height: 18px;
    padding: 0 5px;
  }

  .xm-info-title-retract {
    position: absolute;
    background-color: white;
    top: 0;
    left: 21px;
    transform: translateY(-50%);
    line-height: 18px;
    padding: 0 5px;
  }

  .retract-icon {
    cursor: pointer;
    font-size: 18px;
    margin-left: 5px;
    vertical-align: top;
  }

  .retract-icon:hover{
    color: #66b1ff;
  }
</style>
