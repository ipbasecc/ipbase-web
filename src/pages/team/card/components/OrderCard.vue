<template>
    <q-card v-if="card" bordered
    style="width: 24rem;">
        <q-img
            v-if="card.cover?.url"
            :src="card.cover?.url"
            :ratio="16/9"
            spinner-color="primary"
            spinner-size="82px"
        />
        <q-card-section>
            <div class="column no-wrap">
                <div class="row no-wrap gap-md justify-between">
                    <div class="column no-wrap gap-sm">
                        <span class="font-large font-bold-600">{{ card.name }}</span>
                    </div>
                    <div class="text-negative">
                        <span class="text-h4">{{ card.price / 100 }}</span>
                        <span class="font-small">￥</span>
                    </div>
                </div>
                <div class="q-mt-sm">{{ card.description }}</div>
                <div v-if="card.creator" class="row no-wrap q-mt-sm items-center gap-sm">
                    <q-avatar v-if="card.creator?.profile?.avatar?.url" size="32px">
                        <q-img
                            :src="card.creator?.profile?.avatar?.url"
                            :ratio="1"
                            spinner-color="primary"
                            spinner-size="22px"
                        />
                    </q-avatar>
                    <span v-if="card.creator.username">{{ card.creator.username }}</span>
                </div>
            </div>
        </q-card-section>
        <q-card-section class="border-top q-pa-sm">
            <slot name="buyBtn" />
        </q-card-section>
    </q-card>
</template>

<script setup>


const { card } = defineProps({
    card: {
        type: Object,
        Required: true
    },
})
</script>