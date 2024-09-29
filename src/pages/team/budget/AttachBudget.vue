<template>
    <q-card bordered style="min-width: 22rem;">
      <q-card-section class="column no-wrap gap-sm">
        <q-input square filled v-model.number="amount" type="number" :label="$t('budget_amount')" />
        <q-input square filled v-model="purpose" type="textarea" :label="$t('budget_purpose')" />
      </q-card-section>
      <q-card-section class="border-top q-pa-sm row">
        <q-btn flat :label="$t('cancel')" v-close-popup />
        <q-space />
        <q-btn color="primary" :label="$t('confirm')"
          @click="attach(amount, purpose)" />
      </q-card-section>
    </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { attachBudget } from 'src/pages/team/budget/useBudgets.js'

const amount = ref(NaN);
const purpose = ref('');
const emit = defineEmits(['attached']);
const attach = async (_amount, _purpose) => {
    await attachBudget(_amount, _purpose);
    emit('attached');
    amount.value = NaN;
    amount.value = '';
}
</script>

<style scoped>
</style>