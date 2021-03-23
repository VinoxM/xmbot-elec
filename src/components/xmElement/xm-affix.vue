<template>
  <div class="xm-affix">
    <div :class="[{'xm-affix-fixed':isFixed}]">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "xm-affix",
  props: {
    offset: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isFixed: false,
    }
  },
  methods: {
    handleScroll() {
      let top = document.documentElement.scrollTop
      this.isFixed = top > this.offset
    }
  },
  mounted() {
    window.addEventListener('scroll', () => this.handleScroll())
  }
}
</script>

<style scoped>
.xm-affix {
  line-height: 32px;
  height: 48px;
  width: 100%;
  position: relative;
}

.xm-affix-fixed {
  position: fixed;
}

.xm-affix >>> > div {
  height: 48px;
  /*position: relative;*/
  box-shadow: 0 1px 3px 2px #67676780;
  width: 100%;
  z-index: 100;
}
</style>
