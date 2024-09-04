<template>
  <ChatContainter
    v-if="channel_id"
    v-bind="$attrs"
    :channel_id
    :key="channel_id"
  />
</template>

<script setup>
import { toRefs, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getChannelByID } from "src/api/strapi/team.js";
import { teamStore, mm_wsStore } from "src/hooks/global/useStore.js";
import ChatContainter from "./ChatContainter.vue";

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
const { channel_id } = toRefs(props);

const route = useRoute();

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
