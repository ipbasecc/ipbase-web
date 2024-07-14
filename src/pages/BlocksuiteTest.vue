<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Title </q-toolbar-title>

        <q-space />
        <q-btn dense flat round icon="save" @click="exportDoc" />
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left">
      {{ json }}
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right">
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <div ref="blocksuiteRef" />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import "src/components/Utilits/blocksuite/style.css";
import { onBeforeMount, onMounted, ref, toRefs } from "vue";
import { useQuasar } from "quasar";

import { PageEditor, createEmptyDoc } from "@blocksuite/presets";
import { Job } from "@blocksuite/store";

const props = defineProps({
  jsonContent: {
    type: Object,
    default: null,
  },
});
const { jsonContent } = toRefs(props);
const $q = useQuasar();
const blocksuiteRef = ref();

const editor = new PageEditor();
let doc = createEmptyDoc().init();

const json = ref();
const exportDoc = async () => {
  const { collection } = doc;
  const job = new Job({ collection });
  json.value = await job.docToSnapshot(doc);
};
const importDoc = async (_json) => {
  const { collection } = doc;
  const job = new Job({ collection });
  const res = await job.snapshotToDoc(_json);
  if (res) {
    return res;
  }
};

onBeforeMount(async () => {
  if ($q.dark.mode) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
});

onMounted(async () => {
  // createDoc();
  doc = jsonContent.value ? await importDoc(jsonContent.value) : doc;
  editor.doc = doc;
  blocksuiteRef.value.appendChild(editor);
});

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>

<style lang="scss" scoped></style>
