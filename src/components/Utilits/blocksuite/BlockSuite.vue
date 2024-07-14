<template>
  <EditorProvider>
    <div class="absolute-full main-content">
      <EditorContainer />
    </div>
  </EditorProvider>
</template>

<script setup>
import EditorProvider from "./EditorProvider.vue";
import EditorContainer from "./EditorContainer.vue";
</script>
<style>
.app {
  display: flex;
  font-family: sans-serif;
}

.doc-item {
  padding: 5px;
}

.doc-item.active,
.doc-item:hover {
  background-color: #f0f0f0;
}

.main-content {
  flex: 1;
}
</style>
