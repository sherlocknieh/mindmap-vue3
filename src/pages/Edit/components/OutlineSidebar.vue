<template>
  <Sidebar ref="sidebar" :title="$t('outline.title')">
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
      <el-tooltip
        class="item"
        effect="dark"
        :content="$t('outline.fullscreen')"
        placement="top"
      >
        <div
          class="btn"
          :class="{ isDark: isDark }"
          @click="onChangeToOutlineEdit"
        >
          <span class="icon iconfont iconquanping1"></span>
        </div>
      </el-tooltip>
    </div>
    <Outline
      :mindMap="mindMap"
      v-if="activeSidebar === 'outline'"
      @scrollTo="onScrollTo"
      ref="outlineRef"
    ></Outline>
  </Sidebar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import Outline from './Outline.vue'
import { useAppStore } from '@/store'
import { printOutline } from '@/utils'

// 大纲侧边栏
defineProps({
  mindMap: {
    type: Object
  }
})

const appStore = useAppStore()

const sidebar = ref(null)
const outlineRef = ref(null)

const isDark = computed(() => appStore.localConfig.isDark)
const activeSidebar = computed(() => appStore.activeSidebar)

watch(activeSidebar, (val) => {
  if (val === 'outline') {
    sidebar.value.show = true
  } else {
    sidebar.value.show = false
  }
})

const onChangeToOutlineEdit = () => {
  appStore.setActiveSidebar(null)
  appStore.setIsOutlineEdit(true)
}

const onScrollTo = (y) => {
  let container = sidebar.value.getEl()
  let height = container.offsetHeight
  let top = container.scrollTop
  if (y > top + height) {
    container.scrollTo(0, y - height / 2)
  }
}

// 打印
const onPrint = () => {
  printOutline(outlineRef.value.$el)
}
</script>

<style lang="less" scoped>
.btnList {
  position: absolute;
  right: 50px;
  top: 12px;
  display: flex;
  align-items: center;
  .btn {
    cursor: pointer;
    margin-left: 12px;

    &.isDark {
      color: #fff;
    }
  }
}
</style>
