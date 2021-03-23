<template>
  <div class="text-center">
    <h1>404,Page Not Found</h1>
    <h2>
      <span v-if="countDown>=0">
        <span>{{ countDown }}秒后</span>
        <span class="xm-link" @click="toIndex">返回首页</span>
      </span>
      <span v-else>
        正在<span class="xm-link" @click="toIndex">前往首页</span>...
      </span>
    </h2>
  </div>
</template>

<script>
export default {
  name: "notFound",
  data() {
    return {
      countDown: 5,
      interval: null
    }
  },
  watch: {
    countDown(val) {
      if (val === -1) {
        this.toIndex()
      }
    }
  },
  methods: {
    toIndex() {
      clearInterval(this.interval)
      this.interval = null
      this.$router.push('/index')
    },
    handleCountDown() {
      this.countDown = 5
      this.interval = setInterval(() => {
        this.countDown--
      }, 1000)
    }
  },
  created() {
    this.handleCountDown()
  }
}
</script>

<style scoped>

</style>
