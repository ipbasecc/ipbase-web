<template>
  <div class="absolute-full column no-wrap">
    <template v-if="cssLoaded">
      <q-resize-observer @resize="onResize" />
      <ejs-schedule
        v-if="container"
        :height="container?.height || '100%'"
        :width="container?.width || '100%'"
        :selectedDate="selectedDate"
        :eventSettings="eventSettings"
        :currentView="currentView"
        :readonly="false"
        :dragStart="onDragStart"
        :resizeStart="onResizeStart"
        :actionBegin="handleActionBegin"
        :popupOpen="onPopupOpen"
        :dragStop="onDragStop"
        :resizeStop="onResizeStop"
      >
        <e-views>
          <e-view option="Day"></e-view>
          <e-view option="Week"></e-view>
          <e-view option="TimelineMonth"></e-view>
          <e-view option="WorkWeek"></e-view>
          <e-view option="Month"></e-view>
          <e-view option="Agenda"></e-view>
        </e-views>
        <e-resources v-if="!isShare">
          <e-resource
            field="OwnerId"
            :title="$t('executor')"
            name="Owners"
            :dataSource="ownerDataSource"
            textField="OwnerText"
            idField="Id"
            colorField="OwnerColor"
          ></e-resource>
        </e-resources>
      </ejs-schedule>
    </template>
    <link
      :href="$q.dark.mode ? $pathService('/css/dark.css') : $pathService('/css/light.css')"
      rel="stylesheet"
    />
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, toRefs, onBeforeMount } from "vue";
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
import { processEvent } from "./processEvent.js";

import {
  updateScheduleEvent,
  createScheduleEvent,
  deleteScheduleEvent,
} from "src/api/strapi/project.js";

import { L10n, setCulture, extend } from "@syncfusion/ej2-base";
// import { loadCldr } from '@syncfusion/ej2-base';
import chinese from "./zh-china.json";

import { useQuasar } from "quasar";
import { teamStore } from "src/hooks/global/useStore.js";

import { $pathService } from 'src/boot/service.js'

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
  isShare: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["create", "eventUpdated", "remove"]);
const $q = useQuasar();

const { by, schedule, isShare } = toRefs(props);

const container = ref();
const onResize = (size) => {
  container.value = size;
};

const projectMembers = computed(() => teamStore.project?.project_members);
const cardMembers = computed(() => teamStore.card?.card_members);

const currentView = "Month";

const selectedDate = ref();
const schedule_id = computed(() => schedule.value?.id);
const schedule_events = computed(() => schedule.value?.schedule_events);
const schedule_data = ref();
const eventSettings = ref({});

const set_schedule_data = () => {
  if (schedule_events.value?.length > 0) {
    schedule_data.value = schedule_events.value?.map((i) => ({
      ...i,
      Id: i.id,
      OwnerId: isShare.value ? i.executor?.id : null,
    }));
  } else {
    schedule_data.value = [];
  }
  if (schedule_data.value?.length > 0) {
    selectedDate.value = selectedDate.value || getData(schedule_data.value);
  }
  eventSettings.value = {
    dataSource: extend([], schedule_data.value, null, true),
  };
  eventSettings.value.enableTooltip = false;
};

const getData = (events) => {
  let earliestEventDate = null;

  // 遍历所有事件，找到开始时间最早的事件
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const eventStartTime = event.StartTime; // 假设 StartTime 是 ISO 8601 格式的字符串

    // 创建一个 Date 对象来比较时间
    const eventDate = new Date(eventStartTime).getTime();

    // 如果没有找到最早的事件或者当前事件的开始时间更早
    if (!earliestEventDate || eventDate < earliestEventDate) {
      earliestEventDate = eventDate;
    }
  }

  // 如果找到了最早的事件，返回它的开始时间作为默认日期
  if (earliestEventDate) {
    return new Date(earliestEventDate);
  }

  // 如果没有事件或无法确定最早事件，返回当前日期或其他默认值
  // console.log(events[0]);
  return new Date();
};

watch(
  schedule,
  () => {
    if (schedule.value) {
        console.log("schedule changed");
      set_schedule_data();
    }
  },
  { immediate: true, deep: true }
);
const members = computed(() => {
  let res;
  if (by.value === "project") {
    res = projectMembers.value;
  } else if (by.value === "card") {
    res = cardMembers.value;
  } else if (by.value === "user") {
  } else {
    res = null;
  }
  return res;
});
const ownerDataSource = computed(
  () =>
    members.value?.map((i) =>
      !isShare.value
        ? {
            Id: i.id,
            OwnerText: i.nickname || i.by_user?.username,
            OwnerColor: i.color_marker || "#0f5c7f",
          }
        : []
    ) || []
);

// 处理主题切换时加载不同CSS
const cssLoaded = ref(false);
const loadCss = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = $q.dark.mode ? $pathService('/css/dark.css') : $pathService('/css/light.css');
  link.onload = () => (cssLoaded.value = true);
  document.head.appendChild(link);
};

onBeforeMount(() => {
  loadCss();
});

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

const createEvents = async (args) => {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
  console.log('createEvents', args)
  const __events = processEvent(args);
  console.log('createEvents __events', __events)

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
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
  const __events = processEvent(args);

  const updatePromises = __events.map(async (i) => {
    const _id = i.id;
    delete i.id;
    let params = {
      data: i,
      schedule: schedule_id.value, // 确保 schedule_id.value 已经被定义和赋值
    };
    return await updateScheduleEvent(_id, params); // 直接返回 Promise
  });
  // console.log("updatePromises", updatePromises);

  let _process;
  await Promise.allSettled(updatePromises).then((res) => {
    const successfulResults = res.filter((i) => i.status === "fulfilled");
    if (successfulResults?.length > 0) {
      _process = successfulResults.map((i) => i.value?.data);
      //
    }
  });
  // console.log("_process", );
  return _process;
};
const removeEvents = async (args) => {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
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
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  } else {
    if (args.requestType === "eventCreate") {
      const create = args.addedRecords;
      await createEvents(create);
    }
    if (args.requestType === "eventChange") {
      const change = args.changedRecords;
      const res = await updateEvents(change);
      console.log("updateEvents", res);
      if (res) {
        // emit("eventUpdated", res);
      }
    }
    if (args.requestType === "eventRemove") {
      const remove = args.deletedRecords;
      await removeEvents(remove);
    }
  }
};
function onPopupOpen(args) {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
}
function onDragStop(args) {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
}
function onResizeStop(args) {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
}
function onEventCheck(args) {
  if (isShare.value || teamStore.shareInfo) {
    const eventObj = args.data instanceof Array ? args.data[0] : args.data;
    return eventObj?.StartTime < new Date();
  }
}

const onDragStart = (args) => {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
  // args.excludeSelectors = 'e-header-cells,e-all-day-cells'
  args.navigation.enable = true;
  args.interval = 10;
  args.scroll = {
    enable: true,
    scrollBy: 50,
    timeDelay: 100,
  }
};
const onResizeStart = (args) => {
  if (isShare.value || teamStore.shareInfo) {
    args.cancel = onEventCheck(args);
  }
  args.interval = 1;
  args.scroll = {
    enable: true,
    scrollBy: 50,
    timeDelay: 100,
  };
};
</script>
