<template>
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
  <template v-else>
    <q-toolbar
      class="fixed-top z-fab row flex-center q-pt-md q-pb-sm q-px-md"
      v-bind="$attrs"
    >
      <q-btn flat icon-right="expand_more" no-caps class="q-mx-xs">
        <q-img
          :src="$pathService('/logo.png')"
          :ratio="1"
          height="36px"
          width="36px"
          fit="contain"
          spinner-color="primary"
          spinner-size="22px"
        />
        <span class="q-mx-md q-pr-xl">{{ $t('ipbase_brand') }}</span>
        <BrandMenu :offset="[0, -44]" />
      </q-btn>
      <q-space />
      <AccountMenu />
      <div
        class="absolute-full z-unfab"
        :class="$q.dark.mode ? 'bg-black' : 'bg-white'"
        :style="`opacity: ${opacity};`"
      ></div>
    </q-toolbar>
    <router-view />
  </template>
</template>
<script setup>
import useGetMyMatedate from "src/hooks/global/useGetMyMatedata.js";
import { loginAndInit } from "src/hooks/init.js";

import {
  computed,
  onMounted,
  provide,
  ref,
  watch,
  onBeforeMount,
  onBeforeUnmount
} from "vue";

import BrandMenu from "src/components/VIewComponents/BrandMenu.vue";
import AccountMenu from "src/components/VIewComponents/AccountMenu.vue";

import { useQuasar } from "quasar";
import { userStore, teamStore, uiStore } from "src/hooks/global/useStore.js";
import { clearLocalDB } from "pages/team/hooks/useUser";

import { init_stratpi, init_mattermost } from "src/common/init.js";

init_stratpi();
init_mattermost();

onBeforeMount(async () => {
  uiStore.pageLoaded = true;
  if (!teamStore.init) {
    await loginAndInit();
  }
});
const $q = useQuasar();

const isLogged = ref();
const { fineMeErr } = useGetMyMatedate;
watch(
  userStore,
  () => {
    isLogged.value = userStore.logged;
  },
  { immediate: true, deep: true }
);

const errStatu = ref(0);
if (fineMeErr && fineMeErr.value?.networkError?.statusCode === "401") {
  errStatu.value++;
}

// 第一次请求数据出错，尝试重新请求
const count = ref(2);
//第二次请求数据出错，清空本地缓存重载整个页面
const logout_then_refetch = async () => {
  await clearLocalDB("MainLayout");
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

onMounted(async () => {
  window.addEventListener("scroll", handleScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
<style scoped lang="scss">
.back_home:hover {
  color: $primary;
}
</style>
