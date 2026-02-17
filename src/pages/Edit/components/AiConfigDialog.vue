<template>
  <el-dialog
    class="aiConfigDialog"
    :title="$t('ai.AIConfiguration')"
    v-model="aiConfigDialogVisible"
    width="550px"
    append-to-body
  >
    <div class="aiConfigBox">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <p class="title">{{ $t('ai.VolcanoArkLargeModelConfiguration') }}</p>
        <p class="desc">
          {{ $t('ai.configTip') }}<a href="https://mp.weixin.qq.com/s/JNb7PH4sCjWzIZ9G8wStGQ" target="_blank">{{ $t('ai.course') }}</a
          >。
        </p>
        <el-form-item label="API Key" prop="key">
          <el-input v-model="ruleForm.key"></el-input>
        </el-form-item>
        <el-form-item :label="$t('ai.inferenceAccessPoint')" prop="model">
          <el-input v-model="ruleForm.model"></el-input>
        </el-form-item>
        <!-- <el-form-item label="接口" prop="api">
          <el-input v-model="ruleForm.api"></el-input>
        </el-form-item>
        <el-form-item label="请求方式" prop="method">
          <el-select v-model="ruleForm.method" placeholder="请选择">
            <el-option key="POST" label="POST" value="POST"></el-option>
            <el-option key="GET" label="GET" value="GET"></el-option>
          </el-select>
        </el-form-item> -->
        <!-- <p class="title">{{ $t('ai.mindMappingClientConfiguration') }}</p>
        <el-form-item :label="$t('ai.port')" prop="port">
          <el-input v-model="ruleForm.port"></el-input>
        </el-form-item> -->
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">{{ $t('ai.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('ai.confirm')
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue'
import { useAppStore } from '@/store'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const appStore = useAppStore()

const aiConfigDialogVisible = ref(false)
const ruleFormRef = ref(null)
const ruleForm = ref({
  api: '',
  key: '',
  model: '',
  port: '',
  method: ''
})

const rules = {
  api: [
    {
      required: true,
      message: () => proxy.$t('ai.apiValidateTip'),
      trigger: 'blur'
    }
  ],
  key: [
    {
      required: true,
      message: () => proxy.$t('ai.keyValidateTip'),
      trigger: 'blur'
    }
  ],
  model: [
    {
      required: true,
      message: () => proxy.$t('ai.modelValidateTip'),
      trigger: 'blur'
    }
  ],
  port: [
    {
      required: true,
      message: () => proxy.$t('ai.portValidateTip'),
      trigger: 'blur'
    }
  ],
  method: [
    {
      required: true,
      message: () => proxy.$t('ai.methodValidateTip'),
      trigger: 'blur'
    }
  ]
}

const aiConfig = computed(() => appStore.aiConfig)

watch(() => props.modelValue, (val) => {
  aiConfigDialogVisible.value = val
})

watch(aiConfigDialogVisible, (val, oldVal) => {
  if (!val && oldVal) {
    close()
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const initFormData = () => {
  Object.keys(aiConfig.value).forEach(key => {
    ruleForm.value[key] = aiConfig.value[key]
  })
}

const cancel = () => {
  close()
  initFormData()
}

const confirm = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      close()
      appStore.setLocalConfig({
        ...ruleForm.value
      })
      ElMessage.success(proxy.$t('ai.configSaveSuccessTip'))
    }
  })
}

onMounted(() => {
  initFormData()
})
</script>

<style lang="less" scoped>
.aiConfigDialog {
    :deep(.el-dialog__body) {
      padding: 12px 20px;
    }

  .aiConfigBox {
    a {
      color: #409eff;
    }

    .title {
      margin-bottom: 12px;
      font-weight: bold;
    }

    .desc {
      margin-bottom: 12px;
      padding-left: 12px;
      border-left: 5px solid #ccc;
    }
  }
}
</style>
