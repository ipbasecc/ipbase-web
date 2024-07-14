<template>
    <q-btn
      v-if="$route && $route.meta.where == 'userCenter'"
      dense size="sm" round color="primary" icon="delete"
      class="hover-show transition"
      @click="deletElement"
    />
    <q-item v-else clickable v-close-popup @click="deletElement">
        <q-item-section side><q-icon name="mdi-close" /></q-item-section>
        <q-item-section>删除</q-item-section>
    </q-item>
</template>
<script setup>
import { DeleteElementByID } from "src/apollo/api/api.js";
import { ref, toRef, inject } from "vue";
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps({
  elementId: {
        type: String,
        default: ''
    }
})
const channelId = inject('channelId')
const emit = defineEmits(['elementDeleted'])
const elementIdRef = toRef(props,'elementId')
const DeleteElementByIDParmas = ref({
  deleteElementId: elementIdRef.value,
});
const deletElement = async () => {
  const {
    mutate: DeleteElementByIDMutate,
    onDone: DeleteElementByIDOnDone,
    onError,
  } = DeleteElementByID(DeleteElementByIDParmas);
  const { data } = await DeleteElementByIDMutate();
  if (data) {
    router.push(`/${channelId.value}/elements`);
  }
};
</script>