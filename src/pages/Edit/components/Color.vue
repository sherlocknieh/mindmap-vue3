<template>
  <div class="colorContainer" :class="{ isDark: isDark }">
    <div class="colorList">
      <span
        class="colorItem iconfont"
        v-for="item in colorList"
        :style="{ backgroundColor: item }"
        :class="{ icontouming: item === 'transparent' }"
        :key="item"
        @click="clickColorItem(item)"
      ></span>
    </div>
    <div class="moreColor">
      <span>{{ $t('color.moreColor') }}</span>
      <el-color-picker
        size="mini"
        show-alpha
        v-model="selectColor"
        @change="changeColor"
      ></el-color-picker>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { colorList } from '@/config'
import { useAppStore } from '@/store'

const props = defineProps({
  color: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['change'])

const appStore = useAppStore()
const selectColor = ref('')

const isDark = computed(() => appStore.localConfig.isDark)

watch(() => props.color, () => {
  selectColor.value = props.color
})

onMounted(() => {
  selectColor.value = props.color
})

// 点击预设颜色
const clickColorItem = (color) => {
  emit('change', color)
}

// 修改颜色
const changeColor = () => {
  emit('change', selectColor.value)
}
</script>

<style lang="less" scoped>
.colorContainer {
  &.isDark {
    .moreColor {
      color: hsla(0, 0%, 100%, 0.6);
    }
  }
}

.colorList {
  width: 240px;
  display: flex;
  flex-wrap: wrap;

  .colorItem {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15px;
    height: 15px;
    margin-right: 5px;
    margin-bottom: 5px;
    cursor: pointer;
  }
}

.moreColor {
  display: flex;
  align-items: center;

  span {
    margin-right: 5px;
  }
}
</style>
