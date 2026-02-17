<template>
  <Sidebar ref="sidebar" :title="$t('note.title')">
    <div class="noteContentWrap" ref="noteContentWrap"></div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Sidebar from './Sidebar.vue'
import { useAppStore } from '@/store'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const editor = ref(null)
const node = ref(null)
const sidebar = ref(null)
const noteContentWrap = ref(null)

const isDark = computed(() => appStore.localConfig.isDark)
const activeSidebar = computed(() => appStore.activeSidebar)

watch(activeSidebar, (val) => {
  if (val === 'noteSidebar') {
    sidebar.value.show = true
  } else {
    sidebar.value.show = false
  }
})

const onNodeActive = (...args) => {
  if (activeSidebar.value !== 'noteSidebar') {
    return
  }
  const nodes = [...args[1]]
  if (nodes.length > 0) {
    if (nodes[0] !== node.value) {
      appStore.setActiveSidebar(null)
    }
  } else {
    appStore.setActiveSidebar(null)
  }
}

// 初始化编辑器
const initEditor = () => {
  if (!editor.value) {
    editor.value = new Viewer({
      el: noteContentWrap.value
    })
  }
}

const onNodeNoteClick = (nodeData) => {
  node.value = nodeData
  appStore.setActiveSidebar('noteSidebar')
  editor.value.setMarkdown(nodeData.getData('note'))
}

onMounted(() => {
  initEditor()
  proxy.$bus.$on('node_active', onNodeActive)
  props.mindMap.on('node_note_click', onNodeNoteClick)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('node_active', onNodeActive)
  props.mindMap.off('node_note_click', onNodeNoteClick)
})
</script>

<style lang="less" scoped>
.noteContentWrap {
  padding: 12px 20px;
}
</style>
