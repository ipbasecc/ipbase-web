<template>
  <div class="row no-wrap gap-sm">
    <q-list
      dense
      class="column no-wrap q-pr-md border-right"
      style="min-width: 8rem"
    >
      <q-item
        v-for="i in sections"
        :key="i.val"
        clickable
        v-ripple
        :active="i.val === section"
        active-class="bg-primary text-white"
        class="radius-xs q-mb-xs"
        @click="setSection(i.val)"
      >
        <q-item-section>{{ i.label }}</q-item-section>
      </q-item>
      <div class="q-space" @click="setSection(void 0)" />
    </q-list>
    <q-scroll-area class="q-space tiptap q-pa-md">
      <div v-if="!showVideo" v-html="MDRender(section)" />
      <IntroductionVideo v-else />
    </q-scroll-area>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import whyUSCN from "src/manual/zh-CN/whyUS.md?raw";
import overviewCN from "src/manual/zh-CN/overview.md?raw";
import teamCN from "src/manual/zh-CN/team.md?raw";
import projectCN from "src/manual/zh-CN/project.md?raw";
import channelCN from "src/manual/zh-CN/channel.md?raw";
import navigation_threadsCN from "src/manual/zh-CN/navigation_threads.md?raw";
import navigation_QuadrantCN from "src/manual/zh-CN/navigation_Quadrant.md?raw";
import IntroductionVideo from "src/components/VIewComponents/IntroductionVideo.vue";

import whyUSEN from "src/manual/en-US/whyUS.md?raw";
import overviewEN from "src/manual/en-US/overview.md?raw";
import teamEN from "src/manual/en-US/team.md?raw";
import projectEN from "src/manual/en-US/project.md?raw";
import channelEN from "src/manual/en-US/channel.md?raw";
import navigation_threadsEN from "src/manual/en-US/navigation_threads.md?raw";
import navigation_QuadrantEN from "src/manual/en-US/navigation_Quadrant.md?raw";

import { useQuasar } from 'quasar';
const $q = useQuasar();

const { t } = useI18n();
const section = ref();
const sections = [
  // { label: t("video"), val: "video" },
  { label: t("overview"), val: "overview" },
  { label: t("team"), val: "team" },
  { label: t("navigation_threads"), val: "navigation_threads" },
  { label: t("navigation_Quadrant"), val: "navigation_Quadrant" },
  { label: t("channel"), val: "channel" },
  { label: t("project"), val: "project" },
];
const __lang = computed(() => $q.lang.getLocale());
const showVideo = ref(false);
const setSection = (val) => {
  if (val === "video") {
    showVideo.value = true;
  } else {
    showVideo.value = false;
  }
  section.value = val;
};
import markdownit from "markdown-it";
const md = markdownit();
const MDRender = (val) => {
  const lang = $q.lang.getLocale();
  if (t('App_Lang') === "zh-CN") {
    if (val === "overview") {
      return md.render(overviewCN);
    } else if (val === "team") {
      return md.render(teamCN);
    } else if (val === "navigation_threads") {
      return md.render(navigation_threadsCN);
    } else if (val === "navigation_Quadrant") {
      return md.render(navigation_QuadrantCN);
    } else if (val === "channel") {
      return md.render(channelCN);
    } else if (val === "project") {
      return md.render(projectCN);
    } else {
      return md.render(whyUSCN);
    }
  }
  if (t('App_Lang') === "en-US") {
    if (val === "overview") {
      return md.render(overviewEN);
    } else if (val === "team") {
      return md.render(teamEN);
    } else if (val === "navigation_threads") {
      return md.render(navigation_threadsEN);
    } else if (val === "navigation_Quadrant") {
      return md.render(navigation_QuadrantEN);
    } else if (val === "channel") {
      return md.render(channelEN);
    } else if (val === "project") {
      return md.render(projectEN);
    } else {
      return md.render(whyUSEN);
    }
  }
};
</script>
