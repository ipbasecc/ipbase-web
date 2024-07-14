<template>
  <div class="column no-wrap gap-sm relative-position">
    <OverviewMedia
      :current_version="current_version"
      @mediaChanged="mediaChanged"
    />
    <div class="column no-wrap q-px-md gap-sm q-pt-sm">
      <OverviewName v-if="name" :wasAttached_to="wasAttached_toRef" />
      <OverviewDesc
        v-if="wasAttached_toRef === 'project'"
        :wasAttached_to="wasAttached_toRef"
      />
      <CardContent
        v-if="wasAttached_toRef === 'card'"
        :wasAttached_to="wasAttached_toRef"
      />
      <div class="row no-wrap gap-md items-center justify-between">
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
      <div class="row no-wrap gap-md q-pa-sm items-center radius-xs border">
        <template v-if="calc_auth('overview', 'start', authBase.of)">
          <span
            v-if="!version_update_ing"
            class="q-space q-ml-sm"
            @dblclick="version_update_ing = current_version?.id"
          >
            {{ current_version?.name }}
            <q-tooltip
              class="bg-black text-white"
              anchor="top left"
              self="bottom start"
            >
              双击改名
            </q-tooltip>
          </span>
        </template>
        <span v-else class="q-space q-ml-sm">
          {{ current_version?.name }}
        </span>
        <q-input
          v-if="version_update_ing === current_version?.id"
          v-model="_input_text"
          dense
          square
          filled
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
          <q-menu class="transparent shadow-12">
            <q-list
              dense
              bordered
              class="q-pa-xs radius-sm"
              :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'"
              style="min-width: 9rem"
            >
              <template
                v-if="
                  calc_auth(authBase.collection, 'create_version', authBase.of)
                "
              >
                <q-item class="radius-xs no-padding">
                  <q-item-section class="q-pa-none radius-xs overflow-hidden">
                    <q-input
                      v-model="_input_text"
                      dense
                      square
                      filled
                      placeholder="版本名称"
                      type="text"
                      @keyup.esc="_input_text = null"
                    >
                      <template v-slot:append>
                        <q-btn
                          dense
                          flat
                          round
                          size="sm"
                          icon="check"
                          @click="newVersion"
                        />
                      </template>
                    </q-input>
                  </q-item-section>
                </q-item>
                <q-separator
                  v-if="overView_attachedTo.overviews?.length > 1"
                  spaced
                />
              </template>
              <template v-if="overView_attachedTo.overviews?.length > 1">
                <q-item
                  v-for="i in overView_attachedTo.overviews"
                  :key="i.id"
                  class="radius-xs"
                  clickable
                  @click="set_current_version(i.id)"
                  :class="current_version.id === i.id ? 'bg-primary' : ''"
                  v-close-popup
                >
                  <q-item-section side
                    ><q-avatar size="sm">{{
                      i.version
                    }}</q-avatar></q-item-section
                  >
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
                    <q-btn
                      dense
                      size="sm"
                      flat
                      round
                      icon="star"
                      :color="
                        overView_attachedTo.default_version === i.id
                          ? 'yellow'
                          : ''
                      "
                      @click.stop="
                        calc_auth('project', 'default_version', authBase.of) &&
                          set_defaultVersion(i.id)
                      "
                    />
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
                  <q-item-section>移除此版本</q-item-section>
                  <q-item-section side></q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
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
  provide,
  onMounted,
} from "vue";
import {
  updateProject,
  updateCard,
  addVersion,
  updateVersion,
  deleteVersion,
} from "src/api/strapi/project.js";

import OverviewMedia from "src/pages/Project/components/project/widgets/OverviewMedia.vue";
import OverviewName from "src/pages/Project/components/project/widgets/OverviewName.vue";
import CardContent from "src/pages/Project/components/project/widgets/CardContent.vue";
import OverviewDesc from "src/pages/Project/components/project/widgets/OverviewDesc.vue";
import OverviewStart from "src/pages/Project/components/project/widgets/OverviewStart.vue";
import OverviewEnd from "src/pages/Project/components/project/widgets/OverviewEnd.vue";
import OverviewDeadline from "src/pages/Project/components/project/widgets/OverviewDeadline.vue";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";
import useMatedate from "src/hooks/global/useGetMyMatedata.js";
import { useQuasar } from "quasar";

const $q = useQuasar();
const { userId, me } = useMatedate;
const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const props = defineProps({
  wasAttached_to: {
    type: String,
    default: "project",
  },
});
const wasAttached_toRef = toRef(props, "wasAttached_to");
const name = computed(() =>
  wasAttached_toRef.value === "project"
    ? projectStore.project?.name
    : projectStore.card?.name
);

const authBase = computed(() => {
  let res;
  let isInCard;
  if (projectStore.card) {
    const members = projectStore.card.card_members.map((i) => i.by_user.id);
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
    projectStore.project || projectStore.card?.belonged_project;
});

const overView_attachedTo = computed(() =>
  wasAttached_toRef.value === "project"
    ? projectStore.project
    : projectStore.card
);

const current_version = ref();
const getCurrentVersion = () => {
  // console.log("getCurrentVersion");
  current_version.value =
    overView_attachedTo.value?.overviews?.find(
      (i) => i.id === overView_attachedTo.value?.default_version
    ) ||
    overView_attachedTo.value?.overviews[0] ||
    null;
};
onMounted(() => {
  getCurrentVersion();
});

const set_current_version = (id) => {
  current_version.value = overView_attachedTo.value.overviews.find(
    (i) => i.id === id
  );
};

const removeVersion = async (id) => {
  let attach_to_id =
    wasAttached_toRef.value === "project"
      ? belonged_project.value.id
      : projectStore.card.id;
  let res = await deleteVersion(attach_to_id, id, wasAttached_toRef.value);
  if (res) {
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
    send_chat_Msg(chat_Msg);
  }
};
const _input_text = ref(current_version.value?.name);

const newVersion = async () => {
  if (!_input_text.value) return;
  let params = {
    attach_to: wasAttached_toRef.value,
    attach_to_id:
      wasAttached_toRef.value === "project"
        ? belonged_project.value.id
        : projectStore.card.id,
    project_id: belonged_project.value.id,
    data: {
      name: _input_text.value,
    },
  };
  console.log(params);
  let res = await addVersion(params);
  if (res) {
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
    send_chat_Msg(chat_Msg);
    // set_current_version(res.data.id);
    _input_text.value = null;
  }
};

const version_update_ing = ref(null);
let updateVersionParams = ref({
  attach_to: wasAttached_toRef.value,
  attach_to_id:
    wasAttached_toRef.value === "project"
      ? projectStore.project?.id
      : projectStore.card?.id,
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
    send_chat_Msg(chat_Msg);
  }
};
const updateVersionBlur = (newVal, oldVal) => {
  if (newVal && newVal != oldVal) {
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
    send_chat_Msg(chat_Msg);
  }
};

const startChanged = async (val) => {
  console.log("change start");
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
  send_chat_Msg(chat_Msg);
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
  send_chat_Msg(chat_Msg);
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
  send_chat_Msg(chat_Msg);
};
const mediaChanged = async (id, media) => {
  updateVersionParams.value.data = {
    media: id,
  };
  try {
    let res = await __updateVersion();
    if (res) {
      console.log("mediaChanged", res);
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
              media: id === null ? null : media.attributes,
            },
          },
        },
      };
      send_chat_Msg(chat_Msg);
    }
  } catch (error) {
    console.error(error);
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

watchEffect(() => {
  if (overView_attachedTo.value?.overviews.length === 0) {
    _input_text.value = "默认版本";
    newVersion();
  }
});

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event == "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.overview_id === current_version.value.id &&
          strapi.data.action === "updateVersion_name"
        ) {
          if (wasAttached_toRef.value === "project") {
            projectStore.project.overviews = projectStore.project.overviews.map(
              (i) => ({
                ...i,
                name:
                  (i.id === current_version.value.id &&
                    strapi.data.body.name) ||
                  i.name,
              })
            );
          } else {
            projectStore.card.overviews = projectStore.card.overviews.map(
              (i) => ({
                ...i,
                name:
                  (i.id === current_version.value.id &&
                    strapi.data.body.name) ||
                  i.name,
              })
            );
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
            projectStore.project.name = strapi.data.body.name;
            current_version.value.name = strapi.data.body.name;
          } else if (
            wasAttached_toRef.value === "card" &&
            strapi.data?.attachedTo_id === overView_attachedTo.value.id
          ) {
            projectStore.card.name = strapi.data.body.name;
            current_version.value.name = strapi.data.body.name;
          }
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "change_project_name"
        ) {
          projectStore.project.name = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === projectStore.card?.id &&
          strapi.data.action === "change_card_name"
        ) {
          projectStore.card.name = strapi.data.body;
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "change_project_description"
        ) {
          projectStore.project.description = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === projectStore.card?.id &&
          strapi.data.action === "change_card_description"
        ) {
          projectStore.card.description = strapi.data.body;
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data.card_id === projectStore.card?.id &&
          strapi.data.action === "update_card_jsonContent"
        ) {
          projectStore.card.jsonContent = strapi.data.jsonContent;
        }
        if (
          strapi.data?.is === "project" &&
          strapi.data?.project_id === projectStore.project.id &&
          strapi.data.action === "change_project_content"
        ) {
          projectStore.project.jsonContent = strapi.data.body;
          $q.notify("已保存");
        }
        if (
          strapi.data?.is === "card" &&
          strapi.data?.card_id === projectStore.card?.id &&
          strapi.data.action === "change_card_content"
        ) {
          projectStore.card.jsonContent = strapi.data.body;
          $q.notify("已保存");
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
            if (projectStore.project?.overviews?.length > 0) {
              projectStore.project.overviews.push(strapi.data?.body);
            } else {
              projectStore.project.overviews = [strapi.data?.body];
            }
          } else {
            if (projectStore.card?.overviews?.length > 0) {
              projectStore.card.overviews.push(strapi.data?.body);
            } else {
              projectStore.card.overviews = [strapi.data?.body];
            }
          }
        }
        if (
          strapi.data?.is === "overview" &&
          strapi.data?.attachedTo_id === overView_attachedTo.value.id &&
          strapi.data.action === "removeVersion"
        ) {
          function isSameId(element) {
            return element.id == strapi.data.removed_id;
          }
          if (wasAttached_toRef.value === "project") {
            const index = projectStore.project.overviews.findIndex(isSameId);
            if (index !== -1) {
              projectStore.project.overviews.splice(index, 1);
            }
          } else {
            const index = projectStore.card.overviews.findIndex(isSameId);
            if (index !== -1) {
              projectStore.card.overviews.splice(index, 1);
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
            projectStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).start = strapi.data.start;
          }
          if (wasAttached_toRef.value === "card") {
            console.log("overview_startChanged");
            projectStore.card.overviews.find(
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
            projectStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).end = strapi.data.end;
          }
          if (wasAttached_toRef.value === "card") {
            projectStore.card.overviews.find(
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
            projectStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).deadline = strapi.data.deadline;
          }
          if (wasAttached_toRef.value === "card") {
            projectStore.card.overviews.find(
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
            projectStore.project.overviews.find(
              (i) => i.id === current_version.value.id
            ).media = strapi.data.media;
          }
          if (wasAttached_toRef.value === "card") {
            projectStore.card.overviews.find(
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
