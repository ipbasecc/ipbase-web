<template>
  <div v-if="current_versionRef?.media" class="relative-position hovered-item">
    <q-responsive :ratio="16 / 9" class="full-width">
      <template
        v-if="
          current_versionRef.media.url &&
          filetype(current_versionRef?.media.url) === 'image'
        "
      >
        <q-img
          :src="current_versionRef.media.url"
          :ratio="16 / 9"
          spinner-color="primary"
          spinner-size="82px"
          class="cursor-pointer"
          @click="$hevueImgPreview(current_versionRef?.media?.url)"
        />
      </template>
      <template
        v-if="
          current_versionRef.media.url &&
          filetype(current_versionRef?.media.url) === 'video'
        "
      >
        <video
          v-if="$q.platform.is.mobile"
          controls
          :src="current_versionRef.media.url"
        />
        <Artplayer
          v-else
          :option="{
            url: current_versionRef.media.url,
            muted: false,
            autoplay: false,
            loop: false,
            mutex: true,
            fullscreen: true,
            fullscreenWeb: true,
          }"
          class="fit"
        />
      </template>
    </q-responsive>
    <q-toolbar
      v-if="calc_auth('overview', 'media', authBase.of)"
      class="absolute-top transparent"
    >
      <q-space />
      <q-btn flat round dense icon="more_vert">
        <q-menu class="radius-sm shadow-6">
          <q-list bordered dense>
            <q-item clickable v-close-popup @click="media_change_ing = true">
              <q-item-section side><q-icon name="upload" /></q-item-section>
              <q-item-section>修改概览图</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="updateVersionFn(null)">
              <q-item-section side><q-icon name="remove" /></q-item-section>
              <q-item-section>移除概览图</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-toolbar>
  </div>
  <q-responsive
    v-if="!current_versionRef?.media || media_change_ing"
    :ratio="16 / 9"
    class="full-width transition"
    :class="media_change_ing ? 'absolute blur-xs' : 'relative-position'"
  >
    <div class="absolute-full flex flex-center q-px-xl border-bottom">
      <q-card bordered flat class="full-width">
        <StrapiUpload
          label="预览文件"
          :max-files="1"
          :readonly="!calc_auth('overview', 'media', authBase.of)"
          class="full-width"
          @uploaded="fileUploaded"
        ></StrapiUpload>
        <q-card-section class="row no-wrap q-pa-xs border-top">
          <q-btn
            flat
            dense
            padding="xs md"
            label="取消"
            @click="media_change_ing = false"
          />
          <q-space />
        </q-card-section>
      </q-card>
    </div>
  </q-responsive>
</template>

<script setup>
import { ref, toRef, inject } from "vue";
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";
import filetype from "src/hooks/global/filetype.js";

const props = defineProps({
  current_version: {
    type: Object,
    default() {
      return {};
    },
  },
  wasAttached_to: {
    type: String,
    default: "project",
  },
});
const current_versionRef = toRef(props, "current_version");
const authBase = inject("authBase");

const media_change_ing = ref(false);
const fileUploaded = (files) => {
  console.log("接收到文件", files);
  let file = files[0];
  updateVersionFn(file.id, file);
  media_change_ing.value = false;
};

const emit = defineEmits(["mediaChanged"]);
const updateVersionFn = async (media_id, media) => {
  emit("mediaChanged", media_id, media);
};
</script>
