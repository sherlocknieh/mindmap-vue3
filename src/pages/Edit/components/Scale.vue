<template>
  <div class="scaleContainer" :class="{ isDark: isDark }">
    <el-tooltip
      class="item"
      effect="dark"
      :content="$t('scale.zoomOut')"
      placement="top"
    >
      <div class="btn el-icon-minus" @click="narrow"></div>
    </el-tooltip>
    <div class="scaleInfo">
      <input
        ref="inputRef"
        type="text"
        v-model="scaleNum"
        @input="onScaleNumInput"
        @change="onScaleNumChange"
        @focus="onScaleNumInputFocus"
        @keydown.stop
        @keyup.stop
      />%
    </div>
    <el-tooltip
      class="item"
      effect="dark"
      :content="$t('scale.zoomIn')"
      placement="top"
    >
      <div class="btn el-icon-plus" @click="enlarge"></div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  mindMap: {
    type: Object
  },
  isDark: {
    type: Boolean
  }
})

const scaleNum = ref(100)
const cacheScaleNum = ref(0)
const inputRef = ref(null)

watch(() => props.mindMap, (val, oldVal) => {
  if (val && !oldVal) {
    props.mindMap.on('scale', onScale)
    props.mindMap.on('draw_click', onDrawClick)
    scaleNum.value = toPer(props.mindMap.view.scale)
  }
})

onBeforeUnmount(() => {
  if (props.mindMap) {
    props.mindMap.off('scale', onScale)
    props.mindMap.off('draw_click', onDrawClick)
  }
})

// 转换成百分数
const toPer = (scale) => {
  return (scale * 100).toFixed(0)
}

// 缩小
const narrow = () => {
  props.mindMap.view.narrow()
}

// 放大
const enlarge = () => {
  props.mindMap.view.enlarge()
}

// 聚焦时缓存当前缩放倍数
const onScaleNumInputFocus = () => {
  cacheScaleNum.value = scaleNum.value
}

// 禁止输入非数字
const onScaleNumInput = () => {
  const sanitized = scaleNum.value.replace(/[^0-9]+/g, '')
  scaleNum.value = sanitized
}

// 手动输入缩放倍数
const onScaleNumChange = () => {
  const scaleNumValue = Number(scaleNum.value)
  if (Number.isNaN(scaleNumValue) || scaleNumValue <= 0) {
    scaleNum.value = cacheScaleNum.value
  } else {
    const cx = props.mindMap.width / 2
    const cy = props.mindMap.height / 2
    props.mindMap.view.setScale(scaleNum.value / 100, cx, cy)
  }
}

const onScale = (scale) => {
  scaleNum.value = toPer(scale)
}

const onDrawClick = () => {
  if (inputRef.value) inputRef.value.blur()
}
</script>

<style lang="less" scoped>
.scaleContainer {
  display: flex;
  align-items: center;

  &.isDark {
    .btn {
      color: hsla(0, 0%, 100%, 0.6);
    }

    .scaleInfo {
      color: hsla(0, 0%, 100%, 0.6);

      input {
        color: hsla(0, 0%, 100%, 0.6);
      }
    }
  }

  .btn {
    cursor: pointer;
  }

  .scaleInfo {
    margin: 0 20px;
    display: flex;
    align-items: center;

    input {
      width: 35px;
      text-align: center;
      background-color: transparent;
      border: none;
      outline: none;
    }
  }
}
</style>
