<template>
  <router-view :class="`${uiStore?.draging ? 'unselected' : ''}`" />
  <div v-if="!$q.platform.is.mac && !isWin11 && $q.platform.is.electron && !isMaximized"
    class="absolute-full z-max border app_edge pointer-cross"
  />
  <transition>
    <div v-if="!uiStore.pageLoaded"
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
      style="bottom: 1rem; right: 1rem; min-width: 28rem"
    >
      <q-toolbar class="border-bottom">
        <q-tabs
          v-if="$q.platform.is.electron"
          v-model="fileTab"
          dense
          no-caps
        >
          <q-tab v-for="i in fileTabs" :key="i.name" :name="i.name" :label="$t(i.label)" />
        </q-tabs>
        <span v-else>{{ $t('upload_file') }}</span>
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
              <q-item v-for="i in upload_query" :key="i.id" class="radius-xs overflow-hidden border q-mb-xs">
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
                <q-item-section class="z-fab">{{ i.name }}</q-item-section>
                <q-item-section side class="z-fab">
                  {{ `${upload_process?.find((j) => j.id === i.id)?.percent * 100}%` }}
                </q-item-section>
                <div
                  class="absolute-left bg-primary full-height op-3"
                  :style="`left: 0;width: ${
                    upload_process?.find((j) => j.id === i.id)?.percent * 100
                  }%;`"
                />
              </q-item>
            </template>
            <template v-if="$q.platform.is.electron && fileTab === 'download'">
                <q-item v-for="i in downloadFiles" :key="i.id" class="radius-xs overflow-hidden border q-mb-xs">
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
                  <q-item-section class="z-fab">{{ i.name }}</q-item-section>
                  <q-item-section side class="z-fab">{{ `${i.percent}%` }}</q-item-section>
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
import {ref, provide, computed, watchEffect, onMounted, onBeforeUnmount} from 'vue';
import AppLoading from "./components/VIewComponents/AppLoading.vue";
import {useMeta, useQuasar} from "quasar";
import { useI18n } from 'vue-i18n'
import { $serverStatus } from 'src/boot/service.js';
import useOss from "./stores/oss.js";
import useUIStore from "./stores/ui.js";
import { onKeyStroke } from "@vueuse/core"


const { t } = useI18n()

const $q = useQuasar();
const uiStore = useUIStore();
const ossStore = useOss();

const fetching = ref(false);
const detectFetching = ref(false);
const isFetching = () => {
  detectFetching.value = true
  setTimeout(() => {
    if($serverStatus().axiosStauts === 'pending'){
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

const base_url = import.meta.env.VITE_OSS_URL;
const defaultCover = base_url + "images/article.jpg";
provide("defaultCover", defaultCover);
const defaultAvatar = base_url + "images/panda.jpg";
provide("defaultAvatar", defaultAvatar);

const lang = ref("zh-CN");
provide("lang", lang);
provide("bingWallpaper", null);
let navigationBase = [
  { name: t('channel_nav_posts'), val: "posts", icon: "", activeClass: "", enable: true },
  { name: t('channel_nav_articles'), val: "articles", icon: "", activeClass: "", enable: true },
  { name: t('channel_nav_videos'), val: "videos", icon: "", activeClass: "", enable: true },
  { name: t('channel_nav_audios'), val: "audios", icon: "", activeClass: "", enable: true },
  { name: t('channel_nav_sales'), val: "sales", icon: "", activeClass: "", enable: false },
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

const fileTab = ref('upload');
const fileTabs = [
  { name: 'upload', icon: '', label: t('upload')},
  { name: 'download', icon: '', label: t('download')}
]
const downloadFiles = ref([]);
const isWin11 = ref(false);

// 使用onKeyStroke设置快捷键
if ($q.platform.is.electron) {
  // 处理放大快捷键 (Ctrl/Cmd + =)
  onKeyStroke(['=', '+'], (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault()
      window.zoomAPI.triggerLocalShortcut('CommandOrControl+=')
      console.log('触发放大快捷键')
    }
  })

  // 处理缩小快捷键 (Ctrl/Cmd + -)
  onKeyStroke('-', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault()
      window.zoomAPI.triggerLocalShortcut('CommandOrControl+-')
      console.log('触发缩小快捷键')
    }
  })

  // 处理重置快捷键 (Ctrl/Cmd + 0)
  onKeyStroke('0', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault()
      window.zoomAPI.triggerLocalShortcut('CommandOrControl+0')
      console.log('触发重置快捷键')
    }
  })
}
const isMaximized = ref(false);

// 在组件挂载后设置快捷键监听
onMounted(async() => {
  if($q.platform.is.electron){
    // 初始化时获取状态
    isMaximized.value = window.windowAPI.isMaximized();
    
    // 添加窗口状态变化监听
    window.windowAPI.onWindowStateChange((state) => {
      isMaximized.value = state === 'maximized';
    });
    
    // 监听下载进度事件
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
    
    isWin11.value = await window.osAPI.isWin11();
    
    // 监听本地快捷键设置请求
    window.zoomAPI.onSetupLocalShortcuts((shortcuts) => {
      console.log('主进程请求设置本地快捷键:', shortcuts);
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
            message: t('app_update_tip'),
            actions: [
              {
                label: t('refresh_page'),
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
<style lang="sass">
@keyframes autofill
  100%
    background-color: transparent

.q-input,
.q-select
  .q-field__native
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active
      -webkit-background-clip: text
      animation: autofill 0s forwards

  &.q-field--dark .q-field__native
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active
      -webkit-text-fill-color: transparent

</style>