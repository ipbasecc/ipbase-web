<template>

    <q-btn dense round size="sm" flat :color="is_liked ? 'orange' : ''"
        :icon="is_liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'" @click="toggleLike()" />
</template>
<script setup>
    import { onMounted, ref, computed } from 'vue';
    import { likeCard, removeLikeCard } from "src/api/strapi/project.js";

    const { item } = defineProps(['item'])
    const is_liked = ref(false);

    onMounted(() => {
        is_liked.value = item.by_like_users?.length > 0
    })

    const params = computed(() => {
        return {
            data: {
                card_id: item.id
            }
        }
    })
    const toggleLike = async () => {
        let res
        if (is_liked.value) {
            res = await removeLikeCard(params.value)
        } else {
            res = await likeCard(params.value)
        }
        if (res) {
            is_liked.value = !is_liked.value
        }
    }
</script>