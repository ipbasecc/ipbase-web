<template>
  <div class="q-px-lg q-pb-lg">
    <q-card v-if="msg" bordered>
      <q-card-section
        class="q-pa-sm border-bottom row items-center gap-sm no-wrap"
      >
        <UserAvatar v-if="avatar" :user_id="msg.user_id" :size="avatar_size" />
        <span class="op-3">{{ time }}</span>
      </q-card-section>
      <q-card-section>
        <div class="column no-wrap justify-between q-space">
          <span>{{ msg.profile?.username }}</span>
          <div
            v-if="msg.message"
            class="tiptap"
            v-html="marked.parse(msg.message)"
            style="line-height: 1.25"
          ></div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ref, toRefs } from "vue";
import { date } from "quasar";
import { useGenBlob } from "src/hooks/utilits.js";
import { useFetchAvatar } from "src/pages/Chat/hooks/useFetchAvatar.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";

import { marked } from "marked";
import { i18n } from 'src/boot/i18n.js';

const $t = i18n.global.t;

const props = defineProps({
  msg: {
    type: Object,
    default() {
      return {};
    },
  },
});
const { msg } = toRefs(props);

const avatar = ref();
const calc_avatar = async () => {
  let buffer = await useFetchAvatar(msg.value.user_id);
  if (buffer) {
    let blob = useGenBlob(buffer);
    avatar.value = blob;
    return blob;
  }
};
calc_avatar();

const avatar_size = ref(32);
let _ =
  (date.formatDate(msg.value.create_at, "DD") === "AM" && $t('AM')) || $t('PM');
let __ = date.formatDate(msg.value.create_at, "HH:mm");
const time = computed(() => _ + __);
</script>

<style lang="scss">
.mm_message hr {
  margin: 8px 0 16px 0;
  opacity: 0.1;
}
</style>
