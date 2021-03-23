<template>
  <el-card body-style="padding:10px 20px" shadow="hover" style="margin-bottom: 8px"
           @click.native="changeSelected(value.selected)">
    <el-row class="line-height-32" v-show="!value.retract">
      <span class="text-time-top">{{fullTime?value.item.fullTime:value.item.time}}</span>
      <span :class="fullTime?'text-ellipsis padding-long':'text-ellipsis padding-short'">{{value.item.content}}</span>
      <span style="position: absolute;right:0;top:0">
        <el-checkbox :value="value.selected" @change="changeSelected" style="margin-right: 6px"></el-checkbox>
        <i :class="value.deleting?'el-icon-loading btn-deleting':'el-icon-delete btn-icon btn-danger'"
           @click.stop="delDynamic"></i>
        <i class="el-icon-arrow-down btn-icon" @click.stop="value.retract=true" style="margin-left: 6px"></i>
      </span>
    </el-row>
    <el-row v-show="value.retract">
      <el-row class="line-height-32">
        <span class="text-time">{{fullTime?value.item.fullTime:value.item.time}}</span>
        <span style="float: right">
          <el-checkbox :value="value.selected" @change="changeSelected" style="margin-right: 6px"></el-checkbox>
          <i :class="value.deleting?'el-icon-loading btn-deleting':'el-icon-delete btn-icon btn-danger'"
             @click.stop="delDynamic"></i>
          <i class="el-icon-arrow-up btn-icon" @click.stop="value.retract=false" style="margin-left: 6px"></i>
        </span>
      </el-row>
      <p class="text-ellipsis" style="padding: 0 5px;" :title="value.item.content">{{value.item.content}}</p>
      <el-card body-style="padding:10px 20px;background-color:#f4f5f7" shadow="never"
               v-if="value.item['orig_dy_id']!==0">
        <el-row class="user-info-box-origin" v-if="value.origin">
          <div class="face-box">
            <img :src="value.origin.user['head_url']"/>
          </div>
          <span class="uname-span">{{value.origin.user.name}}</span>
          <span class="text-time">{{value.origin.item['upload_time']}}</span>
        </el-row>
        <p class="text-ellipsis" :title="value.origin?(value.origin.item.description||value.origin.item.content):''">
          {{value.item.tips||(value.origin.item.description||value.origin.item.content)}}</p>
      </el-card>
    </el-row>
  </el-card>
</template>

<script>
  export default {
    name: "bili-dynamic",
    data() {
      return {}
    },
    props: ['value', 'fullTime'],
    methods: {
      delDynamic() {
        if (!this.value.deleting) {
          this.value.deleting = true
          this.$emit('delete')
        }
      },
      changeSelected(val){
        this.value.selected = !val
        this.$emit('selected')
      }
    },
    created() {
      console.log(this.value)
    }
  }
</script>

<style scoped>
  .dynamic-box {
    margin-bottom: 8px;

  }

  .line-height-32 {
    position: relative;
    line-height: 32px;
    height: 32px;
  }

  .text-time {
    color: #99a2aa;
    font-size: 14px;
  }

  .text-time-top{
    color: #99a2aa;
    font-size: 14px;
    position: absolute;
    left: 0;
    top: 0;
  }

  .text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
  }

  .padding-short {
    padding: 0 80px 0 50px !important;
  }

  .padding-long {
    padding: 0 80px 0 140px !important;
  }

  .btn-icon {
    cursor: pointer;
    color: #8c939d;
    line-height: 32px;
  }

  .btn-danger:hover {
    color: #ff4d51 !important;
  }

  .btn-icon:hover {
    color: #8cc5ff;
  }

  .btn-deleting {
    cursor: not-allowed !important;
  }

  .user-info-box-origin {
    height: 24px;
    margin-bottom: 4px;
    position: relative;
  }

  .user-info-box-origin .face-box {
    width: 24px;
    height: 24px;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 50%;
    overflow: hidden;
  }

  .user-info-box-origin .face-box img {
    width: 24px;
    height: 24px;
  }

  .user-info-box-origin .uname-span {
    margin-left: 34px;
    line-height: 24px;
  }
</style>
