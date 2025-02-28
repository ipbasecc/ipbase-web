<template>
  <div
    class="full-width no-wrap flex-center"
    :class="`
      ${$q.screen.gt.xs ? 'column' : 'row'}
      ${$q.screen.gt.md ? 'gap-md' : 'gap-md'}
    `"
    :style="`${$q.screen.gt.xs ? '' : 'height: 72px'}`"
  >
    <div
      v-if="$q.screen.gt.xs"
      class="row no-wrap items-center unselected q-pb-sm relative-position"
      :class="$q.platform.is.electron ? 'q-electron-drag' : ''"
    >
      <q-img :src="$pathService('/logo.png')"
        :ratio="1"
        height="30px"
        width="30px"
        fit="contain"
        spinner-color="primary"
        spinner-size="22px"
        class="loader"
        :class="{ 'loading': uiStore.axiosStauts === 'pending' }"
      />
      <span class="radius-xs bg-black border absolute-top-right" style="font-size: 0.5rem; transform: translateX(7px)">Alpha</span>
      <!-- <BrandMenu :offset="[0, -24]" /> -->
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
          <q-tooltip class="transparent" anchor="top end" self="top start" :offset="[-5, 4]">
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
import {computed, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {teamStore, uiStore} from "src/hooks/global/useStore";
import { $ui } from "src/boot/service";

import NotifyBlock from "src/components/VIewComponents/NotifyBlock.vue";
import localforage from "localforage";

const router = useRouter();
const route = useRoute();
const enabledApps = computed(() => $ui().apps?.filter((i) => i.enable));
const to = async (i) => {
  uiStore.app = i.val;
  uiStore.deal_active_item = '';
  teamStore.navigation = null;
  teamStore && teamStore.$reset_channel() && teamStore.$reset_project();
  await localforage.setItem("last_module", i.to);
  await router.push(`/${i.to}`);
};

/**
 * use full path visitor, auto set uiStore.app to highlight navigation btn
 * @param fullPath
 * @param index
 * @returns {*}
 */
const getSegmentByPath = (fullPath, index) => {
  // 使用 split 方法将 fullPath 按照 / 分割成数组
  const segments = fullPath.split("/")?.filter((i) => i !== '');

  if(segments[index])
  return segments[index] || null;
};
const topLeave_byRoute = computed(() => getSegmentByPath(route.fullPath, 0));
watch(topLeave_byRoute, () => {
  if(topLeave_byRoute.value && !uiStore.app){
    uiStore.app = topLeave_byRoute.value;
  }
},{immediate:true})
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.loader {
  animation: spin 5s linear;
  animation-play-state: paused;
}

.loader.loading {
  animation-play-state: running;
}

</style>
