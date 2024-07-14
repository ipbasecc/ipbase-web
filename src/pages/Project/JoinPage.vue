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
            label="进入项目首页"
            color="primary"
            class="full-width"
            v-close-popup
            @click="goto_projectHome()"
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
            {{ `${inviteInfo.by?.username} 邀请你加入项目` }}
            <q-chip
              square
              dense
              color="deep-orange"
              :label="inviteInfo.project"
            />
          </span>
        </q-card-section>
        <q-card-section class="q-pa-sm border-top">
          <q-btn
            label="立即加入"
            color="primary"
            class="full-width"
            v-close-popup
            @click="join()"
          />
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { visitInvite, acceptInvite } from "src/api/strapi/project.js";
import { ref, watch } from "vue";
import localforage from "localforage";

const route = useRoute();
const router = useRouter();

const { team_id, invite_code } = route.query;

const jwt = localStorage.getItem("jwt");

const errorMsg = ref();
const inviteInfo = ref();
const get_inviteInfo = async () => {
  if (!jwt) {
    return;
  }
  try {
    let res = await visitInvite(team_id, invite_code);
    if (res) {
      console.log("res...", res?.data);
      if (res.data?.error) {
        let __ = res.data?.error?.name;
        if (__ === "NotFoundError") {
          errorMsg.value =
            "未找到与该邀请码匹配的项目，请检查邀请链接是否完整、有效。";
        } else {
          errorMsg.value = res.data?.error?.message;
        }
      } else {
        inviteInfo.value = res.data;
      }
      setTimeout(() => {
        // join();
      }, 1000);
    }
  } catch (error) {
    console.log("error", error);
  }
};
watch(
  jwt,
  () => {
    if (jwt) {
      get_inviteInfo();
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

const joinInfo = ref();
const chat_service = ref();
const join = async () => {
  let res = await acceptInvite(team_id, invite_code);
  if (res?.data) {
    // 此时管理人员应该收到ws消息，有人申请加入，
    // 但是此刻成员还没有正式进入项目/团队，因此不能在前端发送ws消息，此处消息发送由后端完成
    setTimeout(() => {
      joinInfo.value = res.data.message;
    }, 200);
  }
};

const goto_projectHome = () => {
  router.push("/projects");
};
</script>

<style lang="scss" scoped></style>
