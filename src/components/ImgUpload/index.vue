<template>
  <div class="imgUploadContainer">
    <div class="imgUploadPanel">
      <div class="upBtn" v-if="!modelValue">
        <label
          for="imgUploadInput"
          class="imgUploadInputArea"
          @dragenter.stop.prevent
          @dragover.stop.prevent
          @drop.stop.prevent="onDrop"
          >点击此处选择图片、或拖动图片到此</label
        >
        <input
          type="file"
          accept="image/*"
          id="imgUploadInput"
          @change="onImgUploadInputChange"
        />
      </div>
      <div v-if="modelValue" class="uploadInfoBox">
        <div
          class="previewBox"
          :style="{ backgroundImage: `url('${modelValue}')` }"
        ></div>
        <span class="delBtn el-icon-close" @click="deleteImg"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const file = ref(null)

const onImgUploadInputChange = (e) => {
  let selectedFile = e.target.files[0]
  selectImg(selectedFile)
}

const onDrop = (e) => {
  let dt = e.dataTransfer
  let selectedFile = dt.files && dt.files[0]
  selectImg(selectedFile)
}

const selectImg = (selectedFile) => {
  file.value = selectedFile
  let fr = new FileReader()
  fr.readAsDataURL(selectedFile)
  fr.onload = e => {
    emit('update:modelValue', e.target.result)
  }
}

const getSize = () => {
  return new Promise(resolve => {
    let img = new Image()
    img.src = props.modelValue
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = () => {
      resolve({
        width: 0,
        height: 0
      })
    }
  })
}

const deleteImg = () => {
  emit('update:modelValue', '')
  file.value = null
}

defineExpose({
  getSize
})
</script>

<style lang="less" scoped>
@import './style.less';
</style>
