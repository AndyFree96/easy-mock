<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const JsonEditor = defineAsyncComponent(() => import('./JsonEditor.vue'));

const props = defineProps<{
  visible: boolean;
  editing: boolean;
  form: {
    method: string;
    path: string;
    response: string;
    delay: number;
    status: number;
    headers: string;
  };
  submitting: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'update:form': [value: typeof props.form];
  submit: [];
}>();

const emitVisible = (v: boolean) => emit('update:visible', v);
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emitVisible"
    :title="editing ? 'Edit Mock API' : 'Create Mock API'"
    width="620px"
    destroy-on-close
  >
    <el-form label-width="100px">
      <el-form-item label="Method">
        <el-select
          :model-value="form.method"
          @update:model-value="(v: string) => emit('update:form', { ...form, method: v })"
        >
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
          <el-option label="PATCH" value="PATCH" />
        </el-select>
      </el-form-item>

      <el-form-item label="Path">
        <el-input
          :model-value="form.path"
          @update:model-value="(v: string) => emit('update:form', { ...form, path: v })"
          placeholder="/api/example or /api/users/:id"
        />
      </el-form-item>

      <el-form-item label="Status Code">
        <el-input-number
          :model-value="form.status"
          @update:model-value="(v: number | undefined) => emit('update:form', { ...form, status: v ?? 200 })"
          :min="100"
          :max="599"
        />
      </el-form-item>

      <el-form-item label="Delay (ms)">
        <el-input-number
          :model-value="form.delay"
          @update:model-value="(v: number | undefined) => emit('update:form', { ...form, delay: v ?? 0 })"
          :min="0"
          :max="10000"
          :step="100"
        />
      </el-form-item>

      <el-form-item label="Headers">
        <el-input
          :model-value="form.headers"
          @update:model-value="(v: string) => emit('update:form', { ...form, headers: v })"
          type="textarea"
          :rows="2"
          placeholder='{"X-Custom": "value"}'
        />
      </el-form-item>

      <el-form-item label="Response">
        <Suspense>
          <JsonEditor
            :model-value="form.response"
            @update:model-value="(v: string) => emit('update:form', { ...form, response: v })"
            style="width: 100%"
          />
          <template #fallback>
            <div class="editor-fallback">Loading editor...</div>
          </template>
        </Suspense>
        <div class="template-hint">
          Variables: <code>{<!-- -->{timestamp}}</code> <code>{<!-- -->{datetime}}</code>
          <code>{<!-- -->{uuid}}</code> <code>{<!-- -->{randomInt}}</code>
          <code>{<!-- -->{randomFloat}}</code> <code>{<!-- -->{randomBool}}</code>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emitVisible(false)">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="emit('submit')">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.template-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.8;
}
.template-hint code {
  background: var(--el-fill-color);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
}
.editor-fallback {
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e1e1e;
  color: #888;
  border-radius: 4px;
}
</style>
