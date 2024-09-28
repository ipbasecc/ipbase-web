<template>
    <q-layout view="lHh LpR lFf"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
    >

        <q-drawer v-model="uiStore.newsLeftDrawer" :width="navDrawerWidth" side="left">
            <NewsList />
        </q-drawer>

        <q-page-container>
            <q-page padding>
                <div
                    class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
                    :class="dragWidth ? 'bg-primary ' : ''"
                    :style="dragWidth ? 'width: 3px' : 'width: 10px'"
                    @mousedown="handleMouseDown"
                >
                    <q-icon
                        :name="`mdi-chevron-${uiStore.newsLeftDrawer ? 'left' : 'right'}`"
                        color="primary"
                        size="sm"
                        @click="toggleLeftDrawer()"
                        class="cursor-pointer toggle-btn transition z-max"
                        :style="`transform: translateX(${
                            uiStore.newsLeftDrawer ? -16 : 12
                        }px)`"
                    >
                    <q-tooltip class="border" :class="$q.dark.mode ? 'bg-darker text-white' : 'bg-grey-1 text-black'">
                        shift + {{ uiStore.newsLeftDrawer ? '<' : '>' }}
                    </q-tooltip>
                    </q-icon>
                </div>
                <router-view />
            </q-page>
        </q-page-container>

    </q-layout>
</template>
  
<script setup>
import { ref, reactive } from 'vue'
import {useMouse} from "@vueuse/core";
import {uiStore} from "src/hooks/global/useStore.js";
import NewsList from './NewsList.vue'

const toggleLeftDrawer = () => {
    uiStore.newsLeftDrawer = !uiStore.newsLeftDrawer
}

const navDrawerWidth = ref(210);
const { x } = useMouse({ touch: false });
const navDrawerMinWidth = ref(180);
const navDrawerMaxWidth = ref(340);
const _ori_width = ref();
const dragWidth = ref(false);
const position = reactive({
  x: NaN,
  y: NaN,
});
const handleMouseDown = () => {
  position.x = x.value;
  dragWidth.value = true;
  _ori_width.value = navDrawerWidth.value;
  uiStore.draging = true;
};
const handleMouseUp = () => {
  dragWidth.value = false;
  uiStore.draging = false;
};
const handleMouseMove = () => {
  if (!position.x || !dragWidth.value || !_ori_width.value) return;

  const deltaX = x.value - position.x;
  if (
    _ori_width.value + deltaX >= navDrawerMinWidth.value &&
    _ori_width.value + deltaX <= navDrawerMaxWidth.value
  ) {
    navDrawerWidth.value = _ori_width.value + deltaX;
  } else if (_ori_width.value + deltaX > navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMaxWidth.value;
  } else if (_ori_width.value + deltaX === navDrawerMaxWidth.value) {
    navDrawerWidth.value = navDrawerMinWidth.value;
  } else if (_ori_width.value + deltaX < 50) {
    uiStore.newsLeftDrawer = false;
  }
};

</script>