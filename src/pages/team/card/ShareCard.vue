<script setup>
import { useRoute, useRouter } from "vue-router";
import {onBeforeMount, computed, watchEffect, ref} from "vue";
import { uiStore, teamStore } from "src/hooks/global/useStore.js";
import { useQuasar } from "quasar";

import SharePage from "pages/team/card/components/share/SharePage.vue";
import BgBrand from "components/VIewComponents/BgBrand.vue";

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const share_code = computed(() => route.query.share_code);
const share_by = computed(() => route.query.share_by);
const { id } = route.params;

const shareInfo = computed(() =>
  id && share_code.value && share_by.value ? {
    props: {
      card_id: id
    },
    code: share_code.value,
    by: share_by.value
  } : void 0
);
watchEffect(() => {
  if(shareInfo.value){
    teamStore.showCards = true;
    uiStore.topbarClass = null;
    uiStore.isShared = true;
    teamStore.shareInfo = shareInfo.value;
  }
})
onBeforeMount(() => {
  uiStore.topbarClass = $q.dark.mode ? "bg-black" : "bg-primary";
});

const share_code_input = ref('');
const setShareCode = () => {
  router.push(`/card/share/${id}?share_code=${share_code_input.value}&share_by=${share_by.value}`);
}
</script>

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

  <SharePage v-if="shareInfo" :shareInfo />
</template>

<style scoped lang="scss">

</style>
