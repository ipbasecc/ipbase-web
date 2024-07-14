<template>
<!--   <div class="absolute z-max">serverInfo： {{ uiStore.serverInfo }}</div>-->
  <router-view
    :class="`
      ${$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'}
      ${uiStore?.draging ? 'unselected' : ''}
    `"
  />
  <transition>
    <div
      v-if="!uiStore.pageLoaded"
      class="absolute-full column flex-center z-unfab q-electron-drag"
    >
      <div class="absolute-full bg-black op-5" style="z-index: -2"></div>
      <AppLoading />
    </div>
  </transition>
  <q-slide-transition>
    <q-card
      v-if="ossStore.showList"
      class="absolute column no-wrap z-max"
      bordered
      style="bottom: 1rem; right: 1rem; min-width: 360px"
    >
      <q-toolbar class="border-bottom">
        <q-tabs
          v-if="$q.platform.is.electron"
          v-model="fileTab"
          dense
        >
          <q-tab v-for="i in fileTabs" :key="i.name" :name="i.name" :label="i.label" />
        </q-tabs>
        <span v-else>文件上传</span>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="filter_list_off"
          @click="removeComplate()"
        />
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="ossStore.showList = false"
        />
      </q-toolbar>
      <q-card-section class="q-pa-sm">
        <q-scroll-area style="height: 33vh">
          <q-list>
            <template v-if="($q.platform.is.electron && fileTab === 'upload') || !$q.platform.is.electron">
              <q-item v-for="i in upload_query" :key="i.id" class="border-bottom">
              <q-item-section class="z-fab">{{ i.name }}</q-item-section>
              <q-item-section side class="z-fab">
                <q-spinner-ios
                  v-if="upload_process?.find((j) => j.id === i.id)?.percent < 1"
                  color="primary"
                  size="2em"
                />
                <q-icon
                  v-else
                  color="green"
                  name="mdi-checkbox-marked-circle"
                />
              </q-item-section>
              <div
                class="absolute-left bg-primary full-height op-3"
                :style="`left: 0;width: ${
                  upload_process?.find((j) => j.id === i.id)?.percent * 100
                }%;`"
              ></div>
            </q-item>
            </template>
            <template v-if="$q.platform.is.electron && fileTab === 'download'">
                <q-item v-for="i in downloadFiles" :key="i.id" class="border-bottom">
                  <q-item-section class="z-fab">{{ i.name }}</q-item-section>
                  <q-item-section side class="z-fab">
                    <q-spinner-ios
                      v-if="i.percent < 100"
                      color="primary"
                      size="2em"
                    />
                    <q-icon
                      v-else
                      color="green"
                      name="mdi-checkbox-marked-circle"
                    />
                  </q-item-section>
                  <div
                    class="absolute-left bg-primary full-height op-3"
                    :style="`left: 0;width: ${i.percent}%;`"
                  ></div>
                </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-slide-transition>
</template>

<script setup>
import {ref, provide, computed, watch, watchEffect, onMounted} from 'vue';
import AppLoading from "./components/VIewComponents/AppLoading.vue";
import {useMeta, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import useOss from "src/stores/oss.js";
import useUIStore from "src/stores/ui.js";
import useUserStore from "src/stores/user.js";

const router = useRouter()
const $q = useQuasar();
const uiStore = useUIStore();
const ossStore = useOss();
const userStore = useUserStore();

const fetching = ref(false);
const detectFetching = ref(false);
const isFetching = () => {
  detectFetching.value = true
  setTimeout(() => {
    if(uiStore.axiosStauts === 'pending'){
      fetching.value = true
      detectFetching.value = false
    }
  }, 3000);
};
watchEffect(() => {
  if(fetching.value === false && !detectFetching.value){
    isFetching();
  }
})


const imageType = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tif",
  ".tiff",
  ".svg",
  ".gif",
  ".webp",
  "jpg",
  "jpeg",
  "png",
  "tif",
  "tiff",
  "svg",
  "gif",
  "webp",
];
const videoType = [
  ".mp4",
  ".mov",
  ".avi",
  ".flv",
  ".m3u8",
  "webm",
  ".m4v",
  ".mpg",
  ".mpeg",
];
const audioType = [".mp3", ".wav", ".flac", ".aac", ".ogg"];
const officeType = [
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".pdf",
];
const attachmentType = [".zip", ".rar", ".7z", ".tar", ".gz", ".lz4", ".pdf"];
provide("imageType", imageType);
provide("videoType", videoType);
provide("audioType", audioType);
provide("officeType", officeType);
provide("attachmentType", attachmentType);

const base_url = process.env.OSS_URL;
const defaultCover = base_url + "images/article.jpg";
provide("defaultCover", defaultCover);
const defaultAvatar = base_url + "images/panda.jpg";
provide("defaultAvatar", defaultAvatar);

const lang = ref("zh-CN");
provide("lang", lang);
provide("bingWallpaper", null);
let navigationBase = [
  { name: "动态", val: "posts", icon: "", activeClass: "", enable: true },
  { name: "文章", val: "articles", icon: "", activeClass: "", enable: true },
  { name: "视频", val: "videos", icon: "", activeClass: "", enable: true },
  { name: "音频", val: "audios", icon: "", activeClass: "", enable: true },
  { name: "聊天", val: "chat", icon: "", activeClass: "", enable: false },
  { name: "橱窗", val: "sales", icon: "", activeClass: "", enable: false },
];
provide("navigationBase", navigationBase);
const upload_process = computed(() => ossStore.process);
const upload_query = computed(() => ossStore.uploadQueue);
const removeComplate = () => {
  if(fileTab.value === 'upload'){
    ossStore.uploadQueue = ossStore.uploadQueue.filter((i) => i.percent !== 1);
  }
  if(fileTab.value === 'download'){
    downloadFiles.value = downloadFiles.value.filter((i) => i.percent !== 100);
  }
};
useMeta(() => {
  return {
    title: uiStore?.pageTitle
  }
})
const axiosStatusCode = computed(() => uiStore.axiosStautsCode);
watch(axiosStatusCode, () => {
  // console.log('axiosStatusCode', axiosStatusCode)
  if(axiosStatusCode.value === 401){
    // userStore.logged = false;
    router.push('/login')
  }
},{ immediate: true })

const fileTab = ref('upload');
const fileTabs = [
  { name: 'upload', icon: '', label: '上传'},
  { name: 'download', icon: '', label: '下载'}
]
const downloadFiles = ref([]);
// 在组件挂载后订阅下载进度事件
onMounted(() => {
  if($q.platform.is.electron){
    window.windowAPI.downloadMessage('download-progress', (fileInfo) => {
      ossStore.showList = true;
      fileTab.value = 'download';
      if(downloadFiles.value.map(i => i.path).includes(fileInfo.path)){
        downloadFiles.value = downloadFiles.value.map(i => ({
          ...i,
          percent: i.path === fileInfo.path ? fileInfo.percent : i.percent
        }));
      } else {
        downloadFiles.value.push(fileInfo);
      }
    });
    window.windowAPI.downloadMessage('download-completed', (fileInfo) => {
      downloadFiles.value = downloadFiles.value.map(i => ({
        ...i,
        percent: i.path === fileInfo.path ? 100 : i.percent
      }));
    });
  }
});

const stopDownload = (i) => {
  const _res = JSON.parse(JSON.stringify(i))
  window.windowAPI.stopDownload(_res);
}

// Service Worker 更新检测和通知逻辑
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // 强制Service Worker检查更新
        registration.update();
        // 监听 Service Worker 更新
        let refreshing;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          // 显示 Quasar 通知
          $q.notify({
            message: "应用有新更新可用，请保存您的工作并刷新页面。",
            actions: [
              {
                label: "刷新页面",
                color: "white",
                handler: () => {
                  window.location.reload();
                },
              },
            ],
          });
        });
      })
      .catch((error) => {
        console.log("Service Worker registration failed: ", error);
      });
  });
}
</script>
