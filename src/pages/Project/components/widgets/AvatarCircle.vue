<template>
    <template v-if="props">
        <q-avatar
            v-if="avatar"
            :size="`${sizeRef}px`"
            :class="overlapping ? 'overlapping' : ''"
            :style="overlapping ? `left: ${index * -10}px` : ''"
        >
            <q-img
                :src="`${avatar}?x-oss-process=image/resize,h_${sizeRef * 2},m_lfit`"
                :ratio="1"
                spinner-color="primary"
                :spinner-size="`${sizeRef - 14}px`"
            />
        </q-avatar>
        <q-avatar
            v-if="!avatar && avatarRef.username"
            :size="`${sizeRef}px`"
            font-size="1rem"
            class="border text-white"
            :class="overlapping ? 'overlapping' : ''"
            :style="`background-color: ${genColor(avatarRef.username)};left: ${index * -10}px`"
        >
            {{ avatarRef.username.charAt(0).toUpperCase() }}
        </q-avatar>
    </template>
</template>
<script setup>
import { computed, ref, toRef } from 'vue';
import { genColor } from "src/hooks/global/useGenerateColor.js"

const props = defineProps({
    member: {
        type: Object,
        default() {
            return {}
        }
    },
    size: {
        type: Number,
        default: 28
    },
    overlapping: {
        type: Boolean,
        default: false
    },
    index: {
        type: Number,
        default: NaN
    }
})
const avatarRef = toRef(props,'member');
const sizeRef = toRef(props,'size');

const avatar = computed(() => avatarRef.value?.profile?.avatar?.url || null);
</script>