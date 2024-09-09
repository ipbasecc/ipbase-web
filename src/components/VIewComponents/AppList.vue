<template>
  <div
    class="full-width no-wrap flex-center"
    :class="`${$q.screen.gt.xs ? 'column' : 'row'} ${
      $q.screen.gt.md ? 'gap-md' : 'gap-md'
    }`"
    :style="`${$q.screen.gt.xs ? '' : 'height: 72px'}`"
  >
    <div
      v-if="$q.screen.gt.xs"
      class="row no-wrap items-center cursor-pointer q-pb-sm relative-position"
    >
      <q-img src="../../../public/logo.png"
        :ratio="1"
        height="30px"
        width="30px"
        fit="contain"
        spinner-color="primary"
        spinner-size="22px"
      />
      <span class="radius-xs bg-black border absolute-top-right" style="font-size: 0.6rem">Beta</span>
      <BrandMenu :offset="[0, -24]" />
    </div>

    <template v-if="$q.screen.gt.xs">
      <NotifyBlock />
      <template v-for="i in enabledApps" :key="i.val">
        <q-avatar
          square
          :icon="i.icon"
          class="radius-sm cursor-pointer transition"
          :class="
            uiStore.app === i.val
              ? `bg-primary-dark border app-active`
              : 'border-placeholder'
          "
          @click="to(i)"
        >
          <div v-if="uiStore.app === i.val"
            class="flex absolute-left full-height q-pl-xs q-py-sm"
          >
            <div style="width: 3px; background-color: var(--q-primary)"></div>
          </div>
          <q-tooltip class="transparent">
            <q-card bordered>
              <q-card-section :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-10'">
                <div class="font-x-large font-bold-600">{{ $t(i.label) }}</div>
                <q-separator spaced />
                <div class="font-medium text-no-wrap">
                  {{ $t(i.description) }}
                </div>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-avatar>
      </template>
    </template>
    <template v-else>
      <template v-for="i in enabledApps" :key="i.val">
        <q-avatar
            square
            :icon="i.icon"
            class="radius-sm cursor-pointer transition"
            :class="
              uiStore.app === i.val
                ? `bg-primary-dark border app-active`
                : 'border-placeholder'
            "
            size="64px"
            @click="to(i)"
        >
          <div v-if="uiStore.app === i.val"
               class="column absolute-top full-width q-px-sm q-pt-xs"
          >
            <div style="height: 3px; background-color: var(--q-primary)"></div>
          </div>
        </q-avatar>
      </template>
    </template>
  </div>
</template>

<script setup>
import {computed, onBeforeMount, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import localforage from "localforage";

import {teamStore, uiStore} from "src/hooks/global/useStore";
import {useQuasar} from "quasar";

import BrandMenu from "src/components/VIewComponents/BrandMenu.vue";
import NotifyBlock from "src/components/VIewComponents/NotifyBlock.vue";

const $q = useQuasar();

const router = useRouter();
const route = useRoute();
const apps = [
  {
    val: "teams",
    label: 'team',
    icon: "developer_board",
    description: 'app_team_purpose',
    to: "teams",
    enable: true,
  },
  {
    val: "chats",
    label: 'chats',
    icon: "mark_chat_read",
    description: 'app_chat_purpose',
    to: "chats",
    enable: true,
  },
  {
    val: "affairs",
    label: 'affairs',
    icon: "mdi-check-all",
    description: 'app_affairs_purpose',
    to: "affairs",
    enable: true,
  },
  {
    val: "threads",
    label: 'threads',
    icon: "mdi-forum",
    description: 'app_threads_purpose',
    to: "teams/threads",
    enable: !$q.screen.gt.xs,
  },
  {
    val: "brand",
    label: 'brand',
    icon: "mdi-creation",
    description: 'app_brand_purpose',
    to: "brand",
    enable: $q.screen.gt.xs
  },
];
const enabledApps = computed(() => apps.filter((i) => i.enable));
const active = ref();
const routeName = computed(() => route.name);
const defaultApp = ref("teams");
onBeforeMount(() => {
  if (routeName.value === "AffairsPage") {
    defaultApp.value = "affairs";
  } else if (routeName.value === "teams" || teamStore.navigation) {
    defaultApp.value = "teams";
  } else if (routeName.value === "team_threads_homepage") {
    defaultApp.value = "threads";
  } else if (routeName.value === "ChatsPage") {
    defaultApp.value = "chats";
  }  else if (routeName.value === "brand") {
    defaultApp.value = "brand";
  } else {
    defaultApp.value = "teams";
  }
});

const getFirstSegment = (fullPath) => {
  // 使用 split 方法将 fullPath 按照 / 分割成数组
  const segments = fullPath.split("/");
  // 返回第一个非空的部分
  return segments.find((segment) => segment !== "");
};
const to = async (i) => {
  uiStore.app = i.val;
  teamStore && teamStore.$reset_channel();
  await localforage.setItem("last_module", i.to);
  await router.push(`/${i.to}`);
};
const topLeave_byRoute = computed(() => getFirstSegment(route.fullPath));
watchEffect(() => {
  active.value = topLeave_byRoute.value;
  uiStore.app = topLeave_byRoute.value;
});
</script>

<style lang="scss" scoped>
.app-btn {
  border: 1px solid #33333300;
}
.app-btn:hover {
  border: 1px solid #333;
}
.app-active {
  box-shadow: 5px 11px 30px 0 rgb(1 14 208 / 64%);
}
.app-active:hover {
  box-shadow: 0 0 20px 1px #ffbb763f;
  border: 1px solid rgba(255, 255, 255, 0.454) !important;
}
</style>
