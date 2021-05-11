<template>
  <div>
    <el-row class="text-center" style="margin:10px 0">
      <span>区服:</span>
      <el-radio-group v-model="area" size="small">
        <el-radio-button v-for="(val,key) of areaOptions" :key="key" :label="val"></el-radio-button>
      </el-radio-group>
      <el-link @click="$router.push('/pcr/pool-setting')" style="margin-left: 20px" type="info">卡池详情?</el-link>
      <el-button @click="onlineGacha" type="primary" style="margin-left: 20px" size="small">十连</el-button>
    </el-row>
    <div :style="boxStyle" style="margin: 0 auto;position: relative">
      <el-image :style="boxStyle" :src="backgroundSrc" fit="fill"
                style="position: absolute;top: 0;left: 0;z-index: -1"></el-image>
      <div :style="innerBoxStyle" style="margin: auto">
        <div :style="imageRowStyle">
          <div v-for="(val,key) of resultRows.first" :key="key" :title="val.nickName"
               style="cursor: default;display: inline-block"
               :style="{width:imageBoxStyle.width,height:imageBoxStyle.height,marginRight: key===4?'0px':imageBoxStyle.marginRight}">
            <el-image :src="val.src"></el-image>
          </div>
        </div>
        <div :style="imageRowStyle">
          <div v-for="(val,key) of resultRows.second" :key="key" :title="val.nickName"
               style="cursor: default;display: inline-block"
               :style="{width:imageBoxStyle.width,height:imageBoxStyle.height,marginRight: key===4?'0px':imageBoxStyle.marginRight}">
            <el-image :src="val.src"></el-image>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as api_pcr from '../../api/gacha-pcr'

export default {
  name: "pcr-online-gacha",
  data() {
    return {
      area: 'jp',
      areaOptions: ['jp', 'tw', 'cn'],
      boxSize: {
        360: {
          width: 640,
          height: 360,
        },
        720: {
          width: 1280,
          height: 720,
        },
        1080: {
          width: 1920,
          height: 1080,
        },
      },
      boxStyle: {
        width: '', height: ''
      },
      innerBoxSize: {
        360: {
          width: '410px',
          height: '240px',
          paddingTop: '80px'
        },
        720: {
          width: '820px',
          height: '300px',
          paddingTop: '160px'
        },
        1080: {
          width: '1150px',
          height: '700px',
          paddingTop: '240px'
        }
      },
      innerBoxStyle: {},
      imageRowSize: {
        360: {
          height: '50px',
          marginBottom: '30px'
        },
        720: {
          height: '100px',
          marginBottom: '70px'
        },
        1080: {
          height: '150px',
          marginBottom: '100px'
        }
      },
      imageRowStyle: {},
      imageBoxSize: {
        360: {
          width: '50px',
          height: '50px',
          marginRight: '40px'
        },
        720: {
          width: '100px',
          height: '100px',
          marginRight: '80px'
        },
        1080: {
          width: '150px',
          height: '150px',
          marginRight: '100px'
        }
      },
      imageBoxStyle: {},
      resultRows: {
        first: [],
        second: []
      }
    }
  },
  computed: {
    backgroundSrc() {
      const curUrlPrefix = this.$cookies.get('curUrlPrefix')
      let urlPrefix = curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
      return `${urlPrefix}xmbot/resource/gacha/utils/background.jpg`
    },
    urlPrefix() {
      let curUrlPrefix = this.$cookies.get('curUrlPrefix')
      return curUrlPrefix ? this.$urlConf[curUrlPrefix + '_url'] : this.$urlConf['base_url']
    }
  },
  methods: {
    handleResize() {
      let clientWidth = document.documentElement.clientWidth
      let range = Object.keys(this.boxSize).reverse()
      let width = 0
      for (const r of range) {
        if (Number(this.boxSize[r].width) < clientWidth) {
          width = r;
          break
        }
      }
      if (width === 0) {
        width = 360
      }
      this.boxStyle.width = this.boxSize[width].width + 'px'
      this.boxStyle.height = this.boxSize[width].height + 'px'
      this.innerBoxStyle = this.innerBoxSize[width]
      this.imageRowStyle = this.imageRowSize[width]
      this.imageBoxStyle = this.imageBoxSize[width]
    },
    onlineGacha() {
      this.resultRows = {first: [], second: []}
      api_pcr.onlinePcrGacha({user_id: this.$cookies.get('user_id'), area: this.area}).then(res => {
        if (res['code'] === 0) {
          this.resultRows.first = res.data.slice(0, 5).map(o => this.handleGachaMap(o))
          this.resultRows.second = res.data.slice(5).map(o => this.handleGachaMap(o))
          // console.log(this.resultRows)
        } else {
          this.$message.error(res['msg'])
        }
      })
    },
    handleGachaMap(o) {
      return {
        src: this.urlPrefix + `xmbot/resource/gacha/unit/border/${o.id}${parseInt(o.star) === 3 ? 3 : 1}1.png`,
        nickName: o.name,
        star: o.star
      }
    }
  },
  mounted() {
    window.addEventListener('resize', () => this.handleResize())
    this.handleResize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', () => this.handleResize())
  },
  created() {

  }
}
</script>

<style scoped>
.background-image-box {
  width: 1920px;
  height: 1080px;
}
</style>
