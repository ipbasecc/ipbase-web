<template>
  <q-card bordered
    class="column no-wrap"
    :class="`
      ${$q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'}
      ${$q.screen.gt.xs ? 'fit' : ''}
    `"
    :style="!$q.screen.gt.xs ? 'height: 100vh' : ''"
  >
    <q-bar class="transparent border-bottom" style="height: 2.3rem">
      <span class="font-medium">{{ $t('project_settings') }}</span>
      <q-space />
      <q-btn dense flat round icon="close" v-close-popup />
    </q-bar>
    <div class="q-space row no-wrap overflow-hidden">
      <q-list class="border-right q-pa-sm" style="min-width: 9rem"
        :class="
          $q.dark.mode ? 'bg-grey-10 text-grey-1' : 'bg-grey-1 text-grey-10'
        "
      >
        <q-item v-for="i in setting_items" :key="i.val"
          clickable v-ripple dense
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
            $t(i.label)
          }}</q-item-section>
        </q-item>
      </q-list>
      <q-scroll-area class="q-space">
        <div class="column q-pa-sm">
          <OverView v-if="settingforRef === 'basic'"
            wasAttached_to="project"
            :members="teamStore.project?.project_members" :roles="teamStore.project?.member_roles"
          />
          <template v-if="settingforRef === 'enable'">
            <EnableSetting v-if="useAuths('preferences', ['project'])" />
            <span v-else class="fit flex flex-center absolute-full">{{ $t('no_premission_to_edit') }}</span>
          </template>

          <template v-if="settingforRef === 'serviceContent'">
            <ServiceContent v-if="teamStore.project?.type === 'service' && useAuths('price', ['project'])" />
            <span v-else class="fit flex flex-center absolute-full">{{ $t('no_premission_to_edit') }}</span>
          </template>

          <template v-if="settingforRef === 'preferences'">
            <PreferencesSetting v-if="useAuths('preferences', ['project'])" />
            <span v-else class="fit flex flex-center absolute-full">{{ $t('no_premission_to_edit') }}</span>
          </template>

          <template v-if="settingforRef === 'role'">
            <roleSettings v-if="useAuths('manageRole', ['project'])" :members :roles />
            <span v-else class="fit flex flex-center absolute-full">{{ $t('no_premission_to_edit') }}</span>
          </template>

          <template v-if="settingforRef === 'members'">
            <MemberManager v-if="useAuths('manageMember', ['project'])" :byInfo />
            <span v-else class="fit flex flex-center absolute-full">{{ $t('no_premission_to_edit') }}</span>
          </template>

          <template v-if="settingforRef === 'more'">
            <MoreOptions v-if="useAuths('delete', ['project'])" :members :roles />
            <span v-else class="fit flex flex-center absolute-full">{{ $t('no_premission_to_edit') }}</span>
          </template>
        </div>
      </q-scroll-area>
    </div>
    <div
      v-if="loading"
      class="absolute-full blur-sm column flex-center z-max bg-black"
    >
      <span>{{ $t('please_wait') }}</span>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import roleSettings from "./roleSettings.vue";
import MemberManager from "./MemberManager.vue";
import MoreOptions from "./MoreOptions.vue";
import PreferencesSetting from "./PreferencesSetting.vue";
import EnableSetting from "./EnableSetting.vue";
import OverView from "src/pages/team/components/OverView.vue";
import { teamStore } from "src/hooks/global/useStore.js";
import ServiceContent from './initialization/ServiceContent.vue'

const props = defineProps({
  settingfor: {
    type: String,
    default: "basic",
  },
});
const settingforRef = ref("basic");
const members = computed(() => teamStore.project?.project_members);
const roles = computed(() => teamStore.project?.member_roles);

const byInfo = ref({
  by: "project",
  project_id: computed(() => teamStore.project?.id),
});

const setting_items = ref([
  { val: "basic", label: "project_setting_basic", icon: "mdi-information-outline" },
  { val: "enable", label: "project_setting_enable", icon: "toggle_on" },
  { val: "preferences", label: "project_setting_preferences", icon: "tune" },
  { val: "role", label: "project_setting_role", icon: "add_moderator" },
  { val: "members", label: "project_setting_members", icon: "manage_accounts" },
  { val: "more", label: "project_setting_more", icon: "more_horiz" },
]);

const loading = ref(false);
onMounted(() => {
  if(teamStore.project?.type === 'service'){
    const item = {
      val: "serviceContent", label: "project_service_content", icon: "info"
    }
    setting_items.value.splice(1, 0, item)
  }
  setting_items.value = [...new Set(setting_items.value)]
});
</script>

<style lang="scss" scoped></style>
