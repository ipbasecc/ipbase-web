<template>
  <div class="fit editor-container" ref="editorContainerRef"></div>
</template>

<script setup>
import { inject, onMounted, ref } from "vue";

const { editor } = inject("appState");
const editorContainerRef = ref();

onMounted(() => {
  editorContainerRef.value && editorContainerRef.value.appendChild(editor);
});
</script>
