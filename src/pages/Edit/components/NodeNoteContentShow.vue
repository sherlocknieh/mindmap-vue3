<template>
  <div
    class="noteContentViewer customScrollbar"
    ref="noteContentViewer"
    :style="{
      left: this.left + 'px',
      top: this.top + 'px',
      visibility: show ? 'visible' : 'hidden',
    }"
    @click.stop
    @mousedown.stop
    @mousemove.stop
    @mouseup.stop
    @wheel.stop
  >
    <div class="noteContentWrap customScrollbar" ref="noteContentWrap"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

const props = defineProps({
  mindMap: {
    type: Object,
    default() {
      return null
    }
  }
})

const { proxy } = getCurrentInstance()

const editor = ref(null)
const show = ref(false)
const left = ref(0)
const top = ref(0)
const node = ref(null)
const noteContentViewer = ref(null)
const noteContentWrap = ref(null)

const onNodeActive = (...args) => {
  const nodes = [...args[1]]
  if (nodes.length > 0) {
    if (nodes[0] !== node.value) {
      hideNoteContent()
    }
  } else {
    hideNoteContent()
  }
}

// 显示备注浮层
const onShowNoteContent = (content, leftPos, topPos, nodeData) => {
  node.value = nodeData
  editor.value.setMarkdown(content)
  handleALink()
  updateNoteContentPosition(leftPos, topPos)
  show.value = true
}

// 超链接新窗口打开
const handleALink = () => {
  const list = noteContentViewer.value.querySelectorAll('a')
  Array.from(list).forEach(a => {
    a.setAttribute('target', '_blank')
  })
}

// 更新位置
const updateNoteContentPosition = (leftPos, topPos) => {
  const { width, height } = noteContentViewer.value.getBoundingClientRect()
  const { right, bottom } = props.mindMap.elRect
  left.value = leftPos + width > right ? right - width : leftPos
  top.value = topPos + height > bottom ? bottom - height : topPos
}

// 画布缩放事件
const onScale = () => {
  if (!node.value || !show.value) return
  const { left: nodeLeft, top: nodeTop } = node.value.getNoteContentPosition()
  updateNoteContentPosition(nodeLeft, nodeTop)
}

// 隐藏备注浮层
const hideNoteContent = () => {
  show.value = false
}

// 初始化编辑器
const initEditor = () => {
  if (!editor.value) {
    editor.value = new Viewer({
      el: noteContentWrap.value
    })
  }
}

onMounted(() => {
  props.mindMap.el.appendChild(noteContentViewer.value)
  initEditor()
  proxy.$bus.$on('showNoteContent', onShowNoteContent)
  proxy.$bus.$on('hideNoteContent', hideNoteContent)
  document.body.addEventListener('click', hideNoteContent)
  proxy.$bus.$on('node_active', onNodeActive)
  proxy.$bus.$on('scale', onScale)
  proxy.$bus.$on('translate', onScale)
  proxy.$bus.$on('svg_mousedown', hideNoteContent)
  proxy.$bus.$on('expand_btn_click', hideNoteContent)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('showNoteContent', onShowNoteContent)
  proxy.$bus.$off('hideNoteContent', hideNoteContent)
  document.body.removeEventListener('click', hideNoteContent)
  proxy.$bus.$off('node_active', onNodeActive)
  proxy.$bus.$off('scale', onScale)
  proxy.$bus.$off('translate', onScale)
  proxy.$bus.$off('svg_mousedown', hideNoteContent)
  proxy.$bus.$off('expand_btn_click', hideNoteContent)
})
</script>

<style lang="less" scoped>
.noteContentViewer {
  position: fixed;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 2;
  .noteContentWrap {
    max-width: 250px;
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>
