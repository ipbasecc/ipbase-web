<template>
  <!-- {{ schedule }} -->
  <ScheduleBody
    v-if="schedule"
    :by
    :schedule
    :isShare="uiStore.isShared"
    @create="create"
    @eventUpdated="eventUpdated"
    @remove="remove"
  />
  <div v-if="!schedule" class="absolute-full flex flex-center">
    <BgBrand />
  </div>
</template>

<script setup>
import { ref, computed, toRefs, watch } from "vue";
import { send_MattersMsg } from "src/pages/team/hooks/useSendmsg.js";

import ScheduleBody from "./ScheduleBody.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";
import {userStore, mm_wsStore, teamStore, uiStore} from "src/hooks/global/useStore.js";

const props = defineProps({
  project_id: {
    type: String,
    default: "",
  },
  schedule_id: {
    type: Number,
    default: NaN,
  },
  by: {
    type: String,
    default: "project",
  },
});
const { schedule_id, by } = toRefs(props);

const schedules = ref();
const project = computed(() => teamStore.project);
const schedule = ref();
const init = () => {
  if (by.value === "project") {
    schedules.value = teamStore.project?.schedules;
    schedule.value = schedules.value?.find(
      (i) => i.id === Number(schedule_id.value)
    );
  }
  if (by.value === "card") {
    schedule.value = teamStore.card?.schedule;
  }
  if (by.value === "user") {
  }
  // console.log('init');
};
init();
watch(
  [schedule_id, project],
  () => {
    if (schedule_id.value && project.value) {
      init();
    }
  },
  { immediate: true, deep: false }
);

const set_store = (schedule) => {
  teamStore.project = {
    ...teamStore.project,
    schedules: teamStore.project.schedules.map((i) =>
      i.id === schedule.id ? schedule : i
    ),
  };
};

const process_createData = (val) => {
  // console.log("process_createData", val);
  if (by.value === "project") {
    teamStore.project = {
      ...teamStore.project,
      schedules: teamStore.project.schedules.map((i) =>
        i.id === schedule_id.value ? [...i, ...val] : i
      ),
    };
  }
  if (by.value === "card") {
    schedule.value = teamStore.card?.schedule;
    teamStore.card = {
      ...teamStore.card,
      schedule: {
        ...teamStore.card.schedule,
        schedule_events: [...teamStore.card.schedule.schedule_events, ...val],
      },
    };
  }
  if (by.value === "user") {
  }
};
const create = (val) => {
  let chat_Msg = {
    props: {
      strapi: {
        data: {
          is: by.value,
          by_user: userStore.userId,
          action: "schedule_event_created",
          schedule_id: schedule_id.value,
          body: val,
        },
      },
    },
  };
  if (by.value === "project") {
    chat_Msg.body = `${userStore.me.username}：新增了项目规划事件`;
  }
  if (by.value === "card") {
    chat_Msg.body = `${userStore.me.username}：新增了任务规划事件`;
  }
  if (by.value === "user") {
    process_createData(val);
  } else {
    send_chat_Msg(chat_Msg);
  }
};
const process_updateData = (val) => {
  const update_ids = val.map((i) => i.id);
  schedule.value = {
    ...schedule.value,
    schedule_events: schedule.value.schedule_events.map((i) =>
      update_ids.includes(i.id) ? val.find((j) => j.id === i.id) : i
    ),
  };
  set_store(schedule.value);
};
const eventUpdated = async (val) => {
  if (val.includes(undefined)) return;
  let chat_Msg = {
    props: {
      strapi: {
        data: {
          is: by.value,
          by_user: userStore.userId,
          action: "schedule_event_updated",
          schedule_id: schedule_id.value,
          body: val,
        },
      },
    },
  };
  if (by.value === "project") {
    chat_Msg.body = `${userStore.me.username}：更新了项目规划`;
  }
  if (by.value === "card") {
    chat_Msg.body = `${userStore.me.username}：更新了任务规划`;
  }
  if (by.value === "user") {
    process_updateData(val);
  } else {
    await send_chat_Msg(chat_Msg);
  }
};

const process_removeData = (val) => {
  const removed_ids = val.map((i) => i.removed_id);
  schedule.value = {
    ...schedule.value,
    schedule_events: schedule.value.schedule_events.filter(
      (i) => !removed_ids.includes(i.id)
    ),
  };
  set_store(schedule.value);
};
const remove = (val) => {
  let chat_Msg = {
    props: {
      strapi: {
        data: {
          is: by.value,
          by_user: userStore.userId,
          action: "schedule_event_removed",
          schedule_id: schedule_id.value,
          body: val,
        },
      },
    },
  };
  if (by.value === "project") {
    chat_Msg.body = `${userStore.me.username}：删除了项目规划事件`;
  }
  if (by.value === "card") {
    chat_Msg.body = `${userStore.me.username}：删除了任务规划事件`;
  }
  if (by.value === "user") {
    process_removeData(val);
  } else {
    send_chat_Msg(chat_Msg);
  }
};

const send_chat_Msg = async (MsgContent) => {
  console.log("MsgContent", MsgContent);
  await send_MattersMsg(MsgContent);
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
          strapi.data?.is === by.value &&
          strapi.data.schedule_id === schedule_id.value &&
          strapi.data.action === "schedule_event_removed"
        ) {
          process_removeData(strapi.data.body);
        }
        if (
          strapi.data?.is === by.value &&
          strapi.data.schedule_id === schedule_id.value &&
          strapi.data.action === "schedule_event_updated"
        ) {
          process_updateData(strapi.data.body);
        }
        if (
          strapi.data?.is === by.value &&
          strapi.data.schedule_id === schedule_id.value &&
          strapi.data.action === "schedule_event_created"
        ) {
          process_createData(strapi.data.body);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
