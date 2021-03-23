<template>
  <div @mouseleave="hide" @mouseenter="rightArrowShow" :class="positionClass">
    <span v-show="!urlShow">
      <span v-if="!settingShow">
        <i class="el-icon-arrow-left setting-icon" @click="settingShow=true"></i>
      </span>
      <span v-else>
        <el-tooltip content="url前缀设置" placement="top">
          <i class="el-icon-setting setting-icon" @click="urlShow=true"></i>
        </el-tooltip>
        <i class="el-icon-arrow-right setting-icon" v-show="rightShow" @click="settingShow=false"></i>
      </span>
    </span>
<!--    <transition name="fade">-->
      <el-radio-group v-model="baseUrlPrefix" v-show="urlShow" @change="prefixChanged" size="small">
        <el-tooltip :content="`默认前缀:${urlConf.base_url}`" placement="top">
          <el-radio-button label="base">base</el-radio-button>
        </el-tooltip>
        <el-tooltip :content="`开发前缀:${urlConf.dev_url}`" placement="top">
          <el-radio-button label="dev">dev</el-radio-button>
        </el-tooltip>
        <el-tooltip :content="`服务器前缀:${urlConf.pro_url}`" placement="top">
          <el-radio-button label="pro">pro</el-radio-button>
        </el-tooltip>
      </el-radio-group>
<!--    </transition>-->
  </div>
</template>

<script>
  export default {
    name: "url-prefix-conf",
    data() {
      return {
        urlConf: this.$urlConf,
        baseUrlPrefix: '',
        urlShow: false,
        settingShow: false,
        rightShow: false,
      }
    },
    computed: {
      positionClass() {
        if (this.settingShow) {
          if (this.urlShow) {
            return 'position-fixed right-10'
          } else
            return this.rightShow ? 'position-fixed right-0' : 'position-fixed right-10'
        } else {
          return 'position-fixed right-0'
        }
      }
    },
    methods: {
      prefixChanged(val) {
        this.updateBaseUrl(val)
        window.location.reload()
      },
      hide() {
        this.urlShow = false
        this.rightShow = false
      },
      rightArrowShow() {
        this.rightShow = true
      }
    },
    mounted() {
      let curUrlPrefix = this.$cookies.get('curUrlPrefix')
      this.baseUrlPrefix = curUrlPrefix ? curUrlPrefix : 'base'
    }
  }
</script>

<style scoped>
  .setting-icon {
    display: inline-block;
    cursor: pointer;
    line-height: 32px;
    font-size: 18px;
    height: 32px;
    width: 24px;
  }

  .setting-icon:hover {
    color: #ffffff;
    background-color: #66b1ff;
    border-radius: 4px;
  }

  .position-fixed {
    position: fixed;
    display: inline;
    bottom: 10px;
    text-align: center;
  }

  .right-10 {
    right: 28px
  }

  .right-0 {
    right: 0
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
