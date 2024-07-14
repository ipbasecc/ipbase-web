<template>
  <ChatContainter
    v-if="channel_id"
    v-bind="$attrs"
    :channel_id
    :key="channel_id"
  />
  <div v-if="!channel_id && $q.screen.gt.xs" class="absolute-full flex flex-center">
    <BgBrand />
  </div>
</template>

<script setup>
import { toRefs, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import ChatContainter from "./ChatContainter.vue";
import BgBrand from "src/components/VIewComponents/BgBrand.vue";

import { getChannelByID } from "src/api/strapi/team.js";
import { teamStore, mm_wsStore } from "src/hooks/global/useStore.js";

import { useQuasar } from 'quasar';
const $q = useQuasar()
const props = defineProps({
  project_id: {
    type: String,
    default: null,
  },
  channel_id: {
    type: String,
    default: null,
  },
});
const { project_id, channel_id } = toRefs(props);

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  const chatRouteNames = [
    "team_project_chat_homepage",
    "team_project_chat_page",
  ];
  if (chatRouteNames.includes(route.name)) {
    teamStore.navigation = "chat";
  }
  if (!teamStore.mm_channel) {
    teamStore.mm_channel = teamStore.team?.team_channels.find(
      (i) => i.mm_channel?.id === channel_id.value
    );
  }
});
// watch(
//   [project_id, channel_id],
//   async () => {
//     if (!channel_id.value && project_id.value && $q.screen.gt.xs) {
//       const lastChannel = await getLastChannel(project_id.value);
//       if (lastChannel) {
//         teamStore.mm_channel = lastChannel;
//         router.push(
//           `/teams/projects/${project_id.value}/chat/${lastChannel.id}`
//         );
//       }
//     }
//   },
//   { immediate: true, deep: false }
// );

watch(
  mm_wsStore,
  async () => {
    const refetchChannel = async () => {
      const res = await getChannelByID(teamStore.channel?.id);
      if (res?.data) {
        teamStore.channel = res.data;
      }
    };
    if (mm_wsStore.event) {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data.action === "channel_member_updated" &&
          strapi.data.channel_id === teamStore.channel?.id
        ) {
          await refetchChannel();
        }
        if (
          strapi.data.is === "channel" &&
          strapi.data.action === "member_removed" &&
          strapi.data.channel_id === teamStore.channel?.id
        ) {
          teamStore.channel.members = teamStore.channel.members.filter(
            (i) => i.id !== strapi.data.removeMember_id
          );
        }
      }
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
