<template>
  <slot />
</template>

<script setup>
import { provide } from "vue";
import { initEditor } from "./editor.js";
import { DocCollection } from "@blocksuite/store";
import { AffineEditorContainer } from "@blocksuite/presets";

const init = initEditor();
provide("appState", init);
</script>
