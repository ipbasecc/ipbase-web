<template>
  <div
    class="cursor-pointer row no-wrap items-center"
    style="height: 24px; padding-right: 16px"
  >
    <div
      v-for="(item, index) in members"
      :key="index"
      size="22px"
      :style="`width: 16px;z-index: ${index * 100 - index}`"
    >
      <UserAvatar
        v-if="item.by_user?.mm_profile"
        :user_id="item.by_user.mm_profile.id"
        :size="24"
        :disable_card="true"
        :indicator_size="'10px'"
      />
    </div>
  </div>
</template>

<script setup>
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";
import { toRefs, computed } from "vue";

const props = defineProps({
  members: {
    type: Object,
    default() {
      return {};
    },
  },
});

const { members } = toRefs(props);
</script>

<style lang="sass" scoped>
.overlapping
  position: absolute
</style>
