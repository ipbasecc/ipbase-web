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
import { ref, computed, toRefs, watch, watchEffect } from "vue";
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

const project = computed(() => teamStore.project);
const schedule = computed(() => {
  let res
  if (by.value === "project") {
    res = teamStore.project_schedule;
  }
  if (by.value === "card") {
    res = teamStore.card?.schedule;
  }
  return res;
});
watchEffect(() => {
  if (by.value === "project") {
    teamStore.project_schedule = teamStore.project?.schedules?.find(
      (i) => i.id === Number(schedule_id.value)
    );
  }
})
// watch(
//   [schedule_id, project],
//   () => {
//     if (schedule_id.value && project.value) {
//       init();
//     }
//   },
//   { immediate: true, deep: false }
// );

const process_createData = (val) => {
  if (by.value === "user") {
  }
};
const create = (val) => {
  if (by.value === "user") {
    process_createData(val);
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
};
const eventUpdated = async (val) => {
  if (val.includes(undefined)) return;
  if (by.value === "user") {
    process_updateData(val);
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
};
const remove = (val) => {
  if (by.value === "user") {
    process_removeData(val);
  }
};

</script>
