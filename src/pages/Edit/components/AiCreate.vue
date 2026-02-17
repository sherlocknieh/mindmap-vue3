<template>
  <div>
    <!-- 客户端连接失败提示弹窗 -->
    <el-dialog
      class="clientTipDialog"
      :title="$t('ai.connectFailedTitle')"
      v-model="clientTipDialogVisible"
      width="400px"
      append-to-body
    >
      <div class="tipBox">
        <p>{{ $t('ai.connectFailedTip') }}</p>
        <p>
          {{ $t('ai.connectFailedCheckTip1')
          }}<a
            href="https://pan.baidu.com/s/1huasEbKsGNH2Af68dvWiOg?pwd=3bp3"
            >{{ $t('ai.baiduNetdisk') }}</a
          >、<a href="https://github.com/wanglin2/mind-map/releases">Github</a>
        </p>
        <p>{{ $t('ai.connectFailedCheckTip2') }}</p>
        <P>{{ $t('ai.connectFailedCheckTip3') }}</P>
        <p>
          {{ $t('ai.connectFailedCheckTip4')
          }}<el-button size="small" @click="testConnect">{{
            $t('ai.connectionDetection')
          }}</el-button>
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="clientTipDialogVisible = false">{{
            $t('ai.close')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- ai内容输入弹窗 -->
    <el-dialog
      class="createDialog"
      :title="$t('ai.createMindMapTitle')"
      v-model="createDialogVisible"
      width="450px"
      append-to-body
    >
      <div class="inputBox">
        <el-input
          type="textarea"
          :rows="5"
          :placeholder="$t('ai.createTip')"
          v-model="aiInput"
        >
        </el-input>
        <div class="tip warning">
          {{ $t('ai.importantTip') }}
        </div>
        <div class="tip">
          {{ $t('ai.wantModifyAiConfigTip')
          }}<el-button size="small" @click="showAiConfigDialog">{{
            $t('ai.modifyAIConfiguration')
          }}</el-button>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAiCreateDialog">{{
            $t('ai.cancel')
          }}</el-button>
          <el-button type="primary" @click="doAiCreate">{{
            $t('ai.confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- ai生成中添加一个透明层，防止期间用户进行操作 -->
    <div
      class="aiCreatingMask"
      ref="aiCreatingMaskRef"
      v-show="aiCreatingMaskVisible"
    >
      <el-button type="warning" class="btn" @click="stopCreate">{{
        $t('ai.stopGenerating')
      }}</el-button>
    </div>
    <AiConfigDialog v-model="aiConfigDialogVisible"></AiConfigDialog>
    <!-- AI续写 -->
    <el-dialog
      class="createDialog"
      :title="$t('ai.aiCreatePart')"
      v-model="createPartDialogVisible"
      width="450px"
      append-to-body
    >
      <div class="inputBox">
        <el-input type="textarea" :rows="5" v-model="aiPartInput"> </el-input>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeAiCreatePartDialog">{{
            $t('ai.cancel')
          }}</el-button>
          <el-button type="primary" @click="confirmAiCreatePart">{{
            $t('ai.confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Ai from '@/utils/ai'
import { transformMarkdownTo } from 'simple-mind-map/src/parse/markdownTo'
import {
  createUid,
  isUndef,
  checkNodeOuter,
  getStrWithBrFromHtml
} from 'simple-mind-map/src/utils'
import { useAppStore } from '@/store'
import AiConfigDialog from './AiConfigDialog.vue'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const appStore = useAppStore()

const aiCreatingMaskRef = ref(null)
const aiInstance = ref(null)
const isAiCreating = ref(false)
const aiCreatingContent = ref('')

const isLoopRendering = ref(false)
const uidMap = ref({})
const latestUid = ref('')

const clientTipDialogVisible = ref(false)
const createDialogVisible = ref(false)
const aiInput = ref('')
const aiCreatingMaskVisible = ref(false)
const aiConfigDialogVisible = ref(false)

const mindMapDataCache = ref('')
const beingAiCreateNodeUid = ref('')

const createPartDialogVisible = ref(false)
const aiPartInput = ref('')
const beingCreatePartNode = ref(null)

const aiConfig = computed(() => appStore.aiConfig)

// 显示AI配置修改弹窗
const showAiConfigDialog = () => {
  aiConfigDialogVisible.value = true
}

// 客户端连接检测
const testConnect = async () => {
  try {
    await fetch(`http://localhost:${aiConfig.value.port}/ai/test`, {
      method: 'GET'
    })
    ElMessage.success(proxy.$t('ai.connectSuccessful'))
    clientTipDialogVisible.value = false
    createDialogVisible.value = true
  } catch (error) {
    console.log(error)
    ElMessage.error(proxy.$t('ai.connectFailed'))
  }
}

// 检测ai是否可用
const aiTest = async () => {
  // 检查配置
  if (
    !(
      aiConfig.value.api &&
      aiConfig.value.key &&
      aiConfig.value.model &&
      aiConfig.value.port
    )
  ) {
    showAiConfigDialog()
    throw new Error(proxy.$t('ai.configurationMissing'))
  }
  // 检查连接
  let isConnect = false
  try {
    await fetch(`http://localhost:${aiConfig.value.port}/ai/test`, {
      method: 'GET'
    })
    isConnect = true
  } catch (error) {
    console.log(error)
    clientTipDialogVisible.value = true
  }
  if (!isConnect) {
    throw new Error(proxy.$t('ai.connectFailed'))
  }
}

// AI生成整体
const aiCrateAll = async () => {
  try {
    await aiTest()
    createDialogVisible.value = true
  } catch (error) {
    console.log(error)
  }
}

// 关闭ai内容输入弹窗
const closeAiCreateDialog = () => {
  createDialogVisible.value = false
  aiInput.value = ''
}

// 确认生成
const doAiCreate = () => {
  const aiInputText = aiInput.value.trim()
  if (!aiInputText) {
    ElMessage.warning(proxy.$t('ai.noInputTip'))
    return
  }
  closeAiCreateDialog()
  aiCreatingMaskVisible.value = true
  // 发起请求
  isAiCreating.value = true
  aiInstance.value = new Ai({
    port: aiConfig.value.port
  })
  aiInstance.value.init('huoshan', aiConfig.value)
  props.mindMap.renderer.setRootNodeCenter()
  props.mindMap.setData(null)
  aiInstance.value.request(
    {
      messages: [
        {
          role: 'user',
          content: `${proxy.$t(
            'ai.aiCreateMsgPrefix'
          )}${aiInputText}${proxy.$t('ai.aiCreateMsgPostfix')}`
        }
      ]
    },
    content => {
      if (content) {
        const arr = content.split(/\n+/)
        aiCreatingContent.value = arr.splice(0, arr.length - 1).join('\n')
      }
      loopRenderOnAiCreating()
    },
    content => {
      aiCreatingContent.value = content
      resetOnAiCreatingStop()
    },
    () => {
      resetOnAiCreatingStop()
      resetOnRenderEnd()
      ElMessage.error(proxy.$t('ai.generationFailed'))
    }
  )
}

// AI请求完成或出错后需要复位的数据
const resetOnAiCreatingStop = () => {
  aiCreatingMaskVisible.value = false
  isAiCreating.value = false
  aiInstance.value = null
}

// 渲染结束后需要复位的数据
const resetOnRenderEnd = () => {
  isLoopRendering.value = false
  uidMap.value = {}
  aiCreatingContent.value = ''
  mindMapDataCache.value = ''
  beingAiCreateNodeUid.value = ''
}

// 停止生成
const stopCreate = () => {
  aiInstance.value.stop()
  isAiCreating.value = false
  aiCreatingMaskVisible.value = false
  ElMessage.success(proxy.$t('ai.stoppedGenerating'))
}

// 轮询进行渲染
const loopRenderOnAiCreating = () => {
  if (!aiCreatingContent.value.trim() || isLoopRendering.value) return
  isLoopRendering.value = true
  const treeData = transformMarkdownTo(aiCreatingContent.value)
  addUid(treeData)
  let lastTreeData = JSON.stringify(treeData)

  // 在当前渲染完成时再进行下一次渲染
  const onRenderEnd = () => {
    // 处理超出画布的节点
    checkNodeOuter_method()

    // 如果生成结束数据渲染完毕，那么解绑事件
    if (!isAiCreating.value && !aiCreatingContent.value) {
      props.mindMap.off('node_tree_render_end', onRenderEnd)
      latestUid.value = ''
      return
    }

    const treeData = transformMarkdownTo(aiCreatingContent.value)
    addUid(treeData)
    // 正在生成中
    if (isAiCreating.value) {
      // 如果和上次数据一样则不触发重新渲染
      const curTreeData = JSON.stringify(treeData)
      if (curTreeData === lastTreeData) {
        setTimeout(() => {
          onRenderEnd()
        }, 500)
        return
      }
      lastTreeData = curTreeData
      props.mindMap.updateData(treeData)
    } else {
      // 已经生成结束
      // 还要触发一遍渲染，否则会丢失数据
      props.mindMap.updateData(treeData)
      resetOnRenderEnd()
      ElMessage.success(proxy.$t('ai.aiGenerationSuccess'))
    }
  }
  props.mindMap.on('node_tree_render_end', onRenderEnd)

  props.mindMap.setData(treeData)
}

// 处理超出画布的节点
const checkNodeOuter_method = () => {
  if (latestUid.value) {
    const latestNode = props.mindMap.renderer.findNodeByUid(latestUid.value)
    if (latestNode) {
      const { isOuter, offsetLeft, offsetTop } = checkNodeOuter(
        props.mindMap,
        latestNode,
        100,
        100
      )
      if (isOuter) {
        props.mindMap.view.translateXY(offsetLeft, offsetTop)
      }
    }
  }
}

// 给AI生成的数据添加uid
const addUid = (data) => {
  const checkRepeatUidMap = {}
  const walk = (node, pUid = '') => {
    if (!node.data) {
      node.data = {}
    }
    if (isUndef(node.data.uid)) {
      // 根据pUid+文本内容来复用上一次生成数据的uid
      const key = pUid + '-' + node.data.text
      node.data.uid = uidMap.value[key] || createUid()
      // 当前uid和之前的重复，那么重新生成一个。这种情况很少，但是以防万一
      if (checkRepeatUidMap[node.data.uid]) {
        node.data.uid = createUid()
      }
      latestUid.value = uidMap.value[key] = node.data.uid
      checkRepeatUidMap[node.data.uid] = true
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        walk(child, node.data.uid)
      })
    }
  }
  walk(data)
}

// 显示AI续写弹窗
const showAiCreatePartDialog = (node) => {
  beingCreatePartNode.value = node
  const currentMindMapData = props.mindMap.getData()
  // 填充默认内容
  aiPartInput.value = `${proxy.$t(
    'ai.aiCreatePartMsgPrefix'
  )}${getStrWithBrFromHtml(currentMindMapData.data.text)}${proxy.$t(
    'ai.aiCreatePartMsgCenter'
  )}${getStrWithBrFromHtml(node.getData('text'))}${proxy.$t(
    'ai.aiCreatePartMsgPostfix'
  )}`
  createPartDialogVisible.value = true
}

// 关闭AI续写弹窗
const closeAiCreatePartDialog = () => {
  createPartDialogVisible.value = false
}

// 复位AI续写弹窗数据
const resetAiCreatePartDialog = () => {
  beingCreatePartNode.value = null
  aiPartInput.value = ''
}

// 确认AI续写
const confirmAiCreatePart = () => {
  if (!aiPartInput.value.trim()) return
  closeAiCreatePartDialog()
  aiCreatePart()
}

// AI生成部分
const aiCreatePart = async () => {
  try {
    if (!beingCreatePartNode.value) {
      return
    }
    await aiTest()
    beingAiCreateNodeUid.value = beingCreatePartNode.value.getData('uid')
    const currentMindMapData = props.mindMap.getData()
    mindMapDataCache.value = JSON.stringify(currentMindMapData)
    aiCreatingMaskVisible.value = true
    // 发起请求
    isAiCreating.value = true
    aiInstance.value = new Ai({
      port: aiConfig.value.port
    })
    aiInstance.value.init('huoshan', aiConfig.value)
    aiInstance.value.request(
      {
        messages: [
          {
            role: 'user',
            content:
              aiPartInput.value.trim() + proxy.$t('ai.aiCreatePartMsgHelp')
          }
        ]
      },
      content => {
        if (content) {
          const arr = content.split(/\n+/)
          aiCreatingContent.value = arr.splice(0, arr.length - 1).join('\n')
        }

        loopRenderOnAiCreatingPart()
      },
      content => {
        aiCreatingContent.value = content
        resetOnAiCreatingStop()
        resetAiCreatePartDialog()
      },
      () => {
        resetOnAiCreatingStop()
        resetAiCreatePartDialog()
        resetOnRenderEnd()
        ElMessage.error(proxy.$t('ai.generationFailed'))
      }
    )
  } catch (error) {
    console.log(error)
  }
}

// 将生成的数据添加到指定节点上
const addToTargetNode = (newChildren = []) => {
  const initData = JSON.parse(mindMapDataCache.value)
  const walk = node => {
    if (node.data.uid === beingAiCreateNodeUid.value) {
      if (!node.children) {
        node.children = []
      }
      node.children.push(...newChildren)
      return
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        walk(child)
      })
    }
  }
  walk(initData)
  return initData
}

// 轮询进行部分渲染
const loopRenderOnAiCreatingPart = () => {
  if (!aiCreatingContent.value.trim() || isLoopRendering.value) return
  isLoopRendering.value = true
  const partData = transformMarkdownTo(aiCreatingContent.value)
  addUid(partData)
  let lastPartData = JSON.stringify(partData)
  const treeData = addToTargetNode(partData.children || [])

  // 在当前渲染完成时再进行下一次渲染
  const onRenderEnd = () => {
    // 处理超出画布的节点
    checkNodeOuter_method()

    // 如果生成结束数据渲染完毕，那么解绑事件
    if (!isAiCreating.value && !aiCreatingContent.value) {
      props.mindMap.off('node_tree_render_end', onRenderEnd)
      latestUid.value = ''
      return
    }

    const partData = transformMarkdownTo(aiCreatingContent.value)
    addUid(partData)
    const treeData = addToTargetNode(partData.children || [])

    if (isAiCreating.value) {
      // 如果和上次数据一样则不触发重新渲染
      const curPartData = JSON.stringify(partData)
      if (curPartData === lastPartData) {
        setTimeout(() => {
          onRenderEnd()
        }, 500)
        return
      }
      lastPartData = curPartData
      props.mindMap.updateData(treeData)
    } else {
      props.mindMap.updateData(treeData)
      resetOnRenderEnd()
      ElMessage.success(proxy.$t('ai.aiGenerationSuccess'))
    }
  }
  props.mindMap.on('node_tree_render_end', onRenderEnd)
  // 因为是续写，所以首次也直接使用updateData方法渲染
  props.mindMap.updateData(treeData)
}

// AI对话
const aiChat = async (
  messageList = [],
  progress = () => {},
  end = () => {},
  err = () => {}
) => {
  try {
    await aiTest()
    // 发起请求
    isAiCreating.value = true
    aiInstance.value = new Ai({
      port: aiConfig.value.port
    })
    aiInstance.value.init('huoshan', aiConfig.value)
    aiInstance.value.request(
      {
        messages: messageList.map(msg => {
          return {
            role: 'user',
            content: msg
          }
        })
      },
      content => {
        progress(content)
      },
      content => {
        end(content)
      },
      error => {
        err(error)
      }
    )
  } catch (error) {
    console.log(error)
  }
}

// AI对话停止
const aiChatStop = () => {
  if (aiInstance.value) {
    aiInstance.value.stop()
    isAiCreating.value = false
    aiInstance.value = null
  }
}

onMounted(() => {
  document.body.appendChild(aiCreatingMaskRef.value)
  proxy.$bus.$on('ai_create_all', aiCrateAll)
  proxy.$bus.$on('ai_create_part', showAiCreatePartDialog)
  proxy.$bus.$on('ai_chat', aiChat)
  proxy.$bus.$on('ai_chat_stop', aiChatStop)
  proxy.$bus.$on('showAiConfigDialog', showAiConfigDialog)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('ai_create_all', aiCrateAll)
  proxy.$bus.$off('ai_create_part', showAiCreatePartDialog)
  proxy.$bus.$off('ai_chat', aiChat)
  proxy.$bus.$off('ai_chat_stop', aiChatStop)
  proxy.$bus.$off('showAiConfigDialog', showAiConfigDialog)
})
</script>

<style lang="less" scoped>
.clientTipDialog,
.createDialog {
    :deep(.el-dialog__body) {
      padding: 12px 20px;
    }
}

.tipBox {
  p {
    margin-bottom: 12px;

    a {
      color: #409eff;
    }
  }
}

.inputBox {
  .tip {
    margin-top: 12px;

    &.warning {
      color: #f56c6c;
    }
  }
}

.aiCreatingMask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  background-color: transparent;

  .btn {
    position: absolute;
    left: 50%;
    top: 100px;
    transform: translateX(-50%);
  }
}
</style>
