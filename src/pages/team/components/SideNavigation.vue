<template>
  <q-scroll-area class="q-px-sm">
    <q-list dense class="column gap-xs">
      <template v-if="$q.screen.gt.xs">
        <!-- 讨论主题-->
        <q-item
          v-if="!isExternal"
          :class="`${
            teamStore?.mm_channel?.id === 'threads'
              ? 'border'
              : 'border-placeholder'
          }
                  `"
          class="overflow-hidden radius-xs q-pa-xs hovered-item"
          clickable
          v-ripple
          @click="enterThreads()"
        >
          <q-item-section side class="q-pr-sm">
            <q-icon name="speaker_notes" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
          </q-item-section>
          <q-item-section> {{ $t('navigation_threads') }} </q-item-section>
          <div
            v-if="teamStore?.mm_channel?.id === 'threads'"
            class="bg-primary absolute-left"
            style="width: 3px"
          ></div>
        </q-item>
        <!-- 事务沙盘-->
        <q-item
          :class="`${
            teamStore?.mm_channel?.id === 'intro' || !teamStore?.mm_channel
              ? 'border'
              : 'border-placeholder'
          }
                `"
          class="overflow-hidden radius-xs q-pa-xs hovered-item"
          clickable
          v-ripple
          @click="enterIntro('intro')"
        >
          <q-item-section side class="q-pr-sm">
            <q-icon name="developer_board" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
          </q-item-section>
          <q-item-section> {{ $t('navigation_Quadrant') }} </q-item-section>
          <div
            v-if="teamStore?.mm_channel?.id === 'intro'"
            class="bg-primary absolute-left"
            style="width: 3px"
          ></div>
        </q-item>
      </template>
      <template v-if="!isExternal">
        <q-item-label header class="q-pa-sm" :class="$q.screen.gt.xs ? 'text-grey-1' : `text-grey-1${$q.dark.mode ? '' : '0'}`">
          {{ $t('channel') }}
        </q-item-label>
        <template v-if="team.team_channels?.length > 0">
          <q-item
            v-for="i in team.team_channels"
            :key="i.id"
            clickable
            v-ripple
            :class="`${
              teamStore?.mm_channel?.id === i.mm_channel?.id
                ? 'border'
                : 'border-placeholder'
            }
                ${i.auth && !i.auth?.read ? 'op-5' : ''}
                `"
            class="radius-xs q-pa-xs hovered-item overflow-hidden"
            @click="enterChannel(i)"
          >
            <q-item-section side class="q-pr-sm" @mouseenter="deEnter = false">
              <q-btn
                flat
                dense
                size="sm"
                :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`"
                :icon="i.mm_channel?.type === 'O' ? 'public' : 'lock'"
                @mouseenter="deEnter = true"
                @mouseleave="deEnter = false"
              >
                <q-menu class="radius-sm">
                  <q-list dense bordered class="radius-sm q-pa-xs">
                    <q-item
                      clickable
                      auto-close
                      class="radius-xs"
                      @click.stop="setChannelType('O', i)"
                    >
                      <q-item-section side
                        ><q-icon name="public" :color="`grey-1${$q.dark.mode ? '' : '0'}`"
                      /></q-item-section>
                      <q-item-section>{{ $t('public_channel') }}</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      auto-close
                      class="radius-xs"
                      @click.stop="setChannelType('P', i)"
                    >
                      <q-item-section side
                        ><q-icon name="lock" :color="`grey-1${$q.dark.mode ? '' : '0'}`"
                      /></q-item-section>
                      <q-item-section>{{ $t('private_channel') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
            <q-item-section @mouseenter="deEnter = false">
              <div class="row no-wrap gap-xs q-pr-xs">
                <span class="row flex-center">{{ i.name }}</span>
                <UnreadBlock :mm_channel_id="i.mm_channel?.id" />
              </div>
              <q-tooltip class="transparent radius-sm">
                <q-card bordered>
                  <q-card-section class="q-py-sm q-px-md">
                    <div class="font-large">{{ i.name }}</div>
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
          class="border-dashed radius-xs"
          @click="openCreateChannel = true"
        >
          <q-item-section side>
            <q-icon name="add" />
          </q-item-section>
          <q-item-section>
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

      <q-item-label header class="q-pa-sm"
        :class="$q.screen.gt.xs ? 'text-grey-1' : `text-grey-1${$q.dark.mode ? '' : '0'}`"
      >{{ $t('project') }}</q-item-label>
      <template v-if="team.projects?.length > 0">
        <template v-for="project in team.projects" :key="project.id">
          <q-expansion-item
            v-if="project.sub_projects?.length > 0"
            icon="perm_identity"
          >
            <template v-slot:header>
              <q-item-section side style="width: 44px" class="q-pr-sm">
                <q-img
                  :src="project.overviews[0]?.media?.url"
                  :ratio="1"
                  sizes="24"
                  spinner-color="primary"
                  spinner-size="24px"
                  class="radius-xs"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  <div class="row no-wrap gap-xs">
                    <span>{{ project.name }}</span>
                    <UnreadBlock :mm_channel_id="project.mm_channel?.id" />
                  </div>
                </q-item-label>
                <q-item-label v-if="i.description" caption lines="1">
                  {{ i.description }}
                </q-item-label>
              </q-item-section>
              <div
                v-if="teamStore?.project?.id === project.id"
                class="bg-primary absolute-left"
                style="width: 3px"
              ></div>
            </template>
            <q-item
              clickable
              v-ripple
              v-for="i in project.sub_projects"
              :key="i.id"
              :class="`${
                teamStore?.project?.id === project.id
                  ? 'border'
                  : 'border-placeholder'
              } ${i.auth && !i.auth?.read ? 'op-5' : ''}`"
              class="overflow-hidden radius-xs q-pa-xs"
            >
              <q-item-section>
                <q-item-label>
                  <div class="row no-wrap gap-xs">
                    <span>{{ project.name }}</span>
                    <UnreadBlock :mm_channel_id="project.mm_channel?.id" />
                  </div>
                </q-item-label>
                <q-item-label v-if="i.description" caption lines="1">
                  {{ i.description }}
                </q-item-label>
              </q-item-section>
              <div
                v-if="teamStore?.project?.id === project.id"
                class="bg-primary absolute-left"
                style="width: 3px"
              ></div>
            </q-item>
          </q-expansion-item>

          <q-item
            v-else
            clickable
            v-ripple
            :class="`${
              teamStore?.project?.id === project.id
                ? 'border'
                : 'border-placeholder'
            } ${project.auth && !project.auth?.read ? 'op-5' : ''}`"
            class="overflow-hidden radius-xs q-pa-xs"
            @click="enterProject(project)"
          >
            <q-item-section side style="width: 44px" class="q-pr-sm">
              <q-img
                :src="project.overviews[0]?.media?.url"
                :ratio="1"
                sizes="24"
                spinner-color="primary"
                spinner-size="24px"
                class="radius-xs"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <div class="row no-wrap gap-xs">
                  <span>{{ project.name }}</span>
                  <UnreadBlock :mm_channel_id="project.mm_channel?.id" />
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
        class="border-dashed radius-xs"
        @click="createProject()"
      >
        <q-item-section side>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t('create_project') }}</q-item-label>
        </q-item-section>
      </q-item>
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
import {ref, computed, watch, watchEffect} from 'vue';
import { useRouter, useRoute } from "vue-router";
import {
  fetch_userPreferences,
  getTeamMembers,
} from "src/hooks/mattermost/useMattermost.js";
import {
  deleteChannel as deleteMmChannel,
  getChannelByID as getMmChannelByID,
  getUnreadsForTeam,
  getChannelUnreads
} from "src/api/mattermost.js";
import {
  getChannelByID,
  updateChannel,
  removeChannel,
} from "src/api/strapi/team.js";
import { getProjectNav } from "./SideNavigation.js";
import TeamInvite from "./widgets/TeamInvite.vue";
import UnreadBlock from 'src/pages/team/components/widgets/UnreadBlock.vue'
import CreateProject from "./CreateProject.vue";
import EditChannel from "./EditChannel.vue";
import { createChannel } from "src/pages/team/hooks/useCreateChannel.js";
import { useQuasar } from "quasar";
import {mm_wsStore, teamStore, uiStore} from 'src/hooks/global/useStore.js';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const byInfo = ref();

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
const isExternal = computed(() => teamStore.team?.isExternal);

watchEffect(() => {
  if(isExternal.value || uiStore.isFocusMode){
    teamStore.mm_channel = void 0;
  }
})

const mm_team = computed(() => teamStore?.team?.mm_team);
const page = ref(0);
const per_page = ref(60);
watch(
  mm_team,
  async () => {
    if (mm_team.value) {
      await fetch_userPreferences();
      await getTeamMembers(mm_team.value?.id, page.value, per_page.value);
      let mm_channels = []
      const mm_uid = localStorage.getItem("mmUserId")
      if(team.value?.team_channels?.length > 0){
        const filterMMChannel = team.value?.team_channels.filter(i => i.mm_channel)
        mm_channels.push(...filterMMChannel.map(i => i.mm_channel?.id));
      }
      if(team.value.projects?.length > 0){
        const filterHaveMM = team.value.projects.filter(i => i.mm_channel);
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
  },
  { immediate: true, deep: false }
);
const enterProject = async (project) => {
  if (project?.auth && !project?.auth?.read) {
    $q.notify("您尚未正式加入该项目、或您已被该项目管理员屏蔽");
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
  teamStore.project = project;
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
  if (channel?.auth && !channel?.auth?.read) {
    $q.notify("您尚未正式加入该频道、或您已被该频道管理员屏蔽");
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

const projcetCover = (project) => {
  let url;
  if (project.overviews?.length > 0) {
    if (project.default_version) {
      url = project.overviews?.find((i) => i.id === project.default_version)
        .media?.url;
    } else {
      url = project.overviews[0].media?.url;
    }
  }
  return url;
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

const enterThreads = () => {
  teamStore.project = void 0;
  teamStore.project_id = void 0;
  router.push(`/teams/threads`);
  teamStore.mm_channel = {
    id: "threads",
  };
};
const enterIntro = (val) => {
  router.push(`/teams`);
  teamStore.mm_channel = {
    id: val,
  };
  teamStore.project = null;
  teamStore.project_id = null;
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
        teamStore.team.projects.find((i) => i.id === _pid).name =
          strapi.data?.body;
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
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
