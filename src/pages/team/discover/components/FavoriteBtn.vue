<template>
<q-btn dense round size="sm" flat
    :color="is_favorited ? 'orange' : ''"
    :icon="is_favorited ? 'mdi-star' : 'mdi-star-outline'"
    @click="toggleFavorite()"
/>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import { favoriteCard, removefavoriteCard } from "src/api/strapi/project.js";

const { item } = defineProps(['item'])
const is_favorited = ref(false);

onMounted(() => {
    is_favorited.value = item?.favorite_by_users?.length > 0
})


const params = computed(() => {
        return {
            data: {
                card_id: item.id
            }
        }
    })
    const toggleFavorite = async () => {
        let res
        if(is_favorited.value) {
            res = await removefavoriteCard(params.value)
        } else {
            res = await favoriteCard(params.value)
        }
        if(res){
            is_favorited.value = !is_favorited.value
        }
    }
</script>
