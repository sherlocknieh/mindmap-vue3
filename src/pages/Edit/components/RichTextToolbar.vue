<template>
  <div
    class="richTextToolbar"
    ref="richTextToolbar"
    :style="style"
    :class="{ isDark: isDark }"
    @click.stop.passive
    v-show="showRichTextToolbar"
  >
    <el-tooltip :content="$t('richTextToolbar.bold')" placement="top">
      <div class="btn" :class="{ active: formatInfo.bold }" @click="toggleBold">
        <span class="icon iconfont iconzitijiacu"></span>
      </div>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.italic')" placement="top">
      <div
        class="btn"
        :class="{ active: formatInfo.italic }"
        @click="toggleItalic"
      >
        <span class="icon iconfont iconzitixieti"></span>
      </div>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.underline')" placement="top">
      <div
        class="btn"
        :class="{ active: formatInfo.underline }"
        @click="toggleUnderline"
      >
        <span class="icon iconfont iconzitixiahuaxian"></span>
      </div>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.strike')" placement="top">
      <div
        class="btn"
        :class="{ active: formatInfo.strike }"
        @click="toggleStrike"
      >
        <span class="icon iconfont iconshanchuxian"></span>
      </div>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.fontFamily')" placement="top">
      <el-popover placement="bottom" trigger="hover">
        <div class="fontOptionsList" :class="{ isDark: isDark }">
          <div
            class="fontOptionItem"
            v-for="item in fontFamilyList_computed"
            :key="item.value"
            :style="{ fontFamily: item.value }"
            :class="{ active: formatInfo.font === item.value }"
            @click="changeFontFamily(item.value)"
          >
            {{ item.name }}
          </div>
        </div>
        <template #reference>
          <div class="btn">
            <span class="icon iconfont iconxingzhuang-wenzi"></span>
          </div>
        </template>
      </el-popover>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.fontSize')" placement="top">
      <el-popover placement="bottom" trigger="hover">
        <div class="fontOptionsList" :class="{ isDark: isDark }">
          <div
            class="fontOptionItem"
            v-for="item in fontSizeList_data"
            :key="item"
            :style="{
              fontSize: item + 'px',
              height: (item < 30 ? 30 : item + 10) + 'px',
            }"
            :class="{ active: formatInfo.size === item + 'px' }"
            @click="changeFontSize(item)"
          >
            {{ item }}px
          </div>
        </div>
        <template #reference>
          <div class="btn">
            <span class="icon iconfont iconcase fontColor"></span>
          </div>
        </template>
      </el-popover>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.color')" placement="top">
      <el-popover placement="bottom" trigger="hover">
        <Color :color="fontColor" @change="changeFontColor"></Color>
        <template #reference>
          <div class="btn" :style="{ color: formatInfo.color }">
            <span class="icon iconfont iconzitiyanse"></span>
          </div>
        </template>
      </el-popover>
    </el-tooltip>

    <el-tooltip
      :content="$t('richTextToolbar.backgroundColor')"
      placement="top"
    >
      <el-popover placement="bottom" trigger="hover">
        <Color
          :color="fontBackgroundColor"
          @change="changeFontBackgroundColor"
        ></Color>
        <template #reference>
          <div class="btn">
            <span class="icon iconfont iconbeijingyanse"></span>
          </div>
        </template>
      </el-popover>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.textAlign')" placement="top">
      <el-popover placement="bottom" trigger="hover">
        <div class="fontOptionsList" :class="{ isDark: isDark }">
          <div
            class="fontOptionItem"
            v-for="item in alignList_computed"
            :key="item.value"
            :class="{ active: formatInfo.align === item.value }"
            @click="changeTextAlign(item.value)"
          >
            {{ item.name }}
          </div>
        </div>
        <template #reference>
          <div class="btn">
            <span class="icon iconfont iconjuzhongduiqi"></span>
          </div>
        </template>
      </el-popover>
    </el-tooltip>

    <el-tooltip :content="$t('richTextToolbar.removeFormat')" placement="top">
      <div class="btn" @click="removeFormat">
        <span class="icon iconfont iconqingchu"></span>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { fontFamilyList, fontSizeList, alignList } from '@/config'
import Color from './Color.vue'
import { useAppStore } from '@/store'

const { proxy } = getCurrentInstance()

const props = defineProps({
  mindMap: {
    type: Object
  }
})

const appStore = useAppStore()

const richTextToolbar = ref(null)
const fontSizeList_data = fontSizeList
const showRichTextToolbar = ref(false)
const style = ref({
  left: 0,
  top: 0
})
const fontColor = ref('')
const fontBackgroundColor = ref('')
const formatInfo = ref({})

const isDark = computed(() => appStore.localConfig.isDark)

const fontFamilyList_computed = computed(() => {
  return fontFamilyList[proxy.$i18n.locale] || fontFamilyList.zh
})

const alignList_computed = computed(() => {
  return alignList[proxy.$i18n.locale] || alignList.zh
})

const onRichTextSelectionChange = (hasRange, rect, formatInfoData) => {
  if (hasRange) {
    style.value.left = rect.left + rect.width / 2 + 'px'
    style.value.top = rect.top - 60 + 'px'
    formatInfo.value = { ...(formatInfoData || {}) }
  }
  showRichTextToolbar.value = hasRange
}

const toggleBold = () => {
  formatInfo.value.bold = !formatInfo.value.bold
  props.mindMap.richText.formatText({
    bold: formatInfo.value.bold
  })
}

const toggleItalic = () => {
  formatInfo.value.italic = !formatInfo.value.italic
  props.mindMap.richText.formatText({
    italic: formatInfo.value.italic
  })
}

const toggleUnderline = () => {
  formatInfo.value.underline = !formatInfo.value.underline
  props.mindMap.richText.formatText({
    underline: formatInfo.value.underline
  })
}

const toggleStrike = () => {
  formatInfo.value.strike = !formatInfo.value.strike
  props.mindMap.richText.formatText({
    strike: formatInfo.value.strike
  })
}

const changeFontFamily = (font) => {
  formatInfo.value.font = font
  props.mindMap.richText.formatText({
    font
  })
}

const changeFontSize = (size) => {
  formatInfo.value.size = size
  props.mindMap.richText.formatText({
    size: size + 'px'
  })
}

const changeFontColor = (color) => {
  formatInfo.value.color = color
  props.mindMap.richText.formatText({
    color
  })
}

const changeFontBackgroundColor = (background) => {
  formatInfo.value.background = background
  props.mindMap.richText.formatText({
    background
  })
}

const changeTextAlign = (align) => {
  formatInfo.value.align = align
  props.mindMap.richText.formatText({
    align
  })
}

const removeFormat = () => {
  props.mindMap.richText.removeFormat()
}

onMounted(() => {
  document.body.append(richTextToolbar.value)
  proxy.$bus.$on('rich_text_selection_change', onRichTextSelectionChange)
})

onBeforeUnmount(() => {
  proxy.$bus.$off('rich_text_selection_change', onRichTextSelectionChange)
})
</script>

<style lang="less" scoped>
.richTextToolbar {
  position: fixed;
  z-index: 2000;
  height: 55px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  transform: translateX(-50%);
  &.isDark {
    background: #363b3f;

    .btn {
      color: #fff;

      &:hover {
        background: hsla(0, 0%, 100%, 0.05);
      }
    }
  }

  .btn {
    width: 55px;
    height: 55px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
      background-color: #eefbed;
    }

    &.active {
      color: #12bb37;
    }

    .icon {
      font-size: 20px;

      &.fontColor {
        font-size: 26px;
      }
    }
  }
}
.fontOptionsList {
  width: 150px;
  &.isDark {
    .fontOptionItem {
      color: #fff;

      &:hover {
        background-color: hsla(0, 0%, 100%, 0.05);
      }
    }
  }

  .fontOptionItem {
    height: 30px;
    width: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      background-color: #f7f7f7;
    }

    &.active {
      color: #12bb37;
    }
  }
}
</style>
