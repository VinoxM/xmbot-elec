<template>
  <div id="app" class="text-left">
    <router-view/>
<!--    <url-conf></url-conf>-->
  </div>
</template>

<script>
  // import urlConf from './components/others/url-prefix-conf'

  export default {
    name: 'App',
    components: {
      // 'url-conf': urlConf
    },
    computed: {
      isAdmin() {
        return this.$store.state.isAdmin
      }
    },
    data() {
      return {}
    },
    created() {
      // let user_id = this.$cookies.get('user_id')
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

  .cur-pointer{
    cursor: pointer;
  }

  .cur-default{
    cursor: default;
  }

  .cur-not-allowed{
    cursor: not-allowed;
  }

  .css-hide{
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
