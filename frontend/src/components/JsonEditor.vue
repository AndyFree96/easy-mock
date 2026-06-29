<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{ modelValue?: string }>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const el = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(() => {
  if (!el.value) return;

  editor = monaco.editor.create(el.value, {
    value: props.modelValue || '{}',
    language: 'json',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    lineNumbers: 'on',
  });

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor!.getValue());
  });
});

watch(
  () => props.modelValue,
  (v) => {
    if (editor && v !== undefined && v !== editor.getValue()) {
      editor.setValue(v);
    }
  }
);

onUnmounted(() => {
  editor?.dispose();
  editor = null;
});
</script>

<template>
  <div class="editor" ref="el"></div>
</template>

<style scoped>
.editor {
  height: 260px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
</style>
