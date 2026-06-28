<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(['update:modelValue']);

const el = ref();
let editor: any = null;

onMounted(() => {
  editor = monaco.editor.create(el.value, {
    value: props.modelValue || '{}',
    language: 'json',
    theme: 'vs-dark',
    automaticLayout: true,
  });

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue());
  });
});

watch(
  () => props.modelValue,
  (v) => {
    if (editor && v !== editor.getValue()) {
      editor.setValue(v || '{}');
    }
  },
);
</script>

<template>
  <div class="editor" ref="el"></div>
</template>

<style scoped>
.editor {
  height: 300px;
  border: 1px solid #ddd;
}
</style>
