<template>
    <q-btn
        v-if="userIdRef && bizCardIdRef"
        color="orange" round flat dense
        :icon="icon"
        :disable="disable"
        @click.stop="SetDefaultBizcard"
        :class="defatltBizcardIdRef == bizCardIdRef ? '' : 'hover-show transition'"
    />
</template>
<script setup>
import { updateUsersDefaultBizcard } from "src/apollo/api/api.js";
import { ref, toRef, watch } from "vue";

const props = defineProps({
  userId: {
    type: String,
    defatlt: "",
  },
  bizCardId: {
    type: String,
    defatlt: "",
  },
  defatltBizcardId: {
    type: String,
    defatlt: "",
  },
});
const emit = defineEmits(['defaultBizcardSet']);

const userIdRef = toRef(props, "userId");
const bizCardIdRef = toRef(props, "bizCardId");
const defatltBizcardIdRef = toRef(props, "defatltBizcardId");
const icon = ref();
const disable = ref(true);
const defatltBizcardIdForSet = ref();

const SetDefaultBizcard = async () => {
  disable.value = true;
  const updateUsersDefaultBizcardParams = ref({
    data: {
      config: {
        default_bizcard: defatltBizcardIdForSet.value
      },
    },
  });
  const {
    mutate: updateUsersDefaultBizcardMutate,
    onDone,
    onError,
  } = updateUsersDefaultBizcard(updateUsersDefaultBizcardParams);

  const {data} = await updateUsersDefaultBizcardMutate();

  if(data) {
    disable.value = false;
    let default_bizcard_id = data.updateUsersPermissionsUser.data.attributes.config?.default_bizcard?.data?.id || null;
    emit('defaultBizcardSet',default_bizcard_id)
  }
};

watch([bizCardIdRef,defatltBizcardIdRef], () => {
    if(bizCardIdRef.value) {
        disable.value = false;
        defatltBizcardIdForSet.value = defatltBizcardIdRef.value == bizCardIdRef.value ? null : bizCardIdRef.value;
        icon.value = defatltBizcardIdRef.value == bizCardIdRef.value ? 'mdi-star' : 'mdi-star-outline';
    }
},{immediate:true,deep:true})
</script>
