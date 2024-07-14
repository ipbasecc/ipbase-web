<template>
  <q-scroll-area v-if="schedules" class="fit">
    <q-list dense>
      <draggable
        :list="schedules"
        animation="300"
        :fallbackTolerance="2"
        :force-fallback="true"
        :fallbackOnBody="true"
        :item-key="(key) => key"
        :sort="true"
        :touchStartThreshold="4"
        :scroll="true"
        ghost-class="ghostColumn"
        chosen-class="chosenGroupClass"
        drag-class="dragClass"
        handle=".dragBar"
        group="groups"
        class="radius-sm column no-warp q-pa-xs"
        @change="orderSchedule(schedules)"
      >
        <template #item="{ element }">
          <q-item
            clickable
            v-ripple
            class="col radius-xs dragBar hovered-item"
            :class="
              actived_id === element.id
                ? 'border bg-primary'
                : 'border-placeholder'
            "
            :active-class="` ${
              findColor_byIcon(element.icon)
                ? `text-${findColor_byIcon(element.icon)}`
                : `${$q.dark.mode ? 'text-grey-3' : 'text-grey-9'}`
            }`"
            :active="actived_id === element.id"
          >
            <q-item-section side @click="enterSchedule(element)">
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
                      <q-item-section>{{ icon.tip }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-icon>
            </q-item-section>
            <q-item-section @click="enterSchedule(element)">{{
              element.name
            }}</q-item-section>
            <q-item-section side class="hover-show transition">
              <q-btn flat round dense size="sm" icon="more_vert">
                <q-menu class="radius-sm">
                  <q-list bordered dense class="radius-sm q-pa-xs">
                    <q-item class="no-padding">
                      <q-input
                        dense
                        filled
                        v-model="element.name"
                        autofocus
                        type="text"
                        class="radius-xs"
                        :placeholder="element.name"
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
                    </q-item>
                    <q-separator spaced />
                    <q-item
                      :clickable="!loading"
                      class="radius-xs no-padding"
                      v-close-popup
                      @click="remove(element)"
                    >
                      <q-item-section side
                        ><q-icon name="delete"
                      /></q-item-section>
                      <q-item-section>删除</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </template>
        <template #footer>
          <q-item
            v-if="!creating"
            clickable
            v-ripple
            class="hovered-item radius-xs"
            @click="creating = true"
          >
            <q-item-section side>
              <q-icon name="add" />
            </q-item-section>
            <q-item-section class="hover-show transition">
              新建规划
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
                placeholder="规划名称"
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
        </template>
      </draggable>
    </q-list>
  </q-scroll-area>
</template>

<script setup>
import { ref, toRefs, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import useProjectStore from "src/stores/project.js";
import useUserStore from "src/stores/user.js";
import useMmws from "src/stores/mmws.js";
import { send_MattersMsg } from "src/hooks/utilits/useSendmsg.js";

import draggable from "vuedraggable";

import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  updateProject,
} from "src/api/strapi/project.js";

const projectStore = useProjectStore();
const userStore = useUserStore();
const mm_wsStore = useMmws();

const router = useRouter();
const route = useRoute();
const actived_id = computed(() => Number(route.params.schedule_id));

const props = defineProps({
  schedules: {
    type: Array,
    default() {
      return [];
    },
  },
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

const { schedules, by_info } = toRefs(props);
const icons = ref([
  { val: "event", tip: "正常规划", color: "" },
  { val: "handshake", tip: "多方协作", color: "blue" },
  { val: "rocket_launch", tip: "紧张进行中...", color: "orange" },
  { val: "event_busy", tip: "疯狂赶工中...", color: "negative" },
]);
const findColor_byIcon = (icon) => {
  return icons.value.find((i) => i.val === icon)?.color;
};

const enterSchedule = (schedule) => {
  router.push(`/projects/${projectStore.project.id}/schedule/${schedule.id}`);
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
    projectStore.project.schedules.push(val);
  }
  if (by_info.value.card_id) {
    projectStore.card.schedules.push(val);
  }
  if (by_info.value.user_id) {
  }
};
const create = async () => {
  creating.value = true;
  loading.value = true;
  const res = await createSchedule(create_params.value);
  if (res) {
    creating.value = false;
    loading.value = false;

    let chat_Msg = {
      props: {
        strapi: {
          data: {
            is: by_info.value?.by,
            by_user: userStore.userId,
            action: "schedule_created",
            body: res.data,
          },
        },
      },
    };
    if (by_info.value?.by === "project") {
      chat_Msg.body = `${userStore.me.username}：新增了项目规划`;
      chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：新增了任务规划`;
      chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_createdData(val);
    } else {
      send_chat_Msg(chat_Msg);
    }
  }
};
const cancelCreate = () => {
  creating.value = false;
  create_params.value.data.name = "";
};

const process_updatedData = (val) => {
  if (by_info.value.project_id) {
    let source = projectStore.project.schedules;
    projectStore.project.schedules = source.map((i) => {
      if (i.id === val.id) {
        return val;
      } else {
        return i;
      }
    });
  }
  if (by_info.value.card_id) {
    let source = projectStore.card.schedules;
    projectStore.card.schedules = source.map((i) => {
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
const update = async (schedule) => {
  loading.value = true;
  const params = {
    data: {
      name: schedule.name,
      icon: schedule.icon,
      color_marker: schedule.color_marker,
    },
  };
  const res = await updateSchedule(schedule.id, params);
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
      chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：修改了任务规划 - ${schedule.id}`;
      chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_updatedData(res.data);
    } else {
      send_chat_Msg(chat_Msg);
    }
  }
};

const process_removedData = (val) => {
  if (by_info.value.project_id) {
    projectStore.project.schedules = projectStore.project.schedules.filter(
      (i) => i.id != val.removed_id
    );
  }
  if (by_info.value.card_id) {
    projectStore.card = {
      ...projectStore.card,
      card_documents: projectStore.card.card_documents.filter(
        (i) => i.id != val.removed
      ),
    };
  }
  if (by_info.value.user_id) {
  }
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
      chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
    }
    if (by_info.value?.by === "card") {
      chat_Msg.body = `${userStore.me.username}：删除了任务规划 - ${document.title}`;
      chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
    }
    if (by_info.value?.by === "user") {
      process_removedData(res.data);
    } else {
      send_chat_Msg(chat_Msg);
    }
  }
};

const process_orderData = (val) => {
  if (by_info.value?.by === "project") {
    projectStore.project.schedules = val.map((i) =>
      projectStore.project.schedules.find((j) => j.id == i)
    );
  }
  if (by_info.value?.by === "card") {
  }
  if (by_info.value?.by === "user") {
  }
};
const orderSchedule = async (schedules) => {
  if (by_info.value?.by === "project") {
    const project_id = by_info.value.project_id;
    const project_schedules_ids_withOrder = schedules.map((i) => i.id);
    let params = {
      schedules: project_schedules_ids_withOrder,
    };

    let res;
    let Msg_body;

    if (by_info.value?.by === "project") {
      res = await updateProject(project_id, params);
      Msg_body = res.data.schedules.map((i) => i.id);
    }
    if (by_info.value?.by === "card") {
    }
    if (by_info.value?.by === "user") {
    }

    if (res) {
      projectStore.project = res.data;

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
        chat_Msg.props.strapi.data.project_id = projectStore.project?.id;
      }
      if (by_info.value?.by === "card") {
        chat_Msg.body = `${userStore.me.username}：对任务规划进行了排序`;
        chat_Msg.props.strapi.data.card_id = projectStore.card?.id;
      }
      if (by_info.value?.by === "user") {
        process_orderData(Msg_body);
      } else {
        send_chat_Msg(chat_Msg);
      }
    }
  }
};

const send_chat_Msg = async (MsgContent) => {
  send_MattersMsg(MsgContent);
};

const setIcon = async (schedule, icon) => {
  schedule.icon = icon;
  await update(schedule);
};

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
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === projectStore.project?.id &&
          strapi.data.action === "schedule_created"
        ) {
          process_createdData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === projectStore.project?.id &&
          strapi.data.action === "schedule_updated"
        ) {
          process_updatedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === projectStore.project?.id &&
          strapi.data.action === "schedule_removed"
        ) {
          process_removedData(strapi.data.body);
        }
        if (
          strapi.data?.is === by_info.value?.by &&
          strapi.data?.project_id === projectStore.project?.id &&
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
