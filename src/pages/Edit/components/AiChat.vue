<template>
  <Sidebar ref="sidebar" :title="$t('ai.chatTitle')">
    <div class="aiChatBox" :class="{ isDark: isDark }">
      <div class="chatHeader">
        <el-button size="small" @click="clear">
          <span class="el-icon-delete"></span>
          {{ $t('ai.clearRecords') }}
        </el-button>
        <el-button size="small" @click="modifyAiConfig">
          <span class="el-icon-edit"></span>
          {{ $t('ai.modifyAIConfiguration') }}
        </el-button>
      </div>
      <div class="chatResBox customScrollbar" ref="chatResBoxRef">
        <div
          class="chatItem"
          v-for="item in chatList"
          :key="item.id"
          :class="[item.type]"
        >
          <div class="chatItemInner" v-if="item.type === 'user'">
            <div class="avatar">
              <span class="icon el-icon-user"></span>
            </div>
            <div class="content">{{ item.content }}</div>
          </div>
          <div class="chatItemInner" v-else-if="item.type === 'ai'">
            <div class="avatar">
              <span class="icon iconfont iconAIshengcheng"></span>
            </div>
            <div class="content" v-html="item.content"></div>
          </div>
        </div>
      </div>
      <div class="chatInputBox">
        <textarea
          v-model="text"
          class="customScrollbar"
          :placeholder="$t('ai.chatInputPlaceholder')"
          @keydown="onKeydown"
        ></textarea>
        <el-button class="btn" size="small" @click="send" :loading="isCreating">
          {{ $t('ai.send') }}
          <span class="el-icon-position"></span>
        </el-button>
        <el-button
          class="stop"
          size="small"
          type="warning"
          @click="stop"
          v-show="isCreating"
        >
          {{ $t('ai.stopGenerating') }}
        </el-button>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import Sidebar from './Sidebar.vue'
import { useAppStore } from '@/store'
import { createUid } from 'simple-mind-map/src/utils'
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'

let md = null

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const sidebar = ref(null)
const chatResBoxRef = ref(null)
const text = ref('')
const chatList = ref([])
const isCreating = ref(false)

const isDark = computed(() => appStore.localConfig.isDark)
const activeSidebar = computed(() => appStore.activeSidebar)

watch(activeSidebar, (val) => {
  if (val === 'ai') {
    sidebar.value.show = true
  } else {
    sidebar.value.show = false
  }
})

const onKeydown = (e) => {
  if (e.keyCode === 13) {
    if (!e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
}

const send = () => {
  if (isCreating.value) return
  const textValue = text.value.trim()
  if (!textValue) {
    return
  }
  text.value = ''
  const historyUserMsgList = chatList.value
    .filter(item => {
      return item.type === 'user'
    })
    .map(item => {
      return item.content
    })
  chatList.value.push({
    id: createUid(),
    type: 'user',
    content: textValue
  })
  chatList.value.push({
    id: createUid(),
    type: 'ai',
    content: ''
  })
  isCreating.value = true
  const textListValue = [...historyUserMsgList, textValue]
  proxy.$bus.$emit(
    'ai_chat',
    textListValue,
    res => {
      if (!md) {
        md = new MarkdownIt()
      }
      chatList.value[chatList.value.length - 1].content = md.render(res)
      chatResBoxRef.value.scrollTop = chatResBoxRef.value.scrollHeight
    },
    () => {
      isCreating.value = false
    },
    () => {
      isCreating.value = false
      ElMessage.error(proxy.$t('ai.generationFailed'))
    }
  )
}

const stop = () => {
  proxy.$bus.$emit('ai_chat_stop')
  isCreating.value = false
}

const clear = () => {
  chatList.value = []
}

const modifyAiConfig = () => {
  proxy.$bus.$emit('showAiConfigDialog')
}

onMounted(() => {})

onBeforeUnmount(() => {})
</script>

<style lang="less" scoped>
.aiChatBox {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.isDark {
  }

  .chatHeader {
    height: 50px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    padding: 0 12px;
  }

  .chatResBox {
    width: 100%;
    height: 100%;
    padding: 0 12px;
    margin: 12px 0;
    overflow-y: auto;
    overflow-x: hidden;

    .chatItem {
      margin-bottom: 20px;
      border: 1px solid;
      position: relative;
      border-radius: 10px;

      &:last-of-type {
        margin-bottom: 0;
      }

      &.ai {
        border-color: #409eff;

        .chatItemInner {
          .avatar {
            border-color: #409eff;
            left: -12px;
            top: -12px;

            .icon {
              color: #409eff;
            }
          }
        }
      }

      &.user {
        border-color: #f56c6c;

        .chatItemInner {
          .avatar {
            border-color: #f56c6c;
            right: -12px;
            top: -12px;

            .icon {
              color: #f56c6c;
            }
          }
        }
      }

      .chatItemInner {
        width: 100%;
        padding: 12px;

        .avatar {
          width: 30px;
          height: 30px;
          border: 1px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: absolute;
          background-color: #fff;

          .icon {
            font-size: 18px;
            font-weight: bold;
          }
        }

        :deep(.content) {
          width: 100%;
          overflow: hidden;
          color: #3f4a54;
          font-size: 14px;
          line-height: 1.5;

          p {
            margin-bottom: 12px;

            &:last-of-type {
              margin-bottom: 0;
            }
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            margin-top: 24px;
            margin-bottom: 16px;
          }

          code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            white-space: break-spaces;
            background-color: rgba(175, 184, 193, 0.2);
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
              Liberation Mono, monospace;
          }

          pre {
            padding: 12px;
            background-color: rgba(175, 184, 193, 0.2);

            code {
              background-color: transparent;
              padding: 0;
              overflow: hidden;
            }
          }
        }
      }
    }
  }

  .chatInputBox {
    flex-shrink: 0;
    width: 100%;
    height: 150px;
    border-top: 1px solid #e8e8e8;
    position: relative;

    textarea {
      width: 100%;
      height: 100%;
      outline: none;
      padding: 12px;
      border: none;
    }

    .btn {
      position: absolute;
      right: 12px;
      bottom: 12px;
    }

    .stop {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -30px;
    }
  }
}
</style>
