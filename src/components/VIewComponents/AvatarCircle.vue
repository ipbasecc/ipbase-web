<template>
    <template v-if="props">
        <q-avatar
            v-if="avatar"
            :size="`${sizeRef}px`"
        >
            <q-img
            :src="`${avatar}?x-oss-process=image/resize,h_${sizeRef * 2},m_lfit`"
            :ratio="1"
            spinner-color="primary"
            :spinner-size="`${sizeRef - 14}px`"
            />
        </q-avatar>
        <q-avatar
            v-if="!avatar && attributesRef.username"
            size="34px"
            font-size="1rem"
            class="border text-white"
            :style="`background-color: ${genColor(attributesRef.username)};`"
        >
            {{ attributesRef.username.charAt(0).toUpperCase() }}
        </q-avatar>
    </template>
</template>
<script setup>
import { computed, toRef } from 'vue';
import { genColor } from "src/hooks/global/useGenerateColor.js"

const props = defineProps({
    attributes: {
        type: Object,
        default() {
            return {}
        }
    },
    size: {
        type: Number,
        default: 28
    }
})
const attributesRef = toRef(props,'attributes');
const sizeRef = toRef(props,'size');

const avatar = computed(() => attributesRef.value?.profile?.avatar?.data?.attributes?.url || null);
</script>
