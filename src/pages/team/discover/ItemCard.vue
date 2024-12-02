<template>
    <q-card bordered style="max-width: 540px;" class="shadow-0 full-width overflow-hidden">
        <MediaViewer :url="card.cover?.url || alt_image" />
        <q-item>
            <q-item-section v-if="card.creator?.profile?.avatar?.url" side>
                <q-avatar size="md">
                    <q-img :src="card.creator.profile.avatar.url" :ratio="1" spinner-color="primary"
                        spinner-size="22px" />
                </q-avatar>
            </q-item-section>
            <q-item-section @click="enterCardDetail(card)" class="cursor-pointer">
                <q-item-label>{{ card.name }}</q-item-label>
                <q-item-label v-if="card.description" caption lines="2">{{ card.description }}</q-item-label>
            </q-item-section>
            <q-item-section side top>
                <q-item-label caption>
                    <FavoriteBtn :item="card" />
                    <LikeBtn :item="card" />
                    <template v-if="card.type === 'classroom'">
                        <q-chip square v-if="isCreator" :label="$t('my_publish')" color="primary" outline />
                        <template v-else-if="card.price">
                            <q-chip square v-if="buied" :label="$t('buied')" color="positive" outline />
                            <q-chip v-else square :label="`￥：${card.price / 100}`" color="info" outline />
                        </template>
                        <q-chip square v-else :label="$t('price_free')" color="info" outline />
                    </template>
                    <q-chip v-else square :label="$t('my_publish')" color="primary" outline />
                </q-item-label>
            </q-item-section>
        </q-item>
    </q-card>
</template>

<script setup>
    import { computed } from 'vue'
    import { teamStore } from 'src/hooks/global/useStore';
    import FavoriteBtn from './components/FavoriteBtn.vue'
    import LikeBtn from './components/LikeBtn.vue'
    import MediaViewer from 'src/components/VIewComponents/MediaViewer.vue'
    const props = defineProps({
        card: {
            type: Object,
            required: true,
        }
    })
    const emit = defineEmits(['enterCardDetail'])
    const enterCardDetail = (card) => {
        emit('enterCardDetail', card)
    }

    const liked = computed(() => {
        return props.card.by_like_users?.length > 0
    })
    const favorited = computed(() => {
        return props.card.favorite_by_users?.length > 0
    })
    const buied = computed(() => {
        return props.card.orders?.length > 0
    })
    const isCreator = computed(() => {
        return props.card.creator?.id === teamStore.init?.id
    })
</script>
