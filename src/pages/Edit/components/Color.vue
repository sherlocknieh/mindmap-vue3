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
        v-model:value="selectColor"
        @change="changeColor"
      ></el-color-picker>
    </div>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { colorList } from '@/config'
import { mapState, mapActions } from 'pinia'
import { useAppStore } from '@/store'

export default {
  props: {
    color: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      colorList,
      selectColor: '',
    }
  },
  computed: {
    ...mapState(useAppStore, {
      isDark: (state) => state.localConfig.isDark,
    }),
  },
  watch: {
    color() {
      this.selectColor = this.color
    },
  },
  created() {
    this.selectColor = this.color
  },
  methods: {
    // 点击预设颜色
    clickColorItem(color) {
      $emit(this, 'change', color)
    },

    // 修改颜色
    changeColor() {
      $emit(this, 'change', this.selectColor)
    },
  },
  emits: ['change'],
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
