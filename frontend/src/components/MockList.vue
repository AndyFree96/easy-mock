<script setup lang="ts">
import { ref, watch } from 'vue';
import type { MockApi } from '@/types/mock';

defineProps<{
  list: MockApi[];
  loading: boolean;
}>();

const emit = defineEmits<{
  delete: [id: number];
  test: [row: MockApi];
  copy: [path: string];
  search: [query: string];
  edit: [row: MockApi];
  toggle: [row: MockApi];
}>();

const search = ref('');
let timer: ReturnType<typeof setTimeout>;

watch(search, (v) => {
  clearTimeout(timer);
  timer = setTimeout(() => emit('search', v), 300);
});
</script>

<template>
  <div class="mock-list">
    <el-input
      v-model="search"
      placeholder="Search by path or method..."
      clearable
      style="width: 320px; margin-bottom: 12px"
    />
    <el-table :data="list" v-loading="loading" empty-text="No mocks yet">
      <el-table-column label="On" width="55">
        <template #default="{ row }">
          <el-switch
            :model-value="row.enabled !== 0"
            size="small"
            @change="emit('toggle', row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="method" label="Method" width="100">
        <template #default="{ row }">
          <el-tag
            :type="row.method === 'GET' ? 'success' : row.method === 'DELETE' ? 'danger' : 'primary'"
            size="small"
          >
            {{ row.method }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="Path" min-width="180" />
      <el-table-column prop="status" label="Status" width="70" />
      <el-table-column prop="delay" label="Delay" width="70">
        <template #default="{ row }">
          {{ row.delay || 0 }}ms
        </template>
      </el-table-column>
      <el-table-column label="Actions" min-width="320" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="emit('edit', row)">Edit</el-button>
          <el-button size="small" @click="emit('copy', row.path)">Copy</el-button>
          <el-button size="small" type="success" @click="emit('test', row)">Test</el-button>
          <el-button size="small" type="danger" @click="emit('delete', row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
