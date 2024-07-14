<template>
  <q-list class="full-width">
    <q-item
      clickable
      v-ripple
      @click="gotoChannel(mm_channel_id)"
      :class="mmstore.current_channel_id === mm_channel_id ? 'bg-primary' : ''"
    >
      <q-item-section avatar>
        <q-avatar square>
          <q-img
            :src="projectCover"
            :ratio="1"
            spinner-color="primary"
            spinner-size="22px"
          />
        </q-avatar>
      </q-item-section>
      <q-item-section>主讨论群</q-item-section>
    </q-item>
  </q-list>
  <q-list class="full-width q-pa-xs">
    <template v-if="project_users">
      <q-item
        v-for="i in project_users"
        :key="i.id"
        clickable
        v-ripple
        @click="showDirectChat(i)"
        class="radius-sm"
        :class="users_inDirChannel.includes(i.id) ? 'bg-primary' : ''"
      >
        <q-item-section avatar>
          <UserAvatar
            :user_id="i.mm_profile?.id"
            :size="36"
            :disable_card="true"
          />
        </q-item-section>
        <q-item-section>{{ i.username }}</q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import useProjectStore from "src/stores/project.js";
import { uniqueById } from "src/hooks/utilits.js";
import { createDirect } from "src/api/mattermost.js";
import useMmstore from "src/stores/mmstore.js";
import UserAvatar from "src/pages/Chat/components/wigets/UserAvatar.vue";
import localforage from "localforage";
const mmstore = useMmstore();

const projectStore = useProjectStore();
const router = useRouter();
const route = useRoute();
const channel_id = computed(() => route.params?.channel_id);
const channel = computed(() => mmstore.channel);

const project = computed(() => projectStore?.project);
const overview = computed(
  () =>
    project.value?.overviews?.find(
      (i) => i.id === project.value?.default_version
    ) || project.value?.overviews[0]
);
const projectCover = computed(() => overview.value?.media?.url);
const mm_channel_id = computed(() => projectStore?.project?.mm_channel_id);
const project_users = computed(
  () =>
    project.value &&
    uniqueById(project.value?.project_members?.map((i) => i.by_user))
);

const gotoChannel = (channel_id) => {
  router.push(`/projects/${project.value?.id}/chat/${channel_id}`);
};

const My_MMID = ref(localStorage.getItem("mmUserId"));
const createChannel = async (a, b) => {
  const res = await createDirect(a, b);
  if (res) {
    return res.data;
  }
};
const _directChatMembersNames = computed(() => {
  const membersInDirChannel = mmstore.channel?.name.split("__");
  const removeSelf = membersInDirChannel?.filter((i) => i != My_MMID.value);
  if (removeSelf?.length === 1) {
    return removeSelf[0];
  } else {
    return My_MMID.value;
  }
});
const users_inDirChannel = computed(() => {
  return project_users.value
    ?.filter((i) => _directChatMembersNames.value === i.mm_profile?.id)
    ?.map((j) => j.id);
});
const showDirectChat = async (member) => {
  let created_channel = await createChannel(
    My_MMID.value,
    member.mm_profile.id
  );
  if (created_channel) {
    member.direct_channel_id = created_channel.id;
    gotoChannel(created_channel.id);
  }
};

// channel_id 从路由读取，如果有channel_id却没有channel
// 说明是用户通过url直接进入的，添加进入逻辑
watch(
  channel,
  () => {
    if (channel.value) {
      //   find_memberInCurChannel();
    }
  },
  { immediate: true, deep: false }
);
onMounted(async () => {
  if (route.params?.proj_id && route.params.channel_id) {
    gotoChannel(route.params.channel_id);
  } else if (mmstore?.current_channel_id) {
    gotoChannel(mmstore?.current_channel_id);
  } else {
    const mainChannel = projectStore.project?.mm_channel_id;
    gotoChannel(mainChannel);
  }
});
</script>

<style lang="scss" scoped></style>
