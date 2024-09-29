<template>
  <BudgetContainer>
    <tbody class="border-bottom">
      <tr v-for="i in budget.ledgers" :key="i.id" class="hovered-item">
        <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
        <td class="text-left">
          <q-chip class="border" flat square icon="mdi-calendar-text" :label="date.formatDate(i.createdAt, 'YY / MM / DD')" />
        </td>
        <td class="text-left">
          <span :class="i.amount > 0 ? 'text-primary' : 'text-negative'">
            {{ i.amount > 0 ? $t('ledger_income') : $t('ledger_outcome') }}
          </span>
          :
          <span class="font-large font-bold-600">
            {{ i.amount > 0 ? i.amount : -i.amount }}
          </span>
          <q-popup-proxy>
            <q-card bordered style="min-width: 22rem;">
              <q-card-section>
                <div class="row no-wrap gap-md">
                  <q-radio v-model="update_type" val="outcome" :label="$t('ledger_outcome')" />
                  <q-radio v-model="update_type" val="income" :label="$t('ledger_income')" />
                </div>
              </q-card-section>
              <q-card-section>
                <q-input square filled v-model.number="update_amount" type="number" :label="$t('ledger_update_amount')" />
              </q-card-section>
              <q-card-section class="q-pa-sm row">
                <q-space />
                <q-btn color="primary" :label="$t('motify')" @click="updateLedger(i, 'amount')" />
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </td>
        <td>
          <q-chip v-if="i.approved" :label="$t('budget_table_approved')" />
          <q-btn v-else flat dense rounded padding="xs md" color="primary" :label="$t('budget_table_approveIt')" @click="updateLedger(i, 'authorizer')" />
        </td>
        <td class="text-left">
          {{ i.purpose }}
          <q-popup-proxy>
            <q-card bordered style="min-width: 22rem;">
              <q-card-section>
                <q-input square filled v-model="update_purpose" type="textarea" :label="$t('ledger_purpose')" />
              </q-card-section>
              <q-card-section class="q-pa-sm row">
                <q-space />
                <q-btn color="primary" :label="$t('update')" v-close-popup @click="updateLedger(i, 'purpose')" />
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </td>
        <td class="text-left">
          <q-avatar size="2rem">
            <q-img
              :src="i.handler?.profile?.avatar?.url"
              :ratio="1"
              spinner-color="primary"
              spinner-size="22px"
            />
          </q-avatar>
        </td>
        <td class="text-left">
          <q-avatar size="2rem">
            <q-img
              :src="i.authorizer?.profile?.avatar?.url"
              :ratio="1"
              spinner-color="primary"
              spinner-size="22px"
            />
          </q-avatar>
        </td>
        <td class="text-left">
          <q-btn flat dense round size="sm" icon="mdi-dots-vertical" class="transition hover-show">
            <q-menu class="radius-sm">
              <q-list dense bordered class="radius-sm q-pa-xs" style="min-width: 8rem">
                <q-item class="radius-xs" clickable v-close-popup @click="removeLedger(i)">
                  <q-item-section side><q-icon name="delete" /></q-item-section>
                  <q-item-section class="text-no-wrap">{{ $t('ledger_delete') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </td>
        <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
      </tr>
    </tbody>
  </BudgetContainer>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import { teamStore } from "src/hooks/global/useStore.js";
import { date } from 'quasar'
import { budget } from 'src/pages/team/budget/useBudgets.js'
import { updateProjectLedger, removeProjectLedger } from 'src/api/strapi/project.js'
import BudgetContainer from './BudgetContainer.vue'

onBeforeMount(() => {
  if(!teamStore.navigation){
    teamStore.navigation = 'budget'
  }
})

const update_amount = ref()
const update_purpose = ref()
const update_type = ref('outcome');
const updateLedger = async (ledger, field) => {
  let params = {
    budget_id: budget.value.id,
    data: {}
  }
  if(field === 'amount') {
    params.data = {
        amount: update_type.value === 'outcome' ? -update_amount.value : update_amount.value
      }
  }
  if(field === 'purpose') {
    params.data = {
      purpose: update_purpose.value
    }
  }
  if(field === 'authorizer') {
    params.data = {
      authorizer: field
    }
  }
  const { data } = await updateProjectLedger(teamStore?.project?.id, ledger.id, params);
  if(data) {
    if(field === 'authorizer') {
      budget.value.amount = data.budget.amount;
      budget.value.ledgers.find(i => i.id === ledger.id)[field] = data.ledger[field]
      budget.value.ledgers.find(i => i.id === ledger.id).approved = true
    } else {
      budget.value.ledgers.find(i => i.id === ledger.id)[field] = data[field]
    }
  }
  update_purpose.value = '';
  update_amount.value = NaN;
}

const removeLedger = async (ledger) => {
  const { data } = await removeProjectLedger(teamStore?.project?.id, ledger.id);
  if(data) {
    budget.value.ledgers = budget.value.ledgers.filter(i => i.id !== ledger.id)
  }
}

</script>

<style scoped>
</style>