<template>
  <div
    class="sidebarContainer"
    @click.stop
    :class="{ show: show, isDark: isDark }"
    :style="{ zIndex: zIndex }"
  >
    <el-icon class="closeBtn" @click="close" :size="20">
      <Close />
    </el-icon>
    <div class="sidebarHeader" v-if="title">
      {{ title }}
    </div>
    <div class="sidebarContent customScrollbar" ref="sidebarContent">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { store } from '@/config'
import { mapState, mapActions } from 'pinia'
import { useAppStore } from '@/store'
import { Close } from '@element-plus/icons-vue'

// 侧边栏容器
export default {
  components: { Close },
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      show: false,
      zIndex: 0,
    }
  },
  computed: {
    ...mapState(useAppStore, {
      isDark: (state) => state.localConfig.isDark,
    }),
  },
  watch: {
    show(val, oldVal) {
      if (val && !oldVal) {
        this.zIndex = store.sidebarZIndex++
      }
    },
  },
  created() {
    $on(this.$bus, 'closeSideBar', this.handleCloseSidebar)
  },
  beforeUnmount() {
    $off(this.$bus, 'closeSideBar', this.handleCloseSidebar)
  },
  methods: {
    ...mapActions(useAppStore, ['setActiveSidebar']),

    handleCloseSidebar() {
      this.close()
    },

    close() {
      this.show = false
      this.setActiveSidebar(null)
    },

    getEl() {
      return this.$refs.sidebarContent
    },
  },
}
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
