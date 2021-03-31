<template>
  <span>
    <el-tag :type="type" v-for="(item,key) of list" :key="key" :closable="!disabled" @close="tagClose(key)"
            class="xm-tag">{{ item }}</el-tag>
    <el-input size="small" ref="input" class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              @keyup.enter.native="inputConfirm"
              @blur="inputConfirm"
    ></el-input>
    <el-button v-if="!disabled&&!inputVisible" size="small" @click="newTag"
               class="button-new-tag">+ New {{ label }}</el-button>
  </span>
</template>

<script>
export default {
  name: "xm-tags",
  data() {
    return {
      list: [],
      inputValue: '',
      inputVisible: false
    }
  },
  props: {
    value: Array,
    label: {
      type: String,
      default: 'Tag'
    },
    type: {
      type: String,
      default: 'primary'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    value(val) {
      this.list = val ? val : []
    }
  },
  methods: {
    newTag() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.input.focus();
      });
    },
    inputConfirm() {
      if (this.inputValue !== '') {
        this.list.push(this.inputValue)
        this.$emit('update', this.list)
      }
      this.inputValue = ''
      this.inputVisible = false
    },
    tagClose(key) {
      this.list.splice(key, 1)
      this.$emit('update', this.list)
    }
  },
  created() {
    this.list = this.value||[]
  }
}
</script>

<style scoped>
.xm-tag {
  margin-right: 5px;
}

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
</style>
