<template>
  <q-card bordered class="fit column no-wrap">
    <q-bar dark class="transparent border-bottom" style="height: 2.3rem">
      <span class="font-medium">项目设置</span>
      <q-space />
      <q-btn dense flat round icon="close" v-close-popup />
    </q-bar>
    <div class="q-space row no-wrap">
      <q-list class="border-right q-pa-sm" style="min-width: 9rem">
        <q-item
          v-for="i in setting_items"
          :key="i.val"
          clickable
          v-ripple
          dense
          class="radius-xs"
          active-class="bg-primary text-grey-1"
          :active="settingforRef === i.val"
          @click="settingforRef = i.val"
        >
          <q-item-section side>
            <q-icon :name="i.icon" />
          </q-item-section>
          <q-item-section class="text-no-wrap q-pr-md">{{
            i.label
          }}</q-item-section>
        </q-item>
      </q-list>
      <div class="q-space q-pa-sm">
        <OverView v-if="settingforRef === 'basic'" />
        <EnableSetting v-if="settingforRef === 'enable'" />
        <PreferencesSetting v-if="settingforRef === 'preferences'" />
        <roleSettings v-if="settingforRef === 'role'" />
        <MemberManager v-if="settingforRef === 'members'" />
        <MoreOptions
          v-if="settingforRef === 'more'"
          @projectDeleted="projectDeleted"
        />
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
import { ref, toRef } from "vue";
import roleSettings from "src/pages/Project/components/settings/roleSettings.vue";
import MemberManager from "src/pages/Project/components/settings/MemberManager.vue";
import MoreOptions from "src/pages/Project/components/settings/MoreOptions.vue";
import PreferencesSetting from "src/pages/Project/components/settings/PreferencesSetting.vue";
import EnableSetting from "src/pages/Project/components/settings/EnableSetting.vue";
import OverView from "./OverView.vue";

const props = defineProps({
  settingfor: {
    type: String,
    default: "basic",
  },
});
const settingforRef = ref(toRef(props, "settingfor").value);

const setting_items = ref([
  { val: "basic", label: "基本信息", icon: "toggle_on" },
  { val: "enable", label: "功能设置", icon: "toggle_on" },
  { val: "preferences", label: "偏好设置", icon: "tune" },
  { val: "role", label: "权限", icon: "add_moderator" },
  { val: "members", label: "成员", icon: "manage_accounts" },
  { val: "more", label: "更多", icon: "more_horiz" },
]);

const emit = defineEmits(["projectDeleted"]);
const loading = ref(false);
const projectDeleted = () => {
  emit("projectDeleted");
};
</script>

<style lang="scss" scoped></style>
