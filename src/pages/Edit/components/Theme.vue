<template>
  <Sidebar ref="sidebar" :title="$t('theme.title')">
    <div class="themeGroupList" :class="{ isDark: isDark }">
      <el-tabs v-model="activeName" class="tabBox">
        <el-tab-pane
          v-for="group in groupList"
          :key="group.name"
          :label="group.name"
          :name="group.name"
        ></el-tab-pane>
      </el-tabs>
      <div class="themeListTheme customScrollbar">
        <div
          class="themeItem"
          v-for="item in currentList"
          :key="item.value"
          @click="useTheme(item)"
          :class="{ active: item.value === theme }"
        >
          <div class="imgBox">
            <img :src="item.img || themeImgMap[item.value]" alt="" />
          </div>
          <div class="name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Sidebar from './Sidebar.vue'
import { storeData } from '@/api'
import { useAppStore } from '@/store'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  data: {
    type: [Object, null],
    default: null
  },
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const sidebar = ref(null)
const themeListData = ref([
  {
    name: '默认主题',
    value: 'default',
    dark: false
  },
  ...themeList
].reverse())
const theme = ref('')
const activeName = ref('')
const defaultGroupList = ref([])

const isDark = computed(() => appStore.localConfig.isDark)
const activeSidebar = computed(() => appStore.activeSidebar)
const extendThemeGroupList = computed(() => appStore.extendThemeGroupList)

const groupList = computed(() => {
  return [...defaultGroupList.value, ...extendThemeGroupList.value]
})

const currentList = computed(() => {
  return groupList.value.find(item => {
    return item.name === activeName.value
  }).list
})

watch(activeSidebar, (val) => {
  if (val === 'theme') {
    theme.value = props.mindMap.getTheme()
    sidebar.value.show = true
  } else {
    sidebar.value.show = false
  }
})

const handleViewThemeChange = () => {
  theme.value = props.mindMap.getTheme()
  handleDark()
}

const initGroup = () => {
  const baiduThemes = [
    'default',
    'skyGreen',
    'classic2',
    'classic3',
    'classicGreen',
    'classicBlue',
    'blueSky',
    'brainImpairedPink',
    'earthYellow',
    'freshGreen',
    'freshRed',
    'romanticPurple',
    'pinkGrape',
    'mint'
  ]
  const baiduList = []
  const classicsList = []
  themeListData.value.forEach(item => {
    if (baiduThemes.includes(item.value)) {
      baiduList.push(item)
    } else if (!item.dark) {
      classicsList.push(item)
    }
  })
  defaultGroupList.value = [
    {
      name: proxy.$t('theme.classics'),
      list: classicsList
    },
    {
      name: proxy.$t('theme.dark'),
      list: themeListData.value.filter(item => {
        return item.dark
      })
    },
    {
      name: proxy.$t('theme.simple'),
      list: baiduList
    }
  ]
  activeName.value = defaultGroupList.value[0].name
}

const useTheme = (themeItem) => {
  if (themeItem.value === theme.value) return
  theme.value = themeItem.value
  handleDark()
  const customThemeConfig = props.mindMap.getCustomThemeConfig()
  const hasCustomThemeConfig = Object.keys(customThemeConfig).length > 0
  if (hasCustomThemeConfig) {
    ElMessageBox.confirm(proxy.$t('theme.coverTip'), proxy.$t('theme.tip'), {
      confirmButtonText: proxy.$t('theme.cover'),
      cancelButtonText: proxy.$t('theme.reserve'),
      type: 'warning',
      distinguishCancelAndClose: true,
      callback: action => {
        if (action === 'confirm') {
          props.mindMap.setThemeConfig({}, true)
          props.data.theme.config = {}
          changeTheme(themeItem, {})
        } else if (action === 'cancel') {
          changeTheme(themeItem, customThemeConfig)
        }
      }
    })
  } else {
    changeTheme(themeItem, customThemeConfig)
  }
}

const changeTheme = (themeItem, config) => {
  proxy.$bus.$emit('showLoading')
  props.mindMap.setTheme(themeItem.value)
  storeData({
    theme: {
      template: themeItem.value,
      config
    }
  })
}

const handleDark = () => {
  const extendThemeList = []
  extendThemeGroupList.value.forEach(group => {
    extendThemeList.push(...group.list)
  })
  let target = [...themeListData.value, ...extendThemeList].find(item => {
    return item.value === theme.value
  })
  appStore.setLocalConfig({
    isDark: target.dark
  })
}

onMounted(() => {
  initGroup()
  theme.value = props.mindMap.getTheme()
  props.mindMap.on('view_theme_change', handleViewThemeChange)
})

onBeforeUnmount(() => {
  props.mindMap.off('view_theme_change', handleViewThemeChange)
})
</script>

<style lang="less" scoped>
.themeGroupList {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  &.isDark {
    .name {
      color: #fff;
    }
  }

  .tabBox {
    flex-shrink: 0;

    :deep(.el-tabs__nav-wrap) {
      display: flex;
      justify-content: center;
    }
  }

  .themeListTheme {
    height: 100%;
    overflow-y: auto;
    padding: 0 20px;

    .themeItem {
      width: 100%;
      cursor: pointer;
      border-bottom: 1px solid #e9e9e9;
      margin-bottom: 20px;
      padding-bottom: 20px;
      transition: all 0.2s;
      border: 3px solid transparent;
      border-radius: 5px;
      overflow: hidden;

      &:last-of-type {
        border: none;
      }

      &:hover {
        box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
          0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
      }

      &.active {
        border: 3px solid rgb(154, 198, 250);
      }

      .imgBox {
        width: 100%;

        img {
          width: 100%;
        }
      }
      .name {
        text-align: center;
        font-size: 14px;
      }
    }
  }
}
</style>
