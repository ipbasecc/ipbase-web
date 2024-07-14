<template>
  <q-menu
    v-model="openBrand"
    transition-show="jump-down"
    transition-hide="jump-up"
    fit
    :offset="offset"
    class="bg-white z-max shadow-focus"
  >
    <q-card bordered>
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
          回首页
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
          <q-item clickable v-ripple class="radius-xs" @click="goTeamhome()">
            <q-item-section side>
              <q-avatar>
                <q-icon name="mark_chat_read" color="primary" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>团队协作</q-item-label>
              <q-item-label caption>组织你的团队，开展业务或完成项目。</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            class="radius-xs"
            href="https://flame.vip"
            target="_blank"
            @click="title = 'Flame.VIP'"
          >
            <q-item-section side>
              <q-avatar>
                <q-icon name="panorama_fish_eye" color="primary" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>Flame.VIP</q-item-label>
              <q-item-label caption>Autodesk Flame中文教程</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-menu>
</template>

<script setup>
import { ref } from "vue";
import useGetMyMatedate from "src/hooks/global/useGetMyMatedata.js";
import localforage from "localforage";
import { useRouter } from "vue-router";
import useStore from "src/stores/store.js";
const store = useStore();
const router = useRouter();
const { logged, userChannelId } = useGetMyMatedate;

const props = defineProps({
  offset: {
    type: Array,
    default() {
      return [0, -20];
    },
  },
});

const title = ref("微名片");
const openBrand = ref(false);
const gohome = () => {
  localforage.setItem("last_module", "homepage");
  openBrand.value = !openBrand.value;
  store.brand_title = "易乎APP";
  router.push("/");
};
const goTeamhome = () => {
  localforage.setItem("last_module", "chat");
  title.value = "团队沟通";
  openBrand.value = !openBrand.value;
  store.brand_title = "团队";
  router.push("/teams");
};
</script>

<style lang="scss" scoped></style>
