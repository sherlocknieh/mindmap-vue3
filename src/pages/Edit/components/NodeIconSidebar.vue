<template>
  <Sidebar ref="sidebar" :title="$t('nodeIconSidebar.title')">
    <div class="box" :class="{ isDark: isDark }">
      <el-tabs v-model="activeName">
        <el-tab-pane
          :label="$t('nodeIconSidebar.icon')"
          name="icon"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('nodeIconSidebar.sticker')"
          name="image"
        ></el-tab-pane>
      </el-tabs>
      <div class="boxContent">
        <!-- 图标 -->
        <div class="iconBox" v-if="activeName === 'icon'">
          <div class="item" v-for="item in nodeIconList_computed" :key="item.name">
            <div class="title">{{ item.name }}</div>
            <div class="list">
              <div
                class="icon"
                v-for="icon in item.list"
                :key="icon.name"
                v-html="getHtml(icon.icon)"
                :class="{
                  selected: iconList.includes(item.type + '_' + icon.name)
                }"
                @click="setIcon(item.type, icon.name)"
              ></div>
            </div>
          </div>
        </div>
        <!-- 贴纸 -->
        <div class="imageBox" v-if="activeName === 'image'">
          <div class="item" v-for="item in nodeImageList" :key="item.name">
            <div class="title">{{ item.name }}</div>
            <div class="list">
              <div
                class="icon"
                v-for="image in item.list"
                :key="image.url"
                :class="{
                  selected: nodeImage === image.url
                }"
                @click="setImage(image)"
              >
                <img :src="image.url" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Sidebar from './Sidebar.vue'
import { useAppStore } from '@/store'
import { nodeIconList } from 'simple-mind-map/src/svg/icons'
import { mergerIconList } from 'simple-mind-map/src/utils/index'
import icon from '@/config/icon'
import image from '@/config/image'

const { proxy } = getCurrentInstance()

const appStore = useAppStore()

const sidebar = ref(null)
const activeName = ref('icon')
const nodeIconList_computed = mergerIconList([...nodeIconList, ...icon])
const nodeImageList = [...image]
const iconList = ref([])
const nodeImage = ref('')
const activeNodes = ref([])

const activeSidebar = computed(() => appStore.activeSidebar)
const isDark = computed(() => appStore.localConfig.isDark)

watch(activeSidebar, (val) => {
  if (val === 'nodeIconSidebar') {
    sidebar.value.show = true
  } else {
    sidebar.value.show = false
  }
})

const handleNodeActive = (...args) => {
  activeNodes.value = [...args[1]]
  if (activeNodes.value.length > 0) {
    if (activeNodes.value.length === 1) {
      let firstNode = activeNodes.value[0]
      nodeImage.value = firstNode.getData('image') || ''
      iconList.value = firstNode.getData('icon') || [] // 回显图标
    } else {
      nodeImage.value = []
      iconList.value = []
    }
  } else {
    iconList.value = []
    nodeImage.value = ''
  }
}

const handleShowNodeIcon = () => {
  // dialogVisible is not used in this component
}

// 获取图标渲染方式
const getHtml = (icon) => {
  return /^<svg/.test(icon) ? icon : `<img src="${icon}" />`
}

// 设置icon
const setIcon = (type, name) => {
  activeNodes.value.forEach(node => {
    const iconListData = [...(node.getData('icon') || [])]
    let key = type + '_' + name
    let index = iconListData.findIndex(item => {
      return item === key
    })
    // 删除icon
    if (index !== -1) {
      iconListData.splice(index, 1)
    } else {
      let typeIndex = iconListData.findIndex(item => {
        return item.split('_')[0] === type
      })
      // 替换icon
      if (typeIndex !== -1) {
        iconListData.splice(typeIndex, 1, key)
      } else {
        // 增加icon
        iconListData.push(key)
      }
    }
    node.setIcon(iconListData)
    if (activeNodes.value.length === 1) {
      iconList.value = iconListData
    }
  })
}

// 设置贴纸
const setImage = (image) => {
  activeNodes.value.forEach(node => {
    nodeImage.value = image.url
    node.setImage({
      ...image
    })
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
.box {
  padding: 0 20px;

  &.isDark {
    .title {
      color: #fff;
    }
  }

  .title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }

  .boxContent {
    .iconBox {
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

    .imageBox {
      margin-bottom: 20px;
      font-weight: bold;

      .title {
        margin-bottom: 10px;
      }

      .list {
        display: flex;
        flex-wrap: wrap;

        .icon {
          width: 50px;
          height: 50px;
          margin-right: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          position: relative;

          :deep(img) {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          &.selected {
            &::after {
              content: '';
              position: absolute;
              left: -4px;
              top: -4px;
              width: 54px;
              height: 54px;
              border: 2px solid #409eff;
            }
          }
        }
      }
    }
  }
}
</style>
