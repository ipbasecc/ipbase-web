<template>
  <q-scroll-area v-if="schedules" class="fit">
    <q-list dense class="q-pa-xs">
      <VueDraggable v-model="schedules"
        :animation="300" :delay="1" :fallbackTolerance="5" :forceFallback="true" :fallbackOnBody="true"
        group="schedule"
        chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
        handle=".dragBar"
        class="radius-sm column no-wrap"
        @sort="orderSchedule"
      >
      <template v-for="element in schedules" :key="element.id">
        <q-item
          clickable
          v-ripple
          class="col radius-xs hovered-item overflow-hidden"
          :class="actived_id === element.id ? 'border active-sublistitem' : 'border-placeholder op-7'"
          :active-class="` ${
            findColor_byIcon(element.icon)
              ? `text-${findColor_byIcon(element.icon)}`
              : `${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`
          }`"
          :active="actived_id === element.id"
          style="min-height: 40px;"
        >
          <q-item-section side class="dragBar" @click="enterSchedule(element)">
            <q-icon
              :name="element.icon"
              :color="findColor_byIcon(element.icon)"
            >
              <q-menu class="radius-sm">
                <q-list bordered dense class="q-pa-xs radius-sm">
                  <q-item
                    v-for="icon in icons"
                    :key="icon.val"
                    clickable
                    v-close-popup
                    class="radius-xs"
                    @click="setIcon(element, icon.val)"
                  >
                    <q-item-section side
                      ><q-icon :name="icon.val" :color="icon.color"
                    /></q-item-section>
                    <q-item-section>{{ $t(icon.tip) }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-icon>
          </q-item-section>
          <q-item-section @click="enterSchedule(element)">{{
            element.name
          }}</q-item-section>
          <q-item-section side class="hover-show transition absolute-right z-fab q-mr-xs">
            <q-btn flat round dense size="sm" icon="more_vert">
              <q-menu
                class="radius-sm"
                :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-9'"
                @show="params.data.name = element.name"
              >
                <q-list
                  bordered
                  dense
                  class="radius-sm q-pa-xs"
                  style="min-width: 16rem"
                >
                  <q-item class="no-padding column no-wrap gap-xs">
                    <q-input
                      dense
                      filled
                      v-model="params.data.name"
                      autofocus
                      type="text"
                      class="radius-xs"
                      :aria-placeholder="element.name"
                      @keyup.enter="update(element)"
                      @keydown.esc="params.data.name = element.name"
                    >
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          dense
                          size="xs"
                          icon="check"
                          :disable="loading"
                          v-close-popup
                          @click="update(element)"
                        />
                      </template>
                    </q-input>
                    <q-input
                      dense
                      filled
                      v-model="params.data.description"
                      square
                      type="textarea"
                      class="radius-xs"
                      :placeholder="
                        element.description || $t('schedula_desc_placeholder')
                      "
                    />
                  </q-item>
                  <q-separator spaced />
                  <q-item
                    v-if="!element.disable_share"
                    :clickable="!loading"
                    class="radius-xs q-px-sm q-py-xs"
                    v-close-popup
                    @click.stop="share(element)"
                  >
                    <q-item-section side
                      ><q-icon name="share"
                    /></q-item-section>
                    <q-item-section>{{ $t('share') }}</q-item-section>
                    <q-item-section v-if="waring(element)" side>
                      <q-icon
                        color="red"
                        size="0.7rem"
                        name="mdi-checkbox-blank-circle"
                      >
                        <q-tooltip class="font-medium">
                          {{ $t('share_expried') }}
                        </q-tooltip>
                      </q-icon>
                    </q-item-section>
                  </q-item>
                  <q-separator spaced />
                  <q-item
                    :clickable="!loading"
                    class="radius-xs q-px-sm q-py-xs"
                    v-close-popup
                    @click.stop="remove(element)"
                  >
                    <q-item-section side
                      ><q-icon name="delete"
                    /></q-item-section>
                    <q-item-section>{{ $t('delete') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
          <q-item-section v-if="waring(element)" side>
            <q-icon
              color="red"
              size="0.7rem"
              name="mdi-checkbox-blank-circle"
            >
              <q-tooltip class="font-medium"> {{ $t('share_expried') }} </q-tooltip>
            </q-icon>
          </q-item-section>
          <div
            v-if="actived_id === element.id"
            class="absolute-left bg-primary"
            style="width: 3px"
          ></div>
        </q-item>
      </template>
    </VueDraggable>
    <div class="radius-sm column no-wrap" v-if="!teamStore.shareInfo">
      <q-item
        v-if="!creating"
        clickable
        v-ripple
        class="col radius-xs dragBar hovered-item overflow-hidden"
        :class="schedules?.length === 0 ? 'active-sublistitem border-dashed border-op-xl border-xs' : 'hovered-item'"
        style="min-height: 40px;"
        @click="creating = true"
      >
        <q-item-section side class="q-pr-sm q-mr-xs">
          <q-icon name="add" />
        </q-item-section>
        <q-item-section class="hover-show transition">
          {{ $t('create_schedule') }}
        </q-item-section>
      </q-item>
      <q-item v-else class="radius-xs border q-pa-xs">
        <q-item-section>
          <q-input
            v-model="create_params.data.name"
            dense
            flat
            square
            autofocus
            class="full-width"
            @keydown.esc="cancelCreate()"
            @blur="cancelCreate()"
            @keyup.enter.prevent="create()"
            filled
            type="text"
            :placeholder="$t('schedule_name')"
          >
            <template v-slot:prepend>
              <q-item-section side>
                <q-icon name="event" />
              </q-item-section>
            </template>
            <template v-if="create_params.data.name" v-slot:append>
              <q-btn
                flat
                round
                dense
                size="xs"
                icon="check"
                :disable="loading"
                @click="create()"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </div>
    </q-list>
    <q-dialog v-model="shareDlg" persistent>
      <ShareSchedule
        v-if="share_item"
        :share_item
        @shareUpdated="shareUpdated"
      />
    </q-dialog>
  </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, computed, watch, nextTick, onBeforeMount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";
import { VueDraggable } from 'vue-draggable-plus'
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateProject,
} from "src/api/strapi/project.js";
import ShareSchedule from "./ShareSchedule.vue";
import {userStore, mm_wsStore, teamStore, uiStore} from 'src/hooks/global/useStore.js';

const router = useRouter();
const route = useRoute();
const actived_id = computed(() => Number(route.params.schedule_id));

const props = defineProps({
  by_info: {
    type: Object,
    default() {
      return {
        by: "project",
        project_id: NaN,
      };
    },
  },
});

const { by_info } = toRefs(props);
const schedules = ref([]);
onBeforeMount(() => {
  if(by_info.value?.project_id) {
    schedules.value = teamStore.project?.schedules || [];
  } else if(by_info.value?.by === "user") {
    schedules.value = teamStore.init?.schedules
  }
});
const icons = ref([
  { val: "event", tip: "schedule_tip_event", color: "" },
  { val: "handshake", tip: "schedule_tip_handshake", color: "blue" },
  { val: "rocket_launch", tip: "schedule_tip_rocket", color: "orange" },
  { val: "event_busy", tip: "schedule_tip_busy", color: "negative" },
]);
const findColor_byIcon = (icon) => {
  return icons.value.find((i) => i.val === icon)?.color;
};

const loading = ref(false);
const creating = ref(false);
const create_params = ref({
  by_info: by_info.value,
  data: {
    name: "",
  },
});
const process_createdData = (val) => {
  if (by_info.value.project_id) {
    teamStore.project.schedules.push(val);
    schedules.value = teamStore.project.schedules
  }
  if (by_info.value.user_id) {
    // teamStore.init.schedules.push(val);
  }
};
const create = async () => {
  if (loading.value || !create_params.value?.data.name) return;
  creating.value = true;
  loading.value = true;
  const res = await createSchedule(create_params.value);
  if (res) {
    creating.value = false;
    loading.value = false;
    create_params.value.data.name = "";
    if (by_info.value?.by === "user") {
      process_createdData(val);
    }
  }
};
const cancelCreate = () => {
  creating.value = false;
  create_params.value.data.name = "";
};

const process_updatedData = (val) => {
  if (by_info.value.project_id) {
    let source = teamStore.project.schedules;
    teamStore.project.schedules = source.map((i) => {
      if (i.id === val.id) {
        return val;
      } else {
        return i;
      }
    });
    schedules.value = teamStore.project.schedules
  }
  if (by_info.value.card_id) {
    let source = teamStore.card.schedules;
    teamStore.card.schedules = source.map((i) => {
      if (i.id === val.id) {
        return val;
      } else {
        return i;
      }
    });
  }
  if (by_info.value.user_id) {
  }
};
const params = ref({
  data: {
    name: "",
    description: "",
    icon: "",
    color_marker: "",
  },
});

const enterSchedule = (schedule) => {
  router.push(
    `/teams/projects/${teamStore.project.id}/schedule/${schedule.id}`
  );
  uiStore.showMainContentList = false;
};
const update = async (schedule) => {
  if (loading.value) return;
  loading.value = true;
  params.value = {
    data: {
      name: params.value.data.name || schedule.name,
      description: params.value.data.description || schedule.description,
      icon: params.value.data.icon || schedule.icon,
      color_marker: params.value.data.color_marker || schedule.color_marker,
    },
  };
  const res = await updateSchedule(schedule.id, params.value);
  if (res) {
    loading.value = false;
    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "schedule_updated",
            body: res.data,
          },
        },
      },
    };
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：修改了项目规划 - ${schedule.id}`;
      chat_Msg.props.strapi.data.project_id = teamStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：修改了任务规划 - ${schedule.id}`;
      chat_Msg.props.strapi.data.card_id = teamStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_updatedData(res.data);
    } else {
      await send_chat_Msg(chat_Msg);
    }
  }
};

const setIcon = async (schedule, icon) => {
  params.value.data.icon = icon;
  await update(schedule);
};

const process_removedData = (val) => {
  if (by_info.value.project_id) {
    teamStore.project.schedules = teamStore.project.schedules.filter(
      (i) => i.id !== val.removed_id
    );
  }
  if (by_info.value.card_id) {
    teamStore.card = {
      ...teamStore.card,
      card_documents: teamStore.card.card_documents.filter(
        (i) => i.id !== val.removed_id
      ),
    };
  }
  if (by_info.value.user_id) {
  }
  schedules.value = teamStore.project.schedules
};
const remove = async (i) => {
  const res = await deleteSchedule(i.id);
  if (res) {
    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "schedule_removed",
            body: res.data,
          },
        },
      },
    };
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：删除了项目规划 - ${document.title}`;
      chat_Msg.props.strapi.data.project_id = teamStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：删除了任务规划 - ${document.title}`;
      chat_Msg.props.strapi.data.card_id = teamStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_removedData(res.data);
    } else {
      await send_chat_Msg(chat_Msg);
    }
  }
};

const process_orderData = (val) => {
  if (by_info.value?.by === "project") {
    teamStore.project.schedules = val.map((i) =>
      teamStore.project.schedules.find((j) => j.id === i)
    );
    schedules.value = teamStore.project.schedules
  }
  if (by_info.value?.by === "card") {
  }
  if (by_info.value?.by === "user") {
  }
};
const orderSchedule = async () => {
  await nextTick();
  if (by_info.value?.by === "project") {
    const project_id = by_info.value.project_id;
    const project_schedules_ids_withOrder = schedules.value.map((i) => i.id);
    let params = {
      schedules: project_schedules_ids_withOrder,
    };

    let res;
    let Msg_body;

    if (by_info.value?.by === "project") {
      res = await updateProject(project_id, params);
      Msg_body = res.data.schedules.map((i) => i.id);
    }
    if (by_info.value?.by === "user") {
    }

    if (res) {
      teamStore.project = res.data;

      let chat_Msg = {
        props: {
          strapi: {
            data: {
              is: by_info.value?.by,
              by_user: userStore.userId,
              action: "schedule_ordered",
              body: Msg_body,
            },
          },
        },
      };
      if (by_info.value?.by === "project") {
        chat_Msg.body = `${userStore.me.username}：对项目规划进行了排序`;
        chat_Msg.props.strapi.data.project_id = teamStore.project?.id;
      }
      if (by_info.value?.by === "user") {
        process_orderData(Msg_body);
      } else {
        await send_chat_Msg(chat_Msg);
      }
    }
  }
};
const send_chat_Msg = async (MsgContent) => {
  await send_MattersMsg(MsgContent);
};

const shareDlg = ref(false);
const share_item = ref();
const share = async (_schedule) => {
  shareDlg.value = true;
  share_item.value = _schedule;
};
const waring = (schedule) => {
  return schedule.share_codes?.filter((i) => i.max_count < 1)?.length > 0;
};
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
          strapi.data?.is == by_info.value?.by &&
          strapi.data?.project_id == teamStore.project?.id &&
          strapi.data.action === "schedule_created"
        ) {
        console.log('by_info.value?.by', by_info.value?.by);
          process_createdData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "schedule_updated"
        ) {
          process_updatedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "schedule_removed"
        ) {
          process_removedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === teamStore.project?.id &&
          strapi.data.action === "schedule_ordered"
        ) {
          process_orderData(strapi.data.body);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped></style>
