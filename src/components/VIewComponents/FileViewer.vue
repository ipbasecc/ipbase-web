<!-- eslint-disable vue/no-parsing-error -->
<template>
  <!-- 父页面可能有点击事件，必须保留div根节点 -->
  <div :class="fileType !== 'pdf' ? mainStyle : 'fit'" class="column flex flex-center">
    <template v-if="!noPreviewRef">
      <img
        v-if="fileType === 'image'"
        :src="fileRef.url"
        ref="imgRef"
        class="cursor-pointer"
        :class="imgClass"
        :style="imgStyle"
        :alt="fileRef"
        @click="$hevueImgPreview(showImage(fileRef.url))"
      />
      <q-responsive
        v-if="fileType === 'video'"
        :ratio="16 / 9"
        :class="height && !by_width ? '' : 'fit'"
        :style="
          !by_width
            ? `width: ${width}px;${height ? 'height: ' + height + 'px' : ''};`
            : ''
        "
      >
        <template v-if="fileRef">
          <Artplayer
            :option="{
              ...videoOption,
              url: fileRef.url,
            }"
            class="fit"
            :class="clean ? 'hideControls' : ''"
            @fullscreenWeb="fullscreenWeb"
          />
        </template>
        <div v-else class="fit flex flex-center">
          {{ noVideoRef }}
        </div>
      </q-responsive>
      <div v-if="fileType === 'audio'" class="column no-wrap q-pa-sm">
        <div class="relative-position radius-xs overflow-hidden border">
          <div
            v-if="itemRef.cover || poster"
            class="absolute-full op-2"
            :style="style"
          />
          <div class="column no-wrap q-pa-md blur-lg">
            <div class="row no-wrap">
              <div class="font-large font-bold-600">{{ item.title }}</div>
              <q-space />
              <q-btn v-if="canMotify" dense round flat icon="mdi-dots-vertical">
                <q-menu>
                  <q-list dense bordered style="min-width: 100px">
                    <q-item clickable v-close-popup @click="emit('motify')">
                      <q-item-section side
                        ><q-icon name="mdi-pencil" size="sm"
                      /></q-item-section>
                      <q-item-section>编辑</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div class="font-small op-7">{{ publishedAt }}</div>
            <div class="font-small op-7 q-mb-md">{{ item.description }}</div>
            <WaveSurfer :src="fileRef.url" :item="item" />
          </div>
        </div>
      </div>
      <div v-if="fileType === 'pdf'" class="fit">
        <PdfViewer :src="fileRef.url" />
      </div>
      <div v-if="fileType === 'office'" class="fit column no-wrap">
        <OfficeView :src="fileRef.url" />
      </div>
    </template>
    <div v-if="fileType === 'others' || noPreviewRef" class="q-py-sm q-px-sm">
      <q-list>
        <q-item-label v-if="!noPreviewRef"
          >文件不支持直接查看，请下载后查看：</q-item-label
        >
        <q-item
          class="radius-xs border q-mt-sm"
          clickable
          v-ripple
          @click="downloadFile(fileRef.url)"
        >
          <q-item-section side>
            <q-icon name="mdi-attachment" />
          </q-item-section>
          <q-item-section>{{ decodeURIComponent(filename) }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>
<script setup>
import { computed, inject, ref, toRef, toRefs, watch } from "vue";
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";
import FileSaver from "file-saver";
import WaveSurfer from "src/components/VIewComponents/WaveSurfer.vue";
import PdfViewer from "src/components/VIewComponents/ViewerContainer/PdfViewer.vue";
import OfficeView from "src/components/VIewComponents/OfficeView.vue";
import { date } from "quasar";
const props = defineProps({
  hasAttachInfo: {
    type: Boolean,
    default: false,
  },
  canMotify: {
    type: Boolean,
    default: false,
  },
  file: {
    type: Object,
    default() {
      return {};
    },
  },
  cover: {
    type: String,
    default: "",
  },
  item: {
    type: Object,
    default() {
      return {};
    },
  },
  noVideo: {
    type: String,
    default: "该作品没有上传视频",
  },
  noPreview: {
    type: Boolean,
    default: false,
  },
  videoOption: {
    type: Object,
    default() {
      return {
        muted: false,
        autoplay: false,
        loop: false,
        mutex: true,
        fullscreen: true,
        fullscreenWeb: true,
      };
    },
  },
  mainStyle: {
    type: String,
    default: "fit",
  },
  height: {
    type: Number,
    default: NaN,
  },
  clean: {
    type: Boolean,
    default: false,
  },
  by_width: {
    type: Boolean,
    default: false,
  },
  by: {
    type: String,
    default: "",
  },
});
const { height, by_width, by } = toRefs(props);

const width = computed(() => (height.value / 9) * 16);
const emit = defineEmits(["motify", "fullscreenWeb"]);
const fileRef = toRef(props, "file");
const coverRef = toRef(props, "cover");
const poster = ref(
  coverRef.value
    ? coverRef.value
    : `${fileRef.value}?x-oss-process=video/snapshot,t_100,m_fast,f_png,w_640`
);
const itemRef = toRef(props, "item");
const noVideoRef = toRef(props, "noVideo");
const noPreviewRef = toRef(props, "noPreview");
const publishedAt = ref();
const style = ref();
const imageType = inject("imageType");
const videoType = inject("videoType");
const audioType = inject("audioType");
const officeType = inject("officeType");
const officeRatio = ref(16 / 9);

const imgClass = computed(() => {
  let _class
  if(by.value === 'table') {
    _class = 'fit'
  } else {
    if(height.value && !by_width.value) {
      _class = ''
    } else if(by_width.value) {
      _class = 'full-width'
    } else if(!height.value) {
      _class = 'full-height'
    }
  }
  return _class
})
const imgStyle = computed(() => {
  let _style
  if(by.value === 'table') {
    _style = ''
  } else if(!by_width.value) {
    _style = `width: auto;${height.value ? 'height: ' + height.value + 'px' : ''};`
  }
  return _style
})

const ext = ref();
const fileType = ref();
const filename = ref();
const getFileinfo = (val) => {
  const urlObj = new URL(val);
  const str = urlObj.pathname.substring(urlObj.pathname.lastIndexOf("/") + 1);
  // 获取文件名
  filename.value = decodeURIComponent(str);
};
const downloadFile = (val) => {
  FileSaver.saveAs(val, filename.value);
};
const showImage = (url) => {
  return {
    url: url,
    clickMaskCLose: true,
  };
};
const fullscreenWeb = (state) => {
  emit("fullscreenWeb", state);
};
watch(
  [fileRef, itemRef],
  () => {
    if (fileRef.value) {
      // ext.value = fileRef.value.ext ? fileRef.value.ext : '.' + fileRef.value.url.slice(fileRef.value.url.lastIndexOf('.') + 1);
      ext.value = fileRef.value.ext;
      if (imageType.includes(ext.value)) {
        fileType.value = "image";
      } else if (videoType.includes(ext.value)) {
        fileType.value = "video";
      } else if (audioType.includes(ext.value)) {
        fileType.value = "audio";
      } else if (ext.value === ".pdf") {
        fileType.value = "pdf";
      } else if (officeType.includes(ext.value)) {
        fileType.value = "office";
        officeRatio.value =
          ext.value === "ppt" || ext.value === "ppt" ? 16 / 9 : 3 / 4;
      } else {
        fileType.value = "others";
      }
    }
    if (fileRef.value && fileRef.value.url) {
      getFileinfo(fileRef.value.url);
    }
    if (fileRef.value && fileRef.value.type === "audio") {
      loadWave();
    }
    if (itemRef.value) {
      style.value = itemRef.value.cover
        ? "background: url(" + itemRef.value.cover + ")"
        : "background: url(" + poster.value + ")";
      publishedAt.value = date.formatDate(
        itemRef.value.publishedAt,
        "MM/DD - HH:mm"
      );
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>
<style>
.hideControls .art-bottom,
.hideControls .art-progress {
  padding: 0 !important;
}
.hideControls .art-controls {
  display: none;
}
</style>
