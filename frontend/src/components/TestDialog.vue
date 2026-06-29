<script setup lang="ts">
import type { MockApi } from '@/types/mock';

defineProps<{
  visible: boolean;
  result?: MockApi;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
    title="Test Result"
    width="560px"
  >
    <el-descriptions v-if="result" :column="1" border size="small">
      <el-descriptions-item label="Path">{{ result.path }}</el-descriptions-item>
      <el-descriptions-item label="Method">
        <el-tag size="small">{{ result.method }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="Duration">{{ result.duration }} ms</el-descriptions-item>
    </el-descriptions>

    <h4 style="margin: 16px 0 8px">Response</h4>
    <pre class="response-viewer">{{ JSON.stringify(result?.response, null, 2) }}</pre>
  </el-dialog>
</template>

<style scoped>
.response-viewer {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}
</style>
