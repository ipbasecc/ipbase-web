<template>

  <div v-if="!shareInfo" class="absolute-full column flex-center">
    <span class="font-large font-bold-600 q-mb-md" >请输入提取码：</span>
    <q-card flat bordered style="min-width: 22rem" class="shadow-focus radius-sm">
      <q-card-section v-if="!share_by">
        <div class="text-h6">分享链接有误，请检查链接是否正确!</div>
      </q-card-section>
      <template v-else-if="!share_code">
        <q-card-section class="q-pa-xs">
          <q-input
            v-model="share_code_input"
            prefix="提取码："
            filled
            class="overflow-hidden radius-xs"
          >
            <template v-slot:append>
              <q-btn
                dense
                :flat="!share_code_input"
                :color="share_code_input ? 'positive' : ''"
                padding="xs md"
                label="OK"
                :disable="!share_code_input"
                @click="setShareCode()"
              />
            </template>
          </q-input>
        </q-card-section>
      </template>
    </q-card>
    <div class="absolute-bottom full-width row flex-center">
      <BgBrand styleClass="op-5" size="sm" />
    </div>
  </div>
  <div v-else-if="uiStore.message" class="absolute-full column flex-center">
    <q-chip
      icon="info"
      color="deep-orange"
      size="xl"
      :label="uiStore.message"
    />
  </div>
  <ScheduleBody v-if="schedule" :isShare="true" :schedule />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { getScheduleByShare } from "src/api/strapi/project.js";
import {ref, onBeforeMount, onUnmounted, computed, watchEffect} from "vue";
import ScheduleBody from "./ScheduleBody.vue";
import { useQuasar } from "quasar";
import { uiStore } from "src/hooks/global/useStore.js";
import BgBrand from "components/VIewComponents/BgBrand.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const share_code = computed(() => route.query.share_code);
const share_by = computed(() => route.query.share_by);
const { id } = route.params;

const share_code_input = ref('');
const setShareCode = () => {
  router.push(`/schedule/share/${id}?share_code=${share_code_input.value}&share_by=${share_by.value}`);
}
const shareInfo = computed(() =>
  id && share_code.value && share_by.value ? {
    card_id: id,
    code: share_code.value,
    by: share_by.value
  } : void 0
);

const schedule = ref();
onBeforeMount(() => {
  uiStore.topbarClass = $q.dark.mode ? "bg-black" : "bg-primary";
});
watchEffect(async () => {
  if (id && share_code.value && share_by.value) {
    const res = await getScheduleByShare(id, share_code.value, share_by.value);
    if (res?.data) {
      schedule.value = res?.data;
      uiStore.pageTitle = schedule.value.name;
    } else {
      console.log(res);
    }
  }
});
onUnmounted(() => {
  uiStore.topbarClass = null;
});
</script>

<style lang="scss" scoped></style>
