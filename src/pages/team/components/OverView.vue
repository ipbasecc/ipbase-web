<template>
  <OverviewMedia
    v-if="onlyMedia"
    :current_version="current_version"
    :mediaWidth="mediaWidth"
    class="fit"
    @mediaChanged="mediaChanged"
  />
  <div
    v-else
    v-bind="$attrs"
    class="fit column no-wrap gap-sm relative-position q-pb-sm"
    :class="isClassroom ? 'absolute-full' : ''"
  >
    <OverviewMedia
      v-if="!hideMedia"
      :current_version="current_version"
      :isClassroom
      @mediaChanged="mediaChanged"
    />
    <div
      class="column no-wrap q-px-sm gap-sm q-pt-sm"
      :class="isClassroom ? 'q-pb-sm' : ''"
    >
      <OverviewName v-if="name" :wasAttached_to="wasAttached_toRef" />
      <OverviewDesc
        v-if="wasAttached_toRef === 'project'"
        :wasAttached_to="wasAttached_toRef"
      />
    </div>
    <div
      v-if="!isClassroom"
      class="row no-wrap gap-md items-center justify-between q-mx-sm"
    >
      <OverviewStart
        :wasAttached_to="wasAttached_toRef"
        :current_version="current_version"
        @startChanged="startChanged"
      />
      <OverviewEnd
        :wasAttached_to="wasAttached_toRef"
        :current_version="current_version"
        @endChanged="endChanged"
      />
      <OverviewDeadline
        :wasAttached_to="wasAttached_toRef"
        :current_version="current_version"
        @deadlineChanged="deadlineChanged"
      />
    </div>
    <div
      class="row no-wrap gap-md q-pa-sm q-mx-sm items-center radius-xs border"
    >
      <template v-if="calc_auth('overview', 'start', authBase.of)">
        <span
          v-if="!version_update_ing"
          class="q-space q-ml-sm"
          @dblclick="version_update_ing = current_version?.id"
        >
          {{ $t(current_version?.name) }}
          <q-tooltip
            class="bg-black text-white"
            anchor="top left"
            self="bottom start"
          >
            {{ $t('double_click_change_name') }}
          </q-tooltip>
        </span>
      </template>
      <span v-else class="q-space q-ml-sm">
        {{ $t(current_version?.name) }}
      </span>
      <q-input
        v-if="version_update_ing === current_version?.id"
        v-model="_input_text"
        dense
        square
        :placeholder="current_version?.name"
        type="text"
        class="q-space"
        @keyup.esc="version_update_ing = false"
        @blur="updateVersionBlur(_input_text, current_version?.name)"
        @keyup.enter="updateVersionFn(current_version?.id)"
        @keyup.ctrl.enter="updateVersionFn(current_version?.id)"
      >
        <template v-slot:append>
          <q-btn
            dense
            flat
            round
            size="sm"
            icon="check"
            @click="updateVersionFn(current_version?.id)"
          />
        </template>
      </q-input>
      <q-btn dense flat icon="expand_more">
        <q-menu class="transparent shadow-12" ref="versionListMenuRef">
          <q-list
            dense
            bordered
            class="q-pa-xs radius-sm column no-wrap gap-xs"
            :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'"
            style="min-width: 9rem"
          >
            <template
              v-if="
                calc_auth(authBase.collection, 'modify', authBase.of)
              "
            >
              <q-item class="radius-xs" clickable v-close-popup @click="version_update_ing = current_version?.id">
                <q-item-section side>
                  <ReName />
                </q-item-section>
                <q-item-section>{{ $t('change_version_name') }}</q-item-section>
                <q-item-section side />
              </q-item>
              <q-separator
                v-if="overView_attachedTo.overviews?.length > 0"
                spaced
              />
            </template>
            <template v-if="overView_attachedTo.overviews?.length > 0">
              <q-item
                v-for="(i,index) in overView_attachedTo.overviews"
                :key="i.id"
                class="radius-xs"
                clickable
                @click="set_current_version(i.id)"
                :class="current_version.id === i.id ? 'bg-primary' : ''"
                v-close-popup
              >
                <q-item-section side>
                  <q-avatar size="sm">{{ index }}</q-avatar>
                </q-item-section>
                <q-item-section>{{ i.name }}</q-item-section>
                <q-item-section
                  side
                  v-if="
                    calc_auth(
                      authBase.collection,
                      'default_version',
                      authBase.of
                    )
                  "
                >
                  <q-btn dense size="sm" flat round icon="star" :color="overView_attachedTo.default_version === i.id
                        ? 'yellow'
                        : ''"
                    :disable="!calc_auth(authBase.collection, 'default_version', authBase.of)"
                    @click.stop="set_defaultVersion(i.id)"
                  />
                </q-item-section>
              </q-item>
            </template>
            <template v-if="calc_auth(authBase.collection, 'create_version', authBase.of)">
              <q-separator v-if="overView_attachedTo.overviews?.length > 0" spaced />
              <q-item class="radius-xs no-padding">
                <q-item-section class="q-pa-none radius-xs overflow-hidden">
                  <q-input
                      v-model="_input_text"
                      dense square filled :label="$t('add_version')" :placeholder="$t('version_name')" type="text"
                      @keyup.esc="_input_text = ''"
                      @keydown.enter.stop="newVersion"
                  >
                    <template v-slot:append>
                      <q-btn
                          dense flat round size="sm" icon="check" :class="_input_text ? '' : 'op-0'"
                          @click="newVersion"
                      />
                    </template>
                  </q-input>
                </q-item-section>
              </q-item>
            </template>
            <template
              v-if="
                overView_attachedTo.overviews?.length > 1 &&
                calc_auth(authBase.collection, 'remove_version', authBase.of)
              "
            >
              <q-separator spaced />
              <q-item
                class="radius-xs text-red"
                clickable
                @click="removeVersion(current_version.id)"
                v-close-popup
              >
                <q-item-section side
                  ><q-avatar size="sm"
                    ><q-icon name="close" color="red" /></q-avatar
                ></q-item-section>
                <q-item-section>{{ $t('remove_this_version') }}</q-item-section>
                <q-item-section side></q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="column no-wrap q-px-sm gap-sm q-pt-sm q-space overflow-hidden">
      <CardContent
        v-if="wasAttached_toRef === 'card'"
        :wasAttached_to="wasAttached_toRef"
      />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  toRef,
  computed,
  watchEffect,
  provide, toRefs, onBeforeMount,
} from 'vue';
import {
  updateProject,
  updateCard,
  addVersion,
  updateVersion,
  deleteVersion,
} from "src/api/strapi/project.js";

import OverviewMedia from "./widgets/OverviewMedia.vue";
import OverviewName from "./widgets/OverviewName.vue";
import CardContent from "./widgets/CardContent.vue";
import OverviewDesc from "./widgets/OverviewDesc.vue";
import OverviewStart from "./widgets/OverviewStart.vue";
import OverviewEnd from "./widgets/OverviewEnd.vue";
import OverviewDeadline from "./widgets/OverviewDeadline.vue";
import ReName from "./widgets/icons/ReName.vue";

import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { useQuasar } from "quasar";
import {
  userStore,
  mm_wsStore,
  teamStore,
  uiStore,
} from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const $q = useQuasar();
const userId = computed(() => teamStore.init?.id);

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
  onlyMedia: {
    type: Boolean,
    default: false,
  },
  hideMedia: {
    type: Boolean,
    default: false,
  },
  current_versionRef: {
    type: Object,
    default: null,
  }
});
const { current_versionRef } = toRefs(props)
const emit = defineEmits(['current_version'])
const wasAttached_toRef = toRef(props, "wasAttached_to");
const isShared = computed(() => uiStore.isShared)
const name = computed(() =>
  wasAttached_toRef.value === "project"
    ? teamStore.project?.name
    : teamStore.card?.name
);
const isClassroom = computed(
  () =>
    wasAttached_toRef.value === "card" && teamStore.card?.type === "classroom"
);

const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card && !isShared.value) {
    const members = teamStore.card?.card_members?.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  } else {
    res = {
      collection: "card",
      of: "project",
    };
  }
  return res;
});

provide("authBase", authBase.value);

const belonged_project = ref();
watchEffect(() => {
  belonged_project.value =
    teamStore.project || teamStore.card?.belonged_project;
});

const overView_attachedTo = computed(() =>
  wasAttached_toRef.value === "project" ? teamStore.project : teamStore.card
);

const versionListMenuRef = ref();
const current_version = ref();
watchEffect(() => {
  current_version.value = current_versionRef.value
})
const getCurrentVersion = () => {
  // console.log("getCurrentVersion");
  current_version.value =
    overView_attachedTo.value?.overviews?.find(
      (i) => i.id === overView_attachedTo.value?.default_version
    ) ||
    overView_attachedTo.value?.overviews[overView_attachedTo.value?.overviews?.length - 1] ||
    void 0;
};
onBeforeMount(() => {
  getCurrentVersion();
})

const set_current_version = (id) => {
  current_version.value = overView_attachedTo.value.overviews.find(
    (i) => i.id === id
  );
  emit("current_version", current_version.value);
};

const removeVersion = async (id) => {
  let attach_to_id =
    wasAttached_toRef.value === "project"
      ? belonged_project.value?.id
      : teamStore.card?.id;
  let res = await deleteVersion(attach_to_id, id, wasAttached_toRef.value);
  if (res?.data) {
    getCurrentVersion();
    versionListMenuRef.value?.hide();
    let chat_Msg = {
      body: `${userStore.me.username}删除了'${
        wasAttached_toRef.value === "project" ? "项目" : "卡片"
      }'内的概览版本：${id}`,
      props: {
        strapi: {
          data: {
            is: "overview",
            by_user: userStore.userId,
            attachedTo_id: overView_attachedTo.value.id,
            removed_id: res.data.id,
            action: "removeVersion",
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};
const _input_text = ref('');

const newVersion = async () => {
  if (!_input_text.value) return;
  let params = {
    attach_to: wasAttached_toRef.value,
    attach_to_id:
      wasAttached_toRef.value === "project"
        ? belonged_project.value.id
        : teamStore.card.id,
    project_id: belonged_project.value.id,
    data: {
      name: _input_text.value,
    },
  };
  // console.log(params);
  let res = await addVersion(params);
  if (res?.data) {
    current_version.value = res.data;
    let chat_Msg = {
      body: `${userStore.me.username}在'${
        wasAttached_toRef.value === "project" ? "项目" : "卡片"
      }'内新增了概览版本：${_input_text.value}`,
      props: {
        strapi: {
          data: {
            is: "overview",
            by_user: userStore.userId,
            attachedTo_id: overView_attachedTo.value.id,
            action: "newVersion",
            body: res.data,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
    // set_current_version(res.data.id);
    _input_text.value = null;
  }
};

const version_update_ing = ref(null);
let updateVersionParams = ref({
  attach_to: wasAttached_toRef.value,
  attach_to_id:
    wasAttached_toRef.value === "project"
      ? teamStore.project?.id
      : teamStore.card?.id,
  data: {},
});
const __updateVersion = async () => {
  let res = await updateVersion(
    current_version.value.id,
    updateVersionParams.value
  );
  if (res) {
    return res.data;
  }
};
const updateVersionFn = async () => {
  updateVersionParams.value.data.name = _input_text.value;
  let res = await __updateVersion();
  if (res) {
    version_update_ing.value = null;
    // current_version.value = res.data;
    updateVersionParams.value.data = {};

    let chat_Msg = {
      body: `${userStore.me.username}在'${
        wasAttached_toRef.value === "project" ? "项目" : "卡片"
      }'内新增了概览版本：${_input_text.value}`,
      props: {
        strapi: {
          data: {
            is: "overview",
            by_user: userStore.userId,
            overview_id: res.id,
            action: "updateVersion_name",
            body: res,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};
const updateVersionBlur = (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    updateVersionFn(current_version.value.id);
  }
};

const set_defaultVersion = async (overview_id) => {
  // let _ = overView_attachedTo
  let res;
  if (wasAttached_toRef.value === "project") {
    let params = {
      default_version: overview_id,
    };
    res = await updateProject(overView_attachedTo.value.id, params);
  }
  if (wasAttached_toRef.value === "card") {
    let params = {
      project_id: belonged_project.value.id,
      data: {
        default_version: overview_id,
      },
    };
    res = await updateCard(overView_attachedTo.value.id, params);
  }
  if (res) {
    // _.default_version = res.data.default_version;
    // overView_attachedTo = _;
    let chat_Msg = {
      body: `${userStore.me.username}将'${
        wasAttached_toRef.value === "project" ? "项目" : "卡片"
      }'默认版本修改为：${res.data.default_version}`,
      props: {
        strapi: {
          data: {
            is: "overview",
            by_user: userStore.userId,
            attachedTo_id: overView_attachedTo.value.id,
            action: "set_default_version",
            default_version: res.data.default_version,
          },
        },
      },
    };
    await send_chat_Msg(chat_Msg);
  }
};

const startChanged = async (val) => {
  // console.log("change start");
  updateVersionParams.value.data = {
    start: val,
  };
  await __updateVersion();
  let chat_Msg = {
    body: `${userStore.me.username}将'${
      wasAttached_toRef.value === "project" ? "项目" : "卡片"
    }'的版本:'${current_version.value.name}'的开始时间修改为：${val}`,
    props: {
      strapi: {
        data: {
          is: "overview",
          by_user: userStore.userId,
          attachedTo_id: overView_attachedTo.value.id,
          action: "overview_startChanged",
          start: val,
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
};
const endChanged = async (val) => {
  updateVersionParams.value.data = {
    end: val,
  };
  await __updateVersion();
  let chat_Msg = {
    body: `${userStore.me.username}将'${
      wasAttached_toRef.value === "project" ? "项目" : "卡片"
    }'的版本:'${current_version.value.name}'的结束时间修改为：${val}`,
    props: {
      strapi: {
        data: {
          is: "overview",
          by_user: userStore.userId,
          attachedTo_id: overView_attachedTo.value.id,
          action: "overview_endChanged",
          end: val,
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
};
const deadlineChanged = async (val) => {
  updateVersionParams.value.data = {
    deadline: val,
  };
  await __updateVersion();
  let chat_Msg = {
    body: `${userStore.me.username}将'${
      wasAttached_toRef.value === "project" ? "项目" : "卡片"
    }'的版本:'${current_version.value.name}'的审核时间修改为：${val}`,
    props: {
      strapi: {
        data: {
          is: "overview",
          by_user: userStore.userId,
          attachedTo_id: overView_attachedTo.value.id,
          action: "overview_deadlineChanged",
          deadline: val,
        },
      },
    },
  };
  await send_chat_Msg(chat_Msg);
};
const mediaChanged = async (id, media) => {
  updateVersionParams.value.data = {
    media: id,
  };
  try {
    let res = await __updateVersion();
    if (res) {
      // console.log("mediaChanged", res);
      let action = id === null ? "删除了" : "修改了";
      let chat_Msg = {
        body: `${userStore.me.username} ${action} '${
          wasAttached_toRef.value === "project" ? "项目" : "卡片"
        }' 版本:'${current_version.value.name}'的预览媒体`,
        props: {
          strapi: {
            data: {
              is: "overview",
              by_user: userStore.userId,
              attachedTo_id: overView_attachedTo.value.id,
              action: "overview_mediaChanged",
              version: current_version.value?.id,
              project_id: teamStore.project?.id,
              media: id === null ? null : media.attributes,
            },
          },
        },
      };
      await send_chat_Msg(chat_Msg);
    }
  } catch (error) {
    console.error(error);
  }
};
const mediaWidth = computed(
  () => ((uiStore.mainWindowSize?.height - 187) / 9) * 16
);

const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

watchEffect(() => {
  if (overView_attachedTo.value?.overviews.length === 0) {
    _input_text.value = $t('default_version');
    newVersion();
  }
});

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.overview_id === current_version.value.id &&
          strapi.data.action === "updateVersion_name"
        ) {
          if (wasAttached_toRef.value === "project") {
            teamStore.project.overviews = teamStore.project.overviews.map(
              (i) => ({
                ...i,
                name:
                  (i.id === current_version.value.id &&
                    strapi.data.body.name) ||
                  i.name,
              })
            );
          } else {
            teamStore.card.overviews = teamStore.card.overviews.map((i) => ({
              ...i,
              name:
                (i.id === current_version.value.id && strapi.data.body.name) ||
                i.name,
            }));
          }
          current_version.value.name = strapi.data.body.name;
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data.action === "updateVersion_name"
        ) {
          if (
            wasAttached_toRef.value === "project" &&
            strapi.data?.attachedTo_id === overView_attachedTo.value.id
          ) {
            teamStore.project.name = strapi.data.body.name;
            current_version.value.name = strapi.data.body.name;
          } else if (
            wasAttached_toRef.value === "card" &&
            strapi.data?.attachedTo_id === overView_attachedTo.value.id
          ) {
            teamStore.card.name = strapi.data.body.name;
            current_version.value.name = strapi.data.body.name;
          }
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project.id &&
          strapi.data.action === "change_project_name"
        ) {
          teamStore.project.name = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === teamStore.card?.id &&
          strapi.data.action === "change_card_name"
        ) {
          teamStore.card.name = strapi.data.body;
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project.id &&
          strapi.data.action === "change_project_description"
        ) {
          teamStore.project.description = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === teamStore.card?.id &&
          strapi.data.action === "change_card_description"
        ) {
          teamStore.card.description = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === teamStore.card?.id &&
          strapi.data.action === "update_card_jsonContent"
        ) {
          teamStore.card.jsonContent = strapi.data.jsonContent;
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === teamStore.project.id &&
          strapi.data.action === "change_project_content"
        ) {
          teamStore.project.jsonContent = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === teamStore.card?.id &&
          strapi.data.action === "change_card_content"
        ) {
          teamStore.card.jsonContent = strapi.data.body;
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "set_default_version"
        ) {
          overView_attachedTo.value.default_version =
            strapi.data.default_version;
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "newVersion"
        ) {
          if (wasAttached_toRef.value === "project") {
            if (teamStore.project?.overviews?.length > 0) {
              teamStore.project.overviews.push(strapi.data?.body);
            } else {
              teamStore.project.overviews = [strapi.data?.body];
            }
          } else {
            if (teamStore.card?.overviews?.length > 0) {
              teamStore.card.overviews.push(strapi.data?.body);
            } else {
              teamStore.card.overviews = [strapi.data?.body];
            }
          }
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "removeVersion"
        ) {
          function isSameId(element) {
            return element.id === strapi.data.removed_id;
          }
          if (wasAttached_toRef.value === "project") {
            const index = teamStore.project.overviews.findIndex(isSameId);
            if (index !== -1) {
              teamStore.project.overviews.splice(index, 1);
            }
          } else {
            const index = teamStore.card.overviews.findIndex(isSameId);
            if (index !== -1) {
              teamStore.card.overviews.splice(index, 1);
            }
          }
          if (current_version.value.id === strapi.data.removed_id) {
            getCurrentVersion();
          }
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "overview_startChanged"
        ) {
          if (wasAttached_toRef.value === "project") {
            teamStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).start = strapi.data.start;
          }
          if (wasAttached_toRef.value === "card") {
            // console.log("overview_startChanged");
            teamStore.card.overviews.find(
              (i) => i.id === current_version.value.id
            ).start = strapi.data.start;
          }
          getCurrentVersion();
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "overview_endChanged"
        ) {
          if (wasAttached_toRef.value === "project") {
            teamStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).end = strapi.data.end;
          }
          if (wasAttached_toRef.value === "card") {
            teamStore.card.overviews.find(
              (i) => i.id === current_version.value.id
            ).end = strapi.data.end;
          }
          getCurrentVersion();
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "overview_deadlineChanged"
        ) {
          if (wasAttached_toRef.value === "project") {
            teamStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).deadline = strapi.data.deadline;
          }
          if (wasAttached_toRef.value === "card") {
            teamStore.card.overviews.find(
              (i) => i.id === current_version.value.id
            ).deadline = strapi.data.deadline;
          }
          getCurrentVersion();
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "overview_mediaChanged"
        ) {
          if (wasAttached_toRef.value === "project") {
            teamStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).media = strapi.data.media;
          }
          if (wasAttached_toRef.value === "card") {
            teamStore.card.overviews.find(
              (i) => i.id === current_version.value.id
            ).media = strapi.data.media;
          }
          // getCurrentVersion();
          current_version.value.media = strapi.data.media;
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
