<template>
  <div
    class="outlineEditContainer"
    :class="{ isDark: isDark }"
    ref="outlineEditContainer"
    v-if="isOutlineEdit"
  >
    <div class="btnList">
      <el-tooltip
        class="item"
        effect="dark"
        :content="$t('outline.print')"
        placement="top"
      >
        <div class="btn" @click="onPrint">
          <span class="icon iconfont iconprinting"></span>
        </div>
      </el-tooltip>
      <div class="btn" @click="onClose">
        <span class="icon iconfont iconguanbi"></span>
      </div>
    </div>
    <div
      class="outlineEditBox"
      id="fullScreenOutlineEditBox"
      ref="outlineEditBox"
    >
      <div class="outlineEdit">
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
          @current-change="onCurrentChange"
        >
          <template #default="{ node, data }">
            <span
              class="customNode"
              :data-id="data.uid"
            >
              <span
                class="nodeEdit"
                :contenteditable="!isReadonly"
                :key="getKey()"
                @blur="onBlur($event, node)"
                @keydown.stop="onNodeInputKeydown($event, node)"
                @keyup.stop
                @paste="onPaste($event, node)"
                v-html="node.label"
              ></span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useAppStore } from '@/store'
import { useI18n } from 'vue-i18n'
import {
  nodeRichTextToTextWithWrap,
  textToNodeRichTextWithWrap,
  createUid,
  simpleDeepClone,
  htmlEscape,
  handleInputPasteText,
} from 'simple-mind-map/src/utils'
import { storeData } from '@/api'
import { printOutline } from '@/utils'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const { t: $t } = useI18n()
const appStore = useAppStore()

const outlineEditContainer = ref(null)
const outlineEditBox = ref(null)
const tree = ref(null)
const data = ref([])
const defaultProps = ref({
  label: 'label'
})
const currentData = ref(null)

const isReadonly = computed(() => appStore.isReadonly)
const isDark = computed(() => appStore.localConfig.isDark)
const isOutlineEdit = computed(() => appStore.isOutlineEdit)

watch(isOutlineEdit, (val) => {
  if (val) {
    refresh()
    nextTick(() => {
      document.body.appendChild(outlineEditContainer.value)
    })
  }
})

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

const checkAllowDrag = (node) => {
  return !node.data.root
}

const onNodeDrop = () => {
  save()
}

const onCurrentChange = (nodeData) => {
  currentData.value = nodeData
}

const onBlur = (e, node) => {
  // 节点数据没有修改
  if (node.data.textCache === e.target.innerHTML) {
    return
  }
  const richText = node.data.data.richText
  const text = richText ? e.target.innerHTML : e.target.innerText
  node.data.data.text = richText ? textToNodeRichTextWithWrap(text) : text
  node.data.textCache = e.target.innerHTML
  save()
}

const onNodeInputKeydown = (e, node) => {
  const richText = !!node.data.data.richText
  const uid = createUid()
  const text = $t('outline.nodeDefaultText')
  const nodeData = {
    textCache: text,
    uid,
    label: text,
    data: {
      text: richText ? textToNodeRichTextWithWrap(text) : text,
      uid,
      richText
    },
    children: []
  }
  if (e.keyCode === 13 && !e.shiftKey) {
    e.preventDefault()
    if (node.data.root) {
      return
    }
    tree.value.insertAfter(nodeData, node)
  }
  if (e.keyCode === 9) {
    e.preventDefault()
    if (e.shiftKey) {
      // 上移一个层级
      tree.value.insertAfter(node.data, node.parent)
      tree.value.remove(node)
    } else {
      tree.value.append(nodeData, node)
    }
  }
  save()
  nextTick(() => {
    tree.value.setCurrentKey(uid)
    const el = document.querySelector(
      `.customNode[data-id="${uid}"] .nodeEdit`
    )
    if (el) {
      let selection = window.getSelection()
      let range = document.createRange()
      range.selectNodeContents(el)
      selection.removeAllRanges()
      selection.addRange(range)
      let offsetTop = el.offsetTop
      scrollTo(offsetTop)
    }
  })
}

const onKeyDown = (e) => {
  if (!isOutlineEdit.value) return
  if ([46, 8].includes(e.keyCode) && currentData.value) {
    e.stopPropagation()
    tree.value.remove(currentData.value)
    currentData.value = null
    save()
  }
}

const onPaste = (e) => {
  handleInputPasteText(e)
}

const getKey = () => {
  return Math.random()
}

const onPrint = () => {
  printOutline(outlineEditBox.value)
}

const onClose = () => {
  appStore.setIsOutlineEdit(false)
  proxy.$bus.$emit('setData', getData())
}

const scrollTo = (y) => {
  let container = outlineEditBox.value
  let height = container.offsetHeight
  let top = container.scrollTop
  y += 50
  if (y > top + height) {
    container.scrollTo(0, y - height / 2)
  }
}

const getData = () => {
  let newNode = {}
  let node = data.value[0]
  let walk = (root, newRoot) => {
    newRoot.data = root.data
    newRoot.children = []
    ;(root.children || []).forEach(child => {
      const newChild = {}
      newRoot.children.push(newChild)
      walk(child, newChild)
    })
  }
  walk(node, newNode)
  return simpleDeepClone(newNode)
}

const save = () => {
  storeData({
    root: getData()
  })
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style lang="less" scoped>
.outlineEditContainer {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1999;
  background-color: #fff;
  overflow: hidden;
  &.isDark {
    background-color: #262a2e;

    .btnList {
      .btn {
        .icon {
          color: #fff;
        }
      }
    }
  }

  .btnList {
    position: absolute;
    right: 40px;
    top: 20px;
    display: flex;
    align-items: center;

    .btn {
      cursor: pointer;
      margin-left: 12px;

      .icon {
        font-size: 28px;
      }
    }
  }

  .outlineEditBox {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 50px 0;

    .outlineEdit {
      width: 1000px;
      height: 100%;
      height: max-content;
      margin: 0 auto;

      :deep(.customNode .nodeEdit) {
        max-width: 800px;
      }
    }
  }
}
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
