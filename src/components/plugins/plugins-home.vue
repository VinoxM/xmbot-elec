<template>
  <el-container>
    <el-aside width="200px" style="text-align: left">
      <el-menu router :collapse="isCollapse" :default-active="activeMenu">
        <template v-for="item in menus">
          <xm-menu-item :menu="item"></xm-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-main :style="mainStyle">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </el-main>
  </el-container>
</template>

<script>
import {menuDict} from "@/router";

export default {
  name: "plugins_home",
  data() {
    return {
      menus: menuDict,
      activeMenu: '',
      isCollapse: false,
      mainStyle: {
        maxHeight: 'auto'
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.flushRoute(to.fullPath)
    next()
  },
  methods: {
    handleResize() {
      let height = document.documentElement.clientHeight
      this.mainStyle.maxHeight = (height - 60 > 300 ? height - 60 : 300) + 'px'
    },
    flushRoute(fullPath) {
      const path = fullPath ? fullPath : this.$route.fullPath
      let flag = this.getCurrentMenu(path, this.menus)
      if (!flag) this.activeMenu = ''
    },
    getCurrentMenu(path, menus) {
      return menus.some(o => {
        if (o.path === path) {
          this.activeMenu = path
          return true
        }
        if (o.hasOwnProperty('children') && o.children && o.children.length > 0) {
          return this.getCurrentMenu(path, o.children)
        }
        return false
      })
    }
  },
  created() {
    this.flushRoute()
  },
  mounted() {
    window.addEventListener('resize', () => this.handleResize())
    this.handleResize()
  }
}
</script>

<style scoped>
.el-main {
  padding: 0 15px;
}
</style>
