<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MockList from './components/MockList.vue';
import MockForm from './components/MockForm.vue';
import LogPanel from './components/LogPanel.vue';
import TestDialog from './components/TestDialog.vue';
import StatsPanel from './components/StatsPanel.vue';
import { useMocks } from './composables/useMocks';
import { useLogs } from './composables/useLogs';
import { useDark, useToggle } from '@vueuse/core';

const mocks = useMocks();
const logs = useLogs();
const activeTab = ref('mocks');
const isDark = useDark();
const toggleDark = useToggle(isDark);

function onMockSearch(query: string) {
  mocks.search(query);
}

onMounted(() => {
  mocks.load();
  logs.load();
});
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-left">
        <h1>EasyMock</h1>
        <span class="app-subtitle">Mock API Server</span>
      </div>
      <div class="header-right">
        <el-button size="small" @click="mocks.handleExport">Export</el-button>
        <el-button size="small" @click="mocks.handleImport">Import</el-button>
        <el-button size="small" @click="toggleDark()" circle>
          {{ isDark ? '☀️' : '🌙' }}
        </el-button>
      </div>
    </header>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="Mock APIs" name="mocks">
        <el-button
          type="primary"
          @click="mocks.openCreate"
          style="margin-bottom: 12px"
        >
          Create Mock
        </el-button>
        <MockList
          :list="mocks.list.value"
          :loading="mocks.loading.value"
          @delete="mocks.remove"
          @test="mocks.test"
          @copy="mocks.copyUrl"
          @search="onMockSearch"
          @edit="mocks.openEdit"
          @toggle="mocks.toggle"
        />
      </el-tab-pane>

      <el-tab-pane label="Request Logs" name="logs">
        <LogPanel
          :logs="logs.logs.value"
          :loading="logs.loading.value"
          :total="logs.total.value"
          :page="logs.page.value"
          :limit="logs.limit.value"
          :methodFilter="logs.methodFilter.value"
          @refresh="logs.load"
          @update:page="logs.onPageChange"
          @update:limit="logs.onPageSizeChange"
          @update:methodFilter="
            (v: string) => {
              logs.methodFilter.value = v;
            }
          "
          @filter="logs.onFilterChange"
        />
      </el-tab-pane>

      <el-tab-pane label="Stats" name="stats">
        <StatsPanel />
      </el-tab-pane>
    </el-tabs>

    <MockForm
      :visible="mocks.showForm.value"
      :editing="mocks.editingId.value !== null"
      :form="mocks.form.value"
      :submitting="mocks.submitting.value"
      @update:visible="
        (v: boolean) => {
          mocks.showForm.value = v;
        }
      "
      @update:form="
        (f) => {
          mocks.form.value = f;
        }
      "
      @submit="mocks.submit"
    />

    <TestDialog
      :visible="mocks.testDialog.value"
      :result="mocks.testResult.value"
      @update:visible="
        (v: boolean) => {
          mocks.testDialog.value = v;
        }
      "
    />
  </div>
</template>

<style scoped>
.app-shell {
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.app-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.app-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
