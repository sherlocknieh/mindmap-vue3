<template>
  <div
    class="nodeImgPlacementToolbar"
    ref="nodeImgPlacementToolbar"
    :style="style"
    @click.stop.passive
    v-show="showImgPlacementToolbar"
  >
    <div
      class="imgPlacementItem iconfont iconcontentleft"
      v-for="item in imgPlacementList"
      :key="item"
      :class="[
        {
          selected: imgPlacement === item,
        },
        'icon_' + item,
      ]"
      @click="updateImgPlacement(item)"
    ></div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const nodeImgPlacementToolbar = ref(null)
const showImgPlacementToolbar = ref(false)
const style = reactive({
  left: 0,
  top: 0
})
const imgPlacementList = ['top', 'bottom', 'left', 'right']
const node = ref(null)
const imgNode = ref(null)
const imgPlacement = ref('')

const show = (n, img) => {
  node.value = n
  imgPlacement.value = n.getStyle('imgPlacement')
  imgNode.value = img
  showImgPlacementToolbar.value = true
  nextTick(() => {
    updatePos()
  })
}

const close = () => {
  showImgPlacementToolbar.value = false
  node.value = null
  imgPlacement.value = ''
  imgNode.value = null
  style.left = 0
  style.top = 0
}

const updatePos = () => {
  if (!imgNode.value) return
  const {
    width,
    height
  } = nodeImgPlacementToolbar.value.getBoundingClientRect()
  const { width: imgWidth, x, y } = imgNode.value.rbox()
  style.left = x + imgWidth / 2 - width / 2 + 'px'
  style.top = y - height - 5 + 'px'
}

const onScale = () => {
  updatePos()
}

const onNodeActive = (n) => {
  if (n === node.value) {
    return
  }
  close()
}

const updateImgPlacement = (item) => {
  imgPlacement.value = item
  node.value.setStyle('imgPlacement', item)
  close()
}

onMounted(() => {
  props.mindMap.on('node_img_click', show)
  props.mindMap.on('draw_click', close)
  props.mindMap.on('svg_mousedown', close)
  props.mindMap.on('node_dblclick', close)
  props.mindMap.on('node_active', onNodeActive)
  props.mindMap.on('scale', onScale)
  props.mindMap.on('node_img_adjust_btn_mousedown', close)
  props.mindMap.on('delete_node_img_from_delete_btn', close)
  props.mindMap.on('translate', close)
  document.body.append(nodeImgPlacementToolbar.value)
})

onBeforeUnmount(() => {
  props.mindMap.off('node_img_click', show)
  props.mindMap.off('draw_click', close)
  props.mindMap.off('svg_mousedown', close)
  props.mindMap.off('node_dblclick', close)
  props.mindMap.off('node_active', onNodeActive)
  props.mindMap.off('scale', onScale)
  props.mindMap.off('node_img_adjust_btn_mousedown', close)
  props.mindMap.off('delete_node_img_from_delete_btn', close)
  props.mindMap.off('translate', close)
})
</script>

<style lang="less" scoped>
.nodeImgPlacementToolbar {
  position: fixed;
  z-index: 2000;
  height: 40px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 0 10px;
  .imgPlacementItem {
    width: 30px;
    height: 30px;
    margin: 5px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background-color: rgb(237, 237, 237);
    }

    &.icon_top {
      transform: rotateZ(90deg);
    }

    &.icon_bottom {
      transform: rotateZ(-90deg);
    }

    &.icon_right {
      transform: rotateZ(180deg);
    }

    &.selected {
      background-color: rgb(237, 237, 237);
    }
  }
}
</style>
