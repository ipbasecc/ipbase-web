<template>
    <div class="relative-position cursor-pointer q-px-xs"
        :style="`height: 24px; width: ${24 * membersRef.length}px;`"
    >
        <q-avatar
            v-for="(item,index) in membersRef" :key="index" :size="`${size}px`"
            class="overlapping overflow-hidden"
            :style="`left: ${index * 20}px`"
        >
            <q-img
                :src="item.profile?.avatar?.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="18px"
            />
        </q-avatar>
        <slot name="default"></slot>
        <slot name="tooltip"></slot>
    </div>
</template>

<script setup>
import { toRef } from 'vue';

const props = defineProps({
    members: {
        type: Array,
        default() {
            return []
        }
    },
    size: {
        type: Number,
        default: 24
    }
})
const membersRef = toRef(props,'members');
</script>

<style lang="sass" scoped>
.overlapping
  border: 2px solid white
  position: absolute
</style>