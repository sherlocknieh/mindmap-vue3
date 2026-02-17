<template>
  <div class="fullscreenContainer" :class="{ isDark: isDark }">
    <el-tooltip
      class="item"
      effect="dark"
      :content="$t('fullscreen.fullscreenShow')"
      placement="top"
    >
      <div class="btn iconfont iconquanping" @click="toFullscreenShow"></div>
    </el-tooltip>
    <el-tooltip
      class="item"
      effect="dark"
      :content="$t('fullscreen.fullscreenEdit')"
      placement="top"
    >
      <div class="btn iconfont iconquanping1" @click="toFullscreenEdit"></div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { fullscrrenEvent, fullScreen } from '@/utils'

const props = defineProps({
  mindMap: {
    type: Object
  },
  isDark: {
    type: Boolean
  }
})

onMounted(() => {
  document[fullscrrenEvent] = () => {
    setTimeout(() => {
      props.mindMap.resize()
    }, 1000)
  }
})

// 全屏查看
const toFullscreenShow = () => {
  fullScreen(props.mindMap.el)
}

// 全屏编辑
const toFullscreenEdit = () => {
  fullScreen(document.body)
}
</script>

<style lang="less" scoped>
.fullscreenContainer {
  display: flex;
  align-items: center;
  &.isDark {
    .btn {
      color: hsla(0, 0%, 100%, 0.6);
    }
  }

  .item {
    margin-right: 12px;

    &:last-of-type {
      margin-right: 0;
    }
  }

  .btn {
    cursor: pointer;
  }
}
</style>
