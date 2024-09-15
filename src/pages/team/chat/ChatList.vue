<template>
  <q-list dense class="full-width q-pa-xs">
    <q-item
      v-if="teamMode === 'toMany'"
      clickable
      v-ripple
      @click="gotoChannel(project_mm_channel)"
      class="radius-xs overflow-hidden q-mb-xs"
      :class="channel_id === project_mm_channel?.id ? 'border active-sublistitem' : ''"
    >
      <q-item-section avatar>
        <q-avatar square :size="`32`" class="radius-xs">
          <q-img
            :src="projectCover"
            :ratio="1"
            spinner-color="primary"
            spinner-size="22px"
          />
        </q-avatar>
      </q-item-section>
      <q-item-section>{{ $t('all_members_group') }}</q-item-section>
      <div
        v-if="channel_id === project_mm_channel?.id"
        class="absolute-left bg-primary"
        style="width: 3px"
      ></div>
    </q-item>
    <template v-if="project_users">
      <q-item
        v-for="i in project_users"
        :key="i.id"
        clickable
        v-ripple
        @click="showDirectChat(i)"
        class="radius-xs overflow-hidden q-mb-xs"
        :class="directTargetID === i.mm_profile?.id ? 'border active-sublistitem' : ''"
      >
        <q-item-section avatar>
          <UserAvatar
            :user_id="i.mm_profile?.id"
            :size="32"
            :disable_card="true"
          />
        </q-item-section>
        <q-item-section>{{ i.username }}</q-item-section>
        <div
          v-if="directTargetID === i.mm_profile?.id"
          class="absolute-left bg-primary"
          style="width: 3px"
        ></div>
      </q-item>
    </template>
  </q-list>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { uniqueById } from "src/hooks/utilits.js";
import { createDirect, getChannelByID } from "src/api/mattermost.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import { setLastChannel } from "src/pages/team/chat/TeamChat.js";
import {teamStore, uiStore} from 'src/hooks/global/useStore.js';

const router = useRouter();
const route = useRoute();
const channel_id = computed(() => route.params?.channel_id || null);
const teamMode = computed(() => teamStore.team?.config?.mode || 'toMany')

const project = computed(() => teamStore?.project);
const overview = computed(
  () =>
    project.value?.overviews?.find(
      (i) => i.id === project.value?.default_version
    ) ||
    (project.value?.overviews?.length > 0 && project.value?.overviews[0])
);
const projectCover = computed(() => overview.value?.media?.url);
const mm_channel = computed(() => teamStore?.mm_channel);
const project_mm_channel = computed(() => teamStore?.project?.mm_channel);
const project_users = computed(() => {
  let users;
  const all_users = project.value?.project_members?.map((i) => i.by_user);
  if (all_users) {
    users = uniqueById(all_users);
  }
  return users;
});

const gotoChannel = async (channel) => {
  await setLastChannel(project.value?.id, channel);
  teamStore.mm_channel = channel;
  await router.push(`/teams/projects/${project.value?.id}/chat/${channel?.id}`);
  uiStore.showMainContentList = false;
};
const navigation = computed(() => teamStore.navigation);
const findChannelEnter = async (channel_id) => {
  const res = await getChannelByID(channel_id);

  if (res?.data) {
    await gotoChannel(res.data);
  }
};
const route_name = computed(() => route.name);

const My_MMID = ref(localStorage.getItem("mmUserId"));
const createChannel = async (a, b) => {
  const res = await createDirect(a, b);
  if (res) {
    return res.data;
  }
};
const directTargetID = computed(() => {
  if (teamStore.mm_channel?.type !== "D") {
    return null;
  }
  // 私信频道名称由私信双方MM_ID组成，先将私信频道名称从分割符切分成数组
  // 如果是自己对自己的私信，那名称就是自己的ID拼接
  const membersInDirChannel = teamStore.mm_channel?.name.split("__");
  if (!membersInDirChannel) return void 0;
  // 移除数组中当前用户的MM_ID，
  const removeSelf = membersInDirChannel?.filter((i) => i !== My_MMID.value);
  // 如果数组中还剩下id，说明是私信频道，返回对方ID
  if (removeSelf?.length === 1) {
    return removeSelf[0];
  } else {
    // 如果没剩下，说明是自己对自己的私信，那么返回自己的ID
    return My_MMID.value;
  }
});
const DirChannel = ref();
const showDirectChat = async (member) => {
  let created_channel = await createChannel(
    My_MMID.value,
    member.mm_profile.id
  );
  if (created_channel) {
    DirChannel.value = created_channel;
    await gotoChannel(created_channel);
  }
};
watch(
  [channel_id, navigation, route_name, mm_channel],
  async () => {
    const chat_routes = ["team_project_homepage", "team_project_chat_page"];
    if (chat_routes.includes(route_name.value)) {
      if (channel_id.value && !mm_channel.value) {
        await findChannelEnter(channel_id.value);
      }
      if (navigation.value && !channel_id.value) {
        const _channel = teamStore.project?.mm_channel;
        await gotoChannel(_channel);
      }
    }
  },
  { immediate: true, deep: false }
);

/**
 * 如果用户使用URL地址直接访问到聊天页面
 * 但是URL中没有指定频道ID，这里处理默认逻辑
 */
onMounted(async() => {
  await nextTick();
  const _project_id = computed(() => route.params?.project_id || null);
  if(_project_id.value && !project.value && teamStore.init?.default_team?.projects?.length > 0) {
    teamStore.project = teamStore.init?.default_team?.projects.find(i => i.id == _project_id.value);
    const _mm_channel = teamStore.project?.mm_channel;
    
    if(_mm_channel) {
      await gotoChannel(_mm_channel);
    }
  } else if(project_mm_channel.value) {
    await gotoChannel(project_mm_channel.value);
  }
})
</script>

<style lang="scss" scoped></style>
