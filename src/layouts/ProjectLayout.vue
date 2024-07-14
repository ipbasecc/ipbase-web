<template>
  <q-layout
    view="lHr LpR lFr"
    :class="$q.dark.mode ? 'bg-black text-white' : 'bg-grey-1 text-grey-10'"
  >
    <q-drawer
      v-model="appList"
      side="left"
      :width="76"
      class="border-right q-pa-sm"
      :class="$q.dark.mode ? 'bg-grey-10' : 'bg-white'"
    >
      <div class="fit column no-wrap gap-md items-center q-py-md">
        <AppList />
        <q-space />
        <q-btn
          v-if="is_development"
          flat
          dense
          icon="dark_mode"
          @click="$q.dark.toggle()"
        />
        <AccountMenu
          v-if="isLogged"
          menu_anchor="bottom end"
          menu_self="bottom left"
          :menu_offset="[10, 0]"
          show="slide-up"
          hide="slide-down"
          :vertical="true"
        />
      </div>
    </q-drawer>

    <q-page-container>
      <q-page>
        <!-- 如果请求数据出错发生了第一次，不确定原因，尝试再次请求 -->
        <div v-if="errStatu === 1" class="absolute-full column flex-center">
          <q-card bordered>
            <q-card-section>
              <div class="text-h6">数据请求出错：</div>
              <div class="text-subtitle2">
                正在重新请求数据... <span class="q-mx-sm">{{ count }}</span>
              </div>
            </q-card-section>
            <q-card-section>
              <q-btn
                color="primary"
                icon="check"
                label="立即尝试刷新数据"
                class="full-width"
                @click="logout_then_refetch"
              />
            </q-card-section>
          </q-card>
        </div>
        <!-- 如果再次请求依然出错，通知用户发生错误 -->
        <div v-if="errStatu === 2" class="absolute-full column flex-center">
          <span class="text-h4">数据请求出错：</span>
          <ol>
            <li>网络出现故障，无法获取所需数据；</li>
            <li>您的账号可能被封禁，请联系官方！</li>
          </ol>
        </div>
        <div v-else class="absolute-full">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup>
import useGetMyMatedate from "src/hooks/global/useGetMyMatedata.js";
import { computed, onMounted, provide, ref, watch } from "vue";

import AppList from "src/components/VIewComponents/AppList.vue";
import AccountMenu from "src/components/VIewComponents/AccountMenu.vue";

import { init_stratpi, init_mattermost } from "src/common/init.js";
import { userStore } from "src/hooks/global/useStore.js";

const is_development = ref(process.env.DEV);

init_stratpi();
init_mattermost();

const isLogged = ref();
const { fineMeErr } = useGetMyMatedate;
watch(
  userStore,
  () => {
    isLogged.value = userStore.logged;
  },
  { immediate: true, deep: true }
);

const appList = ref(true);

const errStatu = ref(0);
if (fineMeErr && fineMeErr._value?.networkError?.statusCode === "401") {
  errStatu.value++;
  startCountdown();
}

// 第一次请求数据出错，尝试重新请求
const count = ref(2);
const startCountdown = () => {
  setInterval(() => {
    count.value--;
    if (count.value === 0) {
      router.push("/");
    }
  }, 1000);
};
//第二次请求数据出错，清空本地缓存重载整个页面
const logout_then_refetch = () => {
  sessionStorage.clear();
  localStorage.clear;
  // router.push('/');
  window.location.reload();
};

const opacity = ref(0);
const blur = ref(0);
provide(
  "opacity",
  computed(() => opacity.value)
);
provide(
  "blur",
  computed(() => blur.value)
);
const handleScroll = () => {
  const scrollTop = window.scrollY;

  let o = scrollTop / 500;
  let b = scrollTop / 10;

  opacity.value = o <= 1 ? o : 1;
  blur.value = b <= 50 ? b : 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
const noShadowPages = [
  "register",
  "login",
  "channel_homepage",
  "posts",
  "article",
  "video",
  "audio",
  "element",
  "sales",
  "bizcard",
  "chat",
  "favorite",
];
</script>
<style scoped lang="scss">
.back_home:hover {
  color: $primary;
}
</style>
