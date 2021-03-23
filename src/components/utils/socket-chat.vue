<template>
  <div v-loading="loading">
    <el-row class="text-center chat-header">
      <el-link :type="wsColor" @click="wsConnect">{{wsStatus}}</el-link>
    </el-row>
    <div class="chat-divider"></div>
    <el-tabs tab-position="left" v-if="!loading" class="chat-box" v-model="activeTab">
      <el-tab-pane v-for="(val,key,index) of chatLog" :key="index" class="chat-box-tabs" :name="key">
        <div slot="label">
          <span v-if="val.newCount===0">{{key}}</span>
          <el-badge v-else :value="val.newCount" :max="99" style="vertical-align: top">
            <span>{{key}}</span>
          </el-badge>
        </div>
        <div class="chat-box-scroll scroll-to-top" v-show="curBox.scrollTop>200" @click="contentScroll(true)">
          <i class="el-icon-caret-top"></i>
        </div>
        <div :class="hideInput?'chat-box-content content-tall':'chat-box-content'" ref="chatBox" @scroll="scrollChange">
          <el-row class="chat-box-more">
            <el-link type="info" @click="getMore" :disabled="val.noMore">
              {{val.noMore?'没有更多':'加载更多'}}
            </el-link>
          </el-row>
          <el-row v-for="(item,k) of val.rows" :key="k" :class="item['is_self']?'chat-box-row-self':'chat-box-row'">
            <div :class="item['is_self']?'chat-item-self':'chat-item'">
              <div :class="item['is_self']?'text-right chat-item-title':'chat-item-title'">
                <el-tooltip :content="item.user_id" placement="top">
                  <el-link class="chat-item-user">{{item['nick_name']}}</el-link>
                </el-tooltip>
                <span class="chat-item-time"> [{{dateFormat(item['send_time'])}}]</span>
              </div>
              <p v-html="msgFormat(item.message)" class="chat-item-content"></p>
            </div>
          </el-row>
        </div>
        <div :class="hideInput?'chat-box-scroll scroll-to-bottom-tall':'chat-box-scroll scroll-to-bottom'"
             v-show="curBox.scrollHeight-curBox.scrollTop > curBox.height+200"
             @click="contentScroll(false)">
          <i class="el-icon-caret-bottom"></i>
        </div>
        <div :class="hideInput?'chat-divider-tall':'chat-divider'">
          <span v-if="hideInput" class="input-open-btn" @click="hideInputToggle(false)">
            <i class="el-icon-d-arrow-left"></i>
          </span>
        </div>
        <div class="chat-box-input" v-show="!hideInput">
          <el-input :readonly="!isAdmin" type="textarea" :rows="6" :placeholder="isAdmin?'请输入内容':'权限不足'"
                    v-model="textArea"
                    maxlength="250" show-word-limit
                    :class="inputErr?'chat-input-textarea border-err':'chat-input-textarea'"
                    @keypress.enter.native.prevent="sendSubmit"
                    @keydown.alt.enter.native="textArea += '\n'"
                    @keydown.ctrl.enter.native="textArea += '\n'"
          ></el-input>
          <div class="chat-box-input-btn">
            <span class="chat-input-err" v-show="inputErr">未输入内容</span>
            <el-button class="icon-translate-90" size="small" icon="el-icon-d-arrow-right"
                       @click="hideInputToggle(true)">收起
            </el-button>
            <el-button size="small" icon="el-icon-delete" @click="sendInit" :disabled="!isAdmin">清空</el-button>
            <el-button size="small" type="primary" icon="el-icon-check" @click="sendSubmit" :disabled="!isAdmin">发送
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  export default {
    name: "home",
    data() {
      return {
        loading: true,
        imgSuffix: ['jpg', 'jpeg', 'png', 'gif'],
        ws: {},
        textArea: '',
        altEnter: false,
        inputErr: false,
        activeTab: '',
        chatLog: {},
        curBox: {
          height: 0,
          scrollTop: 0,
          scrollHeight: 0
        },
        hideInput: false
      }
    },
    computed: {
      isAdmin() {
        return this.$store.state.isAdmin
      },
      ws_() {
        return this.$ws
      },
      chatLog_() {
        return this.$store.state.chatLog
      },
      wsStatus() {
        if (this.ws.ready) {
          return '已连接到服务器'
        } else if (this.ws.isConnecting) {
          return '连接服务器中'
        } else {
          return '未连接到服务器'
        }
      },
      wsColor() {
        if (this.ws.ready) {
          return 'success'
        } else if (this.ws.isConnecting) {
          return 'info'
        } else {
          return 'danger'
        }
      }
    },
    watch: {
      ws_(val) {
        this.ws = val
      },
      textArea(val) {
        if (val !== '' && this.inputErr) {
          this.inputErr = false
        }
      },
      chatLog_: {
        handler(val) {
          this.getChatLog(val)
        },
        deep: true
      },
      activeTab(val) {
        this.changeCurBox()
        if (this.chatLog[val] && this.chatLog[val].hasOwnProperty('hasNew') && this.chatLog[val].hasNew) this.scrollToBottom()
      }
    },
    methods: {
      wsConnect() {
        if (this.ws.ready || this.ws.isConnecting) {
          return
        }
        this.ws.connect(this)
      },
      scrollChange(e) {
        let target = e.target
        this.curBox.height = target.offsetHeight
        this.curBox.scrollTop = target.scrollTop
        this.curBox.scrollHeight = target.scrollHeight
      },
      contentScroll(flag) {
        let chatBox = document.getElementsByClassName('chat-box-content')
        if (chatBox.length > 0) {
          for (const box of chatBox) {
            if (box.offsetHeight > 0) {
              box.scrollTop = flag ? 0 : (box.scrollHeight - box.offsetHeight)
              this.curBox.height = box.offsetHeight
              this.curBox.scrollTop = box.scrollTop
              this.curBox.scrollHeight = box.scrollHeight
              break
            }
          }
        }
      },
      hideInputToggle(val) {
        let needScroll = false
        if (!val) {
          let chatBox = document.getElementsByClassName('chat-box-content')
          if (chatBox.length > 0) {
            for (const box of chatBox) {
              if (box.offsetHeight > 0) {
                needScroll = box.scrollHeight - box.offsetHeight <= box.scrollTop
                break
              }
            }
          }
        }
        this.hideInput = val
        if (needScroll) {
          this.scrollToBottom()
        }
      },
      getChatLog(chatLog_) {
        if (!chatLog_) {
          this.chatLog = {}
          return
        }
        const chat = {}
        for (const key of Object.keys(chatLog_.group)) {
          // chatLog_.group[key].rows.map(o=>{
          //   o.message = this.msgFormat(o.message)
          //   return o
          // })
          chat[`Group-${key}`] = chatLog_.group[key]
        }
        for (const key of Object.keys(chatLog_.private)) {
        //   chatLog_.private[key].rows.map(o=>{
        //     o.message = this.msgFormat(o.message)
        //     return o
        //   })
          chat[`Private-${key}`] = chatLog_.private[key]
        }
        const keys = Object.keys(chat)
        if (!keys.some(o => o === this.activeTab)) {
          this.activeTab = keys[0]
        }
        this.chatLog = chat
        this.changeCurBox()
        if (this.chatLog[this.activeTab] && this.chatLog[this.activeTab].hasNew) this.scrollToBottom()
      },
      changeCurBox() {
        this.$nextTick(() => {
          let chatBox = document.getElementsByClassName('chat-box-content')
          if (chatBox.length > 0) {
            for (const box of chatBox) {
              if (box.offsetHeight > 0) {
                this.curBox.height = box.offsetHeight
                this.curBox.scrollTop = box.scrollTop
                this.curBox.scrollHeight = box.scrollHeight
                break
              }
            }
          }
        })
      },
      scrollToBottom() {
        this.$nextTick(() => {
          let chatBox = document.getElementsByClassName('chat-box-content')
          if (chatBox.length > 0) {
            for (const box of chatBox) {
              if (box.offsetHeight > 0) {
                box.scrollTop = box.scrollHeight
                this.curBox.height = box.offsetHeight
                this.curBox.scrollTop = box.scrollTop
                this.curBox.scrollHeight = box.scrollHeight
                this.chatLog[this.activeTab].hasNew = false
                this.chatLog[this.activeTab].newCount = 0
                break
              }
            }
          }
        })
      },
      dateFormat(d) {
        let date = new Date(d)
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
      },
      msgFormat(message) {
        let msg = String(message)
        msg = msg.replaceAll('\n', '<br/>')
        let atS = msg.indexOf('[CQ:at,qq=')
        if (atS > -1) {
          let atStr = msg.substring(atS + 10)
          let atE = msg.indexOf(']')
          let CQ = msg.substring(atS, atE + 1)
          let at = atStr.substring(0, atStr.indexOf(']'))
          msg = msg.replace(CQ, `<span class="color-at">@${at}</span>`)
        }
        let curUrlPrefix = this.$cookies.get('curUrlPrefix')
        let urlPrefix = curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
        return this.imgFormat(msg, urlPrefix)
      },
      imgFormat(msg, urlPrefix) {
        if (msg.split('[CQ:image,').length > 1) {
          let cqS = msg.indexOf('[CQ:image,')
          let cqStr = msg.substring(cqS)
          let cqE = cqStr.indexOf(']')
          let CQ = cqStr.substring(0, cqE + 1)
          if (CQ.indexOf('url') > -1) {
            let urlS = CQ.indexOf('url=')
            let urlStr = CQ.substring(urlS + 4)
            let url = urlStr.substr(0, urlStr.indexOf('proxy=') > -1 ? urlStr.length - 9 : urlStr.length - 1)
            // console.log(url)
            let sp = url.split('.')
            if ((sp.length > 1 && this.imgSuffix.some(o => sp[sp.length - 1].startsWith(o))) || url.indexOf('//gchat.qpic.cn/') > -1) {
              url = urlPrefix + `xmbot/web/image.get?url=${url}`
            }
            msg = msg.replace(CQ, `<img class="display-block chat-item-img" src="${url}"/>`)
          } else {
            let fileS = CQ.indexOf('file=file:///')
            let fileStr = CQ.substring(fileS + 13, CQ.length - 1)
            let file = fileStr.substring(fileStr.indexOf('resource'))
            // console.log(fileStr, file)
            let url = urlPrefix + 'xmbot/' + file.replaceAll('\\', '/')
            msg = msg.replace(CQ, `<img class="display-block chat-item-img" src="${url}"/>`)
          }
          return this.imgFormat(msg, urlPrefix)
        } else {
          return msg
        }
      },
      sendSubmit() {
        if (this.textArea === '') {
          this.inputErr = true
          return
        }
        let receiver = this.activeTab.toLowerCase().split('-')
        let reply = receiver[0] === 'group' ? 'group_id' : 'user_id'
        const params = {message_type: receiver[0], message: this.textArea}
        params[reply] = receiver[1].split('_')[0]
        params.apiName = receiver[1].split('_')[1]
        this.$ajax({url: '/chat/sendMsg.do', method: 'post', data: params}).then(res => {
          this.sendInit()
        })
      },
      sendInit() {
        this.textArea = ''
      },
      getMore() {
        let split = this.activeTab.toLowerCase().split('-')
        let params = {
          type: split[0],
          id: split[1],
          apiName: split[2],
          index: this.chatLog[this.activeTab].rows[0].id
        }
        this.moreLoading = true
        this.$ajax({url: '/chat/getMoreMsg.json', method: 'post', data: params})
      }
    },
    created() {
      if (this.$route.meta.auth) {
        this.checkAuth()
          .then(() => {
            this.ws = this.$ws
            this.getChatLog(this.$store.state.chatLog)
            this.loading = false
            this.hideInput = !this.isAdmin
          })
          .catch(err => {
            this.$router.push('/index')
            this.$destroy(this.$options.name)
          })
      } else
        this.loading = false
    }
  }
</script>

<style scoped>
  >>> .color-at {
    color: #8cc5ff;
  }

  .chat-header {
    box-shadow: inset 0 0 4px 1px #8c939d;
    padding: 5px
  }

  .chat-box {
    overflow: hidden;
    box-shadow: inset 0 0 5px 1px #8c939d;
    height: 790px;
  }

  .chat-box-tabs {
    /*height: 800px;*/
    /*overflow: auto;*/
    position: relative;
    box-shadow: inset 15px 0 8px -15px #8c939d;
  }

  .chat-box-content {
    height: 560px;
    overflow: auto;
    padding: 15px 10px;
    box-shadow: inset 0 -15px 8px -15px #8c939d;
    position: relative;
  }

  .content-tall {
    height: 740px !important;
  }

  .chat-box-more {
    text-align: center;
    font-size: 14px;
    margin-bottom: 6px;
  }

  .chat-box-scroll {
    position: absolute;
    right: 30px;
    font-size: 20px;
    line-height: 36px;
    height: 36px;
    width: 36px;
    text-align: center;
    background-color: #fff;
    cursor: pointer;
    color: #409eff;
    z-index: 999;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(0, 0, 0, .40);
  }

  .chat-box-scroll:hover {
    background-color: #f2f6fc;
  }

  .scroll-to-top {
    top: 5px;
  }

  .scroll-to-bottom {
    top: 548px;
  }

  .scroll-to-bottom-tall {
    top: 728px;
  }

  .chat-divider-tall {
    height: 20px;
    text-align: center;
  }

  .input-open-btn {
    line-height: 18px;
    font-size: 12px;
    font-weight: bolder;
    display: inline-block;
    width: 200px;
    border-radius: 6px;
    vertical-align: top;
  }

  .input-open-btn i {
    transform: rotate(90deg);
  }

  .input-open-btn:hover {
    cursor: pointer;
    background-color: rgba(140, 197, 255, 0.40);
  }

  .chat-divider {
    height: 10px;
  }

  .chat-box-input {
    height: 180px;
    box-shadow: inset 0 15px 8px -15px #8c939d;
    padding: 10px;
  }

  .chat-box-input-btn {
    padding: 8px 0;
    text-align: right;
    position: relative;
  }

  .chat-input-err {
    color: red;
    position: absolute;
    left: 0;
    top: 0;
    font-size: 14px;
    line-height: 24px;
  }

  .chat-input-textarea >>> textarea {
    line-height: 20px;
    font-family: "Microsoft YaHei", serif;
  }

  .chat-box-row, .chat-box-row-self {
    padding: 5px;
    margin-bottom: 5px;
    border-radius: 5px;
  }

  .chat-box-row:hover {
    box-shadow: 0 0 3px 3px #8c939d;
  }

  .chat-box-row-self:hover {
    box-shadow: 0 0 3px 3px #8cc5ff;
  }

  .chat-item {
    padding: 5px 10px;
    box-shadow: 0 0 2px 1px #8c939d;
    border-radius: 5px;
    display: inline-block;
    float: left;
  }

  .chat-item-self {
    padding: 5px 10px;
    box-shadow: 0 0 2px 1px #409EFF;
    border-radius: 5px;
    display: inline-block;
    float: right;
  }

  .chat-item-title {
    padding: 0 5px 2px 5px;
    font-size: 14px;
    display: inline-block;
  }

  .chat-item .chat-item-title {
    box-shadow: 0 6px 6px -6px #8c939d;
  }

  .chat-item-self .chat-item-title {
    box-shadow: 0 6px 6px -6px #409EFF;
  }

  .chat-item-user {
    font-size: 16px;
  }

  .chat-item-time {
    font-size: 14px;
    vertical-align: bottom;
    color: #8c939d;
  }

  .chat-item-content {
    max-width: 500px;
    margin: 5px 0 0 0;
    padding: 0 5px;
    line-height: 24px;
  }

  >>> .chat-item-img {
    max-width: 500px;
  }

  .border-err >>> textarea {
    border-color: red !important;
  }

  >>> .el-badge .el-badge__content {
    top: 10px;
    right: 5px;
  }

  .icon-translate-90 >>> i {
    transform: rotate(90deg);
  }
</style>
