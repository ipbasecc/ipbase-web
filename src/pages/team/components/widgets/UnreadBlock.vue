<template>
  <q-badge v-if="unreadCount > 0" :color="color" :align="align">
    {{unreadCount}}
  </q-badge>
</template>
<script setup>
import {teamStore, uiStore} from "src/hooks/global/useStore";
import {toRefs, computed, watch, ref} from "vue";

const props = defineProps({
  mm_channel_id: {
    type: String,
    default: void 0
  },
  color: {
    type: String,
    default: 'negative'
  },
  align: {
    type: String,
    default: 'top'
  },
})
const { mm_channel_id, color, align } = toRefs(props);

const unreadCount = ref();
const mm_team = computed(() => teamStore.team);
const getUnread = (_mm_channel_id) => {
  if(!uiStore.unreads?.team || uiStore.unreads?.channels?.length === 0) return

  const target_channel = uiStore.unreads?.channels.find(
    i => i?.channel_id === _mm_channel_id && i?.team_id === mm_team.value?.mm_team.id)
  if(target_channel){
    unreadCount.value = target_channel.msg_count
  }
}
const unreadStore = computed(() => uiStore.unreads);
watch(unreadStore, () => {
  if(unreadStore.value){
    getUnread(mm_channel_id.value)
  }
},{immediate:true,deep:true})
</script>
