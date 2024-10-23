<template>
    <q-list v-if="layout !== 'grid'" v-bind="$attrs" dense bordered style="min-width: 12rem" class="radius-sm q-pa-xs" :class="$q.dark.mode
            ? 'bg-grey-10 text-grey-1'
            : 'bg-white text-grey-10'
        ">

        <template v-if="useAuths('modify', ['channel'])">
            <q-item clickable v-ripple class="radius-xs" @click="editChannel()">
                <q-item-section side>
                    <q-icon name="tune" size=sm />
                </q-item-section>
                <q-item-section>
                    {{ $t('edit_channel') }}
                </q-item-section>
            </q-item>
        </template>

        <template v-if="useAuths('invite_uris', ['channel'])">
            <q-separator spaced />
            <q-item clickable class="radius-xs" @click="inviteFn()">
                <q-item-section side>
                    <q-icon name="group_add" size=sm />
                </q-item-section>
                <q-item-section>{{ $t('invite_member') }}</q-item-section>
            </q-item>
        </template>
        <template v-if="useAuths('delete', ['channel'])">
            <q-separator spaced />
            <q-item clickable class="radius-xs" @click="deleteChannelFn(channel)">
                <q-item-section side>
                    <q-icon name="remove" size=sm />
                </q-item-section>
                <q-item-section>{{ $t('remove_channel') }}</q-item-section>
            </q-item>
        </template>
    </q-list>
    <template v-else>
        <div class="row no-wrap items-center justify-center gap-xl q-pa-md">
            <q-btn v-if="useAuths('modify', ['channel'])" flat padding="md" @click="editChannel">
                <div class="column flex-center">
                    <q-icon name="tune" />
                    <span>{{ $t('edit_channel') }}</span>
                </div>
            </q-btn>
            <q-btn v-if="useAuths('invite_uris', ['channel'])" flat padding="md" @click="inviteFn">
                <div class="column flex-center">
                    <q-icon name="group_add" />
                    <span>{{ $t('invite_member') }}</span>
                </div>
            </q-btn>
            <q-btn v-if="useAuths('delete', ['channel'])" flat padding="md" @click="deleteChannelFn">
                <div class="column flex-center">
                    <q-icon name="remove" />
                    <span>{{ $t('remove_channel') }}</span>
                </div>
            </q-btn>
        </div>
    </template>
    <q-dialog v-model="openEditChannel" persistent>
      <EditChannel :channel />
    </q-dialog>
    <q-dialog v-model="invite" persistent>
      <TeamInvite :byInfo />
    </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import EditChannel from "./EditChannel.vue";
import TeamInvite from "./widgets/TeamInvite.vue";
import {
  deleteChannel as deleteMmChannel
} from "src/api/mattermost.js";
import {removeChannel} from 'src/api/strapi/team.js'
import {teamStore} from 'src/hooks/global/useStore.js';
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const { channel, layout } = defineProps(['channel', 'layout'])

const openEditChannel = ref(false);
const editChannel = () => {
  openEditChannel.value = true;
};

const invite = ref(false);
const byInfo = ref({
    by: "channel",
    channel_id: channel.id,
});
const inviteFn = () => {
  invite.value = true;
};

const deleteChannelFn = async (i) => {
  const curChannelId = route.params?.channel_id;
  const _mm_channel_id = i.mm_channel.id;
  if (!_mm_channel_id) return;
  const removeMmChannel = await deleteMmChannel(_mm_channel_id);
  if (removeMmChannel) {
    const res = await removeChannel(i.id);
    if (res?.data) {
      teamStore.team.team_channels = teamStore.team.team_channels.filter(
        (i) => i.id !== res.data.channel_id
      );
      if(curChannelId === _mm_channel_id){
        await router.push("/teams");
      }
    }
  }
};
</script>