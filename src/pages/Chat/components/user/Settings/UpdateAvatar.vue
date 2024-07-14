<template>
    <q-card flat class="fit hovered-item transparent">
      <q-card-section class="row flex-center">
        <q-avatar :size="props.size" font-size="52px" color="teal" text-color="white">
          <q-img
            v-if="avatar"
            :src="avatar"
            :ratio="1"
            :sizes="props.size"
            spinner-color="primary"
            spinner-size="82px"
          >
          <div class="absolute-full hover-show"></div>
          </q-img>
        </q-avatar>
      </q-card-section>
      <div class="absolute-full z-max">
        <DrapUpload class="fit unselected cursor-pointer" :isMattermostAvatar="true" @uploaded="uploaded" />
      </div>
    </q-card>
</template>

<script setup>
import { computed } from "vue";
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'

import { useFetchAvatar } from 'src/pages/Chat/hooks/useFetchAvatar.js'

import useMmuser from 'src/stores/mmuser.js';

const props = defineProps({
  size: {
    type: String,
    default: '160px'
  },
  oldAvatar: {
    type: String,
    default: '160px'
  }
})
const mmUserStore = useMmuser();

const mm_user_id = localStorage.getItem('mmUserId');
console.log(mm_user_id);
const avatar = computed(() => mmUserStore.current_user_avatar || props.oldAvatar);
const uploaded = async () => {
  mmUserStore.current_user_avatar = mm_user_id && await useFetchAvatar(mm_user_id,'force');
}

</script>
  