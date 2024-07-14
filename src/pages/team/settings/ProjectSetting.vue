<template>
  <q-card
    bordered
    class="column no-wrap"
    :class="`
      ${$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'}
      ${$q.screen.gt.xs ? 'fit' : ''}
    `"
    :style="!$q.screen.gt.xs ? 'height: 100vh' : ''"
  >
    <q-bar
      dark
      class="transparent border-bottom"
      style="height: 2.3rem"
    >
      <span class="font-medium">项目设置</span>
      <q-space />
      <q-btn dense flat round icon="close" v-close-popup />
    </q-bar>
    <div class="q-space row no-wrap overflow-hidden">
      <q-list
        class="border-right q-pa-sm"
        style="min-width: 9rem"
        :class="
          $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
        "
      >
        <q-item
          v-for="i in setting_items"
          :key="i.val"
          clickable
          v-ripple
          dense
          class="radius-xs q-mt-xs"
          :class="
            settingforRef === i.val
              ? 'bg-primary-gdt text-white'
              : $q.dark.mode
              ? 'bg-grey-10 text-grey-1'
              : 'bg-grey-1 text-grey-10'
          "
          @click="settingforRef = i.val"
        >
          <q-item-section side>
            <q-icon
              :color="settingforRef === i.val ? 'white' : ''"
              :name="i.icon"
            />
          </q-item-section>
          <q-item-section class="text-no-wrap q-pr-md">{{
            i.label
          }}</q-item-section>
        </q-item>
      </q-list>
      <div class="column q-space q-pa-sm scroll-y">
        <OverView v-if="settingforRef === 'basic'" wasAttached_to="project" />
        <EnableSetting v-if="settingforRef === 'enable'" />
        <PreferencesSetting v-if="settingforRef === 'preferences'" />
        <roleSettings v-if="settingforRef === 'role'" />
        <MemberManager v-if="settingforRef === 'members'" :byInfo />
        <MoreOptions v-if="settingforRef === 'more'" />
      </div>
    </div>
    <div
      v-if="loading"
      class="absolute-full blur-sm column flex-center z-max bg-black"
    >
      <span>请稍候...</span>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed } from "vue";
import roleSettings from "./roleSettings.vue";
import MemberManager from "./MemberManager.vue";
import MoreOptions from "./MoreOptions.vue";
import PreferencesSetting from "./PreferencesSetting.vue";
import EnableSetting from "./EnableSetting.vue";
import OverView from "src/pages/team/components/OverView.vue";
import { teamStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  settingfor: {
    type: String,
    default: "basic",
  },
});
const settingforRef = ref("basic");

const byInfo = ref({
  by: "project",
  project_id: computed(() => teamStore.project?.id),
});

const setting_items = ref([
  { val: "basic", label: "基本信息", icon: "mdi-information-outline" },
  { val: "enable", label: "功能设置", icon: "toggle_on" },
  { val: "preferences", label: "偏好设置", icon: "tune" },
  { val: "role", label: "权限", icon: "add_moderator" },
  { val: "members", label: "成员", icon: "manage_accounts" },
  { val: "more", label: "更多", icon: "more_horiz" },
]);
const loading = ref(false);
</script>

<style lang="scss" scoped></style>
