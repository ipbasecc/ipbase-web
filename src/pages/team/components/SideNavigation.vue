<template>
  <q-scroll-area class="q-px-sm">
    <q-list :dense="$q.screen.gt.sm" class="column gap-xs" :style="`width: ${width - 16}px;`">
      <template v-if="$q.screen.gt.xs">
        <!-- 讨论主题-->
        <q-item v-if="enable_threads"
          :class="`${
            teamStore?.mm_channel?.id === 'threads'
              ? 'border active-listitem'
              : 'border-placeholder op-7'
          }`"
          class="overflow-hidden radius-xs q-pa-xs hovered-item full-width"
          clickable
          v-ripple
          @click="enterSubApp('threads')"
        >
          <q-item-section side class="q-pr-sm">
            <q-icon name="speaker_notes" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
          </q-item-section>
          <q-item-section class="overflow-hidden"> {{ $t('navigation_threads') }} </q-item-section>
          <div
            v-if="teamStore?.mm_channel?.id === 'threads'"
            class="bg-primary absolute-left"
            style="width: 3px"
          ></div>
        </q-item>
        <!-- 事务沙盘-->
        <q-item v-if="enalbe_dashboard"
          :class="`${
            teamStore?.mm_channel?.id === 'teams' || !teamStore?.mm_channel
              ? 'border active-listitem'
              : 'border-placeholder op-7'
          }
                `"
          class="overflow-hidden radius-xs q-pa-xs hovered-item full-width"
          clickable
          v-ripple
          @click="enterSubApp('teams')"
        >
          <q-item-section side class="q-pr-sm">
            <q-icon name="mdi-chart-bubble" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
          </q-item-section>
          <q-item-section class="overflow-hidden"> {{ $t('navigation_Quadrant') }} </q-item-section>
          <div
            v-if="teamStore?.mm_channel?.id === 'teams'"
            class="bg-primary absolute-left"
            style="width: 3px"
          ></div>
        </q-item>
        <!-- 团队资讯 -->
        <q-item
          :class="`${
            teamStore?.mm_channel?.id === 'news'
              ? 'border active-listitem'
              : 'border-placeholder op-7'
          }
                `"
          class="overflow-hidden radius-xs q-pa-xs hovered-item full-width"
          clickable
          v-ripple
          @click="enterSubApp('news')"
        >
          <q-item-section side class="q-pr-sm">
            <q-icon name="mdi-newspaper" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
          </q-item-section>
          <q-item-section class="overflow-hidden"> {{ $t('navigation_News') }} </q-item-section>
          <div
            v-if="teamStore?.mm_channel?.id === 'teams'"
            class="bg-primary absolute-left"
            style="width: 3px"
          ></div>
        </q-item>
      </template>
      <template v-if="enalbe_channel">
        <q-item-label header class="q-pa-sm non-selectable text-white">
          {{ $t('channel') }}
        </q-item-label>
        <template v-if="team.team_channels?.length > 0">
          <q-item v-for="i in team.team_channels"
            :key="i.id" clickable v-ripple
            :class="`${teamStore?.mm_channel?.id === i.mm_channel?.id
              ? 'border active-listitem'
              : 'border-placeholder op-7'}
              ${i.auth && !i.auth?.read ? 'op-4' : ''}
            `"
            class="radius-xs q-pa-xs hovered-item overflow-hidden full-width"
            @click="enterChannel(i)"
          >
            <q-item-section side class="q-pr-sm" @mouseenter="deEnter = false">
              <q-icon :name="i.mm_channel?.type === 'O' ? 'mdi-pound' : 'mdi-pound-box'"
                :size="$q.screen.gt.sm ? '' : 'md'"
                :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`"
                @mouseenter="deEnter = true"
                @mouseleave="deEnter = false"
              >
                <q-menu class="radius-sm">
                  <q-list dense bordered class="radius-sm q-pa-xs">
                    <q-item
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click.stop="setChannelType('O', i)"
                    >
                      <q-item-section side
                        ><q-icon name="mdi-pound" :color="`grey-1${$q.dark.mode ? '' : '0'}`"
                      /></q-item-section>
                      <q-item-section>{{ $t('public_channel') }}</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click.stop="setChannelType('P', i)"
                    >
                      <q-item-section side
                        ><q-icon name="mdi-pound-box" :color="`grey-1${$q.dark.mode ? '' : '0'}`"
                      /></q-item-section>
                      <q-item-section>{{ $t('private_channel') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
                <q-tooltip :class="`border ${$q.dark.mode ? 'bg-black' : 'bg-white'}`">
                  {{ i.mm_channel?.type === 'O' ? $t('public_channel') : $t('private_channel') }}
                </q-tooltip>
              </q-icon>
            </q-item-section>
            <q-item-section @mouseenter="deEnter = false" class="overflow-hidden">
              <div class="row no-wrap gap-xs q-pr-xs">
                <span class="row flex-center">{{ initedChannelByMM.includes(i.name) ? $t(i.name) : i.name }}</span>
                <q-space />
                <UnreadBlock :mm_channel_id="i.mm_channel?.id" />
              </div>
              <q-tooltip class="transparent radius-sm">
                <q-card bordered :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-10'">
                  <q-card-section class="q-py-sm q-px-md">
                    <div class="font-large">{{ initedChannelByMM.includes(i.name) ? $t(i.name) : i.name }}</div>
                  </q-card-section>
                  <q-card-section v-if="i.purpose" class="border-top font-medium q-py-sm q-px-md op-5">
                    {{ i.purpose }}
                  </q-card-section>
                </q-card>
              </q-tooltip>
            </q-item-section>
            <q-item-section
              side
              class="hover-show transition no-padding"
              @mouseenter="deEnter = true"
              @mouseleave="deEnter = false"
            >
              <q-btn flat round dense size="sm" icon="more_vert">
                <q-menu class="radius-sm">
                  <q-list
                    dense
                    bordered
                    style="min-width: 12rem"
                    class="radius-sm q-pa-xs"
                    :class="
                      $q.dark.mode
                        ? 'bg-grey-10 text-grey-1'
                        : 'bg-white text-grey-10'
                    "
                  >
                    <q-item
                      clickable v-ripple v-close-popup
                      class="radius-xs"
                      @click="editChannel(i)">
                      <q-item-section side>
                        <q-icon name="tune" size=sm />
                      </q-item-section>
                      <q-item-section>
                        {{ $t('edit_channel') }}
                      </q-item-section>
                    </q-item>
                    <q-separator spaced />
                    <q-item
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click="inviteFn(i)"
                    >
                      <q-item-section side>
                        <q-icon name="group_add" size=sm />
                      </q-item-section>
                      <q-item-section>{{ $t('invite_member') }}</q-item-section>
                    </q-item>
                    <q-separator spaced />
                    <q-item
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click="deleteChannelFn(i)"
                    >
                      <q-item-section side>
                        <q-icon name="remove" size=sm />
                      </q-item-section>
                      <q-item-section>{{ $t('remove_channel') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
            <div
              v-if="teamStore?.mm_channel?.id === i.mm_channel?.id"
              class="bg-primary absolute-left"
              style="width: 3px"
            ></div>
          </q-item>
        </template>
        <q-item
          v-else-if="!openCreateChannel"
          clickable
          v-ripple
          class="border-dashed radius-xs q-pa-xs hovered-item overflow-hidden full-width"
          @click="openCreateChannel = true"
        >
          <q-item-section side>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section class="overflow-hidden">
            <q-item-label>{{ $t('create_channel') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-else
          clickable
          class="radius-xs"
          :class="openCreateChannel ? 'no-padding' : ''"
        >
          <q-item-section>
            <q-input
              v-model="createChannelparams.data.name"
              outlined
              filled
              dense
              type="text"
              :aria-placeholder="`${$t('channel_name')}`"
              class="radius-xs overflow-hidden"
              @keyup.enter="createChannelFn()"
              @keyup.esc="openCreateChannel = false"
            >
              <template #prepend><q-icon name="forum" size="sm" /></template>
              <template v-if="createChannelparams.data.name" #append>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="check"
                  v-close-popup
                  @click="createChannelFn()"
                />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
      </template>

      <template v-if="enalbe_project">
        <q-item-label header class="q-pa-sm non-selectable text-white"
          :class="$q.screen.gt.xs ? 'text-grey-1' : `text-grey-1${$q.dark.mode ? '' : '0'}`"
        >{{ $t('project') }}</q-item-label>
        <template v-if="team.projects?.length > 0">
          <template v-for="project in team.projects" :key="project.id">
            <q-item
              clickable
              v-ripple
              :class="`${
                teamStore?.project?.id === project.id
                  ? 'border active-listitem'
                  : 'border-placeholder op-7'
              } ${project.auth && !project.auth?.read ? 'op-5' : ''}`"
              class="overflow-hidden radius-xs q-pa-xs full-width"
              @click="enterProject(project)"
            >
              <q-item-section side style="width: 44px" class="q-pr-sm">
                <q-img
                  :src="getThumbnail(project)"
                  :ratio="1"
                  sizes="24"
                  spinner-color="primary"
                  spinner-size="24px"
                  class="radius-xs"
                />
              </q-item-section>
              <q-item-section class="overflow-hidden">
                <q-item-label>
                  <div class="row no-wrap gap-xs">
                    <span>{{ project.name }}</span>
                    <q-space />
                    <UnreadBlock v-if="project.auth?.read" :mm_channel_id="project.mm_channel?.id" />
                  </div>
                </q-item-label>
                <q-item-label
                  v-if="project.description"
                  caption
                  lines="1"
                  class="text-grey-5"
                >
                  {{ project.description }}
                </q-item-label>
              </q-item-section>
              <div
                v-if="teamStore?.project?.id === project.id"
                class="bg-primary absolute-left"
                style="width: 3px"
              ></div>
            </q-item>
          </template>
        </template>
        <q-item
          v-else
          clickable
          v-ripple
          class="border-dashed radius-xs q-pa-xs hovered-item overflow-hidden full-width"
          @click="createProject()"
        >
          <q-item-section side>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section class="overflow-hidden">
            <q-item-label>{{ $t('create_project') }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
    <q-dialog v-model="invite" persistent>
      <TeamInvite :byInfo />
    </q-dialog>
    <q-dialog v-model="openCreateProject" persistent>
      <CreateProject @projectCreated="projectCreated" />
    </q-dialog>
    <q-dialog v-model="openEditChannel" persistent>
      <EditChannel :channel="editTarget" />
    </q-dialog>
  </q-scroll-area>
</template>

<script setup>
import {computed, ref, watch, watchEffect, nextTick, onMounted} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {fetch_userPreferences, getTeamMembers,} from "src/hooks/mattermost/useMattermost.js";
import {getChannelByID, getTeamByID, removeChannel, updateChannel} from 'src/api/strapi/team.js'
import {
  deleteChannel as deleteMmChannel,
  getChannelByID as getMmChannelByID,
  getChannelUnreads,
  getUnreadsForTeam
} from "src/api/mattermost.js";
import {getProjectNav} from "./SideNavigation.js";
import TeamInvite from "./widgets/TeamInvite.vue";
import UnreadBlock from 'src/pages/team/components/widgets/UnreadBlock.vue'
import CreateProject from "./CreateProject.vue";
import EditChannel from "./EditChannel.vue";
import {createChannel} from "src/pages/team/hooks/useCreateChannel.js";
import {debounce, useQuasar} from "quasar";
import {mm_wsStore, teamStore, uiStore} from 'src/hooks/global/useStore.js';
import {i18n} from 'src/boot/i18n.js';
import {
  enable_threads,
  enalbe_channel,
  enalbe_dashboard,
  enalbe_project,
  isExternal,
  teamMode
} from "src/pages/team/hooks/useConfig.js";
import useProject from 'src/hooks/project/useProject.js';

const props = defineProps({
  width: {
    type: Number,
    default: NaN,
  },
});

const $t = i18n.global.t;

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const byInfo = ref();
const initedChannelByMM = ['town-square', 'off-topic']

const routeName = computed(() => route.name);
watch(
  routeName,
  () => {
    if (routeName.value === "team_threads_homepage") {
      teamStore.mm_channel = {
        id: "threads",
      };
    }
    if (routeName.value === "team_project_homepage" || routeName.value === "teams") {
      teamStore.project_id = void 0;
      teamStore.project = void 0;
    }
  },
  { immediate: true, deep: false }
);
const mm_channel_id = computed(() => route.params?.channel_id); // 此处为Mattermost channel_id
watch(
  mm_channel_id,
  async () => {
    if (mm_channel_id.value && !teamStore.channel) {
      const mm_channel = await getMmChannelByID(mm_channel_id.value);
      // console.log("mm_channel", mm_channel);
      if (mm_channel?.data) {
        teamStore.mm_channel = mm_channel.data;
      }
      // 获取到Mattermost channel数据后，根据该数据从所有团队频道中筛选出对应的团队频道
      // 如果可以筛选出，说明访问的是聊天频道，否则说明该Mattermost channel是属于某个项目的
      // 因此，需要添加判断，并根据判断结果决定是否继续获取频道数据
      const _channel = team.value?.team_channels?.find(
        (i) => i.mm_channel.id === mm_channel_id.value
      );
      if (_channel) {
        const res = await getChannelByID(_channel.id);
        if (res?.data) {
          teamStore.channel = res.data;
        }
      }
    }
  },
  { immediate: true, deep: false }
);

const team = computed(() => teamStore.team);
const getThumbnail = (project) => {
  const { thumbnail } = useProject(project)  
  return thumbnail
}

watchEffect(() => {
  if(isExternal.value || uiStore.isFocusMode){
    teamStore.mm_channel = void 0;
  }
})

const mm_team = computed(() => teamStore?.team?.mm_team);
const page = ref(0);
const per_page = ref(60);

onMounted(async() => {
  await nextTick();
  if (mm_team.value) {
    await fetch_userPreferences();
    await getTeamMembers(mm_team.value?.id, page.value, per_page.value);
    let mm_channels = []
    const mm_uid = localStorage.getItem("mmUserId")
    if(team.value?.team_channels?.length > 0 && enalbe_channel.value){
      const filterMMChannel = team.value?.team_channels.filter(i => i.mm_channel)
      mm_channels.push(...filterMMChannel.map(i => i.mm_channel?.id));
    }
    if(team.value.projects?.length > 0 && enalbe_project.value && teamMode.value === 'toMany'){
      // can read
      const filterHaveMM = team.value.projects.filter(i => i.mm_channel && i.auth?.read);
      
      if(filterHaveMM?.length > 0){
        mm_channels.push(...filterHaveMM.map(i => i.mm_channel.id));
      }
    }
    if(mm_channels.length > 0){
      const promises = mm_channels.map(async (m) => {
        const res = await getChannelUnreads(mm_uid, m);
        if(res?.data) {
          return res?.data;
        }
      })
      const allSettleds = await Promise.allSettled(promises)
      const fulfilleds = allSettleds.filter(i => i.status === "fulfilled")?.map((j) => j.value);
      if(fulfilleds.length > 0){
        uiStore.unreads.channels = fulfilleds
      }
    }
    if(mm_uid){
      const res = await getUnreadsForTeam(mm_uid, mm_team.value.id)
      if(res?.data){
        uiStore.unreads.team = res?.data
      }
    }

  }
})
const enterProject = async (project) => {
  if (project?.auth && !project?.auth?.read) {
    $q.notify($t('project_not_join_or_was_blocked'));
    return;
  }
  if (
    teamStore.project_id === project.id ||
    teamStore.project?.id === project.id
  ) {
    return;
  }

  teamStore.channel = null; // 重置频道，聊天组件是否显示频道成员管理依赖此判断
  teamStore.$reset_project();
  teamStore.project_id = project.id;
  if (teamStore?.team?.isExternal) {
    await router.push(`/teams/external/${project.id}`);
  } else {
    teamStore.mm_channel = project.mm_channel;
    teamStore.rightDrawerOpen = false;
    const _project_id = project.id;
    const _team_id = teamStore.team?.id;
    if(uiStore.isFocusMode){
      uiStore.showMainContentList = false
      await router.push(`/teams/${_team_id}/focus/${_project_id}`);
    } else {
      let nva = await getProjectNav(_project_id);
      await router.push(`/teams/projects/${_project_id}/${nva || "chat"}`);
    }
  }
  if(!$q.screen.gt.xs){
    teamStore.navigatorDrawer = false
  }
};

const deEnter = ref(false);
const enterChannel = async (channel) => {
  if (deEnter.value) return;
  teamStore.direct_user = void 0;
  uiStore.chat_pannel = false; // 关闭聊天面板，否则因为数据切换可能导致数据错误而报错
  if (channel?.auth && !channel?.auth?.read) {
    $q.notify($t('channel_not_join_or_was_blocked'));
    return;
  }
  teamStore.project = void 0;
  teamStore.project_id = void 0;
  const _id = channel?.mm_channel?.id;
  if (!_id) return;
  teamStore.$reset_project();
  teamStore.channel = channel;
  const res = await getChannelByID(channel.id);
  if (res?.data) {
    teamStore.channel = res.data;
    teamStore.mm_channel = res.data.mm_channel;
  }
  await router.push(`/teams/${_id}`);
  if(!$q.screen.gt.xs){
    teamStore.navigatorDrawer = false
  }
};

const openEditChannel = ref(false);
const editTarget = ref();
const editChannel = (channel) => {
  editTarget.value = channel;
  openEditChannel.value = true;
};

const loading = ref(false);
const openCreateChannel = ref(false);
const createChannelparams = ref({
  team_id: computed(() => teamStore.team?.id),
  data: {
    name: "",
    type: "P",
  },
});
const createChannelFn = async () => {
  loading.value = true;

  await createChannel(createChannelparams.value);

  createChannelparams.value.data.name = "";
  openCreateChannel.value = false;
  loading.value = false;
};

const params = ref({
  data: {
    name: "",
  },
});
const setChannelType = (val, channel) => {
  // console.log("setChannelType", val, channel);
  params.value.data.type = val;
  params.value.data.name = channel.name;
  updateChannelFn(channel);
};
const updateChannelFn = async (channel) => {
  params.value.channel_id = channel.id;
  const res = await updateChannel(channel.id, params.value);
  if (res?.data) {
    teamStore.team.team_channels = teamStore.team.team_channels.map(
      (i) => (i.id === channel.id && res.data) || i
    );
    params.value.data.name = "";
  }
};

const deleteChannelFn = async (i) => {
  const curChannelId = route.params?.channel_id;
  const _mm_channel_id = i.mm_channel.id;
  if (!_mm_channel_id) return;
  const removeMmChannel = await deleteMmChannel(_mm_channel_id);
  if (removeMmChannel) {
    const res = await removeChannel(i.id);
    if (res?.data) {
      teamStore.team.team_channels = teamStore.team.team_channels.filter(
        (i) => i.id !== res.data.channel_id
      );
      if(curChannelId === _mm_channel_id){
        await router.push("/teams");
      }
    }
  }
};

const invite = ref(false);
const inviteFn = (channel) => {
  invite.value = true;
  byInfo.value = {
    by: "channel",
    channel_id: channel.id,
  };
};

const emptyProject = () => {
  teamStore.project = void 0;
  teamStore.project_id = void 0;
}
const enterSubApp = (val) => {
  if(val === 'news'){
    router.push(`/teams/${teamStore.team.id}/news`);
  } else {
    router.push(`/${val}`);
  }
  teamStore.mm_channel = {
    id: val,
  };
  if(teamStore.project){
    emptyProject();
  }
};
const openCreateProject = ref(false);
const createProject = () => {
  openCreateProject.value = true;
};
const projectCreated = (val) => {
  teamStore.team.projects =
    teamStore.team.projects?.length > 0
      ? [...teamStore.team.projects, val]
      : [val];
  openCreateProject.value = false;
};

const callbackChannelRefreshEvents = [
  'channel_created',
  'channel_deleted',
  'channel_updated',
  'channel_converted',
  'update_team',
  'leave_team',
  'added_to_team'
]
watch(
  mm_wsStore,
  async () => {    
    // 判断消息类型
    if (mm_wsStore?.event?.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (
        strapi?.data?.action === "change_project_name" &&
        strapi?.data?.project_id
      ) {
        const _pid = strapi.data.project_id;
        // teamStore.team.projects.find((i) => i.id === _pid).name = strapi.data?.body;
        const project = teamStore.team.projects.find((i) => i.id === _pid);
        console.log('project', project);
        if (project) {
          project.name = strapi.data?.body;
        }
      }
      if (
        strapi?.data?.action === "overview_mediaChanged" &&
        strapi?.data?.project_id
      ) {
        const _pid = strapi.data.project_id;
        const _version = strapi.data.version;
        const _newUrl = strapi.data?.media?.url;
        teamStore.team.projects.map((i) => i.id === _pid ? {
          ...i,
          overviews: i.overviews.map((j) => ({
            ...j,
            url: j.id === _version ? _newUrl : j.url,
          })),
        } : i);
      }
    } else if(callbackChannelRefreshEvents.includes(mm_wsStore?.event?.event)){
      
      const reGetTeam = async () => {
        // console.log('callbackChannelRefreshEvents');
        const res = await getTeamByID(teamStore.team.id);
        if (res?.data) {
          teamStore.team = res.data;
        } else {
          $q.notify({
            type: "negative",
            message: "获取团队信息失败,请刷新页面重试",
          })
        }
      }
      debounce(reGetTeam(),1000)
    } else if(mm_wsStore?.event?.event === 'delete_team'){
      teamStore.status = 'deleted'
      teamStore.teams = teamStore.teams.filter(i => i.id !== teamStore.team.id)
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
