<!-- 需要国际化 -->
<template>
  <q-scroll-area>
    <q-list class="column gap-xs">
      <template v-if="$q.screen.gt.xs">
        <q-list :dense="$q.screen.gt.sm" class="q-px-sm column gap-xs">
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
          <q-item v-if="enable_dashboard"
            :class="`${
              teamStore?.mm_channel?.id === 'teams' || route.name === 'teams'
                ? 'border active-listitem'
                : 'border-placeholder op-7'
            }`"
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
          <q-item @click="enterSubApp('news')"
            :class="`${
              teamStore?.mm_channel?.id === 'news'
                ? 'border active-listitem'
                : 'border-placeholder op-7'
            }`"
            class="overflow-hidden radius-xs q-pa-xs hovered-item full-width"
            clickable v-ripple
          >
            <q-item-section side class="q-pr-sm">
              <q-icon name="mdi-newspaper" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
            </q-item-section>
            <q-item-section class="overflow-hidden"> {{ $t('navigation_News') }} </q-item-section>
            <div
              v-if="teamStore?.mm_channel?.id === 'news'"
              class="bg-primary absolute-left"
              style="width: 3px"
            ></div>
          </q-item>
          <q-item v-if="enable_orders" @click="enterSubApp('orders')"
            :class="`${
              teamStore?.mm_channel?.id === 'orders'
                ? 'border active-listitem'
                : 'border-placeholder op-7'
            }`"
            class="overflow-hidden radius-xs q-pa-xs hovered-item full-width"
            clickable v-ripple
          >
            <q-item-section side class="q-pr-sm">
              <q-icon name="mdi-newspaper" :color="$q.screen.gt.xs ? 'grey-1' : `grey-1${$q.dark.mode ? '' : '0'}`" />
            </q-item-section>
            <q-item-section class="overflow-hidden"> {{ $t('navigation_Orders') }} </q-item-section>
            <div
              v-if="teamStore?.mm_channel?.id === 'orders'"
              class="bg-primary absolute-left"
              style="width: 3px"
            ></div>
          </q-item>
        </q-list>
      </template>
      <template v-if="enable_channel">
        <q-item-label header class="q-pa-sm non-selectable op-6 q-mt-md"
        :class="$q.screen.gt.xs ? 'text-grey-1' : `text-grey-1${$q.dark.mode ? '' : '0'}`">
          {{ $t('community_channel') }}
        </q-item-label>
        <template v-if="team.team_channels?.length > 0">
          <q-list :dense="$q.screen.gt.sm" class="q-px-sm column gap-xs">
            <q-item v-for="i in team.team_channels"
              :key="i.id" clickable v-ripple
              :class="`${teamStore?.mm_channel?.id === i.mm_channel?.id
                ? 'border active-listitem'
                : 'op-7'}
                ${i.auth && !i.auth?.read ? 'op-4' : ''}
                ${heiglight === i.id ? 'border' : 'border-placeholder'}
              `"
              class="radius-xs q-pa-xs hovered-item full-width"
              :style="`width: ${uiStore.navDrawerWidth - 16}px;`"
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
                <span>{{ initedChannelByMM.includes(i.name) ? $t(i.name) : i.name }}</span>
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
              <q-popup-proxy context-menu>
                <ChannelMenu :channel="i" />
              </q-popup-proxy>
              <div
                v-if="teamStore?.mm_channel?.id === i.mm_channel?.id"
                class="bg-primary absolute-left"
                style="width: 3px"
              ></div>
              <UnreadBlock :mm_channel_id="i.mm_channel?.id" />
            </q-item>
          </q-list>
        </template>
        <q-list v-else :dense="$q.screen.gt.sm" class="q-px-sm">
          <q-item v-if="!openCreateChannel"
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
          <q-item v-else
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
        </q-list>
      </template>

      <template v-if="enable_project">
        <q-item-label header class="q-pa-sm non-selectable op-6 q-mt-md"
          :class="$q.screen.gt.xs ? 'text-grey-1' : `text-grey-1${$q.dark.mode ? '' : '0'}`"
        >{{ $t('collaboration_project') }}</q-item-label>
        <q-list :dense="$q.screen.gt.sm" class="q-px-sm column gap-xs">
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
                class="radius-xs q-pa-xs"
                @click="enterProject(project)"
                :style="`width: ${uiStore.navDrawerWidth - 16}px;`"
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
                <q-item-section>
                  <q-item-label>
                    {{ project.name }}
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
                <UnreadBlock v-if="project.auth?.read" :mm_channel_id="project.mm_channel?.id" />
                <div
                  v-if="teamStore?.project?.id === project.id"
                  class="bg-primary absolute-left"
                  style="width: 3px"
                ></div>
                <q-tooltip v-if="project.description && (project.description.length > 32 || project.description.replace(/[^\u4e00-\u9fa5]/g, '').length > 16)" class="transparent radius-sm">
                  <q-card bordered
                  :style="`width: ${uiStore.navDrawerWidth - 16}px;`">
                    <q-card-section :class="$q.dark.mode ? 'text-white' : 'text-black'" class="font-small q-pa-sm">
                      {{ project.description }}
                    </q-card-section>
                  </q-card>
                </q-tooltip>
              </q-item>
            </template>
          </template>
          <q-item
            v-else
            clickable
            v-ripple
            class="border-dashed radius-xs q-mx-xs q-pa-xs hovered-item overflow-hidden full-width"
            @click="createProject()"
          >
            <q-item-section side>
              <q-icon name="add" />
            </q-item-section>
            <q-item-section class="overflow-hidden">
              <q-item-label>{{ $t('create_project') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
    </q-list>
    <q-dialog v-model="openCreateProject" persistent>
      <CreateProject @projectCreated="projectCreated" />
    </q-dialog>
    <q-dialog v-model="buy_service" persistent>
      <q-card bordered style="width: 61dvw; height: 61dvh;" class="column no-wrap overflow-hidden">
        <q-toolbar class="transparent">
          <span>{{ buy_project.name }}</span>
          <q-space />
          <q-btn flat round dense size="sm" icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section v-if="buy_project.jsonContent" class="q-space q-py-none scroll-y">
          <TipTap
            :jsonContent="buy_project.jsonContent"
            :editable="false"
            :need="'json'"
            :square="true"
            styleClass="fit"
          />
        </q-card-section>
        <q-card-section v-else class="q-space q-py-none flex flex-center">
          当前服务没有注明明确的服务内容或条款，购买前请务必确认清楚！
        </q-card-section>
        <q-card-section class="row no-wrap gap-lg">
          <span class="flex flex-center font-large font-bold-600 text-negative">￥：{{ buy_project.price / 100 || $t('price_free') }}</span>
          <PayButton
            v-if="!is_paied"
            class="q-space" btnColor="negative"
            subject="project" :commodity="buy_project" buyLabel="buy_service"
            @buyData="buyData"
          />
          <q-btn v-else color="positive" class="q-space" :label="$t('buy_completed')" @click="refreshProject()" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="join_request" persistent>
      <JoinRequest :project="request_project" @close="join_request = false" />
    </q-dialog>
  </q-scroll-area>
</template>

<script setup>
import {computed, ref, toRefs, watch, watchEffect, nextTick, onMounted} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {fetch_userPreferences, getTeamMembers,} from "src/hooks/mattermost/useMattermost.js";
import {getChannelByID, updateChannel} from 'src/api/strapi/team.js'
import {getChannelByID as getMmChannelByID} from "src/api/mattermost.js";
import {getProjectNav} from "./SideNavigation.js";
import UnreadBlock from 'src/pages/team/components/widgets/UnreadBlock.vue'
import CreateProject from "./CreateProject.vue";
import {createChannel} from "src/pages/team/hooks/useCreateChannel.js";
import {useQuasar} from "quasar";
import {teamStore, uiStore, mm_wsStore } from 'src/hooks/global/useStore.js';
import {i18n} from 'src/boot/i18n.js';
import {
  enable_threads,
  enable_channel,
  enable_dashboard,
  enable_project,
  isExternal
} from "src/pages/team/hooks/useConfig.js";
import useProject from 'src/hooks/project/useProject.js';
import ChannelMenu from './ChannelMenu.vue'
import {updateUnreads} from 'src/pages/team/chat/hooks/useMm.js';
import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
import PayButton from 'src/components/order/PayButton.vue'
import JoinRequest from './JoinRequest.vue'

const props = defineProps({
  width: {
    type: Number,
    default: NaN,
  },
  team: {
    type: Object,
    default: null
  }
});
const emit = defineEmits(['refreshProject'])
const $t = i18n.global.t;

const { team } = toRefs(props);
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const heiglight = ref();

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

const getThumbnail = (project) => {
  const { thumbnail } = useProject(project)  
  return thumbnail
}

watchEffect(() => {
  if(isExternal.value || uiStore.isFocusMode){
    teamStore.mm_channel = void 0;
  }
})

const mm_team_id = computed(() => team.value.mm_team?.id);
const page = ref(0);
const per_page = ref(60);

watch(team, async() => {
  if (team.value) {
    await fetch_userPreferences(); // todo fixme: 被触发了两次
    await getTeamMembers(mm_team_id.value, page.value, per_page.value);    
    await updateUnreads();
  }
},{immediate:true,deep:false})

watch( mm_wsStore, async () => {
  await nextTick();
  // 判断消息类型
  const cur_mmChannel = route.params.mm_channel_id
  if (mm_wsStore?.event?.event === "posted") {
    let message = JSON.parse(mm_wsStore.event.data.post);
    if(message.message === '') return
    const index = uiStore.unreads?.channels?.findIndex(i => i.channel_id === message.channel_id);
    if(index > -1 && cur_mmChannel !== message.channel_id){
      uiStore.unreads.channels[index].msg_count++;

      uiStore.unreads.team.msg_count++;
    }
  }
}, { immediate: true, deep: true });

const buy_service = ref(false);
const buy_project = computed(() => teamStore.buy_project);
const request_project = ref(null);
const join_request = ref(false);
const enterProject = async (project) => {
  if (project?.auth && !project?.auth?.read) {
    if(project.roles?.length === 0){
      if(project.type === 'service'){
        buy_service.value = true;
        teamStore.buy_project = project;
      }else if(!project.is_project_member){
        if(project.allow_join_requests){
          request_project.value = project;
          join_request.value = true;
        } else {
          $q.notify($t('project_is_not_member'));
        }
      }
    }
    if(project.roles?.includes('unconfirmed')){
      $q.notify($t('project_is_unconfirmed'));
    }
    if(project.roles?.includes('blocked')) {
      $q.notify($t('project_is_blocked'));
    }
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

const emptyProject = () => {
  teamStore.project = void 0;
  teamStore.project_id = void 0;
}
const enterSubApp = (val) => {
  if(val === 'news'){
    router.push(`/teams/${teamStore.team.id}/news`);
  } else if(val === 'orders'){
    router.push(`/teams/${teamStore.team.id}/orders`);
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
  openCreateProject.value = false;
};

// 后续完善功能后开启
const enable_orders = ref(false);

const is_paied = ref(false);  
const buyData = (val) => {
  if(Number(val.state) === 2){
    is_paied.value = true
  } else {
    $q.notify({
      message: `error: ${val}`,
      color: 'negative',
      position: 'top',
    })
  }
}
const refreshProject = () => {
  uiStore.reINIT = true
  buy_service.value = false
}
</script>
