<template>
  <DocumentTiptap v-if="teamStore.active_document" :key="teamStore.active_document.id"
    :document="teamStore.active_document" :by_info :contentStyle :showClose="true" @close="close"
  />
</template>

<script setup>
import {computed, ref, toRefs, watch, watchEffect, onBeforeUnmount} from "vue";
import {mm_wsStore, teamStore, userStore} from "src/hooks/global/useStore.js";
import DocumentTiptap from "./DocumentTiptap.vue";
import {useQuasar} from 'quasar'

const $q = useQuasar();

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
const contentStyle = computed(() => {
  return $q.screen.gt.xs && !teamStore.card ? 'max-width: 100%;min-width: 64rem;' : 'max-width: 100%;'
})

const document = ref();
watchEffect(async () => {
  if (by_info.value.by === "project") {
    by_info.value.project_id = teamStore.project?.id;
  } else if (by_info.value.by === "card") {
    by_info.value.card_id = teamStore.card?.id;
  } else {
    by_info.value.user_id = userStore.userId;
  }
});
const close = () => {
  teamStore.active_document = null;
}
onBeforeUnmount(() => {
  close();
});
// watch([document_id, document], async () => {
//   const fetchDoucment = async (_docid) => {
//     const {data} = await getDocument(_docid);
//     if (data) {
//       return data;
//     }
//   }
//   if (document_id.value && !document.value) {
//     console.log("document_id.value", document_id.value);
    
//     document.value = await fetchDoucment(document_id.value);
//   }
// },{immediate:true,deep:false})
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
