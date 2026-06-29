import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createMock,
  updateMock,
  deleteMock,
  getMocks,
  testMock,
  toggleMock,
  exportMocks,
  importMocks,
} from '@/api/mock';
import type { CreateMockDto, MockApi } from '@/types/mock';

function getDefaultForm() {
  return {
    method: 'GET',
    path: '',
    response: '{}',
    delay: 0,
    status: 200,
    headers: '{}',
  };
}

export function useMocks() {
  const list = ref<MockApi[]>([]);
  const loading = ref(false);
  const showForm = ref(false);
  const editingId = ref<number | null>(null);
  const form = ref(getDefaultForm());
  const submitting = ref(false);
  const searchQuery = ref('');
  const testResult = ref<MockApi>();
  const testDialog = ref(false);

  function isMethod(value: string): boolean {
    return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(value);
  }

  async function load() {
    loading.value = true;
    try {
      const response = await getMocks(searchQuery.value || undefined);
      list.value = response.data;
    } catch {
      list.value = [];
    } finally {
      loading.value = false;
    }
  }

  function search(query: string) {
    searchQuery.value = query;
    load();
  }

  async function submit() {
    if (!isMethod(form.value.method)) {
      ElMessage.error('Invalid HTTP method');
      return;
    }
    if (!form.value.path.trim()) {
      ElMessage.error('Path is required');
      return;
    }

    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(form.value.response);
    } catch (e: any) {
      ElMessage.error(`Invalid response JSON: ${e.message}`);
      return;
    }

    if (form.value.headers) {
      try { JSON.parse(form.value.headers); } catch {
        ElMessage.error('Invalid headers JSON');
        return;
      }
    }

    submitting.value = true;
    try {
      const dto: CreateMockDto = {
        method: form.value.method,
        path: form.value.path,
        response: parsedResponse as Record<string, unknown>,
        delay: form.value.delay,
        status: form.value.status,
        headers: JSON.parse(form.value.headers || '{}'),
      };

      if (editingId.value) {
        await updateMock(editingId.value, dto);
        ElMessage.success('Mock updated');
      } else {
        await createMock(dto);
        ElMessage.success('Mock created');
      }

      showForm.value = false;
      form.value = getDefaultForm();
      editingId.value = null;
      await load();
    } catch (e: any) {
      ElMessage.error(e.response?.data?.error || 'Operation failed');
    } finally {
      submitting.value = false;
    }
  }

  function openCreate() {
    editingId.value = null;
    form.value = getDefaultForm();
    showForm.value = true;
  }

  function openEdit(row: MockApi) {
    editingId.value = row.id;
    form.value = {
      method: row.method,
      path: row.path,
      response: typeof row.response === 'string' ? row.response : JSON.stringify(row.response, null, 2),
      delay: row.delay ?? 0,
      status: row.status ?? 200,
      headers: row.headers ? JSON.stringify(row.headers, null, 2) : '{}',
    };
    showForm.value = true;
  }

  async function remove(id: number) {
    try {
      await ElMessageBox.confirm('Delete this mock?', 'Confirm', { type: 'warning' });
      await deleteMock(id);
      await load();
      ElMessage.success('Deleted');
    } catch { /* cancelled */ }
  }

  async function toggle(row: MockApi) {
    try {
      await toggleMock(row.id);
      await load();
    } catch {
      ElMessage.error('Toggle failed');
    }
  }

  async function test(row: MockApi) {
    try {
      const response = await testMock(row.path, row.method);
      testResult.value = response.data;
      testDialog.value = true;
    } catch (e: any) {
      ElMessage.error(e.response?.data?.error || 'Test failed');
    }
  }

  function copyUrl(path: string) {
    const url = `http://localhost:3000${path}`;
    navigator.clipboard.writeText(url).then(
      () => ElMessage.success('Copied'),
      () => ElMessage.error('Copy failed'),
    );
  }

  async function handleExport() {
    try {
      const res = await exportMocks();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'easy-mock-export.json';
      a.click();
      ElMessage.success(`Exported ${res.data.length} mocks`);
    } catch {
      ElMessage.error('Export failed');
    }
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const mocks = JSON.parse(text);
        const res = await importMocks(mocks, true);
        ElMessage.success(`Imported ${res.data.imported}, skipped ${res.data.skipped}`);
        await load();
      } catch {
        ElMessage.error('Import failed — check file format');
      }
    };
    input.click();
  }

  return {
    list,
    loading,
    showForm,
    editingId,
    form,
    submitting,
    searchQuery,
    testResult,
    testDialog,
    load,
    search,
    submit,
    openCreate,
    openEdit,
    remove,
    toggle,
    test,
    copyUrl,
    handleExport,
    handleImport,
  };
}
