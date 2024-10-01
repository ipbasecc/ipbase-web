<template>
  <div class="absolute-full column flex-center">
    <q-card bordered style="min-width: 400px">
      <template v-if="!jwt">
        <q-card-section> 请先登陆 </q-card-section>
        <q-card-actions>
          <q-btn
            label="立即登陆"
            color="primary"
            class="full-width"
            v-close-popup
            @click="toLogin()"
          />
        </q-card-actions>
      </template>
      <template v-if="errorMsg || joinInfo">
        <template v-if="errorMsg">
          <q-card-section class="font-medium border-bottom">
            请注意：
          </q-card-section>
          <q-card-section
            class="q-pa-xl font-large row no-wrap items-center gap-md"
          >
            <q-icon name="error" size="lg" color="red" />
            <span>{{ errorMsg }}</span>
          </q-card-section>
        </template>
        <template v-else-if="joinInfo">
          <q-card-section>
            <span>{{ joinInfo }}</span>
          </q-card-section>
        </template>
        <q-card-section class="border-top">
          <q-btn
            :label="`进入首页`"
            color="primary"
            class="full-width"
            v-close-popup
            @click="gohome()"
          />
        </q-card-section>
      </template>
      <template v-else-if="inviteInfo">
        <q-card-section class="border-bottom">
          <span>嘿：{{ me?.username }}，你好：</span>
        </q-card-section>
        <q-card-section class="row no-wrap gap-md items-center q-pa-xl">
          <q-avatar v-if="inviteInfo?.by?.avatar?.url" size="md">
            <q-img
              :src="inviteInfo.by.avatar.url"
              :ratio="1"
              spinner-color="primary"
              spinner-size="24px"
            />
          </q-avatar>
          <span>
            {{ `${inviteInfo.by?.username} 邀请你加入${target}` }}
            <q-chip
              square
              dense
              color="deep-orange"
              :label="inviteInfo.display_name || inviteInfo.name"
            />
          </span>
        </q-card-section>
        <q-card-section class="q-pa-sm border-top">
          <q-btn
            label="立即加入"
            color="primary"
            class="full-width"
            v-close-popup
            @click="joinFn()"
          />
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, watch, onBeforeMount } from "vue";
import localforage from "localforage";
import { computed } from "vue";
import { join, get_inviteInfo } from 'src/pages/team/hooks/useInvite.js'
import { uiStore } from 'src/hooks/global/useStore.js';

const route = useRoute();
const router = useRouter();

const { team_id, channel_id, project_id, invite_code } = route.query;
const target = computed(() => {
  return (
    (team_id && "团队") || (channel_id && "聊天频道") || (project_id && "项目")
  );
});

const jwt = computed(() => localStorage.getItem("jwt"));

const errorMsg = ref();
const inviteInfo = ref();
const get_inviteInfoFn = async () => {
  if (!jwt.value) {
    return;
  }
  let { errMsg, info } = await get_inviteInfo(team_id, channel_id, project_id, invite_code, target.value);
  errorMsg.value = errMsg;
  inviteInfo.value = info;
};
watch(
  jwt,
  () => {
    if (jwt.value) {
      get_inviteInfoFn();
    }
  },
  { immediate: true, deep: false }
);

const me = ref();
const getMe = async () => {
  let res = await localforage.getItem("__strapi_userMatedate");
  if (res) {
    me.value = res;
  }
};
getMe();
onBeforeMount(() => {
  uiStore.pageLoaded = true
})

const joinInfo = ref();
const joinFn = async () => {
  let res = await join(team_id, channel_id, project_id, invite_code);
  if(res){
    joinInfo.value = res.message;
  }
};

const gohome = () => {
  router.push("/teams");
};
const toLogin = () => {
  router.push("/login");
};
</script>

<style lang="scss" scoped></style>
