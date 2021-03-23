<template>
    <el-menu-item v-if="!hasChildren&&!menu.isGroup" :index="menu.path" :disabled="!isLogin&&menu.meta&&menu.meta.auth">
      <i :class="menu.icon&&menu.icon!==''?menu.icon:'el-icon-menu'"></i>
      <span slot="title">{{menu.title}}</span>
    </el-menu-item>
    <el-submenu v-else-if="hasChildren&&!menu.isGroup" index="">
      <template #title>
        <i :class="menu.icon&&menu.icon!==''?menu.icon:'el-icon-menu'"></i>
        <span slot="title">{{menu.title}}</span>
      </template>
      <xm-menu-item v-for="item in menu.children" :menu="item"></xm-menu-item>
    </el-submenu>
    <el-menu-item-group v-else-if="menu.isGroup">
      <span slot="title">
        <i :class="menu.icon"></i>
        <span slot="title">{{menu.title}}</span>
      </span>
      <xm-menu-item v-for="item in menu.children" :menu="item"></xm-menu-item>
    </el-menu-item-group>
</template>

<script>
    export default {
        name: "xm-menu-item",
        props: ['menu','disabled'],
        computed:{
            hasChildren(){
                return this.menu.children&&this.menu.children.length>0
            },
            isLogin(){
                return this.$store.state.isLogin
            },
            tagName(){
                if (!this.hasChildren&&!this.menu.isGroup){
                    return 'el-menu-item'
                }
                if (this.hasChildren&&!this.menu.isGroup){
                    return 'el-submenu'
                }
                if (this.menu.isGroup){
                    return 'el-menu-item-group'
                }
            }
        },
        created() {
            // console.log(this.menu)
        }
    }
</script>

<style scoped>

</style>
