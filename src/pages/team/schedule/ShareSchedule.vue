<template>
  <q-card
    bordered
    style="min-width: 28rem"
    :class="$q.dark.mode ? 'text-grey-1 bg-grey-10' : 'text-grey-9 bg-grey-1'"
  >
    <q-card-section class="row items-center border-bottom">
      <div class="column no-wrap gap-xs q-pr-md">
        <span class="text-h6">{{ $t('share_your_schedule') }}</span>
        <span v-if="user_shareCode" class="op-7"
          >{{ $t('is_shared_can_share_or_update') }}</span
        >
      </div>
      <q-space />
      <q-btn-group class="q-mr-sm border">
        <q-btn
          v-if="modify"
          dense
          flat
          padding="xs md"
          :label="$t('back')"
          @click="showBeforeShare()"
        />
        <q-btn
          v-else
          dense
          :flat="!waring"
          :color="waring ? 'deep-orange' : ''"
          padding="xs md"
          :label="$t('modify')"
          @click="editeShare()"
        />
        <q-btn dense flat size="sm" icon="mdi-menu-down" class="border-left">
          <q-menu class="radius-sm" ref="moreActionRef">
            <q-list
              dense
              bordered
              class="radius-sm q-pa-xs"
              :class="$q.dark.mode ? '' : 'text-grey-9'"
            >
              <q-item
                clickable
                v-close-popup
                class="radius-xs"
                @click="deleteShare()"
              >
                <q-item-section side><q-icon name="close" /></q-item-section>
                <q-item-section>{{$t('delete_and_reshare')}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-btn-group>
    </q-card-section>
    <q-card-section v-if="waring" class="bg-deep-orange row">
      {{$t('share_expired_reshare')}}
      <q-space />
      <q-btn flat dense size="sm" round icon="close" @click="waring = false" />
    </q-card-section>
    <q-card-section v-if="confirmRemove" class="bg-info row">
      {{$t('new_share_cancel_old_still')}}
      <q-space />
      <q-btn
        flat
        dense
        icon="close"
        :label="$t('know_it')"
        @click="confirmRemoveFn()"
      />
    </q-card-section>
    <template v-if="!share_url || modify">
      <q-card-section
        class="row items-center q-pa-xl"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-3'"
      >
        <form class="column no-wrap gap-md fit">
          <q-input
            v-model="share_code.code"
            outlined
            type="text"
            :label="$t('share_code')"
            :readonly="user_shareCode && !remove ? true : false"
          >
            <template v-slot:append>
              <q-btn
                v-if="!user_shareCode || remove"
                flat
                dense
                round
                icon="mdi-refresh"
                @click="share_code.code = randomKey(6)"
              />
              <q-btn
                v-if="user_shareCode && !remove"
                flat
                dense
                round
                icon="info"
              >
                <q-tooltip v-if="user_shareCode" class="no-padding">
                  <q-card bordered class="q-pl-none q-py-xs q-pr-xs">
                    <q-card-section>
                      <ul class="font-medium">
                        <li>{{ $t('cannot_modify_sharecode') }}</li>
                        <li>{{ $t('or_others_cannot_visit') }}</li>
                        <li>{{ $t('you_can_delete_this_share') }}</li>
                        <li>
                          {{ $t('you_can_recreate_share_after_delete') }}
                        </li>
                      </ul>
                    </q-card-section>
                  </q-card>
                </q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-input
            v-model.number="share_code.max_count"
            type="number"
            step="1"
            outlined
            :label="$t('view_limit')"
            @input="checkInput(share_code.max_count)"
          />
          <q-input
            v-model="share_code.up_time"
            type="text"
            outlined
            :label="$t('date_limit')"
            mask="date"
            :rules="['date']"
          >
            <template v-slot:append>
              <q-btn flat dense round icon="event">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="share_code.up_time"
                    minimal
                    bordered
                    mask="YYYY-MM-DD"
                    :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-9'"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-btn>
            </template>
          </q-input>
        </form>
      </q-card-section>
    </template>
    <template v-else>
      <q-card-section
        class="column no-wrap gap-sm flex-center"
        :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-3'"
      >
        <qrcode-vue :value="share_url" :size="360" level="H" />
        <div
          class="border cursor-pointer full-width q-pa-md radius-sm scroll"
          @click="copy_uri(share_url)"
        >
          <span>{{ share_url }}</span>
        </div>
      </q-card-section>
    </template>
    <q-card-section class="row items-center q-pa-sm border-top">
      <q-btn flat dense padding="xs md" :label="$t('back')" v-close-popup />
      <q-space />
      <q-btn
        dense
        padding="xs md"
        color="primary"
        icon="check"
        :label="$t('confirm')"
        :disable="!share_code.code || !userStore.userId"
        @click="shareSchedule(share_item.id, share_code)"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { updateSchedule } from "src/api/strapi/project.js";
import { copyToClipboard, useQuasar } from "quasar";
import QrcodeVue from "qrcode.vue";
import { computed, onMounted, ref, toRefs, watch } from "vue";
import { randomKey } from "src/hooks/utilits.js";
import { userStore, teamStore } from "src/hooks/global/useStore.js";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const props = defineProps({
  share_item: {
    type: Object,
    default: null,
  },
});
const { share_item } = toRefs(props);
const emit = defineEmits(["shareUpdated"]);

const $q = useQuasar();
const user_shareCode = computed(() =>
  share_item.value?.share_codes?.find(
    (i) => i.creator?.id === Number(userStore.userId)
  )
);

const share_code = ref({
  code: user_shareCode.value ? user_shareCode.value.code : randomKey(6),
  max_count: user_shareCode.value ? user_shareCode.value.max_count : 20,
  up_time: user_shareCode.value ? user_shareCode.value.up_time : "",
});
const genShareUrl = (code) => {
  share_url.value = `${import.meta.env.VITE_APP_URI}schedule/share/${share_item.value?.id}?share_code=${code}&share_by=${userStore.userId}`;
};
const share_url = ref();
const shareSchedule = async (schedule_id, share_code) => {
  if (!share_code.code) return;
  if(share_code.up_time !== ''){
    share_code.up_time = share_code.up_time.replace(/\//g, "-");
  } else {
    share_code.up_time = null;
  }
  
  let _params = {
    data: {
      share_code: share_code,
    },
  };
  console.log("schedule_id", schedule_id);
  const res = await updateSchedule(schedule_id, _params);
  if (res?.data) {
    genShareUrl(share_code.code);
    teamStore.project.schedules = teamStore.project?.schedules.map((i) =>
      i.id === share_item.value.id ? res?.data : i
    );
    modify.value = false;
  }
};
const modify = ref(false);
const editeShare = () => {
  share_url.value = "";
  modify.value = true;
};
const moreActionRef = ref();
const confirmRemove = ref(false);
const confirmRemoveFn = () => {
  confirmRemove.value = false;
  remove.value = false;
  showBeforeShare();
};
const showBeforeShare = () => {
  if (remove.value) {
    confirmRemove.value = true;
  }
  genShareUrl(user_shareCode.value.code);
  modify.value = false;
  moreActionRef.value.hide();
};
const remove = ref(false);
const deleteShare = () => {
  share_url.value = "";
  modify.value = true;
  remove.value = true;
};
const checkInput = (time) => {
  if (time < 0) {
    time = 0;
  }
};
const copy_uri = (val) => {
  copyToClipboard(val)
    .then(() => {
      $q.notify($t('url_copy_secuss'));
    })
    .catch(() => {
      $q.notify($t('copy_error'));
    });
};
const waring = ref(false);
onMounted(() => {
  waring.value =
    share_item.value?.share_codes?.filter((i) => i.max_count < 1)?.length > 0;
});
watch(
  user_shareCode,
  () => {
    if (user_shareCode.value?.code) {
      genShareUrl(user_shareCode.value.code);
    }
  },
  { immediate: true, deep: false }
);
</script>

<style lang="scss" scoped></style>
