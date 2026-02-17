<template>
  <div
    v-if="showMiniMap"
    class="navigatorBox"
    :class="{ isDark: isDark }"
    ref="navigatorBox"
    :style="{ width: width + 'px' }"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
  >
    <div
      class="svgBox"
      ref="svgBox"
      :style="{
        transform: `scale(${svgBoxScale})`,
        left: svgBoxLeft + 'px',
        top: svgBoxTop + 'px'
      }"
    >
      <img :src="mindMapImg" @mousedown.prevent />
    </div>
    <div
      class="windowBox"
      :style="viewBoxStyle"
      :class="{ withTransition: withTransition }"
      @mousedown.stop="onViewBoxMousedown"
      @mousemove="onViewBoxMousemove"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import { useAppStore } from '@/store'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const showMiniMap = ref(false)
const timer = ref(null)
const boxWidth = ref(0)
const boxHeight = ref(0)
const svgBoxScale = ref(1)
const svgBoxLeft = ref(0)
const svgBoxTop = ref(0)
const viewBoxStyle = ref({
  left: 0,
  top: 0,
  bottom: 0,
  right: 0
})
const mindMapImg = ref('')
const width = ref(0)
const setSizeTimer = ref(null)
const withTransition = ref(true)
const navigatorBox = ref(null)
const svgBox = ref(null)

const isDark = computed(() => appStore.localConfig.isDark)

// 切换显示小地图
const toggle_mini_map = (show) => {
  showMiniMap.value = show
  nextTick(() => {
    if (navigatorBox.value) {
      init()
    }
    if (svgBox.value) {
      drawMiniMap()
    }
  })
}

// 思维导图数据改变，更新小地图
const data_change = () => {
  if (!showMiniMap.value) {
    return
  }
  clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    drawMiniMap()
  }, 500)
}

// 计算容器宽度
const setSize = () => {
  clearTimeout(setSizeTimer.value)
  setSizeTimer.value = setTimeout(() => {
    width.value = Math.min(window.innerWidth - 80, 370)
    nextTick(() => {
      if (showMiniMap.value) {
        init()
        drawMiniMap()
      }
    })
  }, 300)
}

// 获取宽高
const init = () => {
  let { width: w, height: h } = navigatorBox.value.getBoundingClientRect()
  boxWidth.value = w
  boxHeight.value = h
}

// 渲染小地图
const drawMiniMap = () => {
  let {
    getImgUrl,
    viewBoxStyle: calculatedViewBoxStyle,
    miniMapBoxScale,
    miniMapBoxLeft,
    miniMapBoxTop
  } = props.mindMap.miniMap.calculationMiniMap(boxWidth.value, boxHeight.value)
  // 渲染到小地图
  getImgUrl(img => {
    mindMapImg.value = img
  })
  viewBoxStyle.value = calculatedViewBoxStyle
  svgBoxScale.value = miniMapBoxScale
  svgBoxLeft.value = miniMapBoxLeft
  svgBoxTop.value = miniMapBoxTop
}

// 小地图鼠标按下事件
const onMousedown = (e) => {
  props.mindMap.miniMap.onMousedown(e)
}

// 小地图鼠标移动事件
const onMousemove = (e) => {
  props.mindMap.miniMap.onMousemove(e)
}

// 鼠标松开事件，最好绑定要window
const onMouseup = (e) => {
  if (!withTransition.value) {
    withTransition.value = true
  }
  if (props.mindMap.miniMap) props.mindMap.miniMap.onMouseup(e)
}

// 视口框的鼠标按下事件
const onViewBoxMousedown = (e) => {
  props.mindMap.miniMap.onViewBoxMousedown(e)
}

// 视口框的鼠标移动事件
const onViewBoxMousemove = (e) => {
  props.mindMap.miniMap.onViewBoxMousemove(e)
}

// 视口框的位置大小改变了，需要更新
const onViewBoxPositionChange = ({ left, right, top, bottom }) => {
  withTransition.value = false
  viewBoxStyle.value.left = left
  viewBoxStyle.value.right = right
  viewBoxStyle.value.top = top
  viewBoxStyle.value.bottom = bottom
}

onMounted(() => {
  setSize()
  window.addEventListener('resize', setSize)
  proxy.$bus.$on('toggle_mini_map', toggle_mini_map)
  proxy.$bus.$on('data_change', data_change)
  proxy.$bus.$on('view_data_change', data_change)
  proxy.$bus.$on('node_tree_render_end', data_change)
  window.addEventListener('mouseup', onMouseup)
  props.mindMap.on(
    'mini_map_view_box_position_change',
    onViewBoxPositionChange
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setSize)
  proxy.$bus.$off('toggle_mini_map', toggle_mini_map)
  proxy.$bus.$off('data_change', data_change)
  proxy.$bus.$off('view_data_change', data_change)
  proxy.$bus.$off('node_tree_render_end', data_change)
  window.removeEventListener('mouseup', onMouseup)
  props.mindMap.off(
    'mini_map_view_box_position_change',
    onViewBoxPositionChange
  )
})
</script>

<style lang="less" scoped>
.navigatorBox {
  position: absolute;
  height: 220px;
  background-color: #fff;
  bottom: 80px;
  right: 70px;
  box-shadow: 0 0 16px #989898;
  border-radius: 4px;
  border: 1px solid #eee;
  cursor: pointer;
  user-select: none;

  &.isDark {
    background-color: #262a2e;
  }

  .svgBox {
    position: absolute;
    left: 0;
    transform-origin: left top;
  }

  .windowBox {
    position: absolute;
    border: 2px solid rgb(238, 69, 69);
    background-color: rgba(238, 69, 69, 0.2);

    &.withTransition {
      transition: all 0.3s;
    }
  }
}
</style>
