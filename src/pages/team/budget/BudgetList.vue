<template>
  <q-scroll-area v-if="budgets" class="fit">
    <q-list dense class="q-pa-xs">
      <q-item v-for="budget in budgets" :key="budget.id"
        class="radius-xs"
        :class="budget.id === activeBudget?.id ? 'border active-sublistitem' : 'border-placeholder op-7'"
        clickable
        @click="toggleBudget(budget.id)"
      >
        <q-item-section side>
          <q-icon name="mdi-cash" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ budget.purpose}}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        class="radius-xs"
        clickable
        @click="openAttach = true"
      >
        <q-item-section side>
          <q-icon name="mdi-plus" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t('budget_add_budget') }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="openAttach" persistent>
      <AttachBudget @attached="attached" />
    </q-dialog>
  </q-scroll-area>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { teamStore } from "src/hooks/global/useStore.js";
import { budgets, budget as activeBudget, toggleBudget, fetchBudgets } from 'src/pages/team/budget/useBudgets.js'
import AttachBudget from './AttachBudget.vue'

const openAttach = ref(false);
const attached = () => {
  openAttach.value = false;
}

const project_id = computed(() => teamStore.project?.id);
watch(project_id, async () => {
  if (project_id.value) {
    await fetchBudgets(project_id.value);
  }
},{immediate: true, deep: false})
</script>

<style scoped>
</style>