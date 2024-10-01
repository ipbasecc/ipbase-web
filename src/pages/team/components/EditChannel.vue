<template>
    <q-card bordered style="min-width: 24rem;">
        <q-card-section class="row no-wrap q-pa-sm border-bottom">
            <div class="font-larger q-ml-sm">{{ $t('update_channel') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense size="sm" v-close-popup />
        </q-card-section>
        <q-card-section class="column no-wrap gap-sm q-pa-lg">
          <q-input
            v-model="channel.name"
            square
            filled
            type="text"
            :label="$t('channel_name')"
            :aria-placeholder="channel.name"
          >
            <template v-slot:prepend>
                <q-icon :name="findIconByType(channel.type)" size="sm" />
            </template>
          </q-input>
          <q-input
            v-model="channel.purpose"
            square
            filled
            type="textarea"
            :label="$t('channel_purpose')"
            :aria-placeholder="channel.name"
          ></q-input>
          <div class="row no-wrap gap-md">
            <q-radio
                v-for="i in CHANNEL_TYPES"
                :key="i.val"
                v-model="channel.type"
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
                :label="$t('update')"
                class="full-width"
                v-close-popup
                :loading="loading"
                @click="updateChannelFn()"
              />
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref, toRefs } from 'vue'
import { updateChannel } from "src/api/strapi/team.js";

const props = defineProps({
    channel: {
        type: Object,
        default: void 0
    }
})
const { channel } = toRefs(props)
const emit = defineEmits(['closePopup'])
const loading = ref(false);
const CHANNEL_TYPES = [
    { val: 'O', label: 'public_channel', icon: 'public'},
    { val: 'P', label: 'private_channel', icon: 'lock'},
]
const findIconByType = (type) => {
    return CHANNEL_TYPES.find(item => item.val === type)?.icon || 'public'
}

const params = ref({
  data: {
    name: "",
  },
});
const updateChannelFn = async () => {
  loading.value = true
  params.value.data = channel.value;
  params.value.channel_id = channel.value.id;
  delete params.value.id;
  const res = await updateChannel(channel.value.id, params.value);
  if (res?.data) {
    params.value = {};
    loading.value = false;
  }
};
const closePopup = () => {
  emit('closePopup')
}
</script>

<style scoped>
</style>