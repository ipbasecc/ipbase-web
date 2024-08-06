<template>
  <q-menu
    v-model="openBrand"
    transition-show="jump-down"
    transition-hide="jump-up"
    fit
    :offset="offset"
    class="bg-white z-max shadow-focus"
  >
    <q-card bordered style="max-width: 24rem;">
      <q-card-section
        class="row no-wrap q-pa-xs q-pt-sm items-center justify-between border-bottom"
      >
        <q-avatar class="q-pl-sm">
          <q-img
            src="../../../public/logo.png"
            :ratio="1"
            height="36px"
            width="36px"
            fit="contain"
            spinner-color="primary"
            spinner-size="22px"
          />
        </q-avatar>
        <span
          class="q-space row flex-center cursor-pointer back_home transition"
          @click="gohome()"
        >
          {{ $t('gohome') }}
        </span>
        <q-icon
          name="expand_less"
          color="primary"
          size="sm"
          class="q-px-md cursor-pointer"
          @click.stop="openBrand = !openBrand"
        />
      </q-card-section>
      <q-card-section class="q-pa-xs">
        <q-list>
          <q-item v-for="i in enabledApps" :key="i.val"
          clickable v-ripple class="radius-xs" @click="to(i)">
            <q-item-section side>
              <q-avatar>
                <q-icon :name="i.icon" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t(i.label) }}</q-item-label>
              <q-item-label caption class="op-7">{{ $t(i.description) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-menu>
</template>

<script setup>
import { ref, computed } from "vue";
import localforage from "localforage";
import { useRouter } from "vue-router";
import useStore from "src/stores/store.js";
import { uiStore } from "src/hooks/global/useStore";
const store = useStore();
const router = useRouter();

const props = defineProps({
  offset: {
    type: Array,
    default() {
      return [0, -20];
    },
  },
});

const openBrand = ref(false);
const apps = [
  {
    val: "teams",
    label: 'team',
    icon: "mark_chat_read",
    description: 'app_team_purpose',
    to: "teams",
    enable: true,
  },
  {
    val: "affairs",
    label: 'affairs',
    icon: "mdi-calendar-clock",
    description: 'app_affairs_purpose',
    to: "affairs",
    enable: true,
  },
];
const enabledApps = computed(() => apps.filter((i) => i.enable));
const to = async (i) => {
  uiStore.app = i.val;
  await localforage.setItem("last_module", i.to);
  await router.push(`/${i.to}`);
};
const gohome = () => {
  localforage.setItem("last_module", "homepage");
  openBrand.value = !openBrand.value;
  store.brand_title = "ipbase_brand";
  router.push("/");
};
</script>

<style lang="scss" scoped></style>
