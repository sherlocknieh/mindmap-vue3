<template>
  <el-tree
    ref="tree"
    class="outlineTree"
    node-key="uid"
    draggable
    default-expand-all
    :class="{ isDark: isDark }"
    :data="data"
    :props="defaultProps"
    :highlight-current="true"
    :expand-on-click-node="false"
    :allow-drag="checkAllowDrag"
    @node-drop="onNodeDrop"
    @node-drag-start="onNodeDragStart"
    @node-drag-end="onNodeDragEnd"
    @current-change="onCurrentChange"
    @mouseenter="isInTreArea = true"
    @mouseleave="isInTreArea = false"
  >
    <template #default="{ node, data }">
      <span
        class="customNode"
        :data-id="data.uid"
        @click="onClick(data)"
      >
        <span
          class="nodeEdit"
          :contenteditable="!isReadonly"
          :key="getKey()"
          @keydown.stop="onNodeInputKeydown($event, node)"
          @keyup.stop
          @blur="onBlur($event, node)"
          @paste="onPaste($event, node)"
          v-html="node.label"
        ></span>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import { useAppStore } from '@/store'
import {
  nodeRichTextToTextWithWrap,
  textToNodeRichTextWithWrap,
  createUid,
  htmlEscape,
  handleInputPasteText
} from 'simple-mind-map/src/utils'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const emit = defineEmits(['scrollTo'])

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const tree = ref(null)
const data = ref([])
const defaultProps = ref({
  label: 'label'
})
const currentData = ref(null)
const notHandleDataChange = ref(false)
const isHandleNodeTreeRenderEnd = ref(false)
const beInsertNodeUid = ref('')
const insertType = ref('')
const isInTreArea = ref(false)
const isAfterCreateNewNode = ref(false)

const isReadonly = computed(() => appStore.isReadonly)
const isDark = computed(() => appStore.localConfig.isDark)

const handleHideTextEdit = () => {
  if (notHandleDataChange.value) {
    notHandleDataChange.value = false
    refresh()
  }
}

const handleDataChange = () => {
  // 在大纲里操作节点时不要响应该事件，否则会重新刷新树
  if (notHandleDataChange.value) {
    notHandleDataChange.value = false
    isAfterCreateNewNode.value = false
    return
  }
  if (isAfterCreateNewNode.value) {
    isAfterCreateNewNode.value = false
    return
  }
  refresh()
}

const handleNodeTreeRenderEnd = () => {
  // 当前存在未完成的节点插入操作
  if (insertType.value) {
    if (insertType.value === 'moveUp') {
      moveUp()
    } else if (insertType.value === 'insertNode') {
      insertNode()
    } else if (insertType.value === 'insertChildNode') {
      insertChildNode()
    }
    insertType.value = ''
    return
  }
  // 插入了新节点后需要做一些操作
  if (isHandleNodeTreeRenderEnd.value) {
    isHandleNodeTreeRenderEnd.value = false
    refresh()
    nextTick(() => {
      afterCreateNewNode()
    })
  }
}

const refresh = () => {
  let treeData = props.mindMap.getData()
  treeData.root = true // 标记根节点
  let walk = root => {
    let text = root.data.richText
      ? nodeRichTextToTextWithWrap(root.data.text)
      : root.data.text
    text = htmlEscape(text)
    text = text.replace(/\n/g, '<br>')
    root.textCache = text // 保存一份修改前的数据，用于对比是否修改了
    root.label = text
    root.uid = root.data.uid
    if (root.children && root.children.length > 0) {
      root.children.forEach(item => {
        walk(item)
      })
    }
  }
  walk(treeData)
  data.value = [treeData]
}

const afterCreateNewNode = () => {
  // 如果是新插入节点，那么需要手动高亮该节点、定位该节点及聚焦
  let id = beInsertNodeUid.value
  if (id && tree.value) {
    try {
      isAfterCreateNewNode.value = true
      // 高亮树节点
      tree.value.setCurrentKey(id)
      let node = tree.value.getNode(id)
      onCurrentChange(node.data)
      // 定位该节点
      onClick(node.data)
      // 聚焦该树节点的编辑框
      const el = document.querySelector(
        `.customNode[data-id="${id}"] .nodeEdit`
      )
      if (el) {
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents(el)
        selection.removeAllRanges()
        selection.addRange(range)
        let offsetTop = el.offsetTop
        emit('scrollTo', offsetTop)
      }
    } catch (error) {
      console.log(error)
    }
  }
  beInsertNodeUid.value = ''
}

const checkAllowDrag = (node) => {
  return !node.data.root
}

const onBlur = (e, node) => {
  // 节点数据没有修改
  if (node.data.textCache === e.target.innerHTML) {
    // 如果存在未执行的插入新节点操作，那么直接执行
    if (insertType.value) {
      if (insertType.value === 'moveUp') {
        moveUp()
      } else if (insertType.value === 'insertNode') {
        insertNode()
      } else if (insertType.value === 'insertChildNode') {
        insertChildNode()
      }
      insertType.value = ''
    }
    return
  }
  // 否则插入新节点操作需要等待当前修改事件渲染完成后再执行
  const richText = node.data.data.richText
  const text = richText ? e.target.innerHTML : e.target.innerText
  const targetNode = props.mindMap.renderer.findNodeByUid(node.data.uid)
  if (!targetNode) return
  notHandleDataChange.value = true
  if (richText) {
    targetNode.setText(textToNodeRichTextWithWrap(text), true)
  } else {
    targetNode.setText(text)
  }
}

const onPaste = (e) => {
  handleInputPasteText(e)
}

const getKey = () => {
  return Math.random()
}

const onNodeInputKeydown = (e) => {
  if (e.keyCode === 13 && !e.shiftKey) {
    // 插入兄弟节点
    e.preventDefault()
    insertType.value = 'insertNode'
    e.target.blur()
  }
  if (e.keyCode === 9) {
    e.preventDefault()
    if (e.shiftKey) {
      // 节点上升一级
      insertType.value = 'moveUp'
      e.target.blur()
    } else {
      // 插入子节点
      insertType.value = 'insertChildNode'
      e.target.blur()
    }
  }
}

const moveUp = () => {
  props.mindMap.execCommand('MOVE_UP_ONE_LEVEL')
}

const insertNode = () => {
  notHandleDataChange.value = true
  isHandleNodeTreeRenderEnd.value = true
  beInsertNodeUid.value = createUid()
  props.mindMap.execCommand('INSERT_NODE', false, [], {
    uid: beInsertNodeUid.value
  })
}

const insertChildNode = () => {
  notHandleDataChange.value = true
  isHandleNodeTreeRenderEnd.value = true
  beInsertNodeUid.value = createUid()
  props.mindMap.execCommand('INSERT_CHILD_NODE', false, [], {
    uid: beInsertNodeUid.value
  })
}

const onClick = (data) => {
  notHandleDataChange.value = true
  const targetNode = props.mindMap.renderer.findNodeByUid(data.uid)
  if (targetNode && targetNode.nodeData.data.isActive) return
  props.mindMap.execCommand('GO_TARGET_NODE', data.uid, () => {
    notHandleDataChange.value = false
  })
}

const onNodeDragStart = () => {
  appStore.setIsDragOutlineTreeNode(true)
}

const onNodeDragEnd = () => {
  appStore.setIsDragOutlineTreeNode(false)
}

const onNodeDrop = (data, target, postion) => {
  notHandleDataChange.value = true
  const node = props.mindMap.renderer.findNodeByUid(data.data.uid)
  const targetNode = props.mindMap.renderer.findNodeByUid(target.data.uid)
  if (!node || !targetNode) {
    return
  }
  switch (postion) {
    case 'before':
      props.mindMap.execCommand('INSERT_BEFORE', node, targetNode)
      break
    case 'after':
      props.mindMap.execCommand('INSERT_AFTER', node, targetNode)
      break
    case 'inner':
      props.mindMap.execCommand('MOVE_NODE_TO', node, targetNode)
      break
    default:
      break
  }
}

const onCurrentChange = (data) => {
  currentData.value = data
}

const onKeyDown = (e) => {
  if (!isInTreArea.value) return
  if ([46, 8].includes(e.keyCode) && currentData.value) {
    e.stopPropagation()
    props.mindMap.renderer.textEdit.hideEditTextBox()
    const node = props.mindMap.renderer.findNodeByUid(currentData.value.uid)
    if (node && !node.isRoot) {
      notHandleDataChange.value = true
      tree.value.remove(currentData.value)
      props.mindMap.execCommand('REMOVE_NODE', [node])
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  proxy.$bus.$on('data_change', handleDataChange)
  proxy.$bus.$on('node_tree_render_end', handleNodeTreeRenderEnd)
  proxy.$bus.$on('hide_text_edit', handleHideTextEdit)
  refresh()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  proxy.$bus.$off('data_change', handleDataChange)
  proxy.$bus.$off('node_tree_render_end', handleNodeTreeRenderEnd)
  proxy.$bus.$off('hide_text_edit', handleHideTextEdit)
})
</script>

<style lang="less" scoped>
.customNode {
  width: 100%;
  color: rgba(0, 0, 0, 0.85);
  font-weight: bold;

  .nodeEdit {
    outline: none;
    white-space: normal;
    padding-right: 20px;
  }
}
</style>
<style lang="less" scoped>
@import url('../../../style/outlineTree.less');
</style>
