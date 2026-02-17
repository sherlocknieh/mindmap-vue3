<template>
  <div
    class="contextmenuContainer listBox"
    v-if="isShow"
    ref="contextmenuRef"
    :style="{ left: left + 'px', top: top + 'px' }"
    :class="{ isDark: isDark }"
  >
    <template v-if="type === 'node'">
      <div
        class="item"
        @click="exec('INSERT_NODE', insertNodeBtnDisabled)"
        :class="{ disabled: insertNodeBtnDisabled }"
      >
        <span class="name">{{ $t('contextmenu.insertSiblingNode') }}</span>
        <span class="desc">Enter</span>
      </div>
      <div
        class="item"
        @click="exec('INSERT_CHILD_NODE')"
        :class="{ disabled: isGeneralization }"
      >
        <span class="name">{{ $t('contextmenu.insertChildNode') }}</span>
        <span class="desc">Tab</span>
      </div>
      <div
        class="item"
        @click="exec('INSERT_PARENT_NODE')"
        :class="{ disabled: insertNodeBtnDisabled }"
      >
        <span class="name">{{ $t('contextmenu.insertParentNode') }}</span>
        <span class="desc">Shift + Tab</span>
      </div>
      <div
        class="item"
        @click="exec('ADD_GENERALIZATION')"
        :class="{ disabled: insertNodeBtnDisabled }"
      >
        <span class="name">{{ $t('contextmenu.insertSummary') }}</span>
        <span class="desc">Ctrl + G</span>
      </div>
      <div class="splitLine"></div>
      <div
        class="item"
        @click="exec('UP_NODE')"
        :class="{ disabled: upNodeBtnDisabled }"
      >
        <span class="name">{{ $t('contextmenu.moveUpNode') }}</span>
        <span class="desc">Ctrl + ↑</span>
      </div>
      <div
        class="item"
        @click="exec('DOWN_NODE')"
        :class="{ disabled: downNodeBtnDisabled }"
      >
        <span class="name">{{ $t('contextmenu.moveDownNode') }}</span>
        <span class="desc">Ctrl + ↓</span>
      </div>
      <div class="item" @click="exec('UNEXPAND_ALL')">
        <span class="name">{{ $t('contextmenu.unExpandNodeChild') }}</span>
      </div>
      <div class="item" @click="exec('EXPAND_ALL')">
        <span class="name">{{ $t('contextmenu.expandNodeChild') }}</span>
      </div>
      <div class="splitLine"></div>
      <div class="item danger" @click="exec('REMOVE_NODE')">
        <span class="name">{{ $t('contextmenu.deleteNode') }}</span>
        <span class="desc">Delete</span>
      </div>
      <div class="item danger" @click="exec('REMOVE_CURRENT_NODE')">
        <span class="name">{{ $t('contextmenu.deleteCurrentNode') }}</span>
        <span class="desc">Shift + Backspace</span>
      </div>
      <div class="splitLine"></div>
      <div
        class="item"
        @click="exec('COPY_NODE')"
        :class="{ disabled: isGeneralization }"
      >
        <span class="name">{{ $t('contextmenu.copyNode') }}</span>
        <span class="desc">Ctrl + C</span>
      </div>
      <div
        class="item"
        @click="exec('CUT_NODE')"
        :class="{ disabled: isGeneralization }"
      >
        <span class="name">{{ $t('contextmenu.cutNode') }}</span>
        <span class="desc">Ctrl + X</span>
      </div>
      <div class="item" @click="exec('PASTE_NODE')">
        <span class="name">{{ $t('contextmenu.pasteNode') }}</span>
        <span class="desc">Ctrl + V</span>
      </div>
      <div class="splitLine"></div>
      <div class="item" @click="exec('REMOVE_HYPERLINK')" v-if="hasHyperlink">
        <span class="name">{{ $t('contextmenu.removeHyperlink') }}</span>
      </div>
      <div class="item" @click="exec('REMOVE_NOTE')" v-if="hasNote">
        <span class="name">{{ $t('contextmenu.removeNote') }}</span>
      </div>
      <div class="item" @click="exec('REMOVE_CUSTOM_STYLES')">
        <span class="name">{{ $t('contextmenu.removeCustomStyles') }}</span>
      </div>
      <div class="item" @click="exec('EXPORT_CUR_NODE_TO_PNG')">
        <span class="name">{{ $t('contextmenu.exportNodeToPng') }}</span>
      </div>
      <div class="splitLine" v-if="enableAi"></div>
      <div class="item" @click="aiCreate" v-if="enableAi">
        <span class="name">{{ $t('contextmenu.aiCreate') }}</span>
      </div>
    </template>
    <template v-if="type === 'svg'">
      <div class="item" @click="exec('RETURN_CENTER')">
        <span class="name">{{ $t('contextmenu.backCenter') }}</span>
        <span class="desc">Ctrl + Enter</span>
      </div>
      <div class="splitLine"></div>
      <div class="item" @click="exec('EXPAND_ALL')">
        <span class="name">{{ $t('contextmenu.expandAll') }}</span>
      </div>
      <div class="item" @click="exec('UNEXPAND_ALL')">
        <span class="name">{{ $t('contextmenu.unExpandAll') }}</span>
      </div>
      <div class="item">
        <span class="name">{{ $t('contextmenu.expandTo') }}</span>
        <span class="el-icon-arrow-right"></span>
        <div
          class="subItems listBox"
          :class="{ isDark: isDark, showLeft: subItemsShowLeft }"
          style="top: -10px"
        >
          <div
            class="item"
            v-for="(item, index) in expandList"
            :key="item"
            @click="exec('UNEXPAND_TO_LEVEL', false, index + 1)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <div class="splitLine"></div>
      <div class="item" @click="exec('RESET_LAYOUT')">
        <span class="name">{{ $t('contextmenu.arrangeLayout') }}</span>
        <span class="desc">Ctrl + L</span>
      </div>
      <div class="item" @click="exec('FIT_CANVAS')">
        <span class="name">{{ $t('contextmenu.fitCanvas') }}</span>
        <span class="desc">Ctrl + i</span>
      </div>
      <div class="item" @click="exec('TOGGLE_ZEN_MODE')">
        <span class="name">{{ $t('contextmenu.zenMode') }}</span>
        {{ isZenMode ? '√' : '' }}
      </div>
      <div class="splitLine"></div>
      <div class="item" @click="exec('REMOVE_ALL_NODE_CUSTOM_STYLES')">
        <span class="name">{{
          $t('contextmenu.removeAllNodeCustomStyles')
        }}</span>
      </div>
      <div class="item">
        <span class="name">{{ $t('contextmenu.copyToClipboard') }}</span>
        <span class="el-icon-arrow-right"></span>
        <div
          class="subItems listBox"
          :class="{ isDark: isDark, showLeft: subItemsShowLeft }"
          style="top: -130px"
        >
          <div
            class="item"
            v-for="item in copyList"
            :key="item.value"
            @click="copyToClipboard(item.value)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import { useAppStore } from '@/store'
import { getTextFromHtml, imgToDataUrl } from 'simple-mind-map/src/utils'
import { transformToMarkdown } from 'simple-mind-map/src/parse/toMarkdown'
import { transformToTxt } from 'simple-mind-map/src/parse/toTxt'
import { setDataToClipboard, setImgToClipboard, copy } from '@/utils'
import { numberTypeList, numberLevelList } from '@/config'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()
const { t, locale } = useI18n()

const contextmenuRef = ref(null)
const isShow = ref(false)
const left = ref(0)
const top = ref(0)
const node = ref(null)
const type = ref('')
const isMousedown = ref(false)
const mosuedownX = ref(0)
const mosuedownY = ref(0)
const enableCopyToClipboardApi = navigator.clipboard
const numberType = ref('')
const numberLevel = ref('')
const subItemsShowLeft = ref(false)
const isNodeMousedown = ref(false)

const isZenMode = computed(() => appStore.localConfig.isZenMode)
const isDark = computed(() => appStore.localConfig.isDark)
const enableAi = computed(() => appStore.localConfig.enableAi)

const expandList = computed(() => {
  return [
    t('contextmenu.level1'),
    t('contextmenu.level2'),
    t('contextmenu.level3'),
    t('contextmenu.level4'),
    t('contextmenu.level5'),
    t('contextmenu.level6')
  ]
})

const copyList = computed(() => {
  const list = [
    {
      name: t('contextmenu.copyToSmm'),
      value: 'smm'
    },
    {
      name: t('contextmenu.copyToJson'),
      value: 'json'
    },
    {
      name: t('contextmenu.copyToMarkdown'),
      value: 'md'
    },
    {
      name: t('contextmenu.copyToTxt'),
      value: 'txt'
    }
  ]
  if (enableCopyToClipboardApi) {
    list.push({
      name: t('contextmenu.copyToPng'),
      value: 'png'
    })
  }
  return list
})

const insertNodeBtnDisabled = computed(() => {
  return !node.value || node.value.isRoot || node.value.isGeneralization
})

const upNodeBtnDisabled = computed(() => {
  if (!node.value || node.value.isRoot || node.value.isGeneralization) {
    return true
  }
  let isFirst =
    node.value.parent.children.findIndex(item => {
      return item === node.value
    }) === 0
  return isFirst
})

const downNodeBtnDisabled = computed(() => {
  if (!node.value || node.value.isRoot || node.value.isGeneralization) {
    return true
  }
  let children = node.value.parent.children
  let isLast =
    children.findIndex(item => {
      return item === node.value
    }) ===
    children.length - 1
  return isLast
})

const isGeneralization = computed(() => {
  return node.value?.isGeneralization
})

const hasHyperlink = computed(() => {
  return !!node.value?.getData('hyperlink')
})

const hasNote = computed(() => {
  return !!node.value?.getData('note')
})

const numberTypeListComputed = computed(() => {
  return numberTypeList[locale.value] || numberTypeList.zh
})

const numberLevelListComputed = computed(() => {
  return numberLevelList[locale.value] || numberLevelList.zh
})

const hasCheckbox = computed(() => {
  return !!node.value?.getData('checkbox')
})

const hasNodeLink = computed(() => {
  return !!node.value?.getData('nodeLink')
})

// 计算右键菜单元素的显示位置
const getShowPosition = (x, y) => {
  const rect = contextmenuRef.value.getBoundingClientRect()
  if (x + rect.width > window.innerWidth) {
    x = x - rect.width - 20
  }
  subItemsShowLeft.value = x + rect.width + 150 > window.innerWidth
  if (y + rect.height > window.innerHeight) {
    y = window.innerHeight - rect.height - 10
  }
  return { x, y }
}

// 节点右键显示
const show = (e, n) => {
  type.value = 'node'
  isShow.value = true
  node.value = n
  const number = node.value.getData('number')
  if (number) {
    numberType.value = number.type || 1
    numberLevel.value = number.level === '' ? 1 : number.level
  }
  nextTick(() => {
    const { x, y } = getShowPosition(e.clientX + 10, e.clientY + 10)
    left.value = x
    top.value = y
  })
}

const onNodeMousedown = () => {
  isNodeMousedown.value = true
}

// 鼠标按下事件
const onMousedown = (e) => {
  if (e.which !== 3) {
    return
  }
  mosuedownX.value = e.clientX
  mosuedownY.value = e.clientY
  isMousedown.value = true
}

// 鼠标松开事件
const onMouseup = (e) => {
  if (!isMousedown.value) {
    return
  }
  if (isNodeMousedown.value) {
    isNodeMousedown.value = false
    return
  }
  isMousedown.value = false
  if (
    Math.abs(mosuedownX.value - e.clientX) > 3 ||
    Math.abs(mosuedownY.value - e.clientY) > 3
  ) {
    hide()
    return
  }
  show2(e)
}

// 画布右键显示
const show2 = (e) => {
  type.value = 'svg'
  isShow.value = true
  nextTick(() => {
    const { x, y } = getShowPosition(e.clientX + 10, e.clientY + 10)
    left.value = x
    top.value = y
  })
}

// 隐藏
const hide = () => {
  isShow.value = false
  left.value = -9999
  top.value = -9999
  type.value = ''
  node.value = null
  numberType.value = ''
  numberLevel.value = ''
}

// 执行命令
const exec = (key, disabled, ...args) => {
  if (disabled) {
    return
  }
  switch (key) {
    case 'COPY_NODE':
      props.mindMap.renderer.copy()
      break
    case 'CUT_NODE':
      props.mindMap.renderer.cut()
      break
    case 'PASTE_NODE':
      props.mindMap.renderer.paste()
      break
    case 'RETURN_CENTER':
      props.mindMap.renderer.setRootNodeCenter()
      break
    case 'TOGGLE_ZEN_MODE':
      appStore.setLocalConfig({
        isZenMode: !isZenMode.value
      })
      break
    case 'FIT_CANVAS':
      props.mindMap.view.fit()
      break
    case 'REMOVE_HYPERLINK':
      node.value.setHyperlink('', '')
      break
    case 'REMOVE_NOTE':
      node.value.setNote('')
      break
    case 'EXPORT_CUR_NODE_TO_PNG':
      props.mindMap.export(
        'png',
        true,
        getTextFromHtml(node.value.getData('text')),
        false,
        node.value
      )
      break
    case 'UNEXPAND_ALL':
      const uid = node.value ? node.value.uid : ''
      proxy.$bus.$emit('execCommand', key, !uid, uid)
      break
    case 'EXPAND_ALL':
      proxy.$bus.$emit('execCommand', key, node.value ? node.value.uid : '')
      break
    default:
      proxy.$bus.$emit('execCommand', key, ...args)
      break
  }
  hide()
}

// 复制到剪贴板
const copyToClipboard = async (copyType) => {
  try {
    hide()
    let data
    let str
    switch (copyType) {
      case 'smm':
      case 'json':
        data = props.mindMap.getData(true)
        str = JSON.stringify(data)
        break
      case 'md':
        data = props.mindMap.getData()
        str = transformToMarkdown(data)
        break
      case 'txt':
        data = props.mindMap.getData()
        str = transformToTxt(data)
        break
      case 'png':
        const png = await props.mindMap.export('png', false)
        const blob = await imgToDataUrl(png, true)
        setImgToClipboard(blob)
        break
      default:
        break
    }
    if (str) {
      if (enableCopyToClipboardApi) {
        setDataToClipboard(str)
      } else {
        copy(str)
      }
    }
    ElMessage.success(t('contextmenu.copySuccess'))
  } catch (error) {
    console.log(error)
    ElMessage.error(t('contextmenu.copyFail'))
  }
}

// AI续写
const aiCreate = () => {
  proxy.$bus.$emit('ai_create_part', node.value)
  hide()
}

onMounted(() => {
  proxy.$bus.$on('node_contextmenu', show)
  proxy.$bus.$on('node_click', hide)
  proxy.$bus.$on('draw_click', hide)
  proxy.$bus.$on('expand_btn_click', hide)
  proxy.$bus.$on('svg_mousedown', onMousedown)
  proxy.$bus.$on('mouseup', onMouseup)
  proxy.$bus.$on('translate', hide)
  proxy.$bus.$on('node_mousedown', onNodeMousedown)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('node_contextmenu', show)
  proxy.$bus.$off('node_click', hide)
  proxy.$bus.$off('draw_click', hide)
  proxy.$bus.$off('expand_btn_click', hide)
  proxy.$bus.$off('svg_mousedown', onMousedown)
  proxy.$bus.$off('mouseup', onMouseup)
  proxy.$bus.$off('translate', hide)
  proxy.$bus.$off('node_mousedown', onNodeMousedown)
})
</script>

<style lang="less" scoped>
.listBox {
  width: 250px;
  background: #fff;
  box-shadow: 0 4px 12px 0 hsla(0, 0%, 69%, 0.5);
  border-radius: 4px;
  padding-top: 16px;
  padding-bottom: 16px;

  &.isDark {
    background: #363b3f;
  }
}
.contextmenuContainer {
  position: fixed;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #1a1a1a;

  &.isDark {
    color: #fff;

    .item {
      &:hover {
        background: hsla(0, 0%, 100%, 0.05);
      }
    }
  }

  .splitLine {
    width: 95%;
    height: 1px;
    background-color: #e9edf2;
    margin: 2px auto;
  }

  .item {
    position: relative;
    height: 28px;
    padding: 0 16px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &.danger {
      color: #f56c6c;
    }

    &:hover {
      background: #f5f5f5;

      .subItems {
        visibility: visible;
      }
    }

    &.disabled {
      color: grey;
      cursor: not-allowed;
      pointer-events: none;

      &:hover {
        background: #fff;
      }
    }

    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .desc {
      color: #999;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .subItems {
      position: absolute;
      left: 100%;
      visibility: hidden;
      width: 150px;
      cursor: auto;

      &.showLeft {
        left: -150px;
      }
    }
  }
}
</style>
