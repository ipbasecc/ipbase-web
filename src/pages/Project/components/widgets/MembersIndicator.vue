<template>
    <div class="cursor-pointer row no-wrap items-center" style="height: 24px;padding-right: 16px">
        <div
            v-for="(item,index) in members" :key="index" size="22px"
            :style="`width: 16px;z-index: ${index * 100 - index}`"
        >
            <UserAvatar
                v-if="item.mm_profile"
                :user_id="item.mm_profile.id"
                :size="24"
                :disable_card="true"
                :indicator_size="'10px'"
            />
        </div>
    </div>
</template>

<script setup>
import useProjectStore from "src/stores/project.js";
import { computed, toRef } from "vue";
import { uniqueById } from 'src/hooks/utilits.js'
import UserAvatar from 'src/pages/Chat/components/wigets/UserAvatar.vue'

const props = defineProps({
    isCard: {
        type: Boolean,
        default: false
    }
})

const isCardRef = toRef(props,'isCard');

const projectStore = useProjectStore();

const members = computed(() => {
    const __ = isCardRef.value ? projectStore.card?.card_members : projectStore.project?.project_members
    let originalMembers = __.map(i => i.by_user);
    let arr = uniqueById(originalMembers)
    if (arr?.length < 3) {
        return arr;
    } else {
        return [...arr?.slice(0, 2), arr?.slice(-1)[0]];
    }
});
</script>

<style lang="sass" scoped>
.overlapping
  position: absolute
</style>