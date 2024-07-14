<template>
    <template v-if="props">
        <q-avatar
            v-if="avatar"
            :size="`${sizeRef}px`"
            :class="user_channel ? 'cursor-pointer' : ''"
            @click="user_channel && imgRouterRef && $router.push(`/${user_channel}/posts`)"
        >
            <q-img
            :src="`${avatar}?x-oss-process=image/resize,h_${sizeRef * 2},m_lfit`"
            :ratio="1"
            spinner-color="primary"
            :spinner-size="`${sizeRef - 14}px`"
            />
        </q-avatar>
        <q-avatar
            v-if="!avatar && username"
            :size="`${sizeRef}px`"
            font-size="0.7rem"
            class="border text-white"
            :style="`background-color: ${genColor(username)};`"
            :class="user_channel ? 'cursor-pointer' : ''"
            @click="user_channel && imgRouterRef && $router.push(`/${user_channel}/posts`)"
        >
            {{ username.charAt(0).toUpperCase() }}
        </q-avatar>
        <span
            v-if="withName"
            :class="user_channel ? 'cursor-pointer' : ''"
            @click="user_channel && $router.push(`/${user_channel}/posts`)"
        >
            {{ attributesRef.username }}
        </span>
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
    },
    withName : {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: ''
    },
    channelId: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    imgRouter: {
        type: Boolean,
        default: false
    }
})
const attributesRef = toRef(props,'attributes');
const sizeRef = toRef(props,'size');
const nameRef = toRef(props,'name');
const imageRef = toRef(props,'image');
const channelIdRef = toRef(props,'channelId');
const imgRouterRef = toRef(props,'imgRouter');

const avatar = computed(() => imageRef.value || attributesRef.value?.profile?.avatar?.data?.attributes?.url || null);
const username = computed(() => nameRef.value || attributesRef.value?.username);
const user_channel = computed(() => channelIdRef.value || attributesRef.value?.user_channel?.data?.id || null);
// const username = ref(nameRef.value || attributesRef.value?.username);
// const user_channel = ref(channelIdRef.value || attributesRef.value?.user_channel?.id);
</script>
