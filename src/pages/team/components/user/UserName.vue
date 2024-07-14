<template>
  <div>
    {{ username }}
  </div>
</template>

<script setup>
import {onBeforeMount, ref, toRefs} from "vue";
import { get_mmProfileByUID } from 'src/pages/team/hooks/useMattermost.js'
const props = defineProps({
  mm_user_id: {
    type: String,
    default: "",
  },
});
const { mm_user_id } = toRefs(props);
const username = ref();
const get = async (_mid) => {
  const res = await get_mmProfileByUID(_mid);
  if (res) {
    return res.username
  }
};
onBeforeMount(async () => {
  if (mm_user_id.value) {
    username.value = await get(mm_user_id.value);
  }
});
</script>

<style lang="scss" scoped></style>
