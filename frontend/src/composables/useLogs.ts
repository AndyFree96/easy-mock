import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getLogs } from '@/api/mock';
import type { LogItem } from '@/types/mock';

export function useLogs() {
  const logs = ref<LogItem[]>([]);
  const loading = ref(false);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const methodFilter = ref('');

  async function load() {
    loading.value = true;
    try {
      const response = await getLogs({
        page: page.value,
        limit: limit.value,
        method: methodFilter.value || undefined,
      });
      logs.value = response.data.data;
      total.value = response.data.total;
    } catch {
      ElMessage.error('Failed to load logs');
    } finally {
      loading.value = false;
    }
  }

  function onPageChange(p: number) {
    page.value = p;
    load();
  }

  function onPageSizeChange(s: number) {
    limit.value = s;
    page.value = 1;
    load();
  }

  function onFilterChange() {
    page.value = 1;
    load();
  }

  return {
    logs,
    loading,
    total,
    page,
    limit,
    methodFilter,
    load,
    onPageChange,
    onPageSizeChange,
    onFilterChange,
  };
}
