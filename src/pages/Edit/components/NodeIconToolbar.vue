<template>
  <div
    class="nodeIconToolbar"
    ref="nodeIconToolbar"
    :style="style"
    @click.stop.passive
    v-show="showNodeIconToolbar"
  >
    <div class="iconListBox">
      <div
        class="icon"
        v-for="icon in iconList"
        :key="icon.name"
        v-html="getHtml(icon.icon)"
        :class="{
          selected: nodeIconList.includes(iconType + '_' + icon.name),
        }"
        @click="setIcon(icon.name)"
      ></div>
    </div>
    <div class="btnBox">
      <span class="btn iconfont iconshanchu" @click="deleteIcon"></span>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { nodeIconList as _nodeIconList } from 'simple-mind-map/src/svg/icons'
import icon from '@/config/icon'
import { useAppStore } from '@/store'

const { proxy } = getCurrentInstance()

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const appStore = useAppStore()

const allIconList = [..._nodeIconList, ...icon]

const nodeIconToolbar = ref(null)
const showNodeIconToolbar = ref(false)
const style = ref({
  left: 0,
  top: 0
})
const node = ref(null)
const iconType = ref('')
const iconName = ref('')
const nodeIconList = ref([])
const iconList = ref([])

const activeSidebar = computed(() => appStore.activeSidebar)

const show = (nodeInstance, iconKey) => {
  node.value = nodeInstance
  iconType.value = iconKey.split('_')[0]
  iconName.value = iconKey.split('_')[1]
  nodeIconList.value = nodeInstance.getData('icon') || []
  iconList.value = [...allIconList.find((item) => {
    return item.type === iconType.value
  }).list]
  updatePos()
  showNodeIconToolbar.value = true
  if (activeSidebar.value === 'nodeIconSidebar') {
    appStore.setActiveSidebar(null)
  }
}

const close = () => {
  showNodeIconToolbar.value = false
  node.value = null
  iconType.value = ''
  iconName.value = ''
  nodeIconList.value = []
  iconList.value = []
  style.value.left = 0
  style.value.top = 0
}

const updatePos = () => {
  if (!node.value) return
  const rect = node.value.getRect()
  style.value.left = rect.x + 'px'
  style.value.top = rect.y + rect.height + 'px'
}

const onScale = () => {
  updatePos()
}

const onNodeActive = (activeNode) => {
  if (activeNode === node.value) {
    return
  }
  close()
}

const deleteIcon = () => {
  setIcon(iconName.value)
  close()
}

// 获取图标渲染方式
const getHtml = (iconData) => {
  return /^<svg/.test(iconData) ? iconData : `<img src="${iconData}" />`
}

// 设置icon
const setIcon = (name) => {
  let key = iconType.value + '_' + name
  let index = nodeIconList.value.findIndex(item => {
    return item === key
  })
  // 删除icon
  if (index !== -1) {
    nodeIconList.value.splice(index, 1)
  } else {
    let typeIndex = nodeIconList.value.findIndex(item => {
      return item.split('_')[0] === iconType.value
    })
    // 替换icon
    if (typeIndex !== -1) {
      nodeIconList.value.splice(typeIndex, 1, key)
      iconName.value = name
    } else {
      // 增加icon
      nodeIconList.value.push(key)
    }
  }
  node.value.setIcon([...nodeIconList.value])
}

onMounted(() => {
  document.body.append(nodeIconToolbar.value)
  props.mindMap.on('node_icon_click', show)
  props.mindMap.on('draw_click', close)
  props.mindMap.on('svg_mousedown', close)
  props.mindMap.on('node_dblclick', close)
  props.mindMap.on('node_active', onNodeActive)
  props.mindMap.on('scale', onScale)
  proxy.$bus.$on('close_node_icon_toolbar', close)
})

onBeforeUnmount(() => {
  props.mindMap.off('node_icon_click', show)
  props.mindMap.off('draw_click', close)
  props.mindMap.off('svg_mousedown', close)
  props.mindMap.off('node_dblclick', close)
  props.mindMap.off('node_active', onNodeActive)
  props.mindMap.off('scale', onScale)
  proxy.$bus.$off('close_node_icon_toolbar', close)
})
</script>

<style lang="less" scoped>
.nodeIconToolbar {
  position: fixed;
  z-index: 2000;
  width: 210px;
  max-height: 170px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .iconListBox {
    width: 100%;
    height: 180px;
    overflow-y: auto;
    padding: 10px;

    .icon {
      width: 24px;
      height: 24px;
      margin: 5px;
      cursor: pointer;
      position: relative;
      float: left;

      :deep(img) {
        width: 100%;
        height: 100%;
      }

      :deep(svg) {
        width: 100%;
        height: 100%;
      }

      &.selected {
        &::after {
          content: '';
          position: absolute;
          left: -4px;
          top: -4px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #409eff;
        }
      }
    }
  }

  .btnBox {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #eee;
    flex-shrink: 0;

    .iconListBox {
        width: 100%;
        height: 180px;
        overflow-y: auto;
        padding: 10px;

        .icon {
            width: 24px;
            height: 24px;
            margin: 5px;
            cursor: pointer;
            position: relative;
            float: left;

            :deep(img) {
                width: 100%;
                height: 100%;
            }

            :deep(svg) {
                width: 100%;
                height: 100%;
            }

            &.selected {
                &::after {
                    content: '';
                    position: absolute;
                    left: -4px;
                    top: -4px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid #409eff;
                }
            }
        }
    }

    .btnBox {
        width: 100%;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid #eee;
        flex-shrink: 0;

        .btn {
            cursor: pointer;
            color: rgba(26, 26, 26, 0.8);
        }
    }
  }
}
</style>