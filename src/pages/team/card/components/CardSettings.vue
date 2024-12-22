<template>
  <q-card bordered class="column no-wrap" style="height: 76vh">
    <q-bar dark class="transparent border-bottom" style="height: 2.3rem">
      <span class="font-medium">{{ $t('card') }} {{ $t('settings') }}</span>
      <q-space />
      <q-btn dense flat round icon="close" v-close-popup />
    </q-bar>
    <div class="q-space row no-wrap">
      <q-list class="border-right q-pa-sm" style="min-width: 9rem">
        <q-item
          v-for="i in setting_items"
          :key="i.val"
          clickable
          v-ripple
          dense
          active-class="bg-primary text-grey-1"
          class="radius-xs q-mb-sm"
          :active="active_item === i.val"
          @click="active_item = i.val"
        >
          <q-item-section side>
            <q-icon :name="i.icon" />
          </q-item-section>
          <q-item-section class="text-no-wrap q-pr-md">{{
            $t(i.label)
          }}</q-item-section>
        </q-item>
      </q-list>
      <roleSettings v-if="active_item === 'role'" :isCard="true" />
      <div
        v-if="active_item === 'private_setting'"
        class="q-space"
      >
        <div
          v-if="useAuths('private', [authBase.collection])"
          class="full-width row no-wrap gap-lg q-pa-md"
        >
          <q-card v-for="(i, index) in isPrivate_items" :key="index" bordered>
            <q-card-section>
              <q-radio
                v-model="isPrivate"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                :val="i.val"
                :label="$t(i.label)"
                class="q-pr-lg"
                @update:model-value="updateCardFn()"
              />
            </q-card-section>
          </q-card>
        </div>
        <div v-else class="fit flex flex-center">{{ $t('no_premission_perform_operation') }}</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, toRefs, computed, watch, onMounted } from "vue";
import roleSettings from "src/pages/team/settings/roleSettings.vue";
import { updateCard } from "src/api/strapi/project.js";
import { teamStore } from "src/hooks/global/useStore.js";
const userId = computed(() => teamStore.init?.id);

const props = defineProps({
  settingfor: {
    type: String,
    default: "role",
  },
});
const authBase = computed(() => {
  let res;
  let isInCard;
  if (teamStore.card) {
    const members = teamStore.card.card_members.map((i) => i.by_user.id);
    isInCard = members?.includes(userId.value);
  }
  if (isInCard) {
    res = {
      collection: "card",
      of: "card",
    };
  } else {
    res = {
      collection: "card",
      of: "project",
    };
  }
  return res;
});
const { settingfor } = toRefs(props);
const active_item = ref();
onMounted(() => {
  active_item.value = settingfor.value;
})
const per_fixs = [
  { val: "kanban", label: "kanban" },
  { val: "article", label: "article" },
  { val: "document", label: "document" },
  { val: "storage", label: "storage" },
];
const title = `${
  per_fixs.find((i) => i.val === teamStore.kanban?.type).label || "task"
}`;
const setting_items = ref([
  { val: "role", label: "role", icon: "add_moderator" },
  { val: "private_setting", label: "private_setting", icon: "mdi-eye-off" },
]);

const isPrivate = ref((teamStore.card?.private && "private") || "public");
const isPrivate_items = [
  { val: "public", label: "public" },
  { val: "private", label: "private" },
];
const isCreator = computed(
  () => teamStore.card?.creator?.id === teamStore.init?.id
);
const updateCardFn = async () => {
  // console.log(isPrivate.value);
  let params = {
    project_id: teamStore.project?.id,
    data: {},
  };
  let setPrivate;
  if (isPrivate.value === "public") {
    setPrivate = false;
  } else {
    setPrivate = true;
  }
  // console.log(setPrivate);
  params.data.private = setPrivate;
  let {data} = await updateCard(teamStore.card?.id, params);
  if (data) {
    return data
  }
};
</script>

<style lang="scss" scoped></style>
