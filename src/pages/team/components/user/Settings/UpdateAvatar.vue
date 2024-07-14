<template>
  <q-card flat class="fit hovered-item transparent">
    <q-card-section class="row flex-center">
      <q-avatar
        :size="props.size"
        font-size="52px"
        color="teal"
        text-color="white"
      >
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
      <DrapUpload
        class="fit unselected cursor-pointer"
        :isAvatar="true"
        @uploaded="uploaded"
      />
    </div>
  </q-card>
</template>

<script setup>
import { computed } from "vue";
import DrapUpload from "src/components/VIewComponents/DrapUpload.vue";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import { mmUser } from "src/hooks/global/useStore.js";

const props = defineProps({
  size: {
    type: String,
    default: "160px",
  },
  oldAvatar: {
    type: String,
    default: "160px",
  },
});

const avatar = computed(() => mmUser.current_user_avatar || props.oldAvatar);
const uploaded = async () => {
  const mm_user_id = localStorage.getItem("mmUserId");
  mmUser.current_user_avatar = await useFetchAvatar(mm_user_id, "force");
};
</script>
