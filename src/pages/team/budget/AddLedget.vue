<template>
    <q-dialog v-model="add_ledget" persistent>
      <q-card bordered style="min-width: 36rem;">
        <q-card-section  class="row q-pa-sm gap-sm">
            <q-radio v-model="add_type" val="outcome" :label="$t('ledger_outcome')" />
            <q-radio v-model="add_type" val="income" :label="$t('ledger_income')" />
            <q-space />
            <div>
              <q-btn flat dense size="sm" round icon="mdi-close" v-close-popup />
            </div>
        </q-card-section>
        <q-card-section>
          <q-form
            class="q-gutter-md"
          >
            <q-input
              filled
              square
              v-model.number="create_params.data.amount"
              type="number"
              :label="$t('ledger_amount')"
            />

            <q-input
              filled
              square
              type="textarea"
              v-model="create_params.data.purpose"
              :label="$t('ledger_purpose')"
            />
            <q-toggle v-model="create_params.data.affect_budget" color="primary" :label="$t('ledger_affect_budget')"/>
          </q-form>
        </q-card-section>
        <q-card-section class="row q-pa-sm gap-sm border-top">
          <q-btn :label="$t('reset')" type="reset" color="primary" flat @click="onReset()" />
          <q-space />
          <q-btn :label="$t('confirm')" color="primary" @click="addLedger()" />
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
    add_ledget,
    add_type,
    onReset,
    addLedger,
    create_params
} from 'src/pages/team/budget/useBudgets.js'
</script>

<style scoped>
</style>