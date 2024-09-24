<template>
  <div class="fit" :class="teamStore?.project?.budget ? '' : 'column flex-center'">
    <q-markup-table v-if="teamStore?.project?.budget" flat square separator="horizontal">
      <thead>
        <tr>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
          <th colspan="4">
            <div class="row no-wrap items-center q-py-xl">
              <div class="text-h4 q-ml-md text-white">总预算：</div>
              <div class="text-h4 q-ml-md text-white">{{ teamStore?.project?.budget.amount }}</div>
            </div>
          </th>
          <th colspan="3" class="text-left">
            <q-btn color="primary" icon="mdi-plus" label="新增" @click="toggleAddLedger" />
          </th>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
        </tr>
        <tr>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
          <th class="text-left">创建时间</th>
          <th class="text-left">金额</th>
          <th class="text-left">状态</th>
          <th class="text-left full-width">说明</th>
          <th class="text-left">经办人</th>
          <th class="text-left">授权人</th>
          <th class="text-left">更多</th>
          <th :style="$q.screen.gt.md ? 'width: 10%;' : ''"></th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
          <td colspan="6">
            <div class="row no-wrap items-center q-py-xl">
              <div class="text-h4 q-ml-md text-white">余额
                <span class="font-small text-grey-5">(不含未批准)：</span>
              </div>
              <div class="text-h4 q-ml-md text-white">{{ left.toFixed(2) }}</div>
            </div>
          </td>
          <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
        </tr>
      </tfoot>
      <tbody class="border-bottom">
        <tr v-for="i in teamStore?.project?.budget?.ledgers" :key="i.id" class="hovered-item">
          <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
          <td class="text-left">
            <q-chip class="border" flat square icon="mdi-calendar-text" :label="date.formatDate(i.createdAt, 'YY / MM / DD')" />
          </td>
          <td class="text-left">
            <span :class="i.amount > 0 ? 'text-primary' : 'text-negative'">
              {{ i.amount > 0 ? '收入' : '支出' }}
            </span>
            :
            <span class="font-large font-bold-600">
              {{ i.amount > 0 ? i.amount : -i.amount }}
            </span>
            <q-popup-proxy>
              <q-card bordered style="min-width: 22rem;">
                <q-card-section>
                  <div class="row no-wrap gap-md">
                    <q-radio v-model="add_type" val="outcome" label="支出" />
                    <q-radio v-model="add_type" val="income" label="收入" />
                  </div>
                </q-card-section>
                <q-card-section>
                  <q-input square filled v-model.number="update_amount" type="number" label="调整金额" />
                </q-card-section>
                <q-card-section class="q-pa-sm row">
                  <q-space />
                  <q-btn color="primary" label="修改" @click="updateLedger(i, 'amount')" />
                </q-card-section>
              </q-card>
            </q-popup-proxy>
          </td>
          <td>
            <q-chip v-if="i.approved" label="已批准" />
            <q-btn v-else flat dense rounded padding="xs md" color="primary" label="批准" @click="updateLedger(i, 'authorizer')" />
          </td>
          <td class="text-left">
            {{ i.purpose }}
            <q-popup-proxy>
              <q-card bordered style="min-width: 22rem;">
                <q-card-section>
                  <q-input square filled v-model="update_purpose" type="textarea" label="用款说明" />
                </q-card-section>
                <q-card-section class="q-pa-sm row">
                  <q-space />
                  <q-btn color="primary" label="更新" v-close-popup @click="updateLedger(i, 'purpose')" />
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
                    <q-item-section class="text-no-wrap">删除该流水</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </td>
          <td :style="$q.screen.gt.md ? 'width: 10%;' : ''"></td>
        </tr>
      </tbody>
    </q-markup-table>
    <q-btn v-else flat outline icon="mdi-plus" label="添加预算">
      <q-popup-proxy cover class="shadow-24">
        <q-card bordered style="min-width: 22rem;">
          <q-card-section class="column no-wrap gap-sm">
            <q-input square filled v-model.number="create_params.data.amount" type="number" label="预算金额" />
            <q-input square filled v-model="create_params.data.purpose" type="textarea" label="预算说明" />
          </q-card-section>
          <q-card-section class="border-top q-pa-sm row">
            <q-space />
            <q-btn color="primary" label="确认" @click="attachBudget()" />
          </q-card-section>
        </q-card>
      </q-popup-proxy>
    </q-btn>
    <q-dialog v-model="add_ledget" persistent>
      <q-card bordered style="min-width: 36rem;">
        <q-card-section  class="row q-pa-sm gap-sm">
            <q-radio v-model="add_type" val="outcome" label="支出" />
            <q-radio v-model="add_type" val="income" label="收入" />
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
              label="用款金额"
            />

            <q-input
              filled
              square
              type="textarea"
              v-model="create_params.data.purpose"
              label="说明款项用途"
            />
          </q-form>
        </q-card-section>
        <q-card-section class="row q-pa-sm gap-sm border-top">
          <q-btn label="重置" type="reset" color="primary" flat @click="onReset()" />
          <q-space />
          <q-btn label="确认" color="primary" @click="addLedger()" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, computed } from 'vue'
import { userStore, teamStore } from "src/hooks/global/useStore.js";
import { sumArr } from "src/hooks/utilits.js";
import { date } from 'quasar'
import { addProjectLedger, updateProjectLedger, removeProjectLedger, attachProjectBudget } from 'src/api/strapi/project.js'

onBeforeMount(() => {
  if(!teamStore.navigation){
    teamStore.navigation = 'budget'
  }
})

const amount = computed(() => teamStore?.project?.budget?.amount);
const total = computed(() => sumArr(
  teamStore?.project?.budget?.ledgers?.filter(l => l.approved)?.map(i => i.amount))
);
const left = computed(() => amount.value && total.value && amount.value + total.value);

const add_ledget = ref(false);
const add_type = ref('outcome');
const toggleAddLedger = () => {
  add_ledget.value = !add_ledget.value
}
const create_params = ref({
  data: {
    amount: NaN,
    purpose: '',
  }
})
const onReset = () => {
  create_params.value.data.amount = NaN;
  create_params.value.data.purpose = ''
}
const addLedger = async () => {
  console.log('addLedger');
  
  if(add_type.value === 'outcome') {
    create_params.value.data.amount = -create_params.value.data.amount;
  }
  const { data } = await addProjectLedger(teamStore?.project?.id, create_params.value);
  onReset();
  if(data) {
    teamStore.project.budget.ledgers.push(data);
    add_ledget.value = false;
  }
}


const update_amount = ref()
const update_purpose = ref()
const updateLedger = async (ledger, field) => {
  let params = {}
  if(field === 'amount') {
    params = {
      data: {
        amount: add_type.value === 'outcome' ? -update_amount.value : update_amount.value
      }
    }
  }
  if(field === 'purpose') {
    params = {
      data: {
        purpose: update_purpose.value
      }
    }
  }
  if(field === 'authorizer') {
    params = {
      data: {
        authorizer: field
      }
    }
  }
  const { data } = await updateProjectLedger(teamStore?.project?.id, ledger.id, params);
  if(data) {
    teamStore.project.budget.ledgers.find(i => i.id === ledger.id)[field] = data[field]
    teamStore.project.budget.ledgers.find(i => i.id === ledger.id).approved = true
  }
  update_purpose.value = '';
  update_amount.value = NaN;
}

const removeLedger = async (ledger) => {
  const { data } = await removeProjectLedger(teamStore?.project?.id, ledger.id);
  if(data) {
    teamStore.project.budget.ledgers = teamStore.project.budget.ledgers.filter(i => i.id !== ledger.id)
  }
}

const attachBudget = async () => {
  let params = {
    data: {
      amount: create_params.value.data.amount,
      purpose: create_params.value.data.purpose,
    }
  }
  const { data } = await attachProjectBudget(teamStore?.project?.id, params);
  if(data) {
    teamStore.project.budget = data
  }
}

</script>

<style scoped>
</style>