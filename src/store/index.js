import { defineStore } from 'pinia'
import { storeLocalConfig } from '@/api/localStorage'

export const useAppStore = defineStore('app', {
  state: () => ({
    isHandleLocalFile: false, // 是否操作的是本地文件
    localConfig: {
      // 本地配置
      isZenMode: false, // 是否是禅模式
      // 是否开启节点富文本
      openNodeRichText: true,
      // 鼠标行为
      useLeftKeySelectionRightKeyDrag: false,
      // 是否显示滚动条
      isShowScrollbar: false,
      // 是否是暗黑模式
      isDark: false,
      // 是否开启AI功能
      enableAi: true,
    },
    activeSidebar: '', // 当前显示的侧边栏
    isOutlineEdit: false, // 是否是大纲编辑模式
    isReadonly: false, // 是否只读
    isSourceCodeEdit: false, // 是否是源码编辑模式
    extraTextOnExport: '', // 导出时底部添加的文字
    isDragOutlineTreeNode: false, // 当前是否正在拖拽大纲树的节点
    aiConfig: {
      api: 'http://ark.cn-beijing.volces.com/api/v3/chat/completions',
      key: '',
      model: '',
      port: 3456,
      method: 'POST',
    },
    // 扩展主题列表
    extendThemeGroupList: [],
    // 内置背景图片
    bgList: [],
  }),

  actions: {
    // 设置操作本地文件标志位
    setIsHandleLocalFile(data) {
      this.isHandleLocalFile = data
    },

    // 设置本地配置
    setLocalConfig(data) {
      const aiConfigKeys = Object.keys(this.aiConfig)
      Object.keys(data).forEach((key) => {
        if (aiConfigKeys.includes(key)) {
          this.aiConfig[key] = data[key]
        } else {
          this.localConfig[key] = data[key]
        }
      })
      storeLocalConfig({
        ...this.localConfig,
        ...this.aiConfig,
      })
    },

    // 设置当前显示的侧边栏
    setActiveSidebar(data) {
      this.activeSidebar = data
    },

    // 设置大纲编辑模式
    setIsOutlineEdit(data) {
      this.isOutlineEdit = data
    },

    // 设置是否只读
    setIsReadonly(data) {
      this.isReadonly = data
    },

    // 设置源码编辑模式
    setIsSourceCodeEdit(data) {
      this.isSourceCodeEdit = data
    },

    // 设置导出时底部添加的文字
    setExtraTextOnExport(data) {
      this.extraTextOnExport = data
    },

    // 设置树节点拖拽
    setIsDragOutlineTreeNode(data) {
      this.isDragOutlineTreeNode = data
    },

    // 扩展主题列表
    setExtendThemeGroupList(data) {
      this.extendThemeGroupList = data
    },

    // 设置背景图片列表
    setBgList(data) {
      this.bgList = data
    },
  },
})
