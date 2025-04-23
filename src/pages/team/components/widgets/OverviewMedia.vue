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
        {{ $t('no_media') }}
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
          @click="$hevueImgPreview(showImage(activeVersion?.media?.url))"
        />
      </template>
      <q-responsive v-if="quality[0]?.url && filetype(quality[0].url) === 'video'"
        class="fit"
        :ratio="16 / 9">
        <Artplayer :option="{
            url: quality[0].url || activeVersion?.media.url,
            quality: quality,
            ...player_options
          }"
          class="fit"
        />
      </q-responsive>
      <q-responsive v-else-if="activeVersion?.media?.url && filetype(activeVersion.media.url) === 'video'"
        class="fit"
        :ratio="16 / 9">
        <Artplayer :option="{
            url: activeVersion?.media.url,
            ...player_options
          }"
          class="fit"
        />
      </q-responsive>
      <q-toolbar
        v-if="auth && teamStore.navigation !== 'classroom'"
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
          <template v-if="!isClassroom || isCreator">
            <q-card-section>
              <DrapUpload :isOSS="true" class="full-width radius-sm border-xs border-dashed border-primary q-py-md"
              :allowedFormats="allowedFormats"
              @uploaded="fileUploaded" :caption="$t('drop_or_pick_cover')" />
            </q-card-section>
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
          </template>
          <q-card-section v-else>
            <span>{{ $t('no_media') }}</span>
          </q-card-section>
        </q-card>
      </div>
    </q-responsive>
  </div>
</template>

<script setup>
import { ref, toRefs, computed } from "vue";
import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";
import filetype from "src/hooks/global/filetype.js";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';
import useOverview from 'src/pages/team/hooks/useOverview.js'
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'

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
    default: void 0,
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
const { activeVersion, isClassroom, auth } = toRefs(props);
const { quality } = useOverview(activeVersion.value);
const isShared = computed(() => uiStore.isShared)
const upload_label = computed(() =>
  teamStore.card?.type === "classroom" ? $t('classroom_file') : $t('preview_file')
);
const player_options = {
  muted: false,
  autoplay: false,
  loop: false,
  mutex: true,
  fullscreen: true,
  fullscreenWeb: !uiStore.activeReel,
}

const isCreator = computed(() => teamStore.card?.creator?.id === teamStore.init?.id)
const allowedFormats = computed(() => teamStore.card?.type === 'classroom' ? $ui().allowedFormatsVideo : [...$ui().allowedFormatsVideo, ...$ui().allowedFormatsImage])

const media_change_ing = ref(false);
const fileUploaded = (file) => {
  console.log("接收到文件", file);
  updateVersionFn(file.id, file);
  media_change_ing.value = false;
};

const emit = defineEmits(["mediaChanged"]);
const updateVersionFn = async (media_id, media) => {
  emit("mediaChanged", activeVersion.value, media_id, media);
};


const showImage = (url) => {
  return {
    url: url,
    clickMaskCLose: true,
  };
};
</script>
