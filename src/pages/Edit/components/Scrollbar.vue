<template>
  <div class="scrollbarContainer" :class="{ isDark: isDark }">
    <!-- 竖向 -->
    <div
      class="scrollbar verticalScrollbar"
      ref="verticalScrollbarRef"
      @click="onVerticalScrollbarClick"
    >
      <div
        class="scrollbarInner"
        :style="verticalScrollbarStyle"
        @click.stop
        @mousedown="onVerticalScrollbarMousedown"
      ></div>
    </div>
    <!-- 横向 -->
    <div
      class="scrollbar horizontalScrollbar"
      ref="horizontalScrollbarRef"
      @click="onHorizontalScrollbarClick"
    >
      <div
        class="scrollbarInner"
        :style="horizontalScrollbarStyle"
        @click.stop
        @mousedown="onHorizontalScrollbarMousedown"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useAppStore } from '@/store'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const timer = ref(null)
const resizeTimer = ref(null)
const verticalScrollbarStyle = ref({})
const horizontalScrollbarStyle = ref({})
const verticalScrollbarRef = ref(null)
const horizontalScrollbarRef = ref(null)

const isDark = computed(() => appStore.localConfig.isDark)

// 向插件传递滚动条宽高数据
const setScrollBarWrapSize = () => {
  if (!props.mindMap.scrollbar) return
  const {
    width
  } = horizontalScrollbarRef.value.getBoundingClientRect()
  const { height } = verticalScrollbarRef.value.getBoundingClientRect()
  props.mindMap.scrollbar.setScrollBarWrapSize(width, height)
}

// 窗口尺寸变化
const onResize = () => {
  clearTimeout(resizeTimer.value)
  resizeTimer.value = setTimeout(() => {
    setScrollBarWrapSize()
  }, 300)
}

// 调用插件方法更新滚动条位置和大小
const updateScrollbar = ({ vertical, horizontal }) => {
  verticalScrollbarStyle.value = {
    top: vertical.top + '%',
    height: vertical.height + '%'
  }
  horizontalScrollbarStyle.value = {
    left: horizontal.left + '%',
    width: horizontal.width + '%'
  }
}

// 垂直滚动条按下事件调用插件方法
const onVerticalScrollbarMousedown = (e) => {
  props.mindMap.scrollbar.onMousedown(e, 'vertical')
}

// 垂直滚动条点击事件调用插件方法
const onVerticalScrollbarClick = (e) => {
  props.mindMap.scrollbar.onClick(e, 'vertical')
}

// 水平滚动条按下事件调用插件方法
const onHorizontalScrollbarMousedown = (e) => {
  props.mindMap.scrollbar.onMousedown(e, 'horizontal')
}

// 水平滚动条点击事件调用插件方法
const onHorizontalScrollbarClick = (e) => {
  props.mindMap.scrollbar.onClick(e, 'horizontal')
}

onMounted(() => {
  setScrollBarWrapSize()
  proxy.$bus.$on('scrollbar_change', updateScrollbar)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('scrollbar_change', updateScrollbar)
  window.removeEventListener('resize', onResize)
})
</script>

<style lang="less" scoped>
.scrollbarContainer {
  &.isDark {
    .scrollbar {
      background-color: #363b3f;

      .scrollbarInner {
        background-color: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .scrollbar {
    position: absolute;
    background-color: #f5f5f5;
    border-radius: 10px;
    overflow: hidden;

    &.verticalScrollbar {
      width: 10px;
      top: 100px;
      bottom: 100px;
      left: 20px;

      .scrollbarInner {
        width: 10px;
        left: 0;
      }
    }

    &.horizontalScrollbar {
      height: 10px;
      left: 100px;
      right: 100px;
      bottom: 70px;

      .scrollbarInner {
        height: 10px;
        top: 0;
      }
    }

    .scrollbarInner {
      position: absolute;
      background-color: #ccc;
      border-radius: 10px;
    }
  }
}
</style>
