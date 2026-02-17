<template>
  <div>
    <el-dialog
      class="nodeImportDialog"
      :title="$t('import.title')"
      v-model="dialogVisible"
      width="350px"
    >
      <el-upload
        ref="upload"
        action="x"
        :accept="supportFileStr"
        :file-list="fileList"
        :auto-upload="false"
        :multiple="false"
        :on-change="onChange"
        :on-remove="onRemove"
        :limit="1"
        :on-exceed="onExceed"
      >
        <template #trigger>
          <el-button size="small" type="primary">{{
            $t('import.selectFile')
          }}</el-button>
        </template>
        <template #tip>
          <div class="el-upload__tip">
            {{ $t('import.support') }}{{ supportFileStr }}{{ $t('import.file') }}
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
          <el-button type="primary" @click="confirm">{{
            $t('dialog.confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      class="xmindCanvasSelectDialog"
      :title="$t('import.xmindCanvasSelectDialogTitle')"
      v-model="xmindCanvasSelectDialogVisible"
      width="300px"
      :show-close="false"
    >
      <el-radio-group v-model="selectCanvas" class="canvasList">
        <el-radio
          v-for="(item, index) in canvasList"
          :key="index"
          :label="index"
          >{{ item.title }}</el-radio
        >
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirmSelect">{{
            $t('dialog.confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import xmind from 'simple-mind-map/src/parse/xmind.js'
import markdown from 'simple-mind-map/src/parse/markdown.js'
import { useAppStore } from '@/store'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const appStore = useAppStore()
const route = useRoute()

const upload = ref(null)
const dialogVisible = ref(false)
const fileList = ref([])
const selectPromiseResolve = ref(null)
const xmindCanvasSelectDialogVisible = ref(false)
const selectCanvas = ref('')
const canvasList = ref([])
const mdStr = ref('')

const supportFileStr = computed(() => {
  return '.smm,.json,.xmind,.md'
})

watch(dialogVisible, (val, oldVal) => {
  if (!val && oldVal) {
    fileList.value = []
  }
})

const handleShowImport = () => {
  dialogVisible.value = true
}

const getRegexp = () => {
  return new RegExp(`\.(smm|json|xmind|md)$`)
}

const handleFileURL = async () => {
  try {
    const fileURL = route.query.fileURL
    if (!fileURL) return
    const macth = getRegexp().exec(fileURL)
    if (!macth) {
      return
    }
    const type = macth[1]
    const res = await fetch(fileURL)
    const file = await res.blob()
    const data = {
      raw: file
    }
    if (type === 'smm' || type === 'json') {
      handleSmm(data)
    } else if (type === 'xmind') {
      handleXmind(data)
    } else if (type === 'md') {
      handleMd(data)
    }
  } catch (error) {
    console.log(error)
  }
}

const onChange = (file) => {
  if (!getRegexp().test(file.name)) {
    ElMessage.error(
      proxy.$t('import.pleaseSelect') +
        supportFileStr.value +
        proxy.$t('import.file')
    )
    fileList.value = []
  } else {
    fileList.value.push(file)
  }
}

const onRemove = (file, fileListParam) => {
  fileList.value = fileListParam
}

const onExceed = () => {
  ElMessage.error(proxy.$t('import.maxFileNum'))
}

const cancel = () => {
  dialogVisible.value = false
}

const confirm = () => {
  if (fileList.value.length <= 0) {
    return ElMessage.error(proxy.$t('import.notSelectTip'))
  }
  proxy.$store.commit('setIsHandleLocalFile', false)
  let file = fileList.value[0]
  if (/\.(smm|json)$/.test(file.name)) {
    handleSmm(file)
  } else if (/\.xmind$/.test(file.name)) {
    handleXmind(file)
  } else if (/\.md$/.test(file.name)) {
    handleMd(file)
  }
  cancel()
  appStore.setActiveSidebar(null)
}

const handleSmm = (file) => {
  let fileReader = new FileReader()
  fileReader.readAsText(file.raw)
  fileReader.onload = evt => {
    try {
      let data = JSON.parse(evt.target.result)
      if (typeof data !== 'object') {
        throw new Error(proxy.$t('import.fileContentError'))
      }
      proxy.$bus.$emit('setData', data)
      ElMessage.success(proxy.$t('import.importSuccess'))
    } catch (error) {
      console.log(error)
      ElMessage.error(proxy.$t('import.fileParsingFailed'))
    }
  }
}

const handleXmind = async (file) => {
  try {
    let data = await xmind.parseXmindFile(file.raw, content => {
      showSelectXmindCanvasDialog(content)
      return new Promise(resolve => {
        selectPromiseResolve.value = resolve
      })
    })
    proxy.$bus.$emit('setData', data)
    ElMessage.success(proxy.$t('import.importSuccess'))
  } catch (error) {
    console.log(error)
    ElMessage.error(proxy.$t('import.fileParsingFailed'))
  }
}

const showSelectXmindCanvasDialog = (content) => {
  canvasList.value = content
  selectCanvas.value = 0
  xmindCanvasSelectDialogVisible.value = true
}

const confirmSelect = () => {
  selectPromiseResolve.value(canvasList.value[selectCanvas.value])
  xmindCanvasSelectDialogVisible.value = false
  canvasList.value = []
  selectCanvas.value = 0
}

const handleMd = async (file) => {
  let fileReader = new FileReader()
  fileReader.readAsText(file.raw)
  fileReader.onload = async evt => {
    try {
      let data = markdown.transformMarkdownTo(evt.target.result)
      proxy.$bus.$emit('setData', data)
      ElMessage.success(proxy.$t('import.importSuccess'))
    } catch (error) {
      console.log(error)
      ElMessage.error(proxy.$t('import.fileParsingFailed'))
    }
  }
}

const handleImportFile = (file) => {
  onChange({
    raw: file,
    name: file.name
  })
  if (fileList.value.length <= 0) return
  confirm()
}

onMounted(() => {
  proxy.$bus.$on('showImport', handleShowImport)
  proxy.$bus.$on('handle_file_url', handleFileURL)
  proxy.$bus.$on('importFile', handleImportFile)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('showImport', handleShowImport)
  proxy.$bus.$off('handle_file_url', handleFileURL)
  proxy.$bus.$off('importFile', handleImportFile)
})
</script>

<style lang="less" scoped>

.canvasList {
  display: flex;
  flex-direction: column;
  :deep(.el-radio) {
    margin-bottom: 12px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
