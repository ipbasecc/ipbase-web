<template>
  <q-card bordered>
    <q-card-section class="row no-wrap items-center border-bottom">
      <div>邀请成员加入项目：</div>
      <q-space />
      <q-btn dense round size="xs" icon="close" v-close-popup />
    </q-card-section>
    <q-card-section class="column no-wrap gap-xxl flex-center q-pa-xl">
      <div
        v-if="!params.up_time"
        class="full-width q-pa-lg border radius-sm flex flex-center"
      >
        请选择一个有效期
      </div>
      <q-spinner-orbit v-if="gen_ing" color="primary" size="2em" />
      <template v-else-if="invite_uri">
        <qrcode-vue :value="invite_uri" :size="360" level="H" />
        <div
          class="radius-sm border q-pa-md cursor-pointer"
          @click="copy_uri(invite_uri)"
        >
          <span>{{ invite_uri }}</span>
        </div>
      </template>
    </q-card-section>
    <q-card-section class="column no-wrap gap-md border-top">
      <q-banner v-if="error_tip">
        <q-card bordered class="full-width">
          <q-card-section>
            {{ error_tip }}
          </q-card-section>
          <q-card-section class="row q-py-sm">
            <q-space />
            <q-btn
              flat
              dense
              label="知道了"
              padding="xs md"
              @click="un_tip()"
            />
          </q-card-section>
        </q-card>
      </q-banner>
      <div class="row no-wrap items-center">
        <span class="q-mr-md">有效期：</span>
        <q-radio
          v-for="i in uptimes"
          :key="i.val"
          v-model="uptime"
          :val="i.val"
          :label="i.label"
        />
      </div>
      <div class="row no-wrap items-center">
        <span class="q-mr-md">最大可用次数:</span>
        <q-radio
          v-for="i in maxes"
          :key="i"
          v-model="max"
          :val="i"
          :label="`${i}`"
        />
      </div>
      <div class="column no-wrap gap-sm">
        <span class="q-mr-md">留言:</span>
        <div class="font-medium q-pa-md border radius-sm">
          我是
          <q-chip
            dense
            square
            color="deep-orange"
            class="q-px-sm"
            :label="userStore.me.username"
          />, 邀请你加入团队
          <q-chip
            dense
            square
            color="deep-orange"
            class="q-px-sm"
            :label="teamStore.team?.display_name"
          />
          <br />
          等你哦！
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, toRefs, watch, watchEffect } from "vue";
import { genChannelInvite, genTeamInvite } from "src/api/strapi/team.js";
import { genInvite } from "src/api/strapi/project.js";
import QrcodeVue from "qrcode.vue";
import { copyToClipboard, useQuasar } from "quasar";

import { teamStore, userStore } from "src/hooks/global/useStore.js";

const props = defineProps({
  byInfo: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { byInfo } = toRefs(props);

const $q = useQuasar();

const APP_URI = process.env.APP_URI;
const uptime = ref();
const uptimes = [
  { val: 1, label: "1天" },
  { val: 7, label: "1周" },
  { val: 30, label: "1月" },
  { val: -1, label: "永久" },
];
const maxes = [1, 5, 10, 20, 50, 1000];
const max = ref(10);

const params = ref({
  max_total: NaN,
  up_time: null,
});
const error_tip = ref();
const un_tip = () => {
  error_tip.value = undefined;
};
watchEffect(() => {
  params.value.up_time =
    uptime.value === -1 ? -1 : getTimestampAfterDays(uptime.value);
  params.value.max_total = max.value;
  error_tip.value =
    params.value.up_time < 0 && params.value.max_total < 0
      ? "最大可用次数 与 有效期，不能同时都不限制！"
      : "";
});

function getTimestampAfterDays(days) {
  if (days === -1) {
    return null;
  }
  // 获取当前时间的时间戳
  let now = Date.now();
  // 计算一天的毫秒数，24小时 * 60分钟 * 60秒 * 1000毫秒
  let oneDay = 24 * 60 * 60 * 1000;
  // 计算指定天数的毫秒数，天数 * 一天的毫秒数
  let daysInMilliseconds = days * oneDay;
  // 计算当前时间 + 指定天数之后的时间戳，当前时间的时间戳 + 指定天数的毫秒数
  // 返回时间戳
  return now + daysInMilliseconds;
}

const invite_uri = ref();
const genInviteFn = async () => {
  if (params.value.up_time === -1 && params.value.max_total !== -1) {
    delete params.value.up_time;
  }
  if (params.value.up_time !== -1 && params.value.max_total === -1) {
    delete params.value.max_total;
  }
  if (params.value.up_time === -1 && params.value.max_total === -1) {
    error_tip.value = "最大可用次数 与 有效期，不能同时都不限制！";
    return;
  }

  let res;
  if (byInfo.value?.by === "team") {
    res = await genTeamInvite(byInfo.value?.team_id, params.value);
  }
  if (byInfo.value?.by === "channel") {
    res = await genChannelInvite(byInfo.value?.channel_id, params.value);
  }
  if (byInfo.value?.by === "project") {
    res = await genInvite(byInfo.value?.project_id, params.value);
  }
  if (res) {
    let invite_code = res.data.invite_code;
    let joinTarget;
    if (byInfo.value?.by === "team") {
      joinTarget = `team_id=${byInfo.value?.team_id}`;
    }
    if (byInfo.value?.by === "channel") {
      joinTarget = `channel_id=${byInfo.value?.channel_id}`;
    }
    if (byInfo.value?.by === "project") {
      joinTarget = `project_id=${byInfo.value?.project_id}`;
    }
    invite_uri.value = `${APP_URI}join?${joinTarget}&invite_code=${invite_code}`;
    gen_ing.value = false;
  }
};

const gen_ing = ref(false);
watch(
  [max, uptime],
  () => {
    if (max.value && uptime.value) {
      gen_ing.value = true;
      setTimeout(() => {
        genInviteFn();
      }, 600);
    }
  },
  { immediate: false, deep: true }
);

const copy_uri = (val) => {
  copyToClipboard(val)
    .then(() => {
      $q.notify("邀请链接已复制到剪贴板");
    })
    .catch(() => {
      $q.notify("复制出错，请手动复制");
    });
};
</script>
