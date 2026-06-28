<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  createMock,
  deleteMock,
  getLogs,
  getMocks,
  testMock,
} from './api/mock';
import type { LogItem, METHODS, MockApi } from './types/mock';
import JsonEditor from './components/JsonEditor.vue';

const show = ref(false);
const list = ref<MockApi[]>([]);
const form = ref(getDefaultMock());
const testResult = ref<MockApi>();
const testDialog = ref(false);
const logs = ref<LogItem[]>();

function getDefaultMock() {
  return {
    method: 'GET',
    path: '',
    response: '{}',
  };
}

function isMethod(value: string): value is METHODS {
  return ['GET', 'POST', 'PUT', 'DELETE'].includes(value);
}

async function loadMocks() {
  try {
    const response = await getMocks();
    list.value = response.data;
  } catch {
    list.value = [];
  }
}

async function submit() {
  if (!isMethod(form.value.method)) {
    throw new Error('Invalid Method');
  }

  try {
    const parsed = JSON.parse(form.value.response);

    await createMock({
      method: form.value.method,
      path: form.value.path,
      response: parsed,
    });

    show.value = false;

    form.value = getDefaultMock();

    loadMocks();
  } catch (e) {
    alert(`JSON格式错误: ${e}`);
  }
}

async function remove(id: number) {
  await deleteMock(id);

  loadMocks();
}

async function test(row: MockApi) {
  const response = await testMock(row.path, row.method);
  testResult.value = response.data;
  testDialog.value = true;
}

async function loadLogs() {
  const response = await getLogs();
  logs.value = response.data.data;
}

onMounted(loadMocks);
onMounted(loadLogs);
</script>

<template>
  <div class="container">
    <h1>EasyMock</h1>
    <el-button type="primary" @click="show = true">创建接口</el-button>
    <el-table :data="list" style="margin-top: 20px">
      <el-table-column prop="method" label="Method"></el-table-column>
      <el-table-column prop="path" label="Path"></el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="danger" @click="remove(scope.row.id)">
            删除
          </el-button>
          <el-button type="success" @click="test(scope.row)"> 测试 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button style="margin-top: 20px" type="primary" @click="loadLogs"
      >查看日志</el-button
    >
    <el-table :data="logs" style="margin-top: 20px">
      <el-table-column prop="method" label="Method"></el-table-column>
      <el-table-column prop="path" label="Path"></el-table-column>
      <el-table-column prop="status" label="Status"></el-table-column>
      <el-table-column prop="time" label="Time(ms)"></el-table-column>
      <el-table-column prop="ip" label="IP"></el-table-column>
      <el-table-column prop="timestamp" label="TimeStamp"></el-table-column>
    </el-table>
  </div>

  <el-dialog v-model="show" title="创建 Mock">
    <el-form>
      <el-form-item label="Method">
        <el-select v-model="form.method">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
        </el-select>
      </el-form-item>

      <el-form-item label="Path">
        <el-input v-model="form.path" />
      </el-form-item>

      <el-form-item label="Response">
        <!-- <el-input type="textarea" rows="8" v-model="form.response" /> -->
        <JsonEditor v-model="form.response" style="width: 100%" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="submit"> 保存 </el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="testDialog" title="Mock测试结果">
    <div>
      <p><b>Path:</b> {{ testResult?.path }}</p>
      <p><b>Method:</b> {{ testResult?.method }}</p>
      <p><b>Duration:</b> {{ testResult?.duration }} ms</p>
    </div>

    <pre style="background: #111; color: #0f0; padding: 10px"
      >{{ testResult?.response }}
 </pre
    >
  </el-dialog>
</template>

<style scoped></style>
