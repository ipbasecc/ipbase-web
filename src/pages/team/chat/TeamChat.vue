<template>
  <ChatContainter
    v-if="mm_channel_id"
    v-bind="$attrs"
    :project_id
    :mm_channel_id
    :key="mm_channel_id"
  />
</template>

<script setup>
import { toRefs, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getChannelByID } from "src/api/strapi/team.js";
import { teamStore, mm_wsStore } from "src/hooks/global/useStore.js";
import ChatContainter from "./ChatContainter.vue";

const props = defineProps({
  mm_channel_id: {
    type: String,
    default: null,
  },
  project_id: {
    type: String,
    default: null,
  }
});
const { mm_channel_id, project_id } = toRefs(props);

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
      (i) => i.mm_channel?.id === mm_channel_id.value
    );
  }
});

watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event) {
      let post = mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data.action === "channel_member_updated" &&
          strapi.data.channel_id === teamStore.channel?.id
        ) {
          const res = await getChannelByID(teamStore.channel?.id);
          if (res?.data) {
            teamStore.channel = res.data;
          }
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
