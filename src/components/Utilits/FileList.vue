<template>
  <q-list bordered class="radius-sm q-pa-xs column no-wrap gap-xs">
    <template v-for="(i, index) in _list" :key="i.id">
      <q-item
        clickable
        v-ripple
        class="radius-xs"
        @click="
          (extractExt(i.name) === 'image' &&
            $hevueImgPreview(showImages(index))) ||
            openPreview(i, index)
        "
      >
        <q-item-section side>
          <q-icon :name="clacTpeyIcon(i.name)" />
        </q-item-section>
        <q-item-section>{{ trimString(i.name, 16) }}</q-item-section>
        <q-item-section side>
          <div class="row no-wrap gap-xs items-center">
            <q-btn
              flat
              dense
              round
              icon="download"
              @click.stop="downloadFile(i)"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              @click.stop="removeFile(i.id)"
            />
          </div>
        </q-item-section>
      </q-item>
    </template>
    <q-dialog v-if="previewFile" v-model="preview" full-height full-width>
      <q-card
        bordered
        class="column no-wrap overflow-hidden"
        :class="$q.dark.mode ? 'bg-black' : 'bg-grey-1'"
      >
        <q-toolbar dark class="transparent">
          <q-btn
            dense
            flat
            icon="mdi-chevron-left"
            :disable="previewIndex === 0"
            @click="pre_preview()"
          />
          <q-btn
            dense
            flat
            icon="mdi-chevron-right"
            :disable="previewIndex === list?.length - 1"
            @click="next_preview()"
          />
          <q-space />
          <q-btn dense round flat icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="q-space column flex-center no-padding">
          <!-- 图片使用预览扩展 -->
          <q-responsive
            v-if="extractExt(previewFile.name) === 'video'"
            :ratio="16 / 9"
            class="full-width"
          >
            <!-- {{ previewFile }} -->
            <video
              v-if="$q.platform.is.mobile"
              controls
              :src="previewFile.url"
            />
            <Artplayer
              v-else
              :option="{
                url: previewFile.url,
                muted: false,
                autoplay: false,
                loop: false,
                mutex: true,
                fullscreen: true,
                fullscreenWeb: true,
              }"
              class="fit"
            />
          </q-responsive>
          <div
            v-if="extractExt(previewFile.name) === 'audio'"
            class="column no-wrap q-pa-sm"
          >
            <div class="relative-position radius-xs overflow-hidden border">
              <div v-if="previewFile.cover" class="absolute-full op-2" />
              <div class="column no-wrap q-pa-md blur-lg">
                <div class="row no-wrap">
                  <div class="font-large font-bold-600">{{ item.title }}</div>
                </div>
                <div class="font-small op-7">{{ publishedAt }}</div>
                <div class="font-small op-7 q-mb-md">
                  {{ item.description }}
                </div>
                <WaveSurfer :src="previewFile.url" :item="item" />
              </div>
            </div>
          </div>
          <q-responsive
            v-if="extractExt(previewFile.name) === 'pdf'"
            :ratio="4 / 3"
            class="column no-wrap q-pa-sm fit"
          >
            <PdfViewer :src="previewFile.url" />
          </q-responsive>
          <div
            v-if="extractExt(previewFile.name) === 'office'"
            class="column no-wrap q-pa-sm fit"
          >
            <OfficeView :src="previewFile.url" />
          </div>
          <div
            v-if="
              extractExt(previewFile.name) === 'others' ||
              !extractExt(previewFile.name)
            "
            class="column no-wrap q-pa-sm"
          >
            <q-btn
              flat
              icon="download"
              :label="$t('cant_preview_need_download')"
              @click.stop="downloadFile(previewFile)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-list>
</template>

<script setup>
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";
import FileSaver from "file-saver";
import WaveSurfer from "src/components/VIewComponents/WaveSurfer.vue";
import PdfViewer from "src/components/VIewComponents/ViewerContainer/PdfViewer.vue";
import OfficeView from "src/components/VIewComponents/OfficeView.vue";
import {ref, toRefs, onMounted} from "vue";

import { extractExt, clacTpeyIcon } from "src/hooks/utilits/useExtractExt.js";
import { trimString } from "src/hooks/utilits.js";

const props = defineProps({
  list: {
    type: Object,
    default() {
      return null;
    },
  },
});
const { list } = toRefs(props);

// 使用新数据来接收父组件数据，之后UI由此数据控制
// 数据变化emit给父组件，父组件在popup关闭后执行后端数据操作，否则会引发VUE组件卸载报错
const _list = ref();
onMounted(() => {
  _list.value = list.value
})

const preview = ref(false);
const previewIndex = ref();
const previewFile = ref();
// const poster = ref(); // Artplayer的预览图片，这里的视频预览使用OSS自动截取，速度有点慢，暂时禁用
const openPreview = (file, index) => {
  console.log("file", file);
  previewFile.value = file;
  previewIndex.value = index;
  // poster.value = `${file.url}?x-oss-process=video/snapshot,t_0,m_fast`;
  preview.value = true;
};

const next_preview = () => {
  if (previewIndex.value === list.value?.length - 1) return;
  previewIndex.value++;
  previewFile.value = list.value[previewIndex.value];
};
const pre_preview = () => {
  if (previewIndex.value === 0) return;
  previewIndex.value--;
  previewFile.value = list.value[previewIndex.value];
};

const showImages = (index) => {
  const _arr = _list.value
    .filter((i) => extractExt(i.name) === "image")
    .map((j) => j.url);
  return {
    multiple: true,
    nowImgIndex: index,
    imgList: _arr,
    clickMaskCLose: true,
  }
};
const downloadFile = (file) => {
  FileSaver.saveAs(file.url, file.name);
};
const emit = defineEmits(["removeFile"]);
const removeFile = (file_id) => {
  _list.value = _list.value.filter(i => i.id !== file_id);
  emit("removeFile", file_id);
};
</script>
