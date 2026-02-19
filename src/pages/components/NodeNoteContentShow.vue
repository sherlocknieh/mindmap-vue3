<template>
  <teleport to="body">
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
      @wheel.passive.stop
    >
      <div class="noteContentWrap customScrollbar" ref="noteContentWrap"></div>
    </div>
  </teleport>
</template>

<script>
import { $on, $off, $once, $emit } from '@/utils/gogocodeTransfer'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

// 节点备注内容显示
export default {
  props: {
    mindMap: {
      type: Object,
      default() {
        return null
      },
    },
  },
  data() {
    return {
      editor: null,
      show: false,
      left: 0,
      top: 0,
      node: null,
    }
  },
  created() {
    $on(this.$bus, 'showNoteContent', this.onShowNoteContent)
    $on(this.$bus, 'hideNoteContent', this.hideNoteContent)
    document.body.addEventListener('click', this.hideNoteContent)
    $on(this.$bus, 'node_active', this.onNodeActive)
    $on(this.$bus, 'scale', this.onScale)
    $on(this.$bus, 'translate', this.onScale)
    $on(this.$bus, 'svg_mousedown', this.hideNoteContent)
    $on(this.$bus, 'expand_btn_click', this.hideNoteContent)
  },
  mounted() {
    this.initEditor()
  },
  beforeUnmount() {
    $off(this.$bus, 'showNoteContent', this.onShowNoteContent)
    $off(this.$bus, 'hideNoteContent', this.hideNoteContent)
    document.body.removeEventListener('click', this.hideNoteContent)
    $off(this.$bus, 'node_active', this.onNodeActive)
    $off(this.$bus, 'scale', this.onScale)
    $off(this.$bus, 'translate', this.onScale)
    $off(this.$bus, 'svg_mousedown', this.hideNoteContent)
    $off(this.$bus, 'expand_btn_click', this.hideNoteContent)
  },
  methods: {
    onNodeActive(...args) {
      const nodes = [...args[1]]
      if (nodes.length > 0) {
        if (nodes[0] !== this.node) {
          this.hideNoteContent()
        }
      } else {
        this.hideNoteContent()
      }
    },

    // 显示备注浮层
    onShowNoteContent(content, left, top, node) {
      this.node = node
      this.editor.setMarkdown(content)
      this.handleALink()
      this.updateNoteContentPosition(left, top)
      this.show = true
    },

    // 超链接新窗口打开
    handleALink() {
      const list = this.$refs.noteContentViewer.querySelectorAll('a')
      Array.from(list).forEach((a) => {
        a.setAttribute('target', '_blank')
      })
    },

    // 更新位置
    updateNoteContentPosition(left, top) {
      const { width, height } =
        this.$refs.noteContentViewer.getBoundingClientRect()
      const { right, bottom } = this.mindMap.elRect
      this.left = left + width > right ? right - width : left
      this.top = top + height > bottom ? bottom - height : top
    },

    // 画布缩放事件
    onScale() {
      if (!this.node || !this.show) return
      const { left, top } = this.node.getNoteContentPosition()
      this.updateNoteContentPosition(left, top)
    },

    // 隐藏备注浮层
    hideNoteContent() {
      this.show = false
    },

    // 初始化编辑器
    initEditor() {
      if (!this.editor) {
        this.editor = new Viewer({
          el: this.$refs.noteContentWrap,
        })
      }
    },
  },
}
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
