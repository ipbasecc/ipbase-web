<template>
  <q-layout view="lHr LpR lfr" container>
    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      :width="240"
      side="left"
      :class="$q.dark.mode ? '' : 'bg-sidebar-lighter text-white'"
    >
      <div class="fit column no-wrap gap-md border-right">
        <q-toolbar class="q-px-sm transparent">
          <q-btn v-if="activedTeam" flat dense padding="xs sm" no-caps dark>
            <div class="q-pr-sm font-bold-600">
              {{ activedTeam.display_name }}
            </div>
            <q-icon name="expand_more" />
            <q-menu
              transition-show="jump-up"
              transition-hide="jump-down"
              :offset="[0, -32]"
              class="shadow-0"
              style="min-width: 200px"
            >
              <q-list
                bordered
                style="min-width: 200px"
                class="shadow-12 radius-xs q-py-sm"
              >
                <q-item clickable v-close-popup @click="dialog('team_setting')">
                  <q-item-section side><q-icon name="tune" /></q-item-section>
                  <q-item-section>团队设置</q-item-section>
                </q-item>
                <q-separator spaced dark />
                <q-item clickable v-close-popup @click="show_invite = true">
                  <q-item-section side
                    ><q-icon name="person_add"
                  /></q-item-section>
                  <q-item-section>邀请成员</q-item-section>
                </q-item>
                <q-separator spaced dark />
                <q-item
                  clickable
                  v-close-popup
                  class="text-red"
                  @click="leaveTeam()"
                >
                  <q-item-section side
                    ><q-icon name="person_add"
                  /></q-item-section>
                  <q-item-section>离开团队</q-item-section>
                </q-item>
                <q-separator spaced dark />
                <q-item
                  clickable
                  v-close-popup
                  v-for="i in teams"
                  :key="i.id"
                  @click="changeTeam(i.id)"
                >
                  <q-item-section>{{ i.display_name }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-space />
          <!-- 团队按钮 + 号 -->
          <q-btn round dense size="sm" icon="add">
            <q-menu
              transition-show="jump-up"
              transition-hide="jump-down"
              :offset="[0, -32]"
              class="shadow-0"
              style="min-width: 200px"
            >
              <q-list
                bordered
                style="min-width: 200px"
                class="shadow-12 radius-xs q-py-sm"
              >
                <q-item
                  clickable
                  v-close-popup
                  @click="$router.push('/create_team')"
                >
                  <q-item-section side
                    ><q-icon name="mdi-chart-bubble"
                  /></q-item-section>
                  <q-item-section>新建团队</q-item-section>
                </q-item>
                <template v-if="activedTeam">
                  <q-item
                    clickable
                    v-close-popup
                    @click="dialog('create_channel')"
                  >
                    <q-item-section side
                      ><q-icon name="diversity_3"
                    /></q-item-section>
                    <q-item-section>新建频道</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="dialog('create_group')"
                  >
                    <q-item-section side
                      ><q-icon name="forum"
                    /></q-item-section>
                    <q-item-section>新建群聊</q-item-section>
                  </q-item>
                  <q-separator spaced dark />
                  <q-item
                    clickable
                    v-close-popup
                    @click="dialog('create_category')"
                  >
                    <q-item-section side><q-icon name="list" /></q-item-section>
                    <q-item-section>新建分组</q-item-section>
                  </q-item>
                  <q-separator spaced dark />
                  <q-item clickable v-close-popup @click="show_invite = true">
                    <q-item-section side
                      ><q-icon name="person_add"
                    /></q-item-section>
                    <q-item-section>邀请成员</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
        <template v-if="activedTeam">
          <q-list dense class="q-px-sm">
            <q-item
              class="radius-xs hovered-item transition"
              clickable
              v-ripple
              @click="changeChannel('threads')"
            >
              <q-item-section side class="q-pr-sm">
                <q-icon name="chat" />
              </q-item-section>
              <q-item-section>Threads</q-item-section>
              <!-- 下方 div 激活后会覆盖在上层，1. 调整样式 2.防止重复点击 -->
              <div
                v-if="
                  activedChannelId == 'threads' ||
                  mmStore.current_channel_id == 'threads'
                "
                class="radius-xs absolute-full"
                :class="'bg-primary-active'"
              />
            </q-item>
          </q-list>
          <q-scroll-area class="q-space">
            <SidebarCategory
              :key="activedTeamId"
              :user_id="uid"
              :team_id="activedTeamId"
              @changeChannel="changeChannel"
            />
          </q-scroll-area>
        </template>
      </div>
      <GenrateInvitelink
        v-if="show_invite"
        :team_id="activedTeam.id"
        :team="activedTeam"
        @closeInvite="closeInvite"
      />
      <q-dialog
        v-model="show_dialog"
        persistent
        full-height
        transition-show="slide-down"
        transition-hide="slide-up"
        transition-duration="500"
      >
        <EditTeam v-if="dialog_target === 'team_setting'" :team="activedTeam" />
        <CreateGroup
          v-if="dialog_target === 'create_group'"
          :team_id="activedTeamId"
          @group_created="group_created"
        />
        <CreateCategory
          v-if="dialog_target === 'create_category'"
          :team_id="activedTeamId"
          :user_id="uid"
        />
        <CreateChannel
          v-if="dialog_target === 'create_channel'"
          :team="activedTeam"
        />
      </q-dialog>
    </q-drawer>

    <q-drawer v-if="false" v-model="rightDrawerOpen" :width="240" side="right">
      {{ mm_wsStore.ws }}
    </q-drawer>

    <q-page-container>
      <q-page>
        <div :key="activedTeamId" class="absolute-full">
          <q-resize-observer @resize="onResize" />
          <q-splitter
            v-if="!loading && splitterLimits"
            v-model="splitterModel"
            unit="px"
            :limits="splitterLimits"
            class="fit overflow-hidden"
            :separator-class="
              mmStore.extend_pannel_target ? 'bg-black' : 'transparent'
            "
            :separator-style="mmStore.extend_pannel_target ? 'width: 3px' : ''"
          >
            <template v-slot:before>
              <div v-if="activedChannelId" class="absolute-full">
                <router-view
                  :key="activedChannelId"
                  @goDirectChat="goDirectChat"
                />
              </div>
              <div v-else class="absolute-full column flex-center">
                <div class="column no-wrap gap-sm items-center op-5">
                  <q-img
                    src="../../../public/logo.png"
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="82px"
                  />
                  <span>从左侧选择一个频道参与讨论吧！</span>
                </div>
              </div>
            </template>
            <template v-slot:after>
              <FlagsContainder
                v-if="mmStore.extend_pannel_target === 'flaggeds'"
              />
              <template v-if="activedChannelId != 'threads'">
                <ThreadContainer
                  v-if="
                    actived_thread &&
                    thread &&
                    mmStore.extend_pannel_target === 'threads'
                  "
                  :thread_channel_id="thread_channel_id"
                  :thread_post_id="thread_post_id"
                  :thread="thread"
                  :hasMore_thread_Msgs="hasMore_thread_Msgs"
                  @closeThreads="closeThreads"
                  :key="activedChannelId"
                />
                <MembersContainder
                  v-if="mmStore.extend_pannel_target === 'members'"
                  :channel_id="activedChannelId"
                  :key="activedChannelId"
                />
                <PinnedsContainder
                  v-if="mmStore.extend_pannel_target === 'pinneds'"
                  :channel_id="activedChannelId"
                  :key="activedChannelId"
                />
                <AttributeContainer
                  v-if="mmStore.extend_pannel_target === 'attribute'"
                  :channel_id="activedChannelId"
                  :key="activedChannelId"
                />
              </template>
            </template>
          </q-splitter>
          <div v-else class="fit column flex-center">
            正在获取数据，请稍候...
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {
  ref,
  watch,
  onUnmounted,
  watchEffect,
  onBeforeMount,
  onMounted,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import {
  getUser,
  getCurUserTeams,
  getTeam,
  getMembersByTeamID,
  getUsersByIDs,
  getThread,
  deleteTeamUser,
} from "src/api/mattermost.js";

import { _ws, closeWs } from "src/pages/Chat/ws.js";

import mmMmStore from "src/stores/mmstore.js";
import useMmuser from "src/stores/mmuser.js";
import useMmws from "src/stores/mmws.js";
import useProjectStore from "src/stores/project.js";

import ThreadContainer from "src/pages/Chat/components/ThreadContainer.vue";
import FlagsContainder from "src/pages/Chat/components/FlagsContainder.vue";
import MembersContainder from "src/pages/Chat/components/MembersContainder.vue";
import PinnedsContainder from "src/pages/Chat/components/PinnedsContainder.vue";
import AttributeContainer from "src/pages/Chat/components/AttributeContainer.vue";
import GenrateInvitelink from "src/pages/Chat/components/Team/GenrateInvitelink.vue";
import EditTeam from "src/pages/Chat/components/Team/EditTeam.vue";
import CreateGroup from "src/pages/Chat/components/Team/CreateGroup.vue";
import CreateCategory from "src/pages/Chat/components/user/CreateCategory.vue";
import CreateChannel from "src/pages/Chat/components/Team/CreateChannel.vue";
import SidebarCategory from "src/pages/Chat/components/SidebarCategory.vue";
import localforage from "localforage";

import { useQuasar } from "quasar";

const $q = useQuasar();
const mm_wsStore = useMmws();
const mmuser = useMmuser();
const mmStore = mmMmStore();
const projectStore = useProjectStore();

const router = useRouter();
const route = useRoute();
const uid = ref(localStorage.getItem("mmUserId") || null);
const mmtoken = ref(localStorage.getItem("mmtoken") || null);

onMounted(() => {
  _ws();
});

const teams = ref();
const activedChannelId = ref();
const activedTeam = ref();
const activedTeamId = ref();
localforage
  .getItem("__mm_last_team")
  .then((res) => {
    activedTeamId.value = res;
  })
  .catch((e) => {
    console.error(e);
  });

const loading = ref(false);
const no_team = ref(true);

const getTeamFn = async (team_id) => {
  let res = await getTeam(team_id);
  if (res) {
    activedTeam.value = res.data;
    activedTeamId.value = res.data.id;
    mmStore.team = res.data;
    mmStore.current_team_id = team_id;
    mmStore.current_teamName = res.data.name;
    return res;
  }
};

const changeTeam = async (team_id) => {
  await localforage.setItem("__mm_last_team", team_id);
  let res = await getTeamFn(team_id);
  if (res?.data) {
    router.push(`/chat/${res.data.name}`);
    await getTeamMembers(team_id);
    // 自动进入上次访问的频道
    let last_channel = await localforage.getItem(
      `__mm_lastChannel_of_${team_id}`
    );
    console.log(last_channel);
    if (last_channel) {
      changeChannel(last_channel);
    } else {
      activedChannelId.value = null;
      mmStore.current_channel_id = null;
      mmStore.channel = null;
    }
  }
};
const init = async () => {
  const loginFn = async () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!localStorage.getItem("mmtoken") || !localStorage.getItem("mmUserId")) {
    loginFn();
    return;
  }
  let res = await getCurUserTeams(uid.value);
  if (res) {
    loading.value = false;

    if (res.data.length === 0) {
      no_team.value = true;
      return;
    }
    teams.value = res.data;
    if (activedTeamId.value) {
      changeTeam(activedTeamId.value);
    } else {
      changeTeam(teams.value[0].id);
    }
  } else {
    setTimeout(() => {
      loading.value = true;
    }, 600);
  }
};

init();

onBeforeMount(() => {
  projectStore.rightDrawerOpen = false;
});

const changeChannel = (channel_id) => {
  // console.log('channel',channel_id);
  activedChannelId.value = channel_id;
  mmStore.current_channel_id = channel_id;
  // console.log('s_channel',mmStore.current_channel_id);

  localforage.setItem(
    `__mm_lastChannel_of_${activedTeam.value.id}`,
    channel_id
  );
  if (channel_id == "threads") {
    router.push(
      `/chat/${activedTeam.value.name}/${uid.value}/${activedTeamId.value}/threads`
    );
  } else {
    router.push(`/chat/${activedTeam.value?.name}/${channel_id}`);
  }
};

// watch(mmStore,() => {
//   if(mmStore.current_channel_id) {
//     if(mmStore.current_channel_id == 'threads'){
//       router.push(`/chat/${activedTeam.value.name}/${uid.value}/${activedTeamId.value}/threads`);
//     } else {
//       router.push(`/chat/${activedTeam.value?.name}/${mmStore.current_channel_id}`)
//     }
//   }
// },{immediate:true,deep:true})

const team_members = ref();
const getTeamMembers = async (team_id) => {
  let res = await getMembersByTeamID(team_id);
  if (res) {
    team_members.value = res.data;
    let resps = await getUsersByIDs(res.data.map((i) => i.user_id));
    if (resps) {
      for (let user of team_members.value) {
        user.profile = resps.data.find((i) => i.id === user.user_id);
      }
      mmuser.members = team_members.value;
    }
  }
};

const goDirectChat = (val, target) => {
  let targetChannel = channels.value.data.find((i) => i.id == val.id);
  changeChannel(targetChannel);
};

// 点击messge开始处理主题
const thread_channel_id = ref();
const thread_post_id = ref();
const thread = ref();
const hasMore_thread_Msgs = ref();
const actived_thread = ref();
const getThreadFn = async (i) => {
  if (i.type) return;
  actived_thread.value = i.id;
  thread_channel_id.value = i.channel_id;
  thread_post_id.value = i.id;

  // 附加用户资料 - 头像、名字等
  const attach_profile = async (val) => {
    let arr = val;
    let resps = await getUsersByIDs(arr.map((i) => i.user_id));
    if (resps) {
      for (let user of arr) {
        user.profile = resps.data.find((i) => i.id === user.user_id);
      }
    }
    return arr;
  };

  let res = await getThread(i.id);
  if (res) {
    // thread.value = res.data;
    let obj = res.data;
    hasMore_thread_Msgs.value = res.data.length === 20;
    // 定义一个空数组来存储新的数组
    let new_array = [];

    // 遍历obj.order数组，对于每个元素，获取其对应的key值
    for (let element of obj.order) {
      let key = element;
      // 如果obj.posts中存在该key值，获取其对应的value内容
      if (obj.posts.hasOwnProperty(key)) {
        let value = obj.posts[key];
        // 将value内容添加到new_array数组中
        new_array.push(value);
      }
      if (obj.order.length === new_array.length) {
        let _withProfile = await attach_profile(new_array);
        if (_withProfile) {
          thread.value = _withProfile;
          return thread.value;
        }
      }
    }
  }
};

watch(
  mmStore,
  () => {
    if (mmStore.thread) {
      getThreadFn(mmStore.thread);
    }
  },
  { immediate: true, deep: true }
);

const closeThreads = () => {
  // 临时存储thread的宽度，因为关闭后会触发宽度改变从而修改store中宽度的值，100mms之后再该回来，这样用户再次打开thread时，宽度还会维持上此关闭时的宽度
  let num = Math.ceil(splitterModel.value);
  mmStore.extend_pannel_target = null;
  actived_thread.value = null;
  thread_channel_id.value = null;
  thread_post_id.value = null;
  mmStore.thread = null;
  mmStore.actived_thread = null;
  setTimeout(() => {
    mmStore.extend_pannel_width = num;
  }, 100);
};

const splitterModel = ref(NaN);
const splitterLimits = ref([640, 960]);
// const splitterUpdate = () => {
//   // mmStore.extend_pannel_width = Math.ceil(splitterModel.value);
//   localforage.setItem('__main_splitterModel',Math.ceil(splitterModel.value));
// }

const chatSize = ref();
const onResize = (size) => {
  chatSize.value = size;
};

watch(
  [chatSize, mmStore],
  async () => {
    if (chatSize.value) {
      let chat_body_width;
      let chat_pannel_width = 420;

      const get_local_width = async () => {
        try {
          let val = await localforage.getItem("__main_splitterModel");
          chat_body_width = val ? val : NaN;
        } catch (err) {
          // handle error
        }
      };

      if (mmStore.extend_pannel_target) {
        await get_local_width();

        splitterModel.value = chat_body_width
          ? chat_body_width
          : chatSize.value.width - chat_pannel_width;
        splitterLimits.value = [640, chatSize.value.width - chat_pannel_width];
      } else {
        splitterModel.value = chatSize.value.width;
        splitterLimits.value = [chatSize.value.width, Infinity];
      }
    }
  },
  { immediate: true, deep: true }
);

watch(
  splitterModel,
  () => {
    if (splitterModel.value) {
      localforage.setItem(
        "__main_splitterModel",
        Math.ceil(splitterModel.value)
      );
    }
  },
  { immediate: false, deep: true }
);

const toggle_extend_pannel = (val) => {
  mmStore.extend_pannel_target =
    mmStore.extend_pannel_target != val ? val : null;
  mmStore.extend_pannel_target_history.push(mmStore.extend_pannel_target);
};

const group_created = () => {
  show_dialog.value = false;
};

const leaveTeam = async () => {
  let res = await deleteTeamUser(activedTeamId.value, uid.value);
  if (res) {
  }
};

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};
const show_invite = ref(false);
const closeInvite = () => {
  show_invite.value = false;
};

const show_dialog = ref(false);
const dialog_target = ref();
const dialog = (val) => {
  dialog_target.value = val;
  show_dialog.value = true;
};

watch(
  [uid, mmtoken],
  async () => {
    if (uid.value && mmtoken.value) {
      mmuser.user_id = uid.value;
    }
  },
  { immediate: true, deep: true }
);

// 在组件卸载后需要关闭ws连接
onUnmounted(() => {
  closeWs();
});

watchEffect(() => {
  activedChannelId.value = mmStore?.current_channel_id;
});

watch(
  route,
  () => {
    if (route && route.params?.channel_id) {
      activedChannelId.value = route.params.channel_id;
    }
  },
  { immediate: true, deep: true }
);

const mm_profile = ref();
let mm_me = async () => {
  try {
    let _ = await localforage.getItem("mm_profile");
    if (_) {
      mmuser.user = _;
      mm_profile.value = _;
    } else {
      let res = await getUser(uid.value);
      if (res) {
        // console.log((res.data));
        mmuser.user = res.data;
      }
    }
  } catch (error) {}
};
mm_me();
</script>
<style scoped>
.main-channel-list {
  width: 240px;
}
</style>
