<template>
    <q-card bordered :style="$q.screen.lt.sm ? '' : `min-width: 24rem;`">
        <q-card-section v-if="!hiddeHeader" class="row no-wrap q-pa-sm border-bottom">
            <div class="font-larger q-ml-sm">{{ $t('create_chat_channel') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>
        <q-card-section class="column no-wrap gap-sm q-pa-lg">
          <q-input
            v-model="createChannelparams.data.name"
            square
            filled
            type="text"
            :label="$t('channel_name')"
            :aria-placeholder="$t('channel_name')"
            @keyup.enter="createChannelFn()"
          >
            <template v-slot:prepend>
                <q-icon :name="findIconByType(createChannelparams.data.type)" size="sm" />
            </template>
          </q-input>
          <q-input
            v-model="createChannelparams.data.purpose"
            square
            filled
            type="textarea"
            :label="$t('channel_purpose')"
            :aria-placeholder="$t('channel_purpose')"
            @keyup.enter="createChannelFn()"
          />
          <div class="row no-wrap gap-md">
            <q-radio
                v-for="i in CHANNEL_TYPES"
                :key="i.val"
                v-model="createChannelparams.data.type"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                :label="$t(i.label)"
                :icon="i.icon"
                :val="i.val"
            />
          </div>
        </q-card-section>
        <q-card-section class="border-top q-pa-sm">
            <q-btn
                dense
                color="primary"
                :label="$t('create')"
                class="full-width"
                v-close-popup
                :loading="loading"
                @click="createChannelFn()"
              />
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { teamStore } from "src/hooks/global/useStore.js";
import { createChannel } from "src/pages/team/hooks/useCreateChannel.js";
import { useQuasar } from 'quasar'
import { i18n } from 'src/boot/i18n.js';

const props = defineProps({
  hiddeHeader: {
    type: Boolean,
    default: false,
  },
});

const $t = i18n.global.t;
const $q = useQuasar()

const emit = defineEmits(['closePopup', 'created'])
const loading = ref(false);
const createChannelparams = ref({
  team_id: void 0,
  data: {
    name: "",
    type: "P",
    purpose: ""
  },
});
const CHANNEL_TYPES = [
    { val: 'O', label: 'public_channel', icon: 'public'},
    { val: 'P', label: 'private_channel', icon: 'lock'},
]
const findIconByType = (type) => {
    return CHANNEL_TYPES.find(item => item.val === type)?.icon || 'public'
}

const createChannelFn = async () => {
  if(loading.value) return;
  loading.value = true;
  createChannelparams.value.team_id = teamStore.team?.id;

  const res = await createChannel(createChannelparams.value);
  createChannelparams.value.data.name = "";
  createChannelparams.value.data.purpose = "";
  loading.value = false;
  
  if(res){
    emit('created', res)
  }
  closePopup();
};
const closePopup = () => {
  emit('closePopup')
}
</script>

<style scoped>
</style>