<template>
  <div id="app" class="text-left">
    <router-view/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {},
  computed: {},
  data() {
    return {}
  },
  methods: {
    saveAllCookies() {
      if (process.env.IS_ELECTRON
          && process.env.NODE_ENV === 'production'
      ) {
        this.$cookies.saveAll()
      }
    }
  },
  created() {
    window.addEventListener('beforeunload', () => this.saveAllCookies())
  },
  beforeDestroy() {
    this.saveAllCookies()
  },
  destroyed() {
    window.removeEventListener('beforeunload', () => this.saveAllCookies())
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  /*margin-top: 60px;*/
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #F5F5F5;
}

::-webkit-scrollbar-track {
  background-color: #F5F5F5;
}

::-webkit-scrollbar-thumb {
  background-color: #999;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #777;
}

::-webkit-scrollbar-thumb:active {
  background-color: #555;
}

label.el-form-item__label:after {
  content: ': ';
}

.text-center {
  text-align: center !important;
}

.text-left {
  text-align: left !important;
}

.text-right {
  text-align: right !important;
}

.display-inline-block {
  display: inline-block;
}

.display-block {
  display: block;
}

.el-tooltip__popper.is-light {
  border: 1px solid #b5b5b5 !important;
}

.float-right {
  float: right;
}

body {
  margin: 0;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.cur-pointer {
  cursor: pointer;
}

.cur-default {
  cursor: default;
}

.cur-not-allowed {
  cursor: not-allowed;
}

.css-hide {
  display: none !important;
}

.xm-link {
  cursor: pointer;
}

.xm-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>
