<template>
  <div class="text-center home-box">
<!--    <iframe src="https://discord.com/widget?id=822804024708956161&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>-->
    <el-row>
      <span v-if="isLogin">来自{{userId.split('_')[0]}}的用户:{{userId.split('_')[1]}},欢迎使用!</span>
      <span v-else>未登录</span>
    </el-row>
    <xm-info-box title="基本功能" retractable>
      <el-row>
        <el-button icon="el-icon-setting" @click="pushTo('/plugins-home')">插件设置</el-button>
        <el-button icon="el-icon-chat-round" @click="pushTo('/plugins-dict')">插件命令</el-button>
      </el-row>
      <el-row>
        <el-button type="primary" icon="el-icon-date" @click="$router.push('/calendar-pcr')">PCR活动日历</el-button>
      </el-row>
      <span>开发中...</span>
    </xm-info-box>
    <xm-info-box title="其他功能" retractable v-if="isLogin">
      <el-row>
        <el-button type="primary" icon="el-icon-thumb" @click="$router.push('/pcr-online-gacha')">PCR在线抽卡</el-button>
      </el-row>
      <el-row>
        <el-button type="primary" icon="el-icon-chat-line-square" @click="$router.push('/chat-puppet')">聊天人偶</el-button>
        <el-button type="primary" icon="el-icon-delete" :disabled="!isAdmin" @click="$router.push('/bili-dynamic')">Bili动态管理</el-button>
      </el-row>
    </xm-info-box>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {}
  },
  computed:{
    isLogin(){
      return this.$store.state.isLogin
    },
    userId(){
      return this.$cookies.get('user_id')
    },
    loginCount(){
      return this.$cookies.get('login_count')
    },
    isAdmin(){
      return this.$store.state.isAdmin
    }
  },
  methods: {
    pushTo(url) {
      this.$router.push(url)
    }
  }
}
</script>

<style scoped>
.home-box{
  padding:20px;
}

.home-box >>> .el-row{
  margin-bottom: 8px;
}
</style>
