import { ref, computed } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
import { addProjectLedger, deleteProjectBudget, attachProjectBudget, findProjectBudgets } from 'src/api/strapi/project.js'

export const budgets = computed(() => teamStore.project?.budgets);
export const budget = ref();

export const fetchBudgets = async (project_id) => {
    const { data } = await findProjectBudgets(project_id);
    if(data) {
        teamStore.project.budgets = data.budgets;
    }
}

export const attachBudget = async (amount, purpose) => {
    let params = {
      data: {
        amount: amount,
        purpose: purpose,
      }
    }
    const { data } = await attachProjectBudget(teamStore?.project?.id, params);
    if(data) {
      budget.value = data;
      teamStore.project?.budgets.push(data);
    }
}

export const toggleBudget = (_budget_id) => {
    budget.value = budgets.value.find((budget) => budget.id === _budget_id);
}

export const add_ledget = ref(false);
export const add_type = ref('outcome');
export const toggleAddLedger = () => {
  add_ledget.value = !add_ledget.value
}
export const create_params = ref({
  budget_id: budget.value?.id,
  data: {
    amount: NaN,
    purpose: '',
    affect_budget: false,
  }
})
export const onReset = () => {
  create_params.value.data.amount = NaN;
  create_params.value.data.purpose = ''
}
export const addLedger = async () => {
  create_params.value.budget_id = budget.value?.id;
  
  if(add_type.value === 'outcome') {
    create_params.value.data.amount = -create_params.value.data.amount;
  }
  const { data } = await addProjectLedger(teamStore?.project?.id, create_params.value);
  onReset();
  if(data) {
    budget.value?.ledgers.push(data);
    add_ledget.value = false;
  }
}

export const deleteBudget = async () => {
    const { data } = await deleteProjectBudget( teamStore?.project?.id, budget.value?.id);
    if(data) {
        budget.value = null;
        teamStore.project.budgets = teamStore.project.budgets.filter((i) => i.id !== Number(data.budget_id));
    }
}