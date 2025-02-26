<template>
  <q-scroll-area class="fit q-pa-xs">
    <q-list dense class="column">
      <q-item
        clickable
        v-ripple
        @click="gotoChannel(project_mm_channel)"
        class="radius-xs overflow-hidden q-mb-xs"
        :class="mm_channel_id === project_mm_channel?.id ? 'border active-sublistitem' : ''"
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
        <q-item-section v-if="project_mm_channel?.unread > 0" side>
          <q-chip :label="project_mm_channel?.unread" />
        </q-item-section>
        <div v-if="mm_channel_id === project_mm_channel?.id"
          class="absolute-left bg-primary"
          style="width: 3px"
        ></div>
      </q-item>
      <template v-if="project_users?.length > 0">
        <q-item v-for="(i, index) in project_users"
          :key="i.id"
          clickable
          v-ripple
          @click="clickUserHandler(i)"
          class="radius-xs overflow-hidden q-mb-xs"
          :class="directTargetID === i.mm_profile?.id ? 'border active-sublistitem' : ''"
          :style="`order: ${project_users.length + (getMsgUser?.id === i.id ? -getMsgCount : index)};`"
        >
          <q-item-section avatar>
            <UserAvatar
              :image="i.wechat_profile?.avatar"
              :user_id="i.mm_profile?.id"
              :size="32"
              :disable_card="true"
              :square="true"
            />
          </q-item-section>
          <q-item-section>{{ i.username }}</q-item-section>
          <q-item-section v-if="i.unread > 0" side>
            <q-chip color="negative" dense :label="i.unread" />
          </q-item-section>
          <div
            v-if="directTargetID === i.mm_profile?.id"
            class="absolute-left bg-primary"
            style="width: 3px"
          ></div>
        </q-item>
      </template>
    </q-list>
    <q-dialog v-model="addFriendDlg" persistent>
      <AddFriendCard
        :strapi_member="project.project_members?.find(i => i.by_user?.id === addFriendUser?.id)"
        title="需要添加对方为好友后才能发送私信"
      />
    </q-dialog>
  </q-scroll-area>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeMount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { uniqueById } from "src/hooks/utilits.js";
import { createDirect, getChannelByID } from "src/api/mattermost.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import { setLastChannel } from "src/pages/team/chat/TeamChat.js";
import {teamStore, uiStore, mm_wsStore} from 'src/hooks/global/useStore.js';
import AddFriendCard from './components/AddFriendCard.vue'

const router = useRouter();
const route = useRoute();
const mm_channel_id = computed(() => route.params?.mm_channel_id || null);
const teamMode = computed(() => teamStore.team?.config?.mode || 'toMany')

const project = computed(() => teamStore?.project);
const allowDirectChat = computed(() => project.value.preferences?.find(i => i.name === 'project_settings')?.settings?.find(j => j.val === 'allow_direct_chat')?.enable)
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
const all_users = computed(() => project.value?.project_members?.filter((i) => i.by_user)?.map((i) => i.by_user) || []);
const project_users = computed(() => {
  let users;
  if (all_users.value) {
    const creator_role = teamStore.project?.member_roles?.find(i => i.subject === 'creator');
    const creator_members = teamStore.project?.project_members?.filter(i => i.member_roles.map(j => j.id).includes(creator_role?.id));
    const creator_users = creator_members?.map(i => i.by_user);
    const isCreator = creator_users?.map(i => i.id)?.includes(teamStore.init?.id);
    // console.log('isCreator', isCreator);
    if(teamMode.value === 'toMany' || isCreator){
      users = uniqueById(all_users.value);
    } else {
      users = creator_users;
    }
    users.forEach(i => {
      i.unread = 0
    });
  }
  return users;
});

const My_MMID = ref(localStorage.getItem("mmUserId"));
const channels = ref([
  {
    channel_name: project_mm_channel.value?.name,
    unread: 0
  }
])
const channel_unread = (channel_name) => {
  const channel = channels.value.find(i => i.channel_name === channel_name);
  if(channel) {
    return channel.unread;
  }
  return 0;
};
const init_allChannels = () => {
  all_users.value?.map(i => {
    channels.value.push({
      channel_name: `${i.mm_profile?.id}__${My_MMID.value}`,
      unread: 0
    })
  })
}
onMounted(() => {
  init_allChannels();
})

const getMsgCount = ref(0);
const getMsgUser = ref();
watch(
    mm_wsStore,
    async () => {
      const { data, event } = mm_wsStore.event;
      const post = !!data?.post ? JSON.parse(data.post) : {};
      let last_post = {}
      // 判断消息类型
      if (event === 'posted' && !!data.channel_name && post.message) {
        if(!last_post || last_post.id === post.id) return;
        if(post.channel_id === project_mm_channel.value?.id && teamStore.mm_channel?.id !== post.channel_id){
          project_mm_channel.value.unread = project_mm_channel.value.unread > 0 ? project_mm_channel.value.unread + 1 : 1
        } else {
          getMsgUser.value = project_users.value.find(i => i.mm_profile?.id === post.user_id && post.user_id !== My_MMID.value && data.channel_type === 'D');
          if(getMsgUser.value) {
            getMsgCount.value++
            if(DirChannel.value?.id === post.channel_id){
              getMsgUser.value.unread = 0
            } else {
              getMsgUser.value.unread += 1;
            }
          }
        }
        last_post = post;
      }
    },
    { immediate: true, deep: true }
);

const gotoChannel = async (channel) => {
  project_mm_channel.value = {
    ...project_mm_channel.value,
    unread: 0
  }
  await setLastChannel(project.value?.id, channel);
  teamStore.mm_channel = channel;
  await router.push(`/teams/projects/${project.value?.id}/chat/${channel?.id}`);
  uiStore.showMainContentList = false;
};
const navigation = computed(() => teamStore.navigation);
const findChannelEnter = async (mm_channel_id) => {
  const res = await getChannelByID(mm_channel_id);

  if (res?.data) {
    await gotoChannel(res.data);
  }
};
const route_name = computed(() => route.name);

const createChannel = async (a, b) => {
  const res = await createDirect(a, b);
  if (res) {
    return res.data;
  }
};

const addFriendDlg = ref(false);
const addFriendUser = ref();
const clickUserHandler = (user) => {
  if(allowDirectChat.value || teamStore.init?.contact?.contacters?.find(i => i.id === user.id)){
    showDirectChat(user)
  } else {
    addFriendUser.value = user
    addFriendDlg.value = true
  }
}
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
const showDirectChat = async (user) => {
  user.unread = 0;
  let created_channel = await createChannel(
    My_MMID.value,
    user.mm_profile.id
  );
  if (created_channel) {
    DirChannel.value = created_channel;
    await gotoChannel(created_channel);
  }
};

const autoEnterChannel = async (mm_channel_id, navigation, route_name, mm_channel) => {
    // 如果当前频道是项目频道，并且团队模式不是多人模式，则不进行频道自动切换
    const isProjectMMChannel = mm_channel_id.value === teamStore.project?.mm_channel?.id;
    const is_toMany = teamMode.value === 'toMany';
    if(isProjectMMChannel && !is_toMany) return;

    const chat_routes = ["team_project_homepage", "team_project_chat_page"];
    if (chat_routes.includes(route_name.value)) {
      if (mm_channel_id.value && !mm_channel.value) {
        await findChannelEnter(mm_channel_id.value);
      }
      if (navigation.value && !mm_channel_id.value) {
        const _channel = teamStore.project?.mm_channel;
        await gotoChannel(_channel);
      }
    }
}
watch(
  [mm_channel_id, navigation, route_name, mm_channel],
  async () => {
    await autoEnterChannel(mm_channel_id, navigation, route_name, mm_channel);
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
