<template>
  <el-dialog
    class="nodeNoteDialog"
    :title="$t('nodeNote.title')"
    v-model="dialogVisible"
    :width="isMobile ? '90%' : '50%'"
    :top="isMobile ? '20px' : '15vh'"
  >
    <!-- <el-input
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 5 }"
          placeholder="请输入内容"
          v-model="note"
        >
        </el-input> -->
    <div class="noteEditor" ref="noteEditor" @keyup.stop @keydown.stop></div>
    <!-- <div class="tip">换行请使用：Enter+Shift</div> -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('dialog.confirm')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css' // Editor's Style
import { isMobile as isMobileUtil } from 'simple-mind-map/src/utils/index'

const { proxy } = getCurrentInstance()

const dialogVisible = ref(false)
const note = ref('')
const activeNodes = ref([])
const editor = ref(null)
const isMobile = ref(isMobileUtil())
const appointNode = ref(null)
const noteEditor = ref(null)

watch(dialogVisible, (val, oldVal) => {
  if (!val && oldVal) {
    proxy.$bus.$emit('endTextEdit')
  }
})

const handleNodeActive = (...args) => {
  activeNodes.value = [...args[1]]
  updateNoteInfo()
}

const updateNoteInfo = () => {
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    note.value = firstNode.getData('note') || ''
  } else {
    note.value = ''
  }
}

const handleShowNodeNote = (node) => {
  proxy.$bus.$emit('startTextEdit')
  if (node) {
    appointNode.value = node
    note.value = node.getData('note') || ''
  }
  dialogVisible.value = true
  nextTick(() => {
    initEditor()
  })
}

const initEditor = () => {
  if (!editor.value) {
    editor.value = new Editor({
      el: noteEditor.value,
      height: '500px',
      initialEditType: 'markdown',
      previewStyle: 'vertical'
    })
  }
  editor.value.setMarkdown(note.value)
}

const cancel = () => {
  dialogVisible.value = false
  if (appointNode.value) {
    appointNode.value = null
    updateNoteInfo()
  }
}

const confirm = () => {
  note.value = editor.value.getMarkdown()
  if (appointNode.value) {
    appointNode.value.setNote(note.value)
  } else {
    activeNodes.value.forEach(node => {
      node.setNote(note.value)
    })
  }

  cancel()
}

onMounted(() => {
  proxy.$bus.$on('node_active', handleNodeActive)
  proxy.$bus.$on('showNodeNote', handleShowNodeNote)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('node_active', handleNodeActive)
  proxy.$bus.$off('showNodeNote', handleShowNodeNote)
})
</script>

<style lang="less" scoped>
.nodeNoteDialog {
  .tip {
    margin-top: 5px;
    color: #dcdfe6;
  }
}
</style>
