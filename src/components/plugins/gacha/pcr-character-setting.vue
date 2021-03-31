<template>
  <el-row :style="{height:maxHeight}">
    <el-row class="tool-nav" :style="{height:navHeight+'px'}">
      <el-input v-model="search" @input="searchChange" clearable placeholder="输入名称筛选" style="width: 50%;margin-right: 10px"></el-input>
      <br v-if="width<900"/>
      <el-checkbox-group v-model="typeFilter" size="small" class="check-box-group" @change="viewClose">
        <el-checkbox-button v-for="(val,key) of typeFilterOps" :label="val.value" :key="key">{{ val.label }}
        </el-checkbox-button>
      </el-checkbox-group>
      <br v-if="width<900"/>
      <el-checkbox-group v-model="starFilter" size="small" class="check-box-group" @change="viewClose">
        <el-checkbox-button v-for="(val,key) of starFilterOps" :label="val.value" :key="key">{{ val.label }}
        </el-checkbox-button>
      </el-checkbox-group>
      <el-tooltip content="添加角色" placement="top" style="margin-left: 10px" v-if="isAdmin">
        <el-button class="el-icon-plus" type="success" size="small" circle @click="charAdd"></el-button>
      </el-tooltip>
      <el-tooltip content="刷新" placement="top" style="margin-left: 10px" >
        <el-button class="el-icon-refresh" type="success" size="small" circle :loading="loading" @click="getNickNames"></el-button>
      </el-tooltip>
    </el-row>
    <el-row v-loading="loading" class="char-boxes"
            :style="{height:charBoxHeight}">
      <char-card class="char-card" v-for="(item,key) of nickNames_" :key="key" :width="charWidth" :value="item"
                 v-show="typeFilter.indexOf(item[0])>-1&&starFilter.indexOf(item[1])>-1"
                 v-on:char-view="charView(item)"></char-card>
    </el-row>
    <el-row class="char-view-box" v-if="itemSelected">
      <char-card :value="curItem" width="120" noClick noName></char-card>
      <div class="char-view-info-box">
        <el-row class="char-view-info-line" @click.native="rowClick([curItem[3],curItem[4]])">
          <span>{{ this.curItem[3] }}/</span>
          <span>{{ this.curItem[4] }}</span>
        </el-row>
        <el-row class="char-view-info-line">
          <el-tag :type="type[this.curItem[0]][1]" size="small">{{ type[this.curItem[0]][0] }}</el-tag>
          <span>{{ star[this.curItem[1]] }}</span>
          <span>{{ this.curItem[2] }}</span>
        </el-row>
        <el-row class="char-view-info-line" @click.native="rowClick(curItem.slice(5))">
          <span>{{ this.curItem.slice(5).join('/') }}</span>
        </el-row>
      </div>
      <div class="char-view-box-tool" v-if="isAdmin">
        <el-tooltip content="删除角色" placement="bottom">
          <el-button icon="el-icon-delete" circle size="mini" type="danger" @click="charDelete"></el-button>
        </el-tooltip>
        <el-tooltip content="编辑角色" placement="bottom">
          <el-button icon="el-icon-edit" circle size="mini" type="primary" @click="charEdit()"></el-button>
        </el-tooltip>
        <el-tooltip content="关闭" placement="bottom">
          <el-button icon="el-icon-close" circle size="mini" @click="viewClose"></el-button>
        </el-tooltip>
      </div>
    </el-row>
    <char-edit :visible.sync="editVisible" :title="charEditTitle" :value="editItem" :width="width"
               v-on:success="editSuccess"></char-edit>
  </el-row>
</template>

<script>
const charCard = {
  name: 'char-card',
  template: `
    <div style="padding:10px 10px 0 10px;display: inline-block"
         :style="{width:size+'px',height:noName?(size+'px'):(size+30+'px'),paddingBottom:noName?'10px':'0'}">
    <el-card shadow="hover" :body-style="{padding:0,height:size+'px',position:'relative'}"
             :style="{width:size+'px',display:'inline-block',borderRadius:radius_+'px',boxShadow:boxShadow}"
             @click.native="cardClick">
      <el-image :class="value[0]==='hidden'?'gray':''" :style="{width:size+'px',height:size+'px'}"
                :src="getUrl(value[1],value[2])" fit="fill"></el-image>
      <el-image v-for="i in star" :key="i" :src="getStar()" fit="fill" style="position: absolute;bottom:0"
                :style="{width:starSize+'px',height:starSize+'px',left:(i-1)*(starSize*0.6)+'px'}"></el-image>
    </el-card>
    <span
        style="display: block;text-align: center;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 20px"
        :style="{maxWidth:size+'px'}" v-if="!noName">{{ value[4] }}</span>
    </div>
  `,
  props: {
    width: [String, Number],
    radius: [String, Number],
    value: Array,
    noClick: {
      type: Boolean,
      default: false
    },
    noName: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    size() {
      if (!this.width) {
        return 120
      }
      if (typeof this.width === 'number') {
        return this.width
      }
      if (typeof this.width === 'string') {
        return this.width.endsWith('px') ? Number(this.width.replace('px', '')) : Number(this.width)
      }
    },
    radius_() {
      if (!this.radius) {
        return 8
      }
      if (typeof this.radius === 'number') {
        return this.radius
      }
      if (typeof this.radius === 'string') {
        if (this.radius.endsWith('px')) {
          return Number(this.radius.replace('px', ''))
        } else if (this.radius.endsWith('%')) {
          return Number(this.radius.replace('%', ''))
        } else
          return Number(this.radius)
      }
    },
    starSize() {
      if (!this.width) {
        return 30
      }
      if (typeof this.width === 'number') {
        return (this.width / 5).toFixed(0)
      }
      if (typeof this.width === 'string') {
        return this.width.endsWith('px') ? ((Number(this.width.replace('px', '')) / 4).toFixed(0)) : ((Number(this.width) / 4).toFixed(0))
      }
    },
    star() {
      return Number(this.value[1].replace('star', ''))
    },
    boxShadow() {
      let shadow = ''
      switch (this.value[0]) {
        case 'limited':
          shadow = '0 0 5px 2px #e6a23c !important'
          break
        case 'hidden':
          shadow = '0 0 5px 2px #e9e9eb !important'
          break
        case 'normal':
          shadow = '0 0 5px 2px #409EFF !important'
          break
      }
      return shadow
    }
  },
  methods: {
    getUrl(star, num) {
      let curUrlPrefix = this.$cookies.get('curUrlPrefix')
      let urlPrefix = curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
      return urlPrefix + 'xmbot/resource/icon/unit/' + num + (star === 'star3' ? '3' : '1') + '1.jpg'
    },
    getStar() {
      let curUrlPrefix = this.$cookies.get('curUrlPrefix')
      let urlPrefix = curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
      return urlPrefix + 'xmbot/resource/gacha/utils/star.png'
    },
    cardClick() {
      if (!this.noClick) this.$emit('char-view')
    }
  }
}
import * as api_pcr from '../../../api/gacha-pcr'
import charEdit from './pcr-character-edit'

export default {
  name: "pcr-characters",
  components: {
    'char-card': charCard,
    'char-edit': charEdit
  },
  data() {
    return {
      maxHeight: 'auto',
      width: 800,
      loading: true,
      visible_: false,
      nickNames: [],
      nickNames_: [],
      search: '',
      editVisible: false,
      curItem: null,
      itemSelected: false,
      charEditTitle: '',
      editItem: null,
      star: {star1: '一星', star2: '两星', star3: '三星'},
      type: {limited: ['限定', 'warning'], hidden: ['隐藏', 'info'], normal: ['常驻', 'primary']},
      changed: false,
      typeFilter: ['limited', 'hidden', 'normal'],
      typeFilterOps: [
        {value: 'limited', label: '限定'},
        {value: 'hidden', label: '隐藏'},
        {value: 'normal', label: '常驻'},
      ],
      starFilter: ['star1', 'star2', 'star3'],
      starFilterOps: [
        {value: 'star1', label: '一星'},
        {value: 'star2', label: '两星'},
        {value: 'star3', label: '三星'},
      ],
      navHeight: 60,
    }
  },
  watch: {
    visible(val) {
      this.visible_ = val
    },
    width(val) {
      this.navHeight = val > 900 ? 60 : 160
    },
    admin(val) {
      this.isAdmin = val
    }
  },
  computed: {
    charBoxHeight() {
      if (this.width > 900) {
        return this.itemSelected ? 'calc(100% - 220px)' : 'calc(100% - 60px)'
      } else {
        return this.itemSelected ? 'calc(100% - 320px)' : 'calc(100% - 160px)'
      }
    },
    charWidth() {
      return this.width > 900 ? 100 : 80
    },
    isAdmin() {
      return this.$store.state.isAdmin
    }
  },
  mounted() {
    window.addEventListener('resize', () => this.handleResize())
    this.handleResize()
  },
  methods: {
    handleResize() {
      let height = document.documentElement.clientHeight
      let width = document.documentElement.clientWidth
      this.width = width - 200 - 30
      this.maxHeight = (height - 60 > 300 ? height - 60 : 300) + 'px'
    },
    getNickNames() {
      this.loading = true
      api_pcr.getPcrNickNames().then(res => {
        this.nickNames = Object.values(res.data)
        this.nickNames_ = this.nickNames
        this.loading = false
      }).catch(e => {
      })
    },
    searchChange(val) {
      if (val === '') {
        this.nickNames_ = this.nickNames
      } else {
        this.nickNames_ = this.nickNames.filter(o => {
          return o.slice(2).some(obj => {
            return obj.indexOf(val) > -1
          })
        })
      }
    },
    charView(item) {
      if (this.curItem === item) {
        this.viewClose()
      } else {
        this.itemSelected = true
        this.curItem = item
      }
    },
    viewClose() {
      this.itemSelected = false
      this.curItem = null
    },
    editSuccess() {
      this.changed = true
      this.viewClose()
      this.getNickNames()
    },
    charAdd() {
      this.editVisible = true
      this.charEditTitle = '添加角色'
      this.editItem = null
    },
    charEdit() {
      this.editVisible = true
      this.charEditTitle = '编辑角色'
      this.editItem = this.curItem
    },
    charDelete() {
      this.$confirm('是否删除角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api_pcr.deletePcrCharacter({num: this.curItem[2]}).then(res => {
          if (res['code'] === 0) {
            this.changed = true
            this.$message({
              type: 'success',
              duration: 1000,
              message: res['msg'],
              onClose: () => {
                this.getNickNames()
                this.viewClose()
              }
            })
          } else {
            this.$message.error(res['msg'])
          }
        }).catch(() => {
        })
      })
    },
    drawerClose() {
      this.$emit('close', this.changed)
    },
    rowClick(arr) {
      if (this.width <= 900) {
        this.$message.info(arr.join('/'))
      }
    }
  },
  created() {
    this.getNickNames()
  }
}
</script>

<style scoped>
.chars-drawer >>> .el-drawer__body {
  overflow: hidden;
  position: relative;
}

.tool-nav {
  padding: 10px 10px 10px 10px;
  height: 60px;
}

.char-card >>> .el-card {
  cursor: pointer;
}

.char-boxes {
  overflow-y: scroll;
}

.char-view-box {
  height: 140px;
  box-shadow: 0 0 5px 1px #777777;
  position: relative;
  border-radius: 8px;
}

.char-view-info-box {
  height: 120px;
  padding: 24px 0 8px 0;
  width: calc(100% - 150px);
  display: inline-block;
  vertical-align: top;
}

.char-view-info-line {
  height: 36px;
  line-height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  white-space: nowrap;
}

.char-card >>> .gray img {
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);
  /*-ms-filter: grayscale(100%);*/
  -o-filter: grayscale(100%);
  filter: grayscale(100%);
}

.char-view-box-tool {
  position: absolute;
  top: 5px;
  right: 5px;
}

.check-box-group {
  display: inline-block;
  vertical-align: middle;
  padding: 10px 0;
}
</style>
