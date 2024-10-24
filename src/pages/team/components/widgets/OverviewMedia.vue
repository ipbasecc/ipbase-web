<template>
  <div class="relative-position hovered-item"
    :class="`${isClassroom ? 'column flex-center q-space' : ''}`"
  >
    <q-responsive
      v-if="isShared && !activeVersion?.media"
      :ratio="16 / 9"
      class="q-mx-auto"
    >
      <div class="absolute-full flex flex-center q-pa-xl border-bottom">
        No Media
      </div>
    </q-responsive>
    <template v-if="activeVersion?.media">
      <template v-if="activeVersion.media.url &&
          filetype(activeVersion?.media.url, activeVersion?.media.ext) === 'image'
        "
      >
        <q-img
          :src="activeVersion.media.url"
          :ratio="16 / 9"
          spinner-color="primary"
          spinner-size="82px"
          class="cursor-pointer"
          @click="$hevueImgPreview(activeVersion?.media?.url)"
        />
      </template>
      <template v-if="quality?.length > 0 && filetype(activeVersion?.media.url) === 'video'">
        <Artplayer :option="{
            url: quality[0].url,
            quality: quality,
            muted: false,
            autoplay: false,
            loop: false,
            mutex: true,
            fullscreen: true,
            fullscreenWeb: !uiStore.activeReel,
          }"
          class="fit"
        />
      </template>
      <q-toolbar
        v-if="auth"
        class="absolute-top transparent z-fab"
      >
        <q-space v-if="!uiStore.activeReel" />
        <q-btn flat round dense icon="more_vert">
          <q-menu class="radius-sm">
            <q-list bordered dense class="radius-sm q-pa-xs">
              <q-item
                clickable
                v-close-popup
                class="radius-xs"
                @click="media_change_ing = true"
              >
                <q-item-section side><q-icon name="upload" /></q-item-section>
                <q-item-section class="text-no-wrap">{{ $t('change_overview_preview') }}</q-item-section>
              </q-item>
              <q-separator spaced />
              <q-item
                clickable
                v-close-popup
                class="radius-xs"
                @click="updateVersionFn(null)"
              >
                <q-item-section side><q-icon name="remove" /></q-item-section>
                <q-item-section class="text-no-wrap">{{ $t('remove_overview_preview') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </template>
    <q-responsive
      v-if="(!activeVersion?.media || media_change_ing) && !isShared"
      :ratio="16 / 9"
      class="transition"
      :class="
        media_change_ing
          ? 'absolute-full blur-xs'
          : 'full-width relative-position'
      "
    >
      <div class="absolute-full flex flex-center q-pa-xl">
        <q-card bordered flat style="min-width: 22rem">
          <StrapiUpload
            :label="upload_label"
            :max-files="1"
            :readonly="!auth"
            class="full-width"
            @uploaded="fileUploaded"
          ></StrapiUpload>
          <q-card-section class="row no-wrap q-pa-xs border-top">
            <q-btn
              flat
              dense
              padding="xs md"
              :label="$t('cancel')"
              @click="media_change_ing = false"
            />
            <q-space />
          </q-card-section>
        </q-card>
      </div>
    </q-responsive>
  </div>
</template>

<script setup>
import { ref, toRefs, computed } from "vue";
import StrapiUpload from "src/components/Utilits/StrapiUpload.vue";
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";
import filetype from "src/hooks/global/filetype.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';
import useOverview from 'src/pages/team/hooks/useOverview.js'

const $t = i18n.global.t;

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
  activeVersion: {
    type: Object,
    default: void 0,
  },
  isClassroom: {
    type: Boolean,
    default: false,
  },
  mediaWidth: {
    type: Number,
    default: NaN,
  },
  auth: {
    type: Boolean,
    default: false,
  },
  fitContainer: {
    type: Boolean,
    default: false,
  },
});
const { activeVersion } = toRefs(props);
const { quality } = useOverview(activeVersion.value);
const isShared = computed(() => uiStore.isShared)
const upload_label = computed(() =>
  teamStore.card?.type === "classroom" ? $t('classroom_file') : $t('preview_file')
);

const media_change_ing = ref(false);
const fileUploaded = (files) => {
  // console.log("接收到文件", files);
  let file = files[0];
  updateVersionFn(file.id, file);
  media_change_ing.value = false;
};

const emit = defineEmits(["mediaChanged"]);
const updateVersionFn = async (media_id, media) => {
  emit("mediaChanged", activeVersion.value, media_id, media);
};
</script>
