<template>
  <el-row>
    <el-drawer direction="ttb" :visible.sync="visible">
      <el-form class="form-box" label-width="80px" size="small">
        <el-form-item label="用户ID">
          <el-input v-model="form.uid"></el-input>
        </el-form-item>
        <el-form-item label="Csrf">
          <el-input v-model="form['csrf']"></el-input>
        </el-form-item>
        <el-form-item label="Cookie">
          <el-input v-model="form.cookie" type="textarea" rows="4" resize="none"></el-input>
        </el-form-item>
      </el-form>
    </el-drawer>
    <el-row class="search-tool-bar">
      <div style="position: absolute;left: 10px;top: 0">
        <el-button icon="el-icon-setting" size="small" @click="visible=true"></el-button>
        <el-button size="small" type="primary" @click="searchDynamic(0)" style="margin-right: 10px"
                   :loading="isSearching"
                   icon="el-icon-search">Search
        </el-button>
        <el-switch active-text="显示完整时间" inactive-text="只显示日期" v-model="fullTime"></el-switch>
      </div>
      <div class="user-info-box" v-if="userInfo.uid||userInfo.mid">
        <div class="face-box">
          <img :src="getFaceSrc()"/>
        </div>
        <span class="uname-span">{{userInfo.uname||userInfo.name}}</span>
      </div>
      <span class="search-tool-btn" v-if="userInfo.uid||userInfo.mid">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" style="margin-right: 10px"
                       @change="changeCheckAll"></el-checkbox>
          <i :class="deleting?'el-icon-loading btn-deleting':'el-icon-delete btn-danger'" @click="deleteAll"></i>
          <span class="search-expand-btn" style="margin-left: 5px">
            <i class="el-icon-arrow-up" @click="retractAll(false)"></i>
            <i class="el-icon-arrow-down" @click="retractAll(true)"></i>
          </span>
        </span>
    </el-row>
    <el-row style="position: relative">
      <el-row class="dynamic-box">
        <xm-dynamic v-for="(val,key) of dynamic" :key="key" :value.sync="val" :full-time="fullTime"
                    @selected="changeIndeterminate"
                    @delete="delOneDynamic(val,key)"></xm-dynamic>
        <el-row style="text-align: center" v-if="form.offsetId!==0">
          <el-link v-if="hasMore" :disabled="isSearching" @click="searchDynamic">加载更多</el-link>
          <el-link v-else disabled>没有更多</el-link>
        </el-row>
      </el-row>
      <el-backtop target=".dynamic-box" style="position: absolute;right: 10px;bottom: 10px"></el-backtop>
    </el-row>
  </el-row>
</template>

<script>
  import * as api_live from '../../api/live'
  import biliDynamic from './templ-dynamic-box'

  export default {
    name: "bili-dynamic",
    components: {
      'xm-dynamic': biliDynamic
    },
    data() {
      return {
        visible: false,
        loading: false,
        form: {
          uid: null,
          cookie: null,
          csrf: null,
          offsetId: 0
        },
        dynamic: [],
        hasMore: true,
        isSearching: false,
        fullTime: false,
        deleting: false,
        checkAll: false,
        isIndeterminate: false
      }
    },
    computed: {
      userInfo() {
        if (this.dynamic.length > 0) {
          return this.dynamic[0].user
        } else return {face: null, uname: null, uid: null}
      },
      urlPrefix() {
        let curUrlPrefix = this.$cookies.get('curUrlPrefix')
        return curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
      }
    },
    methods: {
      getSettings() {
        this.loading = true
        api_live.getLiveSetting().then(res => {
          if (res['code'] !== 0) {
            this.loading = false
            this.$message.error(res['msg'])
            return
          }
          this.form = {
            uid: res.data.uid,
            cookie: 'l=v; ' + res.data.cookie,
            csrf: res.data['csrf_token'],
            offsetId: 0
          }
          this.loading = false
        }).catch(err => {
          this.loading = false
        })
      },
      searchDynamic(offset) {
        this.isSearching = true
        if (offset === 0) {
          this.form.offsetId = 0
          this.dynamic = []
        }
        let params = {
          uid: this.form.uid || '',
          cookie: this.form.cookie || '',
          offsetId: this.form.offsetId
        }
        api_live.getBiliDynamic(params).then(res => {
          if (res['code'] === 0 && res.data['code'] === 0) {
            if (this.form.offsetId === res.data.data['next_offset']||res.data.data['next_offset'] === 0) {
              this.hasMore = false
            } else {
              this.form.offsetId = res.data.data['next_offset']
              let cards = res.data.data['cards']
              if (cards && cards.length > 0) {
                for (const elem of cards) {
                  let card = this.handleJson(elem['card'])
                  if (elem.desc.type === 8) {
                    card.item = {
                      timestamp: card['pubdate'],
                      content: '[Vidoe] ' + card.title,
                      orig_dy_id: 0
                    }
                    card.user = card.owner
                  }
                  card.item.time = this.handleTime(card.item.timestamp)
                  card.item.fullTime = this.handleTime(card.item.timestamp, true)
                  if (!!card.origin) {
                    if (card.item['orig_type'] === 8) {
                      card.origin.item = {
                        upload_time: card.origin['pubdate'],
                        content: '[Video] ' + card.origin.title
                      }
                      card.origin.user = card.origin.owner
                    }
                    card.origin.item['upload_time'] = this.handleTime(card.origin.item['upload_time'] || card.origin.item['timestamp']);
                    card.origin.user['head_url'] = this.urlPrefix + `xmbot/web/image.get?url=${card.origin.user['head_url'] || card.origin.user['face']}`;
                  }
                  card.retract = false
                  card.selected = false
                  card.desc = elem.desc
                  card.deleting = false
                  this.dynamic.push(card)
                }
              }
            }
          }
          this.changeIndeterminate()
          this.isSearching = false
        }).catch(err => {
          this.isSearching = false
        })
      },
      getFaceSrc() {
        return this.userInfo.face ? this.urlPrefix + `xmbot/web/image.get?url=${this.userInfo.face}` : ''
      },
      handleJson(json) {
        if (typeof json === 'object') {
          if (json instanceof Array) {
            json.map(o => {
              return this.handleJson(o)
            })
          } else if (json instanceof Object) {
            for (const key of Object.keys(json)) {
              json[key] = this.handleJson(json[key])
            }
          }
          return json
        } else {
          if (json === '') return json
          let obj = ''
          try {
            obj = JSON.parse(json)
          } catch (e) {
            return json
          }
          return typeof obj === 'object' ? this.handleJson(obj) : json
        }
      },
      handleTime(time, fullTime) {
        let date = new Date()
        date.setTime(time * 1000)
        if (fullTime) {
          return `${date.getFullYear()}-` +
            `${String(date.getMonth() + 1).padStart(2, '0')}-` +
            `${String(date.getDate()).padStart(2, '0')} ` +
            `${String(date.getHours()).padStart(2, '0')}:` +
            `${String(date.getMinutes()).padStart(2, '0')}:` +
            `${String(date.getSeconds()).padStart(2, '0')}`
        } else {
          return `${String(date.getMonth() + 1).padStart(2, '0')}-` +
            `${String(date.getDate()).padStart(2, '0')} `
        }
      },
      delOneDynamic(val, key) {
        let json = {
          dynamic_id: val.desc['dynamic_id_str'],
          csrf: this.form.csrf,
          cookie: this.form.cookie
        }
        api_live.delOneDynamic(json).then(res => {
          if (res.data['code'] === 0) {
            this.dynamic.splice(key, 1)
            this.$message.success(res['msg'])
          } else {
            this.dynamic[key].deleting = false
            this.$message.error(res['data'].message)
          }
        }).catch(err => {
          this.dynamic[key].deleting = false
        })
      },
      changeCheckAll(val) {
        this.dynamic.map(o => {
          o.selected = val
          return o
        })
        this.isIndeterminate = false
      },
      changeIndeterminate() {
        this.checkAll = !this.dynamic.some(o => !o.selected)
        if (this.dynamic.length === 1) this.isIndeterminate = false
        else {
          let flag = false
          let last = true
          for (let i = 0; i < this.dynamic.length; i++) {
            if (i === 0) {
              last = this.dynamic[i].selected
              continue
            }
            flag = last !== this.dynamic[i].selected
          }
          this.isIndeterminate = flag
        }
      },
      retractAll(val) {
        this.dynamic.map(o => {
          o.retract = val
          return o
        })
      },
      deleteAll() {
        this.dynamic.map(o => {
          if (!o.selected) return o
          o.deleting = true;
          let dynamic_id = o.desc['dynamic_id_str']
          let json = {
            dynamic_id: dynamic_id,
            csrf: this.form.csrf,
            cookie: this.form.cookie
          }
          api_live.delOneDynamic(json).then(res => {
            let index = this.dynamic.findIndex(e => e.desc['dynamic_id_str'] === dynamic_id)
            if (res.data['code'] === 0) {
              this.dynamic.splice(index, 1)
            } else {
              this.dynamic[index].deleting = false
            }
          }).catch(err => {
            let index = this.dynamic.findIndex(e => e.desc['dynamic_id_str'] === dynamic_id)
            this.dynamic[index].deleting = false
          })
        })
        this.checkAll = false
        this.isIndeterminate = false
      }
    },
    created() {
      if (this.$route.meta.auth) {
        this.checkAuth()
          .then(() => {
            this.getSettings()
          })
          .catch(err => {
            this.$router.push('/index')
            this.$destroy(this.$options.name)
          })
      } else {
        this.getSettings()
      }
    }
  }
</script>

<style scoped>
  .input-prefix {
    display: inline-block;
    width: 60px;
  }

  .dynamic-box {
    padding: 0 30px;
    max-height: 760px;
    overflow: auto;
  }

  .form-box {
    padding: 0 20px;
  }

  .search-tool-bar {
    text-align: center;
    padding: 0 10px 15px 10px;
    margin: 0 20px;
    height: 47px;
    line-height: 32px;
    position: relative;
  }

  .user-info-box {
    display: inline-block;
    height: 32px;
    position: relative;
  }

  .user-info-box .face-box {
    width: 32px;
    height: 32px;
    /*position: absolute;*/
    /*left: 0;*/
    /*top: 0;*/
    display: inline-block;
    vertical-align: top;
    border-radius: 50%;
    overflow: hidden;
  }

  .user-info-box .face-box img {
    width: 32px;
    height: 32px;
  }

  .user-info-box .uname-span {
    vertical-align: top;
    margin-left: 10px;
  }

  .transform-90 {
    transform: rotate(90deg);
  }

  .search-tool-btn {
    position: absolute;
    right: 25px;
    top: 0;
    height: 32px;
    line-height: 32px;
    display: block;
  }

  .search-tool-btn > i {
    line-height: 32px;
  }

  .search-expand-btn {
    display: inline-block;
    width: 28px;
    line-height: 16px;
    vertical-align: middle;
  }

  .search-expand-btn i {
    width: 28px;
    cursor: pointer;
  }

  .search-expand-btn i:hover {
    color: #8cc5ff;
    box-shadow: #3f3f40 0px 0px 1px 0px;
  }

  .btn-danger {
    cursor: pointer;
    color: #8c939d;
    line-height: 32px;
  }

  .btn-danger:hover {
    color: #ff4d51 !important;
  }

  .btn-deleting {
    cursor: not-allowed !important;
  }
</style>
