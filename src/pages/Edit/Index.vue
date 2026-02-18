<template>
  <div
    class="container"
    :class="{
      isDark: appStore.localConfig.isDark,
      activeSidebar: appStore.activeSidebar,
    }"
  >
    <template v-if="show">
      <Toolbar v-if="!appStore.localConfig.isZenMode"></Toolbar>
      <Edit></Edit>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElLoading } from 'element-plus'
import Toolbar from './components/Toolbar.vue'
import Edit from './components/Edit.vue'
import { useAppStore } from '@/store'
import { getLocalConfig } from '@/api'

const { t } = useI18n()
const appStore = useAppStore()
const show = ref(false)

// 初始化本地配置
const initLocalConfig = () => {
  let config = getLocalConfig()
  if (config) {
    appStore.setLocalConfig({
      ...appStore.localConfig,
      ...config,
    })
  }
}

// 设置 body 暗黑模式
const setBodyDark = () => {
  appStore.localConfig.isDark
    ? document.body.classList.add('isDark')
    : document.body.classList.remove('isDark')
}

// 监听暗黑模式变化
watch(
  () => appStore.localConfig.isDark,
  () => {
    setBodyDark()
  }
)

onMounted(async () => {
  initLocalConfig()
  const loading = ElLoading.service({
    lock: true,
    text: t('other.loading'),
  })
  show.value = true
  loading.close()
  setBodyDark()
})
</script>

<style lang="less">
body {
  &.isDark {
    /* el-button */
    .el-button {
      background-color: #363b3f;
      color: hsla(0, 0%, 100%, 0.9);
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    /* el-input */
    .el-input__inner {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
      color: hsla(0, 0%, 100%, 0.9);
    }

    .el-input.is-disabled .el-input__inner {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
      color: hsla(0, 0%, 100%, 0.3);
    }

    .el-input-group__append,
    .el-input-group__prepend {
      background-color: #363b3f;
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    .el-input-group__append button.el-button {
      color: hsla(0, 0%, 100%, 0.9);
    }

    /* el-select */
    .el-select-dropdown {
      background-color: #36393d;
      border-color: hsla(0, 0%, 100%, 0.1);

      .el-select-dropdown__item {
        color: hsla(0, 0%, 100%, 0.6);
      }

      .el-select-dropdown__item.selected {
        color: #409eff;
      }

      .el-select-dropdown__item.hover,
      .el-select-dropdown__item:hover {
        background-color: hsla(0, 0%, 100%, 0.05);
      }
    }

    .el-select .el-input.is-disabled .el-input__inner:hover {
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    /* el-popper*/
    .el-popper {
      background-color: #36393d;
      border-color: hsla(0, 0%, 100%, 0.1);
    }

    .el-popper[x-placement^='bottom'] .popper__arrow {
      background-color: #36393d;
    }

    .el-popper[x-placement^='bottom'] .popper__arrow::after {
      border-bottom-color: #36393d;
    }

    .el-popper[x-placement^='top'] .popper__arrow {
      background-color: #36393d;
    }

    .el-popper[x-placement^='top'] .popper__arrow::after {
      border-top-color: #36393d;
    }

    /* el-tabs */
    .el-tabs__item {
      color: hsla(0, 0%, 100%, 0.6);

      &:hover,
      &.is-active {
        color: #409eff;
      }
    }

    .el-tabs__nav-wrap::after {
      background-color: hsla(0, 0%, 100%, 0.6);
    }

    /* el-slider */
    .el-slider__runway {
      background-color: hsla(0, 0%, 100%, 0.6);
    }

    /* el-radio-group */
    .el-radio-group {
      .el-radio-button__inner {
        background-color: #36393d;
        color: hsla(0, 0%, 100%, 0.6);
      }

      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        color: #fff;
        background-color: #409eff;
      }
    }

    /* el-dialog */
    .el-dialog {
      background-color: #262a2e;

      .el-dialog__header {
        border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
      }

      .el-dialog__title {
        color: hsla(0, 0%, 100%, 0.9);
      }

      .el-dialog__body {
        background-color: #262a2e;
      }

      .el-dialog__footer {
        border-top: 1px solid hsla(0, 0%, 100%, 0.1);
      }
    }

    /* el-upload */
    .el-upload__tip {
      color: #999;
    }

    /* 富文本编辑器 */
    .toastui-editor-main-container {
      background-color: #fff;
    }
  }
}
</style>
