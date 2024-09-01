<template>
  <DocumentTiptap v-if="document" :document :by_info contentStyle="max-width: 100%;min-width: 64rem;" />
</template>

<script setup>
import { ref, toRefs, watch, watchEffect } from "vue";
import { getDocument } from "src/api/strapi/project.js";
import { teamStore, mm_wsStore, userStore } from "src/hooks/global/useStore.js";
import DocumentTiptap from "./DocumentTiptap.vue";

const props = defineProps({
  project_id: {
    type: String,
    default: "",
  },
  document_id: {
    type: String,
    default: "",
  },
  by_info: {
    type: Object,
    default() {
      return {
        by: "project",
      };
    },
  },
});

const { project_id, document_id, by_info } = toRefs(props);

const document = ref();
watchEffect(async () => {
  if (document_id.value && teamStore) {
    if (by_info.value.by === "project") {
      by_info.value.project_id = teamStore.project?.id;
    } else if (by_info.value.by === "card") {
      by_info.value.card_id = teamStore.card?.id;
    } else {
      by_info.value.user_id = userStore.userId;
    }
    if (teamStore.card?.card_documents) {
      document.value = teamStore.card.card_documents?.find(
        (i) => i.id === Number(document_id.value)
      );
    } else {
      const fetch = await getDocument(document_id.value);
      if (fetch?.data) {
        document.value = fetch.data;
      }
    }
  }
});
watch(
  mm_wsStore,
  async () => {
    if (mm_wsStore.event && mm_wsStore.event.event === "posted") {
      let post =
        mm_wsStore.event.data?.post && JSON.parse(mm_wsStore.event.data.post);
      if (!post) return;
      const isCurClint = mm_wsStore?.clientId === post?.props?.clientId;
      if (isCurClint) return;
      let strapi = post?.props?.strapi;
      if (strapi) {
        if (
          strapi.data?.body?.id === document.value?.id &&
          strapi.data.action === "document_updated"
        ) {
          document.value = strapi.data?.body;
        }
      }
    }
  },
  { immediate: false, deep: true }
);
</script>

<style lang="scss" scoped></style>
