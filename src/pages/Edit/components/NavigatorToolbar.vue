<template>
  <div class="navigatorContainer customScrollbar" :class="{ isDark: isDark }">
    <div class="item">
      <el-select
        v-model="lang"
        size="small"
        style="width: 100px"
        @change="onLangChange"
      >
        <el-option
          v-for="item in langList"
          :key="item.value"
          :label="item.name"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="item">
      <el-tooltip
        effect="dark"
        :content="$t('navigatorToolbar.backToRoot')"
        placement="top"
      >
        <div class="btn iconfont icondingwei" @click="backToRoot"></div>
      </el-tooltip>
    </div>
    <div class="item">
      <div class="btn iconfont iconsousuo" @click="showSearch"></div>
    </div>
    <div class="item">
      <MouseAction :isDark="isDark" :mindMap="mindMap"></MouseAction>
    </div>
    <div class="item">
      <el-tooltip
        effect="dark"
        :content="
          openMiniMap
            ? $t('navigatorToolbar.closeMiniMap')
            : $t('navigatorToolbar.openMiniMap')
        "
        placement="top"
      >
        <div class="btn iconfont icondaohang1" @click="toggleMiniMap"></div>
      </el-tooltip>
    </div>
    <div class="item">
      <!-- <el-switch
        v-model="isReadonly"
        :active-text="$t('navigatorToolbar.readonly')"
        :inactive-text="$t('navigatorToolbar.edit')"
        @change="readonlyChange"
      >
      </el-switch> -->
      <el-tooltip
        effect="dark"
        :content="
          isReadonly
            ? $t('navigatorToolbar.edit')
            : $t('navigatorToolbar.readonly')
        "
        placement="top"
      >
        <div
          class="btn iconfont"
          :class="[isReadonly ? 'iconyanjing' : 'iconbianji1']"
          @click="readonlyChange"
        ></div>
      </el-tooltip>
    </div>
    <div class="item">
      <Fullscreen :isDark="isDark" :mindMap="mindMap"></Fullscreen>
    </div>
    <div class="item">
      <Scale :isDark="isDark" :mindMap="mindMap"></Scale>
    </div>
    <div class="item">
      <div
        class="btn iconfont"
        :class="[isDark ? 'iconmoon_line' : 'iconlieri']"
        @click="toggleDark"
      ></div>
    </div>
    <!-- <div class="item">
      <el-tooltip
        effect="dark"
        :content="$t('navigatorToolbar.changeSourceCodeEdit')"
        placement="top"
      >
        <div class="btn iconfont iconyuanma" @click="openSourceCodeEdit"></div>
      </el-tooltip>
    </div> -->
    <div class="item">
      <Demonstrate :isDark="isDark" :mindMap="mindMap"></Demonstrate>
    </div>
    <div class="item">
      <el-dropdown @command="handleCommand">
        <div class="btn el-icon-more"></div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="shortcutKey">
              <span class="iconfont iconjianpan"></span>
              {{ $t('navigatorToolbar.shortcutKeys') }}
            </el-dropdown-item>
            <el-dropdown-item command="aiChat">
              <span class="iconfont iconAIshengcheng"></span>
              {{ $t('navigatorToolbar.ai') }}
            </el-dropdown-item>
            <el-dropdown-item command="client">
              <span class="iconfont iconxiazai"></span>
              {{ $t('navigatorToolbar.downloadClient') }}
            </el-dropdown-item>
            <el-dropdown-item command="github">
              <span class="iconfont icongithub"></span>
              Github
            </el-dropdown-item>
            <el-dropdown-item command="site">
              <span class="iconfont iconwangzhan"></span>
              {{ $t('navigatorToolbar.site') }}
            </el-dropdown-item>
            <el-dropdown-item disabled
              >{{ $t('navigatorToolbar.current') }}v{{
                version
              }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import Scale from './Scale.vue'
import Fullscreen from './Fullscreen.vue'
import MouseAction from './MouseAction.vue'
import { langList } from '@/config'
import i18n from '@/i18n'
import { storeLang, getLang } from '@/api'
import { useAppStore } from '@/store'
import pkg from 'simple-mind-map/package.json'
import Demonstrate from './Demonstrate.vue'

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()
const appStore = useAppStore()

const version = ref(pkg.version)
const lang = ref('')
const openMiniMap = ref(false)

const isReadonly = computed(() => appStore.isReadonly)
const isDark = computed(() => appStore.localConfig.isDark)

const readonlyChange = () => {
  appStore.setIsReadonly(!isReadonly.value)
  props.mindMap.setMode(isReadonly.value ? 'readonly' : 'edit')
}

const toggleMiniMap = () => {
  openMiniMap.value = !openMiniMap.value
  proxy.$bus.$emit('toggle_mini_map', openMiniMap.value)
}

const onLangChange = (langValue) => {
  i18n.locale = langValue
  storeLang(langValue)
  proxy.$bus.$emit('lang_change')
}

const showSearch = () => {
  proxy.$bus.$emit('show_search')
}

const toggleDark = () => {
  appStore.setLocalConfig({
    isDark: !isDark.value
  })
}

const handleCommand = (command) => {
  if (command === 'shortcutKey') {
    appStore.setActiveSidebar('shortcutKey')
    return
  } else if (command === 'aiChat') {
    appStore.setActiveSidebar('ai')
    return
  } else if (command === 'client') {
    proxy.$bus.$emit(
      'showDownloadTip',
      proxy.$t('navigatorToolbar.downloadClient'),
      proxy.$t('navigatorToolbar.downloadDesc')
    )
    return
  }
  let url = ''
  switch (command) {
    case 'github':
      url = 'https://github.com/wanglin2/mind-map'
      break
    case 'helpDoc':
      url = 'https://wanglin2.github.io/mind-map-docs/help/help1.html'
      break
    case 'devDoc':
      url =
        'https://wanglin2.github.io/mind-map-docs/start/introduction.html'
      break
    case 'site':
      url = 'https://wanglin2.github.io/mind-map-docs/'
      break
    case 'issue':
      url = 'https://github.com/wanglin2/mind-map/issues/new'
      break

    default:
      break
  }
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.click()
}

const backToRoot = () => {
  props.mindMap.renderer.setRootNodeCenter()
}

const openSourceCodeEdit = () => {
  appStore.setIsSourceCodeEdit(true)
}

onMounted(() => {
  lang.value = getLang()
})
</script>

<style lang="less" scoped>
.navigatorContainer {
  padding: 0 12px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: hsla(0, 0%, 100%, 0.8);
  border-radius: 5px;
  opacity: 0.8;
  height: 44px;
  font-size: 12px;
  display: flex;
  align-items: center;

  &.isDark {
    background: #262a2e;

    .item {
      a {
        color: hsla(0, 0%, 100%, 0.6);
      }

      .btn {
        color: hsla(0, 0%, 100%, 0.6);
      }
    }
  }

  .item {
    margin-right: 20px;

    &:last-of-type {
      margin-right: 0;
    }

    a {
      color: #303133;
      text-decoration: none;
    }

    .btn {
      cursor: pointer;
      font-size: 18px;
    }
  }
}

@media screen and (max-width: 700px) {
  .navigatorContainer {
    left: 20px;
    overflow-x: auto;
    overflow-y: hidden;
    height: 60px;
  }
}
</style>
