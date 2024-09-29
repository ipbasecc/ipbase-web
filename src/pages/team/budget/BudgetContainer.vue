<template>
  <div class="fit" :class="budget ? '' : 'column flex-center'">
    <q-markup-table v-if="budget"
      flat square separator="horizontal"
      class="no-shadow transparent"
    >
      <thead>
        <tr>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
          <th colspan="4">
            <div class="row no-wrap items-center q-py-xl">
              <div class="text-h4 q-ml-md">{{ $t('total_budget_amount') }}</div>
              <div class="text-h4 q-ml-md">{{ budget.amount }}</div>
            </div>
          </th>
          <th colspan="3" class="text-left">
            <q-btn-dropdown
              split flat
              :class="$q.dark.mode ? 'bg-dark' : 'bg-grey-1'"
              class="border"
              @click="toggleAddLedger"
            >
              <template #label>
                <span :class="$q.dark.mode ? 'text-grey-1' : 'text-grey-10'" class="q-px-md">
                  {{ $t('add_ledger') }}
                </span>
              </template>
              <q-list dense bordered class="radius-sm q-pa-xs">
                <q-item clickable v-close-popup @click="deleteBudget()" class="radius-xs">
                  <q-item-section side>
                    <q-icon name="delete" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('delete') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </th>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
        </tr>
        <tr>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
          <th class="text-left">{{ $t('add_ledger') }}</th>
          <th class="text-left">{{ $t('budget_table_createAt') }}</th>
          <th class="text-left">{{ $t('budget_table_status') }}</th>
          <th class="text-left full-width">{{ $t('budget_table_purpose') }}</th>
          <th class="text-left">{{ $t('budget_table_handler') }}</th>
          <th class="text-left">{{ $t('budget_table_authorizer') }}</th>
          <th class="text-left">{{ $t('budget_table_more') }}</th>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
          <td colspan="6">
            <div class="row no-wrap items-center q-py-xl">
              <div class="text-h4 q-ml-md">{{ $t('budget_table_balance') }}
                <span class="font-small text-grey-5">{{ $t('budget_table_balance_tip') }}</span>
              </div>
              <div class="text-h4 q-ml-md">{{ left.toFixed(2) }}</div>
            </div>
          </td>
          <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
        </tr>
      </tfoot>
      <slot />
    </q-markup-table>
    <BgBrand v-else />
    <AddLedget />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { budget, toggleAddLedger, deleteBudget } from 'src/pages/team/budget/useBudgets.js'
import { sumArr } from "src/hooks/utilits.js";
import AddLedget from './AddLedget.vue'
import BgBrand from 'src/components/VIewComponents/BgBrand.vue'

const amount = computed(() => budget.value?.amount);
const total = computed(() => sumArr(
  budget.value?.ledgers?.filter(l => l.approved)?.map(i => i.amount))
);
const left = computed(() => amount.value && total.value && amount.value + total.value);
</script>

<style scoped>
</style>