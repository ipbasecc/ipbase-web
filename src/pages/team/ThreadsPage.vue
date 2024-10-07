<template>
  <NavigatorContainer v-if="$q.screen.gt.xs">
    <q-layout
      view="hHh LpR lfr"
      container
      class="absolute-full"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <q-drawer
        v-if="(uiStore.app === 'teams' || uiStore.app === 'threads') && $q.screen.gt.xs"
        side="left"
        v-model="uiStore.threadsDrawer"
        :breakpoint="640"
        :width="threadsDrawerWidth"
        class="border-right"
      >
        <div
          class="absolute-full column no-wrap"
          :class="$q.dark.mode ? '' : 'bg-gery-2 text-grey-10'"
        >
          <ThreadsList @enterThread="enterThread" />
        </div>
      </q-drawer>
      <q-page-container>
        <q-page :class="$q.dark.mode ? 'bg-darker' : 'bg-grey-2'">
          <div
            v-if="$q.screen.gt.xs"
            class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
            :class="dragWidth ? 'bg-primary ' : ''"
            :style="dragWidth ? 'width: 3px' : 'width: 10px'"
            @mousedown="handleMouseDown"
          >
            <q-icon
              :name="`mdi-chevron-${uiStore.threadsDrawer ? 'left' : 'right'}`"
              color="primary"
              size="sm"
              @click="togglethreadsDrawer()"
              class="cursor-pointer toggle-btn transition z-max"
              :style="`transform: translateX(${
                uiStore.threadsDrawer ? -16 : 12
              }px)`"
            />
          </div>
          <ThreadContainer
            v-if="thread"
            :chatInfo
            :showToolbar="false"
            class="absolute-full"
          />
          <ResumeFolder v-else class="absolute-full" />
        </q-page>
      </q-page-container>
    </q-layout>
  </NavigatorContainer>
  <template v-else>
    <ThreadContainer
      v-if="thread"
      :chatInfo
      :fullHeight="true"
      class="absolute-full"
      @closeThread="thread = void 0"
    />
    <ThreadsList v-else @enterThread="enterThread" />
  </template>
</template>

<script setup>
import {computed, onBeforeMount, reactive, ref} from "vue";

import ThreadContainer from "./chat/ThreadContainer.vue";
import ThreadsList from "./components/ThreadsList.vue";
import ResumeFolder from "./components/widgets/ResumeFolder.vue";
import NavigatorContainer from "pages/team/NavigatorContainer.vue";
import {uiStore} from "src/hooks/global/useStore";
import {useMouse} from "@vueuse/core";
import {useQuasar} from "quasar";

const $q = useQuasar();
const thread = ref();
const enterThread = (val) => {
  thread.value = val;
};

const togglethreadsDrawer = () => {
  uiStore.threadsDrawer = !uiStore.threadsDrawer;
};
const threadsDrawerWidth = ref(360);
onBeforeMount(() => {
  if ($q.screen.gt.md) {
    threadsDrawerWidth.value = 460;
  } else if ($q.screen.gt.lg) {
    threadsDrawerWidth.value = 540;
  }
});

const { x } = useMouse({ touch: false });
const threadsDrawerMinWidth = ref(240);
const threadsDrawerMaxWidth = ref(640);
const _ori_width = ref();
const dragWidth = ref(false);
const position = reactive({
  x: NaN,
  y: NaN,
});
const handleMouseDown = () => {
  position.x = x.value;
  dragWidth.value = true;
  _ori_width.value = threadsDrawerWidth.value;
  uiStore.dragging = true;
};
const handleMouseUp = () => {
  dragWidth.value = false;
  uiStore.dragging = false;
};
const handleMouseMove = () => {
  if (!position.x || !dragWidth.value || !_ori_width.value) return;

  const deltaX = x.value - position.x;
  if (
    _ori_width.value + deltaX >= threadsDrawerMinWidth.value &&
    _ori_width.value + deltaX <= threadsDrawerMaxWidth.value
  ) {
    threadsDrawerWidth.value = _ori_width.value + deltaX;
  } else if (_ori_width.value + deltaX > threadsDrawerMaxWidth.value) {
    threadsDrawerWidth.value = threadsDrawerMaxWidth.value;
  } else if (_ori_width.value + deltaX === threadsDrawerMaxWidth.value) {
    threadsDrawerWidth.value = threadsDrawerMinWidth.value;
  } else if (_ori_width.value + deltaX < 50) {
    uiStore.threadsDrawer = false;
  }
};

const chatInfo = computed(() => ({
  mm_channel_id: thread.value?.thread_channel_id,
  post_id: thread.value?.thread_post_id,
}));
</script>
