<template>
  <el-dialog
    class="nodeIconDialog"
    :title="$t('nodeIcon.title')"
    v-model="dialogVisible"
    width="500"
  >
    <div class="item" v-for="item in nodeIconList" :key="item.name">
      <div class="title">{{ item.name }}</div>
      <div class="list">
        <div
          class="icon"
          v-for="icon in item.list"
          :key="icon.name"
          v-html="getHtml(icon.icon)"
          :class="{
            selected: iconList.includes(item.type + '_' + icon.name),
          }"
          @click="setIcon(item.type, icon.name)"
        ></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { nodeIconList as nodeIconListData } from 'simple-mind-map/src/svg/icons'
import icon from '@/config/icon'

const { proxy } = getCurrentInstance()

const nodeIconList = [...nodeIconListData, ...icon]
const dialogVisible = ref(false)
const iconList = ref([])
const activeNodes = ref([])

const handleNodeActive = (...args) => {
  activeNodes.value = [...args[1]]
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    iconList.value = firstNode.getData('icon') || []
  } else {
    iconList.value = []
  }
}

const handleShowNodeIcon = () => {
  dialogVisible.value = true
}

const getHtml = (icon) => {
  return /^<svg/.test(icon) ? icon : `<img src="${icon}" />`
}

const setIcon = (type, name) => {
  let key = type + '_' + name
  let index = iconList.value.findIndex(item => {
    return item === key
  })
  // 删除icon
  if (index !== -1) {
    iconList.value.splice(index, 1)
  } else {
    let typeIndex = iconList.value.findIndex(item => {
      return item.split('_')[0] === type
    })
    // 替换icon
    if (typeIndex !== -1) {
      iconList.value.splice(typeIndex, 1, key)
    } else {
      // 增加icon
      iconList.value.push(key)
    }
  }
  activeNodes.value.forEach(node => {
    node.setIcon([...iconList.value])
  })
}

onMounted(() => {
  proxy.$bus.$on('node_active', handleNodeActive)
  proxy.$bus.$on('showNodeIcon', handleShowNodeIcon)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('node_active', handleNodeActive)
  proxy.$bus.$off('showNodeIcon', handleShowNodeIcon)
})
</script>

<style lang="less" scoped>
.nodeIconDialog {
  :deep(.el-dialog__body) {
    padding: 0 20px;
  }

  .deleteBtn {
    margin-bottom: 20px;
  }

  .item {
    margin-bottom: 20px;
    font-weight: bold;

    .title {
      margin-bottom: 10px;
    }

    .list {
      display: flex;
      flex-wrap: wrap;

      .icon {
        width: 24px;
        height: 24px;
        margin-right: 10px;
        margin-bottom: 10px;
        cursor: pointer;
        position: relative;

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
  }
}
</style>
