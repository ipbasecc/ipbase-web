<template>
  <template v-if="sidebarData">
    <q-expansion-item
      v-for="order in sidebarData.order"
      :key="order"
      :default-opened="__calc_collapsed(order)"
      dense
      switch-toggle-side
      expand-icon-toggle
      expand-icon-class="expand_icon q-pr-none"
      expand-icon="expand_less"
      icon="more_vert"
      header-class="hovered-item"
      content-inset-level="0.1"
      @update:model-value="
        updateSideBarCategoryCollapsed(__calc_categories(order))
      "
      class="full-width q-mb-sm"
    >
      <template v-slot:header>
        <q-item-section class="cursor-pointer">
          {{ displayName_to_CN(__calc_categories(order).display_name) }}
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            dense
            size="sm"
            round
            icon="more_vert"
            class="hover-show transition z-fab"
          >
            <q-menu class="radius-sm border">
              <q-list dense class="q-pa-xs radius-sm" style="min-width: 100px">
                <template v-if="__calc_categories(order).type === 'custom'">
                  <q-item clickable class="no-padding radius-xs">
                    <q-item-section class="no-padding">
                      <q-input
                        v-model="text_for_changeGroupName"
                        square
                        filled
                        dense
                        type="text"
                        placeholder="输入新分组名称"
                        class="no-padding"
                        @keyup.enter="
                          updateSideBarCategoryDisplayname(
                            __calc_categories(order)
                          )
                        "
                      >
                        <template v-if="text_for_changeGroupName" v-slot:append>
                          <q-btn
                            dense
                            size="sm"
                            round
                            flat
                            icon="check"
                            @click="
                              updateSideBarCategoryDisplayname(
                                __calc_categories(order)
                              )
                            "
                            v-close-popup
                          />
                        </template>
                      </q-input>
                    </q-item-section>
                  </q-item>
                  <q-separator spaced class="op-5" />
                </template>
                <q-item
                  clickable
                  v-close-popup
                  class="radius-xs"
                  @click="dialog('create_category')"
                >
                  <q-item-section side><q-icon name="list" /></q-item-section>
                  <q-item-section>新建分组</q-item-section>
                </q-item>
                <template
                  v-if="
                    __calc_categories(order).channel_ids.length === 0 &&
                    __calc_categories(order).type === 'custom'
                  "
                >
                  <q-separator spaced class="op-5" />
                  <q-item
                    clickable
                    v-close-popup
                    class="text-red radius-xs"
                    @click="deleteCategory(__calc_categories(order))"
                  >
                    <q-item-section side
                      ><q-icon name="delete_sweep" color="red"
                    /></q-item-section>
                    <q-item-section>删除分组</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </template>

      <template v-if="channels && preferences">
        <div
          v-for="channel_id in __calc_categories(order)
            .channel_ids.slice()
            .reverse()"
          :key="channel_id"
          class="column no-wrap gap-xs q-px-sm hovered-item"
          :class="
            mmStore.current_channel_id === channel_id
              ? 'op-none'
              : 'hover-highlight transition'
          "
        >
          <div
            v-if="isHide(channel_id)"
            class="row no-wrap items-center q-pa-xs q-pl-sm relative-position"
          >
            <q-icon
              v-if="__calc_channelType(channel_id) === 'O'"
              name="public"
              @click="changeChannel(__calc_channel(channel_id), channel_id)"
              :size="`${sidebar_iconSize}px`"
              class="cursor-pointer"
            />
            <q-icon
              v-if="__calc_channelType(channel_id) === 'P'"
              name="lock"
              @click="changeChannel(__calc_channel(channel_id), channel_id)"
              :size="`${sidebar_iconSize}px`"
              class="cursor-pointer"
            />
            <q-avatar
              v-if="__calc_channelType(channel_id) === 'G'"
              square
              :size="`${sidebar_iconSize + 2}px`"
              class="border radius-xs cursor-pointer"
            >
              {{
                __calc_groupMemberCount(channel_id)
              }}
              @click="changeChannel(__calc_channel(channel_id),channel_id)"
            </q-avatar>
            <UserAvatar
              v-if="
                channels &&
                __calc_channelType(channel_id) === 'D' &&
                user_status_ByChannelsNeed
              "
              :user_id="__calc_target_id(__calc_channel_nameField(channel_id))"
              :status="__calc_userStatus(channel_id)"
              :size="sidebar_iconSize"
              class="cursor-pointer"
            />
            <span
              @click="changeChannel(__calc_channel(channel_id), channel_id)"
              class="q-space cursor-pointer font-medium q-px-sm"
            >
              {{ __calc_channelName(channel_id) }}
            </span>
            <div class="row no-wrap items-center gap-xs">
              <unreadInticator :user_id="user_id" :channel_id="channel_id" />
              <q-btn
                flat
                dense
                size="sm"
                round
                icon="more_vert"
                class="hover-show transition"
              >
                <q-menu class="radius-sm border">
                  <q-list
                    dense
                    class="q-pa-xs radius-sm"
                    style="min-width: 100px"
                  >
                    <q-item
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click="
                        favoriteChannelFn(
                          __calc_category(order),
                          __calc_channel(channel_id)
                        )
                      "
                    >
                      <q-item-section side
                        ><q-icon name="bookmark_add"
                      /></q-item-section>
                      <q-item-section>{{
                        __calc_category(order).type == "favorites"
                          ? "取消收藏"
                          : "收藏"
                      }}</q-item-section>
                    </q-item>
                    <q-item clickable class="radius-xs">
                      <q-item-section side
                        ><q-icon name="swap_vert"
                      /></q-item-section>
                      <q-item-section>移动到</q-item-section>
                      <q-item-section side>
                        <q-icon name="keyboard_arrow_right" />
                      </q-item-section>
                      <q-menu
                        anchor="top end"
                        self="top start"
                        class="radius-sm border"
                      >
                        <q-list
                          dense
                          class="q-pa-xs radius-sm"
                          style="min-width: 100px"
                        >
                          <template
                            v-for="order_ofChange in move_toMenu(
                              channel_id,
                              order
                            )"
                            :key="order_ofChange"
                          >
                            <q-item
                              clickable
                              class="radius-xs"
                              @click="
                                changeCategory(
                                  __calc_category(order),
                                  __calc_category(order_ofChange),
                                  channel_id
                                )
                              "
                            >
                              <q-item-section>
                                {{
                                  displayName_to_CN(
                                    sidebarData.categories.find(
                                      (i) => i.id === order_ofChange
                                    ).display_name
                                  )
                                }}
                              </q-item-section>
                            </q-item>
                          </template>
                          <q-separator spaced dark />
                          <q-item
                            clickable
                            class="radius-xs"
                            @click="dialog('create_category')"
                          >
                            <q-item-section>新分组</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-item>
                    <q-separator
                      v-if="
                        __calc_channelType(channel_id) === 'D' ||
                        __calc_channelType(channel_id) === 'G'
                      "
                      spaced
                      class="op-5"
                    />
                    <q-item
                      v-if="__calc_channelType(channel_id) === 'D'"
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click="
                        hideDirectChat(
                          user_id,
                          __calc_target_id_ByChannelID(channel_id)
                        )
                      "
                    >
                      <div class="absolute-full bg-negative op-1"></div>
                      <q-item-section side
                        ><q-icon name="exit_to_app"
                      /></q-item-section>
                      <q-item-section>关闭对话</q-item-section>
                    </q-item>
                    <q-item
                      v-if="__calc_channelType(channel_id) === 'G'"
                      clickable
                      v-close-popup
                      class="radius-xs"
                      @click="hideGroupChat(user_id, channel_id)"
                    >
                      <div class="absolute-full bg-negative op-1"></div>
                      <q-item-section side
                        ><q-icon name="exit_to_app"
                      /></q-item-section>
                      <q-item-section>关闭群聊</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div
              v-if="mmStore.current_channel_id === channel_id"
              class="radius-xs absolute-full z-unfab"
              :class="'bg-primary-active'"
            />
          </div>
        </div>
      </template>
    </q-expansion-item>
  </template>

  <q-dialog
    v-model="show_dialog"
    persistent
    full-height
    transition-show="slide-down"
    transition-hide="slide-up"
    transition-duration="500"
  >
    <CreateCategory
      v-if="dialog_target === 'create_category'"
      :team_id="team_id"
      :user_id="user_id"
    />
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import {
  getUsersByIDs,
  getUserStatusBy_ids,
  getUseSidebarDataByTeam,
  getSidebarCategoryOrder,
  updateSidebarCategory,
  updateSidebarCategorys,
  getChannelByUserTeamID,
  getUserPreferences,
  updateUserPreferences,
  deleteSidebarCategorys,
  getTeamUnreads,
} from "src/api/mattermost.js";

import UserAvatar from "src/pages/Chat/components/wigets/UserAvatar.vue";
import CreateCategory from "src/pages/Chat/components/user/CreateCategory.vue";
import useMmws from "src/stores/mmws.js";
import useMmStore from "src/stores/mmstore.js";

import { defineAsyncComponent } from "vue";

const unreadInticator = defineAsyncComponent(() =>
  import("src/pages/Chat/components/wigets/unreadInticator.vue")
);

const mm_wsStore = useMmws();
const mmStore = useMmStore();

const props = defineProps({
  user_id: {
    type: String,
    default: "",
  },
  team_id: {
    type: String,
    default: "",
  },
});

// 获取用户偏好数据
const preferences = ref();
const visiableChannels_ids = ref();
const fetch_userPreferences = async () => {
  let res = await getUserPreferences(props.user_id);
  if (res) {
    preferences.value = res.data;

    let _visiable_directChannel = res.data
      .filter((i) => i.category === "direct_channel_show" && i.value != "false")
      .map((i) => i.name);
    let _visiable_directGroup = res.data
      .filter((i) => i.category === "group_channel_show" && i.value != "false")
      .map((i) => i.name);
    visiableChannels_ids.value = [
      ..._visiable_directChannel,
      ..._visiable_directGroup,
    ];
    // hiddenChannelIds.value = _hiddend_directChannel.map(i => i.name);
  }
  return res.data;
};
fetch_userPreferences();

// 获取用户频道
const channels = ref();
const fetch_UserChannles = async () => {
  let res = await getChannelByUserTeamID(props.user_id, props.team_id);
  if (res) {
    channels.value = res.data;
  }
  return res.data;
};
fetch_UserChannles();

//获取用户侧栏分组
const sidebarData = ref();
const fetch_UserSidebarData = async () => {
  let res = await getUseSidebarDataByTeam(props.user_id, props.team_id);
  if (res) {
    sidebarData.value = res.data;
  }
  return res.data;
};
fetch_UserSidebarData();

//获取用户侧栏分组
const sidebarDataOrder = ref();
const fetch_UserSidebarOrder = async () => {
  let res = await getSidebarCategoryOrder(props.user_id, props.team_id);
  if (res) {
    sidebarDataOrder.value = res.data;
  }
  return res.data;
};
fetch_UserSidebarOrder();

//获取指定id的所有用户
const user_data_ByChannelsNeed = ref();
const fetch_UsersByIds = async (ids) => {
  if (!ids) return;
  let res = await getUsersByIDs(ids);
  if (res) {
    console.log("ids", res);
    user_data_ByChannelsNeed.value = res.data;
  }
};

//获取指定id的所有用户的状态
const user_status_ByChannelsNeed = ref();
const fetch_UsersStatusByIds = async (ids) => {
  if (!ids) return;
  let res = await getUserStatusBy_ids(ids);
  if (res) {
    console.log("ids", res);
    user_status_ByChannelsNeed.value = res;
  }
};
// 计算私信频道用户ID集合，用来获取其头像、状态
const all_user_ids = computed(
  () =>
    channels.value?.length &&
    channels.value
      .filter((i) => i.type === "D")
      .map((i) => i.name.replace(props.user_id, "").replace("__", ""))
);
watch(
  all_user_ids,
  () => {
    if (all_user_ids.value?.length > 0) {
      fetch_UsersByIds(all_user_ids.value);
      fetch_UsersStatusByIds(all_user_ids.value);
    }
  },
  { immediate: true, deep: true }
);

const displayName_to_CN = (name) => {
  let cn_displayName;
  switch (name) {
    case "Favorites":
      cn_displayName = "收藏";
      break;
    case "Channels":
      cn_displayName = "频道";
      break;
    case "Direct Messages":
      cn_displayName = "私信";
      break;
    default:
      cn_displayName = name;
  }
  return cn_displayName;
};

//获取频道未读
const unreads = ref();
const get_unreads = async () => {
  let res = await getTeamUnreads(props.user_id);
  if (res) {
    unreads.value = res.data;
  }
};
get_unreads();

async function __calc_unreads(channel_id) {
  await get_unreads(channel_id).then((res) => {
    return res;
  });
}

const sidebar_iconSize = ref(24);
// watch([channels, sidebarData], async () => {
//   if (channels.value && sidebarData.value) {
//     let ids = channels.value
//       .filter(i => i.type === 'D')
//       .map(i => i.name.replace(props.user_id, '').replace('__', ''));

//     if(!ids) return
//     // console.log('ids',ids);
//     await fetch_UsersByIds(ids);
//     await fetch_UsersStatusByIds(ids);
//   }
// }, { immediate: true, deep: true })

//界面数据提取函数
//根据后端返回的侧栏数据 从order提取对应的分组
const Deleted_channel = computed(() => mmStore.Deleted_channel);
function __calc_categories(order) {
  if (Deleted_channel.value) {
    sidebarData.value.categories = sidebarData.value.categories.map((i) => {
      return {
        ...i,
        channel_ids: i.channel_ids.filter((c) => c != Deleted_channel.value),
      };
    });
  }
  return sidebarData.value.categories.find((i) => i.id === order);
}
//提取频道name字段
function __calc_channel_nameField(channel_id) {
  return channels.value.find((i) => i.id === channel_id).name;
}
//从私信频道ID中提取私信对象用户ID
function __calc_target_id_ByChannelID(channel_id) {
  return __calc_target_id(__calc_channel_nameField(channel_id));
}
//从私信频道名称中提取私信对象用户ID
function __calc_target_id(str) {
  // 判断字符串是否包含"__"，如果不包含，返回false
  if (!str.includes("__")) {
    return false;
  }
  // 用"__"分割字符串，得到两个子字符串
  let parts = str.split("__");
  // 判断两个子字符串是否相等，如果相等，返回true，否则返回false
  let id;
  if (parts[0] === parts[1]) {
    id = props.user_id;
  } else {
    id = parts.find((i) => i != props.user_id);
  }
  return id;
}
//从私信频道名称中判断私信是不是自己给自己的
function _calc_isMe(str) {
  // 判断字符串是否包含"__"，如果不包含，返回false
  if (!str.includes("__")) {
    return false;
  }
  // 用"__"分割字符串，得到两个子字符串
  let parts = str.split("__");
  // 判断两个子字符串是否相等，如果相等，返回true，否则返回false
  return parts[0] === parts[1];
}

//提取频道
const __calc_channel = (channel_id) => {
  return channels.value.find((channel) => channel.id === channel_id);
};
//提取并生成频道名称
const __calc_channelName = (channel_id) => {
  let name;
  if (channels.value.find((channel) => channel.id === channel_id).type != "D") {
    name = channels.value.find(
      (channel) => channel.id === channel_id
    ).display_name;
  } else {
    let channelName = __calc_channel_nameField(channel_id);
    let isMe = _calc_isMe(channelName);
    let target_id = isMe ? props.user_id : __calc_target_id(channelName);

    name =
      user_data_ByChannelsNeed.value?.find((i) => i.id === target_id).nickname ||
      user_data_ByChannelsNeed.value?.find((i) => i.id === target_id).username;
    if (isMe) {
      name = name + " - 您";
    }
  }
  return name;
};
//提取频道Type
function __calc_channelType(channel_id) {
  return channels.value.find((channel) => channel.id === channel_id)?.type;
}
//生成群聊成员数目
function __calc_groupMemberCount(channel_id) {
  return channels.value
    .find((channel) => channel.id === channel_id)
    .display_name.split(",").length;
}
//提取用户状态
const __calc_userStatus = (channel_id) => {
  let channel_name = channels.value.find((i) => i.id === channel_id).name;
  let direct_channel_id = __calc_target_id(channel_name);
  // console.log('channel_name',channel_name,'direct_channel_id',direct_channel_id);
  return user_status_ByChannelsNeed.value.find(
    (i) => i.user_id === direct_channel_id
  );
};
//根据返回的sidebarData数据获取分组
function __calc_category(order) {
  return sidebarData.value.categories.find((i) => i.id === order);
}
// 生成“移动到...”菜单数据
const move_toMenu = (channel_id, order) => {
  return sidebarData.value.order.filter(
    (i) =>
      (((__calc_channelType(channel_id) === "D" ||
        __calc_channelType(channel_id) === "G") &&
        !i.includes("channels")) ||
        ((__calc_channelType(channel_id) === "O" ||
          __calc_channelType(channel_id) === "P") &&
          !i.includes("direct_messages"))) &&
      i != order
  );
};
// 判断频道是否被隐藏
function isHide(channel_id) {
  let __isHide;
  let channel_type = __calc_channelType(channel_id);
  if (channel_type === "P" || channel_type === "O") {
    __isHide = true;
  } else {
    // 偏好中条目的name - 群聊：群聊的频道ID / 私信：私信对象的用户ID
    let pfrs_i_name;
    if (channel_type === "D") {
      pfrs_i_name = __calc_target_id_ByChannelID(channel_id);
    } else if (channel_type === "G") {
      pfrs_i_name = channel_id;
    }
    __isHide = visiableChannels_ids.value.includes(pfrs_i_name);
  }
  return __isHide;
}

function __calc_collapsed(order) {
  return !__calc_categories(order).collapsed;
}

// 用户操作部分
//修改分组折叠状态
// const is_local_event = ref(false);
const updateSideBarCategoryCollapsed = async (category) => {
  if (category.channel_ids.length === 0) return;

  //设置本地事件，ws收到更新后，如果是本地事件，不要触发更新数据行为，1.浪费、2.有图像的时候重加载画面会闪烁
  //   is_local_event.value = true;
  console.log("切换折叠");
  let parmars = Object.assign({}, category);
  //切换折叠状态
  parmars.collapsed = !parmars.collapsed;

  //提交修改
  let res = await updateSidebarCategory(
    props.user_id,
    props.team_id,
    category.id,
    parmars
  );
  if (res) {
    //不希望通过接收ws来触发更新sidebar数据事件，这里手动更新，避免更新sidebar事件是头像重加载
    // category.collapsed = !category.collapsed;
    setTimeout(() => {
      //延迟后关闭本地事件指示，确保触发响应ws事件
      //   is_local_event.value = false;
    }, 600);
  }
  // changeTeam(props.team_id);
};
// 隐藏私聊频道
const hideDirectChat = async (user_id, name) => {
  const parmars = [
    {
      user_id: props.user_id,
      category: "direct_channel_show",
      name: name,
      value: "false",
    },
  ];
  let res = await updateUserPreferences(props.user_id, parmars);
  if (res) {
    fetch_userPreferences();
  }
};
// 显示私聊频道
const showDirectChat = async (user_id, name) => {
  const parmars = [
    {
      user_id: props.user_id,
      category: "direct_channel_show",
      name: name,
      value: "true",
    },
  ];
  let res = await updateUserPreferences(props.user_id, parmars);
  if (res) {
    fetch_userPreferences();
  }
  return res;
};
// 隐藏群聊频道
const hideGroupChat = async (user_id, name) => {
  const parmars = [
    {
      user_id: props.user_id,
      category: "group_channel_show",
      name: name,
      value: "false",
    },
  ];
  let res = await updateUserPreferences(user_id, parmars);
  if (res) {
    fetch_userPreferences();
  }
};
// 显示群聊频道
const showGroupChat = async (user_id, name) => {
  const parmars = [
    {
      user_id: props.user_id,
      category: "group_channel_show",
      name: name,
      value: "true",
    },
  ];
  let res = await updateUserPreferences(user_id, parmars);
  if (res) {
    fetch_userPreferences();
  }
  return res;
};

//分类
const text_for_changeGroupName = ref("");

// 收藏
const favoriteChannelFn = (cur_category, channel) => {
  let target_category;
  if (cur_category.type === "favorites") {
    if (channel.type === "D" || channel.type === "G") {
      target_category = sidebarData.value.categories.find(
        (i) => i.type === "direct_messages"
      );
    } else {
      target_category = sidebarData.value.categories.find(
        (i) => i.type === "channels"
      );
    }
  } else {
    target_category = sidebarData.value.categories.find(
      (i) => i.type === "favorites"
    );
  }
  console.log(target_category);
  changeCategory(cur_category, target_category, channel.id);
};
//移动分类
const changeCategory = async (cur, target, channel_id) => {
  console.log("target.collapsed", target.collapsed);
  let parmars = [cur, target];
  if (cur.channel_ids.includes(channel_id)) {
    parmars[0].channel_ids = parmars[0].channel_ids.filter(
      (i) => i != channel_id
    );
  }
  if (!target.channel_ids.includes(channel_id)) {
    parmars[1].channel_ids.push(channel_id);
  }

  //开始提交修改
  let res = await updateSidebarCategorys(props.user_id, props.team_id, parmars);
  if (res) {
    //如果目标分组是折叠状态、将其展开
    if (target.collapsed) {
      //     target.collapsed = !target.collapsed
      // console.log('target.collapsed',target.collapsed);
      await updateSideBarCategoryCollapsed(target);
    }
  }
};
//删除分类
const deleteCategory = async (category) => {
  if (category.type != "custom") return "不能删除内置分组";
  if (category.channel_ids.length > 0) {
    $q.notify("分组下有频道，请移动后再删除分组");
    return;
  }

  let category_id = category.id;
  await deleteSidebarCategorys(props.user_id, props.team_id, category_id);
};
//分类改名
const updateSideBarCategoryDisplayname = async (category) => {
  if (category.type != "custom") return "不能修改内置分组";
  //设置本地事件，ws收到更新后，如果是本地事件，不要触发更新数据行为，1.浪费、2.有图像的时候重加载画面会闪烁
  //   is_local_event.value = true;

  let parmars = Object.assign({}, category);
  if (parmars.channels) {
    delete parmars.channels;
  }

  parmars.display_name = text_for_changeGroupName.value;

  let res = await updateSidebarCategory(
    props.user_id,
    props.team_id,
    category.id,
    parmars
  );
  if (res) {
    //不希望通过接收ws来触发更新sidebar数据事件，这里手动更新，避免更新sidebar事件时头像重加载
    category.display_name = text_for_changeGroupName.value;
    text_for_changeGroupName.value = "";
    setTimeout(() => {
      //   is_local_event.value = false;
    }, 600);
  }
  // changeTeam(props.team_id);
};

const show_dialog = ref(false);
const dialog_target = ref();
const dialog = (val) => {
  dialog_target.value = val;
  show_dialog.value = true;
};

const emit = defineEmits(["changeChannel"]);
const changeChannel = (channel, channel_id) => {
  mmStore.channel = channel;
  emit("changeChannel", channel_id);
};

watch(mm_wsStore, () => {
  // console.log(mm_wsStore.event);
  const fetch_sidebar_events = [
    "group_added",
    "sidebar_category_created",
    "sidebar_category_deleted",
    "sidebar_category_updated",
    "sidebar_category_order_updated",
    "channel_member_updated",
    "channel_converted",
  ];
  const fetch_Preferences_events = [
    "preference_changed",
    "preferences_changed",
    "preferences_deleted",
  ];

  let ws_event = mm_wsStore.event?.event || null;
  if (!ws_event) return;

  if (fetch_sidebar_events.includes(ws_event)) {
    fetch_UserSidebarData();
  }

  if (fetch_Preferences_events.includes(ws_event)) {
    fetch_userPreferences();
  }
});
</script>
