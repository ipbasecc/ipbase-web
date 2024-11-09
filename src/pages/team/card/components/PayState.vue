<template>
    <div class="text-positive">
      <template v-if="card.price > 0">
        <span v-if="cardState?.isCreator" class="font-medium font-bold-600">
            {{ $t('self_published') }}
        </span>
        <span v-if="cardState?.isPaied" class="font-medium font-bold-600">
            {{ $t('paied') }}
        </span>
        <template v-if="!cardState?.isPaied && !cardState?.isCreator">
            <span class="font-small">￥</span>
            <span class="font-medium font-bold-600">{{ `${card.price / 100}` }}</span>
        </template>
      </template>
      <span v-else class="border q-px-sm q-py-xs radius-xs">{{ $t('price_free') }}</span>
    </div>
</template>

<script setup>
import {computed } from 'vue'
    const { card } = defineProps(['card']);
    const cardState = computed(() => card.payState.cardState);    
</script>