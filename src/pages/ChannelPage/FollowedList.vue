<template>
<!--  {{followed}}-->

  <q-list v-if="userStore" dense class="full-width q-pa-sm column no-wrap gap-sm">
    <q-item v-for="i in followed" :key="i.id" clickable v-ripple class="radius-xs"
            :class="userStore.affairsFilterIDs?.includes(i.id) ? 'border' : 'border-placeholder'"
            @click="goChannel(i.user_channel.id)"
    >
      <q-item-section side>
        <UserAvatar
          :user_id="i.mm_profile?.id"
          :size="36"
          :disable_card="true"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{i.username}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>
<script setup>
import {computed} from 'vue'
import {useRouter} from "vue-router";
import {teamStore, userStore} from "src/hooks/global/useStore.js";
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";

const router = useRouter();
const followed = computed(() => teamStore.init?.followed);
const goChannel = (channel_id) => {
  if(!channel_id) return
  router.push(`/brand/${channel_id}`)
}
</script>