<template>
  <el-dialog
    class="nodeImageDialog"
    :title="$t('nodeImage.title')"
    v-model="dialogVisible"
    :width="isMobile ? '90%' : '600px'"
    :top="isMobile ? '20px' : '15vh'"
  >
    <div class="title">方式一</div>
    <ImgUpload
      ref="ImgUploadRef"
      v-model="img"
      style="margin-bottom: 12px;"
    ></ImgUpload>
    <div class="title">方式二</div>
    <div class="inputBox">
      <span class="label">请输入图片地址</span>
      <el-input
        v-model="imgUrl"
        size="small"
        placeholder="http://xxx.com/xx.jpg"
        @keydown.stop
      ></el-input>
    </div>
    <div class="title">可选</div>
    <div class="inputBox">
      <span class="label">{{ $t('nodeImage.imgTitle') }}</span>
      <el-input v-model="imgTitle" size="small" @keydown.stop></el-input>
    </div>
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
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import ImgUpload from '@/components/ImgUpload/index.vue'
import { getImageSize, isMobile as isMobileUtil } from 'simple-mind-map/src/utils/index'

const { proxy } = getCurrentInstance()

const dialogVisible = ref(false)
const img = ref('')
const imgUrl = ref('')
const imgTitle = ref('')
const activeNodes = ref(null)
const isMobile = ref(isMobileUtil())
const ImgUploadRef = ref(null)

const handleNodeActive = (...args) => {
  activeNodes.value = [...args[1]]
}

const handleShowNodeImage = () => {
  reset()
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    let imgData = firstNode.getImageUrl() || ''
    if (imgData) {
      if (/^https?:\/\//.test(imgData)) {
        imgUrl.value = imgData
      } else {
        img.value = imgData
      }
    }
    imgTitle.value = firstNode.getData('imageTitle') || ''
  }
  dialogVisible.value = true
}

const cancel = () => {
  dialogVisible.value = false
  reset()
}

const reset = () => {
  img.value = ''
  imgTitle.value = ''
  imgUrl.value = ''
}

const confirm = async () => {
  try {
    // 删除图片
    if (!img.value && !imgUrl.value) {
      cancel()
      activeNodes.value.forEach(node => {
        node.setImage(null)
      })
      return
    }
    let res = null
    let imgData = ''
    if (img.value) {
      imgData = img.value
      res = await ImgUploadRef.value.getSize()
    } else if (imgUrl.value) {
      imgData = imgUrl.value
      res = await getImageSize(imgData)
    }
    activeNodes.value.forEach(node => {
      node.setImage({
        url: imgData || 'none',
        title: imgTitle.value,
        width: res.width || 100,
        height: res.height || 100
      })
    })
    cancel()
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  proxy.$bus.$on('node_active', handleNodeActive)
  proxy.$bus.$on('showNodeImage', handleShowNodeImage)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('node_active', handleNodeActive)
  proxy.$bus.$off('showNodeImage', handleShowNodeImage)
})
</script>

<style lang="less" scoped>
.nodeImageDialog {
  .title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .inputBox {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .label {
      width: 150px;
    }
  }
}
</style>
