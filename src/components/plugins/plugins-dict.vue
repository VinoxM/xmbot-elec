<template>
  <div v-loading="loading" class="container-box">
    <el-row class="box-header">
      <el-menu :default-active="activeMenu" @select="menuChange" mode="horizontal">
        <el-menu-item v-for="(item,key) of menu" :key="key" :index="item">{{item}}</el-menu-item>
      </el-menu>
      <el-row style="margin-top: 5px">
        <el-input placeholder="本页内筛选" v-model="search" @input="searchChange" clearable style="width: 280px;margin-right: 10px"></el-input>
        <el-radio-group v-model="isCollapse" size="small">
          <el-radio-button :label="true"><i class="el-icon-s-unfold"></i></el-radio-button>
          <el-radio-button :label="false"><i class="el-icon-menu"></i></el-radio-button>
        </el-radio-group>
      </el-row>
    </el-row>
    <el-row class="height-auto">
      <el-row v-if="activeDict&&activeDict.length>0">
        <el-collapse v-if="isCollapse">
          <el-collapse-item v-for="(item,key) of activeDict" :key="key">
            <div slot="title" class="plugins-title">
              <el-tag v-for="(i,k) of item.match" :key="k" style="margin-right: 10px">{{i}}</el-tag>
            </div>
            <el-row>
              <p>
                <span>权限(限制): </span>
                <el-tag size="small" :type="item['rules'].indexOf('admin')>-1?'danger':'info'">
                  {{item['rules'].indexOf('admin')>-1?'仅主人':'全员'}}
                </el-tag>
                <el-tag size="small" v-if="item['rules'].indexOf('group')>-1" type="success">仅群聊</el-tag>
                <el-tag size="small" v-if="item['rules'].indexOf('private')>-1" type="success">仅私聊</el-tag>
              </p>
            </el-row>
            <el-row>
              <p>
                <span>匹配规则: </span>
                <el-tag size="small" :type="item['needPrefix']?'success':'info'">匹配昵称前缀</el-tag>
                <el-tag size="small" :type="item.startWith?'success':'info'">匹配开头</el-tag>
                <el-tag v-if="item.startWith" size="small" :type="item['needReplace']?'success':'info'">去除匹配的开头
                </el-tag>
              </p>
            </el-row>
            <el-row>
              <p>
                <span>描述: </span>
                {{item.describe}}
              </p>
            </el-row>
          </el-collapse-item>
        </el-collapse>
        <div v-else>
          <el-tooltip v-for="(item,key) of activeDict" :key="key" effect="light" placement="top" class="box-tool-tip">
            <div slot="content">
              <el-row>
                <p><span>描述: </span>{{item.describe}}</p>
              </el-row>
              <el-row>
                <el-tag size="small" :type="item['needPrefix']?'success':'info'">匹配昵称前缀</el-tag>
                <el-tag size="small" :type="item.startWith?'success':'info'">匹配开头</el-tag>
                <el-tag v-if="item.startWith" size="small" :type="item['needReplace']?'success':'info'">去除匹配的开头
                </el-tag>
              </el-row>
              <el-row>
                <el-tag size="small" :type="item['rules'].indexOf('admin')>-1?'danger':'info'">
                  {{item['rules'].indexOf('admin')>-1?'仅主人':'全员'}}
                </el-tag>
                <el-tag size="small" v-if="item['rules'].indexOf('group')>-1" type="success">仅群聊</el-tag>
                <el-tag size="small" v-if="item['rules'].indexOf('private')>-1" type="success">仅私聊</el-tag>
              </el-row>
            </div>
            <el-card shadow="hover" :body-style="bodyStyle" class="box-item">
              <div style="margin: 0 auto">
                <el-tag v-for="(i,k) of item.match" :key="k" class="box-item-tag">{{i}}</el-tag>
              </div>
            </el-card>
          </el-tooltip>
        </div>
      </el-row>
      <el-row v-else class="no-more-data">
        <p>无数据</p>
      </el-row>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: "plugins-dict",
    data() {
      return {
        fullWidth: 0,
        menu: [],
        loading: true,
        dict: {},
        activeMenu: '',
        activeDict: [],
        search: '',
        isCollapse: true,
        bodyStyle: 'padding:0;text-align:center;height: 100px;display: table-cell;vertical-align: middle;width: 150px;'
      }
    },
    methods: {
      menuChange(index, indexPath) {
        this.activeDict = this.dict[index]
      },
      searchChange(val) {
        if (val === '') this.activeDict = this.dict[this.activeMenu]
        else this.activeDict = this.dict[this.activeMenu].filter(o => {
          return o.match.some(obj => {
            return obj.indexOf(val) > -1
          })
        })
      },
      handleResize:function() {
        this.fullWidth = document.documentElement.clientWidth
        this.isCollapse = this.fullWidth <= 900
      }
    },
    mounted() {
      window.addEventListener('resize', this.handleResize)
      this.handleResize()
    },
    created() {
      this.$ajax({url: '/getMatchDict.json'}).then(res => {
        if (res['code'] === 0) {
          let data = res.data
          this.menu = Object.keys(data)
          this.dict = res.data
          if (this.menu.length > 0) {
            this.activeMenu = this.menu[0]
            this.activeDict = this.dict[this.activeMenu]
          }
          this.loading = false
        } else {
          this.$message.error(res['msg'])
        }
      }).catch(err => {
        this.$message.error(err)
      })
    }
  }
</script>

<style scoped>
  .height-auto {
    overflow: auto;
    max-height: 745px;
    min-height: 400px;
  }

  .box-tool-tip {
    display: inline-block;
    margin-right: 15px;
    margin-top: 10px
  }

  .box-item {
    border-radius: 10px
  }

  .box-item-tag {
    display: inline-block
  }

  .no-more-data {
    text-align: center;
    font-size: 14px;
    color: #8c939d
  }

  .plugins-title {
    overflow: hidden;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
    white-space: nowrap;
  }

  .container-box{
    position: relative;
    padding: 90px 20px 0 20px;
    text-align: left;
  }

  .box-header{
    position: absolute;
    top: 0;
    left:0;
    width: 100%;
    padding: 0 20px;
  }

  .box-header>>>.el-menu--horizontal li{
    height: 40px;
    line-height: 40px;
  }
</style>
