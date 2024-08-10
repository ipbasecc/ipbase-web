<template>
  <q-uploader
    flat
    :bordered
    :multiple="maxFiles !== 1"
    :accept="accept"
    :max-total-size="MaxTotalSize"
    :max-files="maxFiles"
    :label="label"
    @added="addFiles"
    :readonly="readonlyRef"
    color="transparent"
    :class="classRef"
    class="overflow-hidden"
  >
    <template v-slot:header="scope">
      <div class="column">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn
            v-if="scope.queuedFiles.length > 0"
            icon="clear_all"
            @click="scope.removeQueuedFiles"
            round
            dense
            flat
          >
            <q-tooltip>{{ $t('clean_all') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="scope.uploadedFiles.length > 0"
            icon="done_all"
            @click="scope.removeUploadedFiles"
            round
            dense
            flat
          >
            <q-tooltip>{{ $t('clean_all_complate') }}</q-tooltip>
          </q-btn>
          <div class="column no-wrap q-space">
            <span class="font-large font-bold-600">{{ label }}</span>
            <span class="font-small op-7 text-limit" style="max-width: 40ch">
              {{ $t('upload_tip_rBtn') }}
              <q-tooltip> {{ $t('support') }}：{{ acceptRef }} </q-tooltip>
            </span>
          </div>
          <q-btn
            v-if="scope.canAddFiles"
            type="a"
            icon="add_box"
            @click="scope.pickFiles"
            round
            dense
            flat
          >
            <q-uploader-add-trigger />
            <q-tooltip>{{ $t('pick_file') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="scope.canUpload && !autoUploadRef"
            icon="cloud_upload"
            :color="uploadState === 'watting' ? 'red' : ''"
            @click="confirmUpload(files)"
            round
            dense
            :flat="uploadState === ''"
          >
            <q-tooltip>{{ $('upload_file') }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>
    <template v-if="completed" v-slot:list="scope">
      <q-list separator>
        <q-item>
          <q-item-label class="full-width ellipsis"> {{ $t('upload_complated') }} </q-item-label>
        </q-item>
        <q-item v-for="file in scope.files" :key="file.__key">
          <q-item-label class="full-width ellipsis">
            {{ file.name }}
          </q-item-label>
        </q-item>
      </q-list>
    </template>
  </q-uploader>
</template>
<script setup>
import { OSS } from "boot/oss";
import { inject, ref, toRef, watch } from "vue";
import localforage from "localforage";

import Bottleneck from "bottleneck";
import { userStore, ossStore } from "src/hooks/global/useStore.js";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const uploadQueue = new Bottleneck({ maxConcurrent: 5 });

const me = ref();
const getMe = async () => {
  let res = await localforage.getItem("init");
  if (res) {
    me.value = res;
  } else {
    me.value = userStore?.me;
  }
};
getMe();
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  accept: {
    type: String,
    default: ".jpg,.png,.mp4,.mov,.m4v,.jpeg,.png,.webp,.svg,.avi",
  },
  MaxTotalSize: {
    type: Number,
    default: 20480000000,
  },
  maxFiles: {
    type: Number,
    default: 10,
  },
  remoteFloder: {
    type: String,
    default: "test/",
  },
  needUpload: {
    type: Boolean,
    default: false,
  },
  autoUpload: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: "",
  },
  bordered: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["filesOfUploaded", "wattingFiles", "fileWatting"]);

const remoteFloderRef = toRef(props, "remoteFloder");
const autoUploadRef = toRef(props, "autoUpload");
const acceptRef = toRef(props, "accept");
const readonlyRef = toRef(props, "readonly");
const classRef = toRef(props, "class");
const needUploadRef = toRef(props, "needUpload");
const maxFilesRef = toRef(props, "maxFiles");
const imageType = inject("imageType");
const videoType = inject("videoType");
const officeType = inject("officeType");
const attachmentType = inject("attachmentType");

const completed = ref(false);

const acceptFileType = ref(acceptRef.value);
watch(acceptRef, () => {
  if (acceptRef.value && acceptRef.value === "all") {
    const result = imageType.value
      .concat(videoType.value)
      .concat(officeType.value)
      .concat(attachmentType.value);
    const obj = {};
    result.forEach((item) => {
      obj[item] = item;
    });
    acceptFileType.value = JSON.stringify(obj);
  }
});
const files = ref();
const uploadState = ref();

const addFiles = async (val) => {
  if (autoUploadRef.value) {
    await confirmUpload(val);
  } else {
    files.value = val;
    uploadState.value = "watting";
    emit("fileWatting", uploadState.value);
  }
};
const uploadFile = async (file, username, id) => {
  if (file instanceof File) {
    // 浏览器 获取文件大小，并转化为m单位，四舍五入到整数
    let fileSize = Math.round(file.size / 1024 / 1024);
    let res = await OSS.uploadFile(remoteFloderRef.value + file.name, file);
    if (res) {
      let resFile = {
        url: res,
        name: file.name,
        size: fileSize,
        caption: `${username} ${t('by_time')} ${new Date().toISOString()} ${t('upload')}`,
        hash: id + "-" + file.name,
        mime: file.type,
        provider: "yihu",
        folderPath: "/",
        ext: "." + file.name.slice(file.name.lastIndexOf(".") + 1),
      };
      console.log("file", resFile);
      return resFile;
    }
  }
};
const confirmUpload = async (files) => {
  ossStore.showList = true;
  try {
    let filesArray = Array.from(files);
    let complateFiles = [];
    await Promise.all(
      filesArray.map(async (file, index) => {
        console.log("file", file);
        const now = Date.now();
        const id = `${index}_${now}`;
        let __ = {
          name: file.name,
          type: file.type,
          size: file.size,
          complate: false,
          id: id,
          percent: 0,
        };
        ossStore.uploadQueue.push(__);
        console.log("uploadQueue", ossStore.uploadQueue);
        try {
          await uploadQueue.schedule(async () => {
            // 执行上传逻辑，例如使用 axios 或其他上传库
            let upload = await uploadFile(file, me.value.username, id);
            if (upload) {
              console.log("upload", upload);
              if (ossStore.uploadQueue?.map((i) => i.id).includes(id)) {
                ossStore.uploadQueue.find((i) => i.id === id).complate = true;
                ossStore.uploadQueue.find((i) => i.id === id).percent =
                  ossStore.process?.find((i) => i.id === id)?.percent;
              }
              let upload_pool = {
                process: ossStore.process,
                uploadQueue: ossStore.uploadQueue,
              };
              let ___ = JSON.parse(JSON.stringify(upload_pool));
              await localforage.setItem("upload_pool", ___);
              complateFiles.push(upload);
            }
          });
        } catch (error) {
          console.error(`${t('upload_error')}：${file.name}`, error);
        }
      })
    );
    emit("fileWatting", null);
    emit("filesOfUploaded", complateFiles);
    console.log("complateFiles", complateFiles);
    return complateFiles;
  } catch (e) {
    // 处理或抛出错误
    console.log(t('get_file_error') + e);
    throw e;
  }
};
watch(
  needUploadRef,
  () => {
    if (needUploadRef.value) {
      confirmUpload(files.value);
    }
  },
  { deep: true }
);
defineExpose({ confirmUpload });
</script>
