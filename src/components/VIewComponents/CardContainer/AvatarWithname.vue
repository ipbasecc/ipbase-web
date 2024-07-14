<template>
    <div class="row no-wrap gap-sm items-center">
        <q-avatar
            class="cursor-pointer"
            size="24px"
            @click="$router.push(`/${authorRef.attributes.user_channel.data.id}/posts`)"
        >
            <q-img
                :src="authorRef.attributes.profile.avatar.data.attributes.url"
                :ratio="1"
                spinner-color="primary"
                spinner-size="16px"
            />
        </q-avatar>
        <div class="column q-space">
            <span class="cursor-pointer"
                @click="$router.push(`/${authorRef.attributes.user_channel.data.id}/posts`)"
            >{{ authorRef.attributes.username }}</span>
        </div>
    </div>
</template>
<script setup>
import { toRef } from 'vue';

const props = defineProps({
    author: {
        type: Object,
        default() {
            return {}
        }
    }
})
const authorRef = toRef(props,'author')
</script>