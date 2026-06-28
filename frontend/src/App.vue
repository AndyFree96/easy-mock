<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { createMock, deleteMock, getMocks } from './api/mock';
import type { METHODS, MockApi } from './types/mock';
import JsonEditor from './components/JsonEditor.vue';

const show = ref(false);
const list = ref<MockApi[]>([]);
const form = ref(getDefaultMock());

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

async function load() {
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

    load();
  } catch (e) {
    alert(`JSON格式错误: ${e}`);
  }
}

async function remove(id: number) {
  await deleteMock(id);

  load();
}

onMounted(load);
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
        </template>
      </el-table-column>
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
</template>

<style scoped></style>
