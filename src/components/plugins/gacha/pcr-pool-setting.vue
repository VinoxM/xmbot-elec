<template>
  <div class="text-left">
    <div style="text-align: right" v-loading="loading">
          <span v-if="checkTop">
            <el-checkbox v-model="hidden_unsel" :label="hidden_unsel?'隐藏已选择':'显示已选择'"></el-checkbox>
            <el-checkbox v-model="prop_on" :label="prop_on?'显示概率':'隐藏概率'"></el-checkbox>
            <el-checkbox v-model="nickName_on" :label="nickName_on?'显示角色名':'隐藏角色名'"></el-checkbox>
            <el-checkbox v-model="lang_cn" :label="lang_cn?'中文昵称':'日文昵称'"></el-checkbox>
          </span>
      <span v-else class="el-icon-d-arrow-right arrow-down"
            style="transform: rotate(90deg) scaleY(2);margin-right: 10px;" @click="drawer=true"></span>
      <span style="margin-left: 20px">
          <el-button size="small" type="success" v-if="fullWidth>900" @click="getSettings">刷新角色</el-button>
          <el-button size="small" type="primary" @click="update(false)" v-if="isAdmin">保存全部</el-button>
        </span>
    </div>
    <el-tabs v-if="character" :stretch="true" v-model="activePool" v-loading="loading">
      <el-tab-pane v-for="(v,n,i) in character" :key="i" :label="poolName[n]" :name="n" class="tab-panel-box">
        <el-row style="margin-bottom: 20px;text-align: left">
          <el-button size="small" type="primary" @click="update(true)" v-if="isAdmin">保存本页</el-button>
        </el-row>
        <el-collapse v-model="activeStars[n]">
          <el-collapse-item v-for="(v1,n1,i1) in poolTitle" :key="i1" :title="v1" :name="n1" v-show="n1!=='hidden'">
            <el-divider v-if="n1==='star3'||n1==='star1'" content-position="left">常驻</el-divider>
            <div v-for="(v2,n2,i2) in character[n].normal[n1]" :class="isAdmin?'char-box':'char-box not-admin'"
                 :title="v2.name[lang]" v-show="v2.sel||(!v2.sel&&!hidden_unsel)">
              <div :class="v2.sel?'img-box':'img-box gray'">
                <el-image :style="imgWidth" @click="toggleSel(n,'normal',n1,n2)" :src="getSrc(v2,n1)" fit="fill"
                          :class="isAdmin?'cur-pointer':'cur-default'">
                  <div slot="placeholder" class="image-slot" :style="imgWidth">
                    <el-icon class="el-icon-loading"></el-icon>
                    <span>加载中</span>
                  </div>
                  <div slot="error" class="image-slot" :style="imgWidth">
                    <i class="el-icon-picture-outline"></i>
                    <span>加载失败</span>
                  </div>
                </el-image>
                <span :style="spanStyle" @click="togglePickCheck(n,'normal',n1,n2)" v-show="v2.sel"
                      :class="v2.pick_up?'pick-up pick-up-on':'pick-up pick-up-off'">Up</span>
                <span v-if="n1==='star3'" :style="spanStyle" @click="toggleFreeSt(n,'normal',n1,n2)" v-show="v2.pick_up"
                      :class="v2['free_stone']?'free-stone free-stone-on':'free-stone free-stone-off'">+100</span>
              </div>
              <span :style="{width:imgWidth.width}" v-show="nickName_on" v-text="v2.name[lang]"></span>
              <span :style="{width:imgWidth.width}" v-show="prop_on"
                    v-text="prop_computed(v2.sel,v2.pick_up,n,n1,v2.prop,v2.id)"></span>
            </div>
            <el-divider v-if="n1==='star3'||n1==='star1'" content-position="left">限定</el-divider>
            <div v-if="n1==='star3'||n1==='star1'" v-for="(v2,n2,i2) in character[n]['limited'][n1]"
                 :class="isAdmin?'char-box':'char-box not-admin'" :title="v2.name[lang]"
                 v-show="v2.sel||(!v2.sel&&!hidden_unsel)">
              <div :class="v2.sel?'img-box':'img-box gray'">
                <el-image :style="imgWidth" @click="toggleSel(n,'limited',n1,n2)" :src="getSrc(v2,n1)" fit="fill"
                          :class="isAdmin?'cur-pointer':'cur-default'">
                  <div slot="placeholder" class="image-slot" :style="imgWidth">
                    <el-icon class="el-icon-loading"></el-icon>
                    <span>加载中</span>
                  </div>
                  <div slot="error" class="image-slot" :style="imgWidth">
                    <i class="el-icon-picture-outline"></i>
                    <span>加载失败</span>
                  </div>
                </el-image>
                <span :style="spanStyle" @click="togglePickCheck(n,'limited',n1,n2)" v-show="v2.sel"
                      :class="v2.pick_up?'pick-up pick-up-on':'pick-up pick-up-off'">Up</span>
                <span v-if="n1==='star3'" :style="spanStyle" @click="toggleFreeSt(n,'limited',n1,n2)"
                      v-show="v2.pick_up"
                      :class="v2['free_stone']?'free-stone free-stone-on':'free-stone free-stone-off'">+100</span>
              </div>
              <span :style="{width:imgWidth.width}" v-show="nickName_on" v-text="v2.name[lang]"></span>
              <span :style="{width:imgWidth.width}" v-show="prop_on"
                    v-text="prop_computed(v2.sel,v2.pick_up,n,n1,v2.prop,v2.id)"></span>
            </div>
            <div v-if="n1==='hidden'" v-for="(v2,n2,i2) in character[n].hidden.star1" class="char-box not-admin"
                 :title="v2.name[lang]" v-show="v2.sel||(!v2.sel&&!hidden_unsel)">
              <div :class="v2.sel?'img-box':'img-box gray'">
                <el-image :style="imgWidth" style="cursor:not-allowed;" :src="getSrc(v2,n1)" fit="fill">
                  <div slot="placeholder" class="image-slot" :style="imgWidth">
                    <el-icon class="el-icon-loading"></el-icon>
                    <span>加载中</span>
                  </div>
                  <div slot="error" class="image-slot" :style="imgWidth">
                    <i class="el-icon-picture-outline"></i>
                    <span>加载失败</span>
                  </div>
                </el-image>
                <span v-show="v2.sel" :style="spanStyle" :class="v2.pick_up?'pick-up pick-up-on':'pick-up pick-up-off'">Up</span>
                <span v-if="n1==='star3'" :style="spanStyle" v-show="v2.pick_up"
                      :class="v2['free_stone']?'free-stone free-stone-on':'free-stone free-stone-off'">+100</span>
              </div>
              <span :style="{width:imgWidth.width}" v-show="nickName_on" v-text="v2.name[lang]"></span>
              <span :style="{width:imgWidth.width}" v-show="prop_on" v-text="v2.prop"></span>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane name="others">
        <span slot="label">
          <span v-if="poolName['others']!==''" v-text="poolName['others']"></span>
          <i v-else class="el-icon-setting"></i>
        </span>
        <el-row style="margin-bottom: 10px;text-align: left;padding: 5px 5px">
          <el-button size="small" type="primary" @click="update(true)" v-if="isAdmin">保存本页</el-button>
          <el-button size="small" type="success" v-if="fullWidth<900" @click="getSettings">刷新角色</el-button>
        </el-row>
        <el-form style="padding: 0 15px" label-width="140px" label-position="left">
          <!--          <el-form-item label="自动更新">-->
          <!--            <el-checkbox :disabled="!isAdmin" v-model="profiles.settings['auto_update']" :label="profiles.settings['auto_update']?'启用':'禁用'"></el-checkbox>-->
          <!--          </el-form-item>-->
          <el-form-item label="默认卡池">
            <el-select v-model="profiles.settings['default_pool']" :disabled="!isAdmin">
              <el-option label="日服" value="jp"></el-option>
              <el-option label="台服" value="tw"></el-option>
              <el-option label="国服" value="cn"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="抽卡上限">
            <el-input-number v-model="profiles.settings['day_limit']" :min="30" :max="12000"
                             :disabled="!isAdmin"></el-input-number>
          </el-form-item>
          <el-divider content-position="left">下井欧气反馈</el-divider>
          <el-form-item label="两个或以上UP角色">
            <xm-tags :value.sync="profiles.settings['reply_info']['r']['reply']" label="Reply"
                     :disabled="!isAdmin"></xm-tags>
          </el-form-item>
          <el-form-item label="0个UP角色">
            <xm-tags :value.sync="profiles.settings['reply_info']['r0']['reply']" label="Reply"
                     :disabled="!isAdmin"></xm-tags>
          </el-form-item>
          <el-form-item label="1到3个SSR">
            <xm-tags :value.sync="profiles.settings['reply_info']['r1']['reply']" label="Reply"
                     :disabled="!isAdmin"></xm-tags>
          </el-form-item>
          <el-form-item label="4到9个SSR">
            <xm-tags :value.sync="profiles.settings['reply_info']['r2']['reply']" label="Reply"
                     :disabled="!isAdmin"></xm-tags>
          </el-form-item>
          <el-form-item label="10个以上SSR">
            <xm-tags :value.sync="profiles.settings['reply_info']['r3']['reply']" label="Reply"
                     :disabled="!isAdmin"></xm-tags>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <el-drawer :with-header="false" :visible.sync="drawer" direction="ttb" size="110px" :modal-append-to-body="false">
      <div style="padding: 20px">
        <div class="check-box-div">
          <el-switch v-model="hidden_unsel" :active-text="hidden_unsel?'隐藏已选择':'显示已选择'"></el-switch>
          <el-switch v-model="prop_on" :active-text="prop_on?'显示概率':'隐藏概率'"></el-switch>
        </div>
        <div class="check-box-div">
          <el-switch v-model="nickName_on" :active-text="nickName_on?'显示角色名':'隐藏角色名'"></el-switch>
          <el-switch v-model="lang_cn" :active-text="lang_cn?'中文昵称':'日文昵称'"></el-switch>
        </div>
      </div>
    </el-drawer>
    <!--    <chars-view :visible.sync="charsVisible" :admin="isAdmin" :width.sync="fullWidth" v-on:close="viewClosed"></chars-view>-->
  </div>
</template>

<script>
import * as api_pcr from '../../../api/gacha-pcr'

export default {
  name: "pcr-pool-setting",
  data() {
    return {
      fullWidth: 0,
      // charsVisible:false,
      loading: true,
      imgWidth: {width: '96px', height: '96px'},
      spanStyle: {
        fontSize: "12px",
        height: "18px",
        lineHeight: "18px"
      },
      bodyStyle: {
        padding: "15px 5px"
      },
      profiles: {
        settings: null,
        pools: null,
        character: null,
      },
      nickName_on: false,
      prop_on: false,
      hidden_unsel: false,
      character: null,
      sel_normal: null,
      sel_pick_up: null,
      pool_prop: null,
      charNames: null,
      activePool: 'pool_jp',
      poolName: {
        pool_jp: "日服卡池",
        pool_tw: "台服卡池",
        pool_cn: "国服卡池",
        others: "其他设置"
      },
      activeStars: {
        pool_jp: ["star3"],
        pool_tw: ["star3"],
        pool_cn: ["star3"]
      },
      poolTitle: {
        star3: "SSR",
        star2: "SR",
        star1: "R",
        hidden: "Hidden",
      },
      drawer: false,
      checkTop: false,
      lang_cn: false,
      // inputVisible_1:false,
      // inputValue_1:"",
      // inputVisible_2:false,
      // inputValue_2:"",
      // inputVisible_3:false,
      // inputValue_3:"",
      // inputVisible_4:false,
      // inputValue_4:"",
      // inputVisible_5:false,
      // inputValue_5:"",
    }
  },
  computed: {
    suf() {
      return this.star < 3 ? 1 : 3
    },
    lang() {
      return this.lang_cn ? 1 : 0
    },
    isAdmin() {
      return this.$store.state.isAdmin
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  beforeDestroy() {
    this.handleResize()
  },
  methods: {
    handleResize: function () {
      this.fullWidth = document.documentElement.clientWidth
      if (this.fullWidth > 900) {
        this.imgWidth.width = "96px"
        this.imgWidth.height = "96px"
        this.checkTop = true
        this.spanStyle = {
          fontSize: "12px",
          height: "18px",
          lineHeight: "18px"
        }
        this.tabPosition = "top"
        this.bodyStyle.padding = "20px"
        this.poolName = {
          pool_jp: "日服卡池",
          pool_tw: "台服卡池",
          pool_cn: "国服卡池",
          others: "其他设置"
        }
      } else {
        this.imgWidth.width = "72px"
        this.imgWidth.height = "72px"
        this.checkTop = false
        this.spanStyle = {
          fontSize: "9px",
          height: "16px",
          lineHeight: "16px"
        }
        this.tabPosition = "left"
        this.bodyStyle.padding = "15px 5px"
        this.poolName = {
          pool_jp: "JP",
          pool_tw: "TW",
          pool_cn: "CN",
          others: ""
        }
      }
    },
    getSettings() {
      let _this = this
      _this.loading = true
      api_pcr.getPcrSetting().then(res => this.profiles.settings = res.data)
      api_pcr.getPcrPools().then(res => {
        _this.profiles.pools = res.data
        api_pcr.getPcrCharacter().then(r => {
          _this.profiles.character = r.data
          let pool = res.data
          let char = r.data
          let character = {
            pool_jp: {},
            pool_tw: {},
            pool_cn: {}
          }
          let charNames = {}
          let sel_normal = {
            pool_jp: {star1: [], star2: [], star3: []},
            pool_tw: {star1: [], star2: [], star3: []},
            pool_cn: {star1: [], star2: [], star3: []}
          }
          let sel_pick_up = {
            pool_jp: {star1: {}, star2: {}, star3: {}},
            pool_tw: {star1: {}, star2: {}, star3: {}},
            pool_cn: {star1: {}, star2: {}, star3: {}}
          }
          let pool_prop = {
            pool_jp: {star1: 0, star2: 0, star3: 0},
            pool_tw: {star1: 0, star2: 0, star3: 0},
            pool_cn: {star1: 0, star2: 0, star3: 0}
          }
          for (let suf in character) {
            let pickUp = {
              star1: {
                pool: {}
              },
              star2: {
                pool: {}
              },
              star3: {
                pool: {}
              },
            }
            character[suf] = JSON.parse(JSON.stringify(char))
            for (let type in pool[suf]["pools"]) {
              if (!pool[suf]["pools"].hasOwnProperty(type)) continue
              if (type.length > 6) {
                let pu = pool[suf]["pools"][type]
                let c = String(pu['prefix']).split("★").length - 1
                for (let i = 0; i < pu["pool"].length; i++) {
                  pickUp["star" + c]["pool"][pu["pool"][i]] = {
                    prop: pu["prop"] / pu["pool"].length,
                    prop_last: pu["prop_last"] / pu["pool"].length,
                    free_stone: pu["free_stone"].indexOf(pu["pool"][i]) !== -1
                  }
                }
              }
            }
            for (let type in char) {
              if (!char.hasOwnProperty(type)) continue
              for (let star in char[type]) {
                if (!char[type].hasOwnProperty(star)) continue
                for (let id in char[type][star]) {
                  if (!char[type][star].hasOwnProperty(id)) continue
                  pool_prop[suf][star] = pool[suf]["pools"][star]["prop"]
                  let sel = false
                  let prop = 0
                  let prop_last = 0
                  let pick_up = false
                  let free_stone = false
                  if (pool[suf]["pools"][star]["pool"].indexOf(id) !== -1) {
                    sel = true
                    sel_normal[suf][star].push(id)
                    let prop_ = pool[suf]["pools"][star]["prop"] / pool[suf]["pools"][star]["pool"].length
                    prop = prop_ / 10
                    let prop_last_ = pool[suf]["pools"][star]["prop_last"] / pool[suf]["pools"][star]["pool"].length
                    prop_last = prop_last_ / 10
                  } else if (pickUp[star]["pool"] && Object.keys(pickUp[star]["pool"]).indexOf(id) !== -1) {
                    sel = true
                    let prop_ = pickUp[star]["pool"][id]["prop"]
                    prop = prop_ / 10
                    let prop_last_ = pickUp[star]["pool"][id]["prop_last"]
                    prop_last = prop_last_ / 10
                    pick_up = true
                    free_stone = pickUp[star]["pool"][id]["free_stone"]
                    sel_pick_up[suf][star][id] = {
                      prop: prop.toFixed(3),
                      free_stone: free_stone
                    }
                  }
                  prop = prop.toFixed(3) + "%"
                  prop_last = prop_last.toFixed(3) + "%"
                  character[suf][type][star][id] = {
                    id: id,
                    name: char[type][star][id],
                    sel: sel,
                    prop: prop,
                    prop_last: prop_last,
                    pick_up: pick_up,
                    free_stone: free_stone
                  }
                  if (!charNames[id]) {
                    charNames[id] = char[type][star][id]
                  }
                }
              }
            }
          }
          _this.character = character
          _this.sel_normal = sel_normal
          _this.sel_pick_up = sel_pick_up
          _this.pool_prop = pool_prop
          _this.charNames = charNames
          _this.loading = false
        })
      })
    },
    prop_computed: function (sel, pick, n, n1, prop, id) {
      if (!sel) {
        return "0.000%"
      }
      if (pick) {
        return this.sel_pick_up[n][n1][id]["prop"] + "%"
      } else {
        return (this.pool_prop[n][n1] / this.sel_normal[n][n1].length / 10).toFixed(3) + '%'
      }
    },
    getSrc(v, n) {
      let curUrlPrefix = this.$cookies.get('curUrlPrefix')
      console.log()
      let urlPrefix = curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
      // let urlPrefix = this.$urlConf['base_url']
      const url = urlPrefix + 'xmbot/resource/icon/unit/' + v.id + (n === 'star3' ? '3' : '1') + '1.jpg'
      console.log(url)
      return urlPrefix + 'xmbot/resource/icon/unit/' + v.id + (n === 'star3' ? '3' : '1') + '1.jpg'
    },
    toggleSel: function (n, type, n1, n2) {
      if (!this.isAdmin) return
      this.character[n][type][n1][n2]["sel"] = !this.character[n][type][n1][n2]["sel"]
      if (!this.character[n][type][n1][n2]["sel"]) {
        if (this.character[n][type][n1][n2]["pick_up"]) {
          this.character[n][type][n1][n2]["pick_up"] = false
          delete this.sel_pick_up[n][n1][n2]
          this.handlePickProp(n, type, n1, n2)
        } else {
          let inx = this.sel_normal[n][n1].indexOf(n2)
          this.sel_normal[n][n1].splice(inx, 1)
        }
      } else {
        this.sel_normal[n][n1].push(n2)
      }
    },
    togglePickCheck: function (n, type, n1, n2) {
      if (!this.isAdmin) return
      let prop = 0
      let flag = false
      if (n1 === "star2" && !this.character[n][type][n1][n2]["pick_up"]) {
        let keys = Object.keys(this.sel_pick_up[n][n1])
        if (keys.length >= 1) {
          flag = true
          prop = 5 / (keys.length + 1)
          this.$prompt('请输入概率:', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: prop.toFixed(3),
            inputValidator: function (e) {
              if (/[0-9]*[.][0-9]{3}/.test(e)) {
                if (Number(e) - 5 < 0 && Number(e) > 0) {
                  return true
                }
              }
              return "请输入大于0,小于5的三位小数"
            }
          }).then(({value}) => {
            prop = value
            this.togglePick(n, type, n1, n2, prop)
          }).catch(() => {
          })
        }
      } else if (n1 === 'star1' && !this.character[n][type][n1][n2]["pick_up"]) {
        flag = true
        this.$prompt('请输入概率:', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: prop.toFixed(3),
          inputValidator: function (e) {
            if (/[0-9]*[.][0-9]{3}/.test(e)) {
              if (Number(e) - 12 < 0 && Number(e) > 0) {
                return true
              }
            }
            return "请输入大于0,小于12的三位小数"
          }
        }).then(({value}) => {
          prop = value
          this.togglePick(n, type, n1, n2, prop)
        }).catch(() => {
        })
      }
      if (!flag) this.togglePick(n, type, n1, n2, prop)
    },
    togglePick: function (n, type, n1, n2, prop) {
      this.character[n][type][n1][n2]["pick_up"] = !this.character[n][type][n1][n2]["pick_up"]
      if (!this.character[n][type][n1][n2]["pick_up"]) {
        this.sel_normal[n][n1].push(n2)
        this.character[n][type][n1][n2]["prop"] = Number(this.sel_pick_up[n][n1][n2]["prop"]).toFixed(3) + "%"
        this.character[n][type][n1][n2]["free_stone"] = false
        delete this.sel_pick_up[n][n1][n2]
      } else {
        let inx = (this.sel_normal[n][n1]).indexOf(n2)
        this.sel_normal[n][n1].splice(inx, 1)
        if (prop === 0) {
          this.sel_pick_up[n][n1][n2] = {prop: 0, free_stone: false}
        } else {
          this.sel_pick_up[n][n1][n2] = {prop: prop, free_stone: false}
        }
        this.character[n][type][n1][n2]["prop"] = Number(this.sel_pick_up[n][n1][n2]["prop"]).toFixed(3) + "%"
      }
      this.handlePickProp(n, type, n1, n2)
    },
    handlePickProp: function (n, type, n1, n2) {
      let keyCount = Object.keys(this.sel_pick_up[n][n1]).length
      let sel_prop_ = {normal: {star1: 795, star2: 180, star3: 25}, up: {star1: 695, star2: 130, star3: 18}}
      this.pool_prop[n][n1] = sel_prop_[keyCount > 0 ? 'up' : 'normal'][n1]
      if (n1 === "star3") {
        let prop = (7 / Object.keys(this.sel_pick_up[n][n1]).length / 10).toFixed(3)
        for (let k of Object.keys(this.sel_pick_up[n][n1])) {
          this.sel_pick_up[n][n1][k]["prop"] = prop
        }
        this.character[n][type][n1][n2]["prop"] = prop + "%"
      } else if (n1 === "star2") {
        let prop_in = 0
        let pick_up = this.character[n][type][n1][n2]["pick_up"]
        let keys = Object.keys(this.sel_pick_up[n][n1]);
        if (pick_up) {
          if (keys.length === 1) {
            prop_in = "5.000"
          } else {
            prop_in = this.sel_pick_up[n][n1][n2]["prop"]
          }
        } else {
          prop_in = 0
        }
        let prop_a = 5
        if (!pick_up) {
          prop_a = 0
          for (let e of keys) {
            prop_a += Number(this.sel_pick_up[n][n1][e]["prop"].substr(0, 5))
          }
        }
        for (let k of keys) {
          if (k !== n2) {
            let prop_pre = Number(this.sel_pick_up[n][n1][k]["prop"].substr(0, 5))
            let per = prop_pre / prop_a
            let prop_o = Number(5 - prop_in) * per
            this.sel_pick_up[n][n1][k]["prop"] = Number(prop_o).toFixed(3)
          }
        }
        if (pick_up) {
          this.sel_pick_up[n][n1][n2]["prop"] = prop_in
          this.character[n][type][n1][n2]["prop"] = prop_in + "%"
        }
      } else if (n1 === 'star1') {
        let prop_in = 0
        let pick_up = this.character[n][type][n1][n2]["pick_up"]
        let keys = Object.keys(this.sel_pick_up[n][n1]);
        if (pick_up) {
          if (keys.length === 1) {
            prop_in = "10.000"
          } else {
            prop_in = this.sel_pick_up[n][n1][n2]["prop"]
          }
        } else {
          prop_in = 0
        }
        let prop_a = 10
        if (!pick_up) {
          prop_a = 0
          for (let e of keys) {
            prop_a += Number(this.sel_pick_up[n][n1][e]["prop"].substr(0, 5))
          }
        }
        for (let k of keys) {
          if (k !== n2) {
            let prop_pre = Number(this.sel_pick_up[n][n1][k]["prop"].substr(0, 5))
            let per = prop_pre / prop_a
            let prop_o = Number(10 - prop_in) * per
            this.sel_pick_up[n][n1][k]["prop"] = Number(prop_o).toFixed(3)
          }
        }
        if (pick_up) {
          this.sel_pick_up[n][n1][n2]["prop"] = prop_in
          this.character[n][type][n1][n2]["prop"] = prop_in + "%"
        }
      }
    },
    toggleFreeSt(n, type, n1, n2) {
      if (!this.isAdmin) return
      this.sel_pick_up[n][n1][n2]["free_stone"] = !this.sel_pick_up[n][n1][n2]["free_stone"]
      this.character[n][type][n1][n2]["free_stone"] = !this.character[n][type][n1][n2]["free_stone"]
    },
    getDateNow() {
      let date = new Date()
      return (date.getFullYear()) * 100000000 + (date.getMonth() + 1) * 1000000 + (date.getDate() * 10000 + date.getHours() * 100 + date.getMinutes())
    },
    // showInput(key){
    //   this['inputVisible_'+key]=true
    //   this.$nextTick(_ => {
    //     this.$refs['saveTagInput_'+key].$refs.input.focus();
    //   });
    // },
    // inputConfirm(key,index){
    //   let inputValue = this['inputValue_'+index]
    //   if(inputValue!==''){
    //     this.profiles.settings["reply_info"][key]["reply"].push(inputValue)
    //   }
    //   this['inputVisible_'+index]=false
    //   this['inputValue_'+index]=""
    // },
    // closeReplaysTag(key,i){
    //   this.profiles.settings["reply_info"][key]["reply"].splice(i,1)
    // },
    update(isCurrent = false) {
      let now = this.getDateNow();
      this.profiles.pools.info.version = now
      if (isCurrent) {
        if (this.activePool === 'others') {
          api_pcr.savePcrSetting(this.profiles.settings).then(res => {
            if (res['code'] === 0) this.$message.success('保存成功')
            else this.$message.error(res['msg'])
          })
        } else {
          this.handlePools(this.activePool, now)
          api_pcr.savePcrPoolsSetting(this.profiles.pools).then(res => {
            if (res['code'] === 0) this.$message.success('保存成功')
            else this.$message.error(res['msg'])
          })
        }
      } else {
        for (let suf in this.poolName) {
          if (suf === "others") {
            continue
          }
          this.handlePools(suf, now)
        }
        api_pcr.saveAllPcrSetting({settings: this.profiles.settings, pools: this.profiles.pools}).then(res => {
          if (res['code'] === 0) this.$message.success('保存成功')
          else this.$message.error(res['msg'])
        })
      }
    },
    handlePools(suf, now) {
      let pools = {
        star1: {pool: [], prop: 795, prop_last: 0, name: "1星", prefix: "★"},
        star2: {pool: [], prop: 180, prop_last: 975, name: "2星", prefix: "★★"},
        star3: {pool: [], prop: 25, prop_last: 25, name: "3星", prefix: "★★★"}
      }
      for (let star in pools) {
        for (let char of this.sel_normal[suf][star]) {
          pools[star]["pool"].push(char)
        }
      }
      if (Object.keys(this.sel_pick_up[suf].star3).length > 0) {
        pools["pick_up"] = {pool: [], prop: 7, prop_last: 7, name: "Pick Up", prefix: "★★★", free_stone: []}
        for (let char in this.sel_pick_up[suf].star3) {
          if (!this.sel_pick_up[suf].star3.hasOwnProperty(char)) continue
          pools["pick_up"]["pool"].push(char)
          if (this.sel_pick_up[suf].star3[char]["free_stone"]) {
            pools["pick_up"]["free_stone"].push(char)
          }
        }
        pools.star3.prop -= 7
        pools.star3.prop_last -= 7
      }
      let i = 1;
      if (Object.keys(this.sel_pick_up[suf].star2).length > 0) {
        let char_s2 = {}
        for (let char in this.sel_pick_up[suf].star2) {
          if (!this.sel_pick_up[suf].star2.hasOwnProperty(char)) continue
          if (!char_s2[this.sel_pick_up[suf].star2[char]["prop"] * 10]) {
            char_s2[this.sel_pick_up[suf].star2[char]["prop"] * 10] = []
          }
          char_s2[this.sel_pick_up[suf].star2[char]["prop"] * 10].push(char)
        }
        for (let k in char_s2) {
          pools["pick_up" + i] = {
            pool: char_s2[k],
            prop: Number(k),
            prop_last: k * 5.4,
            name: "Pick Up",
            prefix: "★★",
            free_stone: []
          }
          i++
        }
        pools.star2.prop -= 50
        pools.star2.prop_last -= 270
      }
      if (Object.keys(this.sel_pick_up[suf].star1).length > 0) {
        let char_s1 = {}
        for (let char in this.sel_pick_up[suf].star1) {
          if (!this.sel_pick_up[suf].star1.hasOwnProperty(char)) continue
          if (!char_s1[this.sel_pick_up[suf].star1[char]["prop"] * 10]) {
            char_s1[this.sel_pick_up[suf].star1[char]["prop"] * 10] = []
          }
          char_s1[this.sel_pick_up[suf].star1[char]["prop"] * 10].push(char)
        }
        for (let k in char_s1) {
          pools["pick_up" + i] = {
            pool: char_s1[k],
            prop: Number(k),
            prop_last: 0,
            name: "Pick Up",
            prefix: "★",
            free_stone: []
          }
          i++
        }
        pools.star1.prop -= 100
      }
      this.profiles.pools[suf]["pools"] = pools
      this.profiles.pools[suf]["info"]['version'] = now
    },
    // viewClosed(changed){
    //   this.charsVisible = false
    //   if (changed){
    //     window.location.reload()
    //   }
    // }
  },
  created() {
    if (this.$route.meta.auth) {
      this.checkAuth()
          .then(() => {
            this.getSettings()
          })
          .catch(err => this.$router.push('/index'))
    } else
      this.getSettings()
  }
}
</script>

<style scoped>
.input-new-tag {
  width: 90px;
  vertical-align: bottom;
}

.button-new-tag {
  display: inline-block;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.tab-panel-box {
  padding: 5px 5px;
}

.char-box {
  display: inline-block;
  margin: 10px 10px;
  text-align: center;
}

.not-admin span.pick-up {
  cursor: default;
}

.not-admin span.free-stone {
  cursor: default;
}

.img-box {
  position: relative;
}

.img-box img {
  display: block;
  cursor: pointer;
  border-radius: 10px;
}

.char-box > span {
  display: block;
  padding: 5px 0;
  line-height: 16px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  white-space: nowrap;
}

.char-box .sel-box {
  position: absolute;
  border: solid 2px;
  border-radius: 20%;
  top: -2px;
  left: -2px;
  width: 100%;
  height: 100%;
}

.gray .el-image >>> img {
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);
  /*-ms-filter: grayscale(100%);*/
  -o-filter: grayscale(100%);
  filter: grayscale(100%);
}

.pick-up {
  cursor: pointer;
  position: absolute;
  top: 3px;
  right: 20px;
  transform: translateY(-50%) translateX(100%);
  border-radius: 10px;
  color: #fff;
  display: inline-block;
  font-size: 12px;
  height: 18px;
  line-height: 18px;
  padding: 0 6px !important;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #fff;
}

.pick-up-on {
  background-color: #f56c6c;
}

.pick-up-off {
  background-color: #CACACA;
}

.free-stone {
  cursor: pointer;
  position: absolute;
  right: 0;
  bottom: 0;
  border-radius: 8px 0 5px 0;
  color: #fff;
  display: inline-block;
  padding: 0 3px !important;
  text-align: center;
  white-space: nowrap;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
}

.free-stone-on {
  background-color: #f56c6c;
}

.free-stone-off {
  background-color: #CACACA;
}

.check-box-div {
  margin-bottom: 15px;
  text-align: center;
}

.el-form-item {
  margin-bottom: 10px;
}

.el-form-item label {
  min-width: 90px;
  text-align: left;
}

.arrow-down {
  cursor: pointer;
}

.arrow-down:hover {
  color: #ffffff;
  background-color: #66b1ff;
  border-radius: 3px;
}

.el-image {
  display: block !important;
  box-shadow: 0 0 3px 1px #606266;
  border-radius: 7px;
}

.el-image >>> img {
  border-radius: 5px;
}

.image-slot {
  display: table-cell;
  vertical-align: middle;
  box-shadow: inset 0 0 5px 1px #dedede;
}
</style>
