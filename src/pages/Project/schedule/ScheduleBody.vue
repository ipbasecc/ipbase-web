<template>
  <div class="absolute-full column no-wrap">
    <ejs-schedule
      height="100%"
      width="100%"
      :selectedDate="selectedDate"
      :eventSettings="eventSettings"
      :currentView="currentView"
      :readonly="false"
      :dragStart="onDragStart"
      :resizeStart="onResizeStart"
      :actionBegin="handleActionBegin"
    >
      <e-views>
        <e-view option="Day"></e-view>
        <e-view option="Week"></e-view>
        <e-view option="TimelineMonth"></e-view>
        <e-view option="WorkWeek"></e-view>
        <e-view option="Month"></e-view>
        <e-view option="Agenda"></e-view>
      </e-views>
      <e-resources>
        <e-resource
          field="OwnerId"
          title="负责人"
          name="Owners"
          :dataSource="ownerDataSource"
          textField="OwnerText"
          idField="Id"
          colorField="OwnerColor"
        ></e-resource>
      </e-resources>
    </ejs-schedule>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch } from "vue";
import {
  ScheduleComponent as EjsSchedule,
  ViewsDirective as EViews,
  ViewDirective as EView,
  ResourcesDirective as EResources,
  ResourceDirective as EResource,
  Day,
  Week,
  TimelineViews,
  TimelineMonth,
  WorkWeek,
  Month,
  Agenda,
  Resize,
  DragAndDrop,
} from "@syncfusion/ej2-vue-schedule";
import { processEvent } from "src/pages/Project/schedule/processEvent.js";

import {
  updateScheduleEvent,
  createScheduleEvent,
  deleteScheduleEvent,
} from "src/api/strapi/project.js";

import { L10n, setCulture } from "@syncfusion/ej2-base";
// import { loadCldr } from '@syncfusion/ej2-base';
import chinese from "./zh-china.json";

import useProjectStore from "src/stores/project.js";
import { toRefs } from "vue";

const props = defineProps({
  by: {
    type: String,
    default: "project",
  },
  schedule: {
    type: Object,
    default() {
      return {};
    },
  },
});
const emit = defineEmits("create", "update", "remove");

const { by, schedule } = toRefs(props);

const projectStore = useProjectStore();
const projectMembers = computed(() => projectStore.project.project_members);
const cardMembers = computed(() => projectStore.card.card_members);

const currentView = "Month";

const selectedDate = new Date(2024, 2, 8);
const schedule_id = computed(() => schedule.value?.id);
const schedule_events = computed(() => schedule.value?.schedule_events);
const schedule_data = ref();
const eventSettings = ref();

const set_schedule_data = () => {
  if (schedule_events.value?.length > 0) {
    schedule_data.value = schedule_events.value?.map((i) => ({
      ...i,
      Id: i.id,
      OwnerId: i.executor?.id,
    }));
  } else {
    schedule_data.value = [];
  }
  eventSettings.value = {
    enableTooltip: false,
    dataSource: schedule_data.value,
  };
  //   console.log("set_schedule_data");
};
watch(
  schedule,
  () => {
    if (schedule.value) {
      //   console.log("schedule changed");
      set_schedule_data();
    }
  },
  { immediate: true, deep: true }
);
const members = computed(() => {
  let res;
  if (by.value === "project") {
    res = projectMembers.value;
  }
  if (by.value === "card") {
    res = cardMembers.value;
  }
  if (by.value === "user") {
  }
  return res;
});
const ownerDataSource = computed(() =>
  members.value.map((i) => ({
    Id: i.id,
    OwnerText: i.nickname || i.by_user?.username,
    OwnerColor: i.color_marker || "#0f5c7f",
  }))
);

// loadCldr(chinese);
// const locale = 'zh-CN'
setCulture("en-US");
L10n.load(chinese);

provide("schedule", [
  Day,
  Week,
  TimelineViews,
  TimelineMonth,
  WorkWeek,
  Month,
  Agenda,
  Resize,
  DragAndDrop,
]);

const onDragStart = (args) => {
  // args.excludeSelectors = 'e-header-cells,e-all-day-cells'
  (args.navigation.enable = true),
    (args.interval = 10),
    (args.scroll = {
      enable: true,
      scrollBy: 50,
      timeDelay: 100,
    });
};
const onResizeStart = (args) => {
  (args.interval = 1),
    (args.scroll = {
      enable: true,
      scrollBy: 50,
      timeDelay: 100,
    });
};

const act = ref();
const createEvents = async (args) => {
  const __events = processEvent(args);
  act.value = __events;

  const res = await Promise.allSettled(
    __events.map(async (i) => {
      i.id && delete i.id;
      let params = {};
      params.data = i;
      params.data.schedule = schedule_id.value;
      return await createScheduleEvent(params);
    })
  );

  const successfulResults = res
    .filter((result) => result.status === "fulfilled")
    // @ts-ignore
    .map((result) => result.value?.data);
  emit("create", successfulResults);

  return successfulResults;
};
const updateEvents = async (args) => {
  // console.log('args',args);
  const __id = args;
  const __events = processEvent(args);
  act.value = __events;

  const res = await Promise.allSettled(
    __events.map(async (i) => {
      const _id = i.id;
      delete i.id;
      let params = {
        data: i,
      };
      params.data.schedule = schedule_id.value;
      return await updateScheduleEvent(_id, params);
    })
  );

  const successfulResults = res
    .filter((i) => i.status === "fulfilled")
    // @ts-ignore
    .map((i) => i.value?.data);
  emit("update", successfulResults);
};
const removeEvents = async (args) => {
  const __events = processEvent(args);
  const res = await Promise.allSettled(
    __events.map(async (i) => {
      return await deleteScheduleEvent(i.id);
    })
  );
  const successfulResults = res
    .filter((i) => i.status === "fulfilled")
    // @ts-ignore
    .map((i) => i.value?.data);
  //   console.log("remove", successfulResults);
  emit("remove", successfulResults);
};
const handleActionBegin = async (args) => {
  if (args.requestType === "eventCreate") {
    const create = args.addedRecords;
    await createEvents(create);
  }
  if (args.requestType === "eventChange") {
    const change = args.changedRecords;
    // console.log('change',change);
    await updateEvents(change);
  }
  if (args.requestType === "eventRemove") {
    const remove = args.deletedRecords;
    await removeEvents(remove);
  }
};
</script>

<style>
@import "@syncfusion/ej2-base/styles/material-dark.css";
@import "@syncfusion/ej2-buttons/styles/material-dark.css";
@import "@syncfusion/ej2-calendars/styles/material-dark.css";
@import "@syncfusion/ej2-dropdowns/styles/material-dark.css";
@import "@syncfusion/ej2-inputs/styles/material-dark.css";
@import "@syncfusion/ej2-navigations/styles/material-dark.css";
@import "@syncfusion/ej2-popups/styles/material-dark.css";
@import "@syncfusion/ej2-vue-schedule/styles/material-dark.css";
.e-schedule {
  background: #303030;
  border: 0px solid #61616100;
}
</style>
