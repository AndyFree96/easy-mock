<script setup lang="ts">
import { ref } from 'vue';
import type { LogItem } from '@/types/mock';
import { ElMessage } from 'element-plus';

defineProps<{
  logs: LogItem[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  methodFilter: string;
}>();

const emit = defineEmits<{
  refresh: [];
  'update:page': [value: number];
  'update:limit': [value: number];
  'update:methodFilter': [value: string];
  filter: [];
}>();

const detailVisible = ref(false);
const detailRow = ref<LogItem>();

function showDetail(row: LogItem) {
  detailRow.value = row;
  detailVisible.value = true;
}

function formatLocalTime(utc: string) {
  const d = new Date(utc + 'Z');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function copyPath(path: string) {
  const url = `http://localhost:3000${path}`;
  navigator.clipboard.writeText(url).then(
    () => ElMessage.success('URL copied'),
    () => ElMessage.error('Copy failed'),
  );
}
</script>

<template>
  <div class="log-panel">
    <div class="log-toolbar">
      <el-select
        :model-value="methodFilter"
        @update:model-value="
          (v: string) => {
            emit('update:methodFilter', v);
            emit('filter');
          }
        "
        placeholder="Filter by method"
        clearable
        style="width: 160px"
      >
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
      </el-select>
      <el-button @click="emit('refresh')">Refresh</el-button>
    </div>

    <el-table
      :data="logs"
      v-loading="loading"
      empty-text="No logs yet"
      style="margin-top: 8px"
      @row-click="showDetail"
      row-class-name="log-row"
    >
      <el-table-column prop="method" label="Method" width="90">
        <template #default="{ row }">
          <el-tag
            :type="
              row.method === 'GET'
                ? 'success'
                : row.method === 'DELETE'
                  ? 'danger'
                  : 'primary'
            "
            size="small"
          >
            {{ row.method }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="Path" min-width="180">
        <template #default="{ row }">
          <span
            class="log-path"
            @click.stop="copyPath(row.path)"
            :title="'Copy: ' + row.path"
          >
            {{ row.path }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status >= 400 ? 'danger' : 'success'" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="time" label="Time (ms)" width="90" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column label="Timestamp" width="180">
        <template #default="{ row }">
          {{ formatLocalTime(row.timestamp) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > limit"
      style="margin-top: 16px; justify-content: flex-end"
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-size="limit"
      :current-page="page"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="(p: number) => emit('update:page', p)"
      @size-change="(s: number) => emit('update:limit', s)"
    />

    <el-dialog v-model="detailVisible" title="Log Detail" width="480px">
      <el-descriptions v-if="detailRow" :column="1" border size="small">
        <el-descriptions-item label="Method">{{ detailRow.method }}</el-descriptions-item>
        <el-descriptions-item label="Path">{{ detailRow.path }}</el-descriptions-item>
        <el-descriptions-item label="Status">{{ detailRow.status }}</el-descriptions-item>
        <el-descriptions-item label="Response Time">{{ detailRow.time }} ms</el-descriptions-item>
        <el-descriptions-item label="IP">{{ detailRow.ip }}</el-descriptions-item>
        <el-descriptions-item label="Timestamp">{{ formatLocalTime(detailRow.timestamp) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style scoped>
.log-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.log-path {
  cursor: pointer;
  color: var(--el-color-primary);
}
.log-path:hover {
  text-decoration: underline;
}
:deep(.log-row) {
  cursor: pointer;
}
</style>
