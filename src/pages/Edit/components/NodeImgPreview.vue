<template>
  <viewer :images="images">
    <img v-for="src in images" :key="src" :src="src" />
  </viewer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'

const props = defineProps({
  mindMap: {
    type: Object,
    default: () => null
  }
})

const { proxy } = getCurrentInstance()
const images = ref([])

const onNodeTmgDblclick = (node, e) => {
  e.stopPropagation()
  e.preventDefault()
  images.value = [node.getImageUrl()]
  proxy.$viewerApi({
    images: images.value
  })
}

onMounted(() => {
  props.mindMap.on('node_img_dblclick', onNodeTmgDblclick)
})

onBeforeUnmount(() => {
  props.mindMap.off('node_img_dblclick', onNodeTmgDblclick)
})
</script>

<style></style>
