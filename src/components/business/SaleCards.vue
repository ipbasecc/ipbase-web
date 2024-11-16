<template>
    <div class="row gap-sm">
        <q-card bordered :class="$q.screen.gt.sm ? 'col-6' : 'col-12'">
            <q-card-section>
                <div class="text-h6">{{ $t('total_revenue') }}</div>
                <div class="font-bold-600" style="font-size: 5rem;">{{ teamStore.init?.income / 100 }}</div>
            </q-card-section>
            <q-card-section>
                {{ $t('total_revenue_description') }}
            </q-card-section>
        </q-card>
        <q-card bordered class="col">
            <q-card-section>
                <div class="row items-start">
                    <div class="text-h6">{{ $t('account_balance') }}</div>
                    <q-space />
                    <q-btn color="primary" :label="$t('withdraw')" padding="xs lg" @click="onClick" />
                </div>
                <div class="font-bold-600" style="font-size: 5rem;">{{ teamStore.init?.withdraw / 100 }}</div>
            </q-card-section>
            <q-card-section>
                {{ $t('account_balance_description') }}
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { teamStore } from 'src/hooks/global/useStore';
</script>