<template>
  <div
    class="full-width no-wrap items-center"
    :class="`${$q.screen.gt.xs ? 'column' : 'row'} ${
      $q.screen.gt.md ? 'gap-md' : 'gap-sm'
    }`"
  >
    <div
      v-if="$q.screen.gt.xs"
      class="row no-wrap items-center cursor-pointer q-pb-sm relative-position"
    >
      <q-img
        src="../../../public/logo.png"
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
          <div
            v-if="uiStore.app === i.val"
            class="flex absolute-left full-height q-pl-xs q-py-sm"
          >
            <div style="width: 3px; background-color: var(--q-primary)"></div>
          </div>
          <q-tooltip class="transparent">
            <q-card bordered>
              <q-card-section>
                <div class="font-x-large font-bold-600">{{ i.label }}</div>
                <q-separator spaced />
                <div class="font-medium text-no-wrap">
                  {{ i.description }}
                </div>
              </q-card-section>
            </q-card>
          </q-tooltip>
        </q-avatar>
      </template>
    </template>
    <template v-else>
      <q-tabs v-model="defaultApp" class="q-px-xl">
        <q-tab
          v-for="i in enabledApps"
          :key="i.val"
          :name="i.val"
          :icon="i.icon"
          :label="i.label"
          :class="`text-grey-1${$q.dark.mode ? '' : '0'}`"
          @click="to(i)"
        />
      </q-tabs>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onBeforeMount } from "vue";
import { useRouter, useRoute } from "vue-router";
import useGetMyMatedate from "src/hooks/global/useGetMyMatedata.js";
import localforage from "localforage";

import { uiStore, teamStore } from "src/hooks/global/useStore";
import { useQuasar } from "quasar";

import BrandMenu from "src/components/VIewComponents/BrandMenu.vue";
import NotifyBlock from "src/components/VIewComponents/NotifyBlock.vue";

const $q = useQuasar();

const router = useRouter();
const route = useRoute();

const { logged, userChannelId } = useGetMyMatedate;
const ipbase_uri = computed(() => {
  // console.log('logged',logged.value);
  return (
    (logged.value && userChannelId.value && `${userChannelId.value}/posts`) ||
    "/"
  );
});
const apps = [
  {
    val: "teams",
    label: "团队",
    icon: "mark_chat_read",
    description: "基于团队、频道的IM",
    to: "teams",
    enable: true,
  },
  {
    val: "affairs",
    label: "事务",
    icon: "mdi-calendar-clock",
    description: "管理个人事务",
    to: "affairs",
    enable: true,
  },
  {
    val: "ipbase",
    label: "品牌",
    icon: "contacts",
    description: "打造你的个人、团队品牌",
    to: ipbase_uri.value,
    enable: false,
  },
  {
    val: "connect",
    label: "Flame",
    icon: "panorama_fish_eye",
    description: "Autodesk Flame中文教程",
    to: "flame",
    enable: false,
  },
  {
    val: "threads",
    label: "主题",
    icon: "mdi-forum",
    description: "访问你参与讨论的主题",
    to: "teams/threads",
    enable: !$q.screen.gt.xs,
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
  if (i.to === "flame") {
    window.open("https://flame.vip", "_blank");
  } else {
    uiStore.app = i.val;
    await localforage.setItem("last_module", i.to);
    await router.push(`/${i.to}`);
  }
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
