<template>
  <div
    class="sidebarContainer"
    @click.stop
    :class="{ show: show, isDark: isDark }"
    :style="{ zIndex: zIndex }"
  >
    <span class="closeBtn el-icon-close" @click="close"></span>
    <div class="sidebarHeader" v-if="title">
      {{ title }}
    </div>
    <div class="sidebarContent customScrollbar" ref="sidebarContent">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { store } from '@/config'
import { useAppStore } from '@/store'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const show = ref(false)
const zIndex = ref(0)
const sidebarContent = ref(null)

const isDark = computed(() => appStore.localConfig.isDark)

watch(show, (val, oldVal) => {
  if (val && !oldVal) {
    zIndex.value = store.sidebarZIndex++
  }
})

const handleCloseSidebar = () => {
  close()
}

const close = () => {
  show.value = false
  appStore.setActiveSidebar(null)
}

const getEl = () => {
  return sidebarContent.value
}

onMounted(() => {
  proxy.$bus.$on('closeSideBar', handleCloseSidebar)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('closeSideBar', handleCloseSidebar)
})

defineExpose({
  show,
  close,
  getEl
})
</script>

<style lang="less" scoped>
.sidebarContainer {
  position: fixed;
  right: -300px;
  top: 110px;
  bottom: 0;
  width: 300px;
  background-color: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  &.isDark {
    background-color: #262a2e;
    border-left-color: hsla(0, 0%, 100%, 0.1);

    .sidebarHeader {
      border-bottom-color: hsla(0, 0%, 100%, 0.1);
      color: #fff;
    }

    .closeBtn {
      color: #fff;
    }
  }

  &.show {
    right: 0;
  }

  .closeBtn {
    position: absolute;
    right: 20px;
    top: 12px;
    font-size: 20px;
    cursor: pointer;
  }

  .sidebarHeader {
    width: 100%;
    height: 44px;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .sidebarContent {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
</style>
