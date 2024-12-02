<template>
  <ejs-filemanager
    v-if="cssLoaded"
    v-bind="$attrs"
    ref="filemanagerRef"
    id="file-manager"
    class="fit borderless"
    :ajaxSettings="ajaxSettings"
    :allowMultiSelection="allowMultiSelection"
    :allowDragAndDrop="allowDragAndDrop"
    :uploadSettings="uploadSettings"
    :toolbarSettings="toolbarSettings"
    :contextMenuSettings="contextMenuSettings"
    :locale
    :showHiddenItems="false"
    @beforeSend="onBeforeSend($event)"
    @beforeDownload="onBeforeSend($event)"
    @toolbarClick="onToolbarClick($event)"
    @menuClick="onMenuClick($event)"
  ></ejs-filemanager>
  <link
    :href="$q.dark.mode ? $pathService('/css/dark.css') : $pathService('/css/light.css')"
    rel="stylesheet"
  />
</template>

<script setup>
import {
  FileManagerComponent as EjsFilemanager,
  DetailsView,
  NavigationPane,
  Toolbar,
} from "@syncfusion/ej2-vue-filemanager";
import { ref, provide, toRefs, onMounted } from "vue";

import { L10n, setCulture } from "@syncfusion/ej2-base";
import { filemanager_cn } from "src/i18n/ej2.js";
import { useQuasar } from "quasar";
import { $pathService } from 'src/boot/service.js'

const props = defineProps({
  storage: {
    type: Object,
    default: null,
  },
});
const { storage } = toRefs(props);

const $q = useQuasar();
const cssLoaded = ref(false);
const loadCss = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = $q.dark.mode ? $pathService('/css/dark.css') : $pathService('/css/light.css');
  link.onload = () => (cssLoaded.value = true);
  document.head.appendChild(link);
};

onMounted(() => {
  loadCss();
});

const locale = "zh";
const filemanager = [DetailsView, NavigationPane, Toolbar];
provide("filemanager", filemanager);

const hostUrl = `${process.env.REST_API}storages/${storage.value?.id}/`;
let jwt = localStorage.getItem(`jwt`);
jwt = jwt.replace(/"/g, "");
const ajaxSettings = {
  url: hostUrl + "Azure",
  getImageUrl: hostUrl + "GetImage",
  uploadUrl: hostUrl + "Upload",
  downloadUrl: hostUrl + "Download",
};
function onBeforeSend(args) {
  args.ajaxSettings.beforeSend = function (args) {
    args.httpRequest.setRequestHeader("Authorization", `Bearer ${jwt}`);
  };
}
const allowMultiSelection = true;
const allowDragAndDrop = true;
const uploadSettings = ref({
  directoryUpload: false,
  autoUpload: true,
  minFileSize: 0,
  maxFileSize: 30000000,
  allowedExtensions: "",
  autoClose: false,
});
const toolbarSettings = {
  items: [
    "Upload",
    "UploadFolder",
    "NewFolder",
    "Download",
    "Rename",
    "Delete",
    "SortBy",
    "Refresh",
    "Selection",
    "View",
    "Details",
  ],
};
const contextMenuSettings = {
  file: [
    "Open",
    "|",
    "Cut",
    "Copy",
    "|",
    "Delete",
    "Rename",
    "|",
    "Details",
    "UploadFolder",
  ],
  folder: [
    "Open",
    "|",
    "Cut",
    "Copy",
    "Paste",
    "|",
    "Delete",
    "Rename",
    "|",
    "Details",
    "UploadFolder",
  ],
  layout: [
    "SortBy",
    "Refresh",
    "|",
    "Paste",
    "|",
    "NewFolder",
    "Upload",
    "UploadFolder",
  ],
  navbar: [
    "NewFolder",
    "Upload",
    "|",
    "Delete",
    "Rename",
    "|",
    "Details",
    "UploadFolder",
  ],
};
const filemanagerRef = ref();
const onToolbarClick = (args) => {
  if (args.item.id === "file-manager_tb_uploadfolder") {
    uploadSettings.value.directoryUpload = true;
    filemanagerRef.value.ej2Instances.uploadSettings.directoryUpload = true;
    setTimeout(function () {
      filemanagerRef.value.uploadFiles();
      filemanagerRef.value.ej2Instances.uploadSettings.directoryUpload = false;
    }, 100);
  }
};
const onMenuClick = (args) => {
  if (args.item.id === "file-manager_cm_uploadfolder") {
    uploadSettings.value.directoryUpload = true;
    filemanagerRef.value.ej2Instances.uploadSettings.directoryUpload = true;
    setTimeout(function () {
      filemanagerRef.value.uploadFiles();
      filemanagerRef.value.ej2Instances.uploadSettings.directoryUpload = false;
    }, 100);
  }
};

setCulture("zh");

L10n.load({
  zh: {
    filemanager: filemanager_cn,
  },
});
</script>

<style>
@import "@syncfusion/ej2-icons/styles/material.css";
.e-image-wrap {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.e-image-wrap .e-image {
  /* margin: 0 auto; */
  width: auto !important;
}
.e-dlg-header-content {
  padding: 8px 12px !important;
  margin-bottom: 22px;
}
</style>
