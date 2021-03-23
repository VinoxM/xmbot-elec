<template>
  <div>
    <el-radio-group v-model="curArea" size="small">
      <el-radio-button v-for="(val,key,index) in calendar" :key="index" :label="key">{{key.toUpperCase()}}
      </el-radio-button>
    </el-radio-group>
    <el-calendar>
      <div slot="dateCell" slot-scope="{date,data}">
        <span class="calendar-date">{{new Date(date).getDate()}}</span>
        <el-row class="calendar-active" v-for="(v,k) of getByDate(date)" :key="k" :title="v.name">{{v.name}}</el-row>
      </div>
    </el-calendar>
  </div>
</template>

<script>
  import * as api_pcr from '../../api/calendar-pcr'

  export default {
    name: "pcr-calendar",
    data() {
      return {
        curArea: '',
        calendar: {}
      }
    },
    computed: {
      curCalendar() {
        return this.calendar[this.curArea]
      }
    },
    methods: {
      getByDate(d) {
        if (!this.curCalendar) return []
        const date = new Date(d)
        return this.curCalendar.filter(o => {
          let s = new Date(o['start_time'])
          let e = new Date(o['end_time'])
          let start = s.getFullYear() * 10000 + (s.getMonth() + 1) * 100 + s.getDate()
          let end = e.getFullYear() * 10000 + (e.getMonth() + 1) * 100 + e.getDate()
          let now = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
          return now >= start && now <= end
        })
      }
    },
    created() {
      api_pcr.getAllCalendar().then(res => {
        if (res['code'] === 0) {
          this.calendar = res.data
          this.curArea = Object.keys(this.calendar)[0]
        }
      })
    }
  }
</script>

<style scoped>
  >>>.el-calendar-table .el-calendar-day{
    height: auto;
    min-height: 90px;
    position: relative;
  }

  .calendar-date{
    position: absolute;
    top: 0;
    right: 0;
    text-align: center;
    display: inline-block;
    background-color: #EBEEF5;
    border-radius: 0 0 0 8px;
    width: 24px;
    line-height: 24px;
    z-index: 999;
  }

  .calendar-active{
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .calendar-active:hover{
    background-color: #EBEEF5;
  }

  >>> .el-calendar-table .el-calendar-day:hover {
     cursor: default !important;
     background: none !important;
  }
</style>
