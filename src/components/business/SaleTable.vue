<template>
  <div class="column q-mt-sm">
    <q-toolbar class="transparent q-mb-md q-mt-lg">
      <q-tabs v-model="orderToggler">
        <q-tab v-for="i in orderTags" :key="i.name" :name="i.name" :label="i.label" />
      </q-tabs>
    </q-toolbar>
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="name"
      :selected-rows-label="clacWhitdrawAmount"
      :selection="orderToggler === 'can_withdraw' ? 'multiple' : 'none'"
      v-model:selected="selected"
      :pagination="initialPagination"
    >
      <template v-slot:body-cell-cover="props">
        <q-td :props="props">
          <img :src="props.row.cover" alt="Cover Image" style="width: 100px; height: auto;" />
        </q-td>
      </template>
      <template v-slot:body-cell-author="props">
        <q-td :props="props">
          <q-avatar size="2rem" color="primary" class="border">
            <q-img
              v-if="props.row.author?.profile?.avatar?.url"
              :src="props.row.author?.profile?.avatar?.url"
              :ratio="1"
              spinner-color="primary"
              spinner-size="1rem"
            />
            <span v-else>{{ props.row.author.username[0] }}</span>
          </q-avatar>
        </q-td>
      </template>
    </q-table>

    <div v-if="orderToggler === 'can_withdraw'" class="column q-mt-md q-pa-md">
      <div class="row items-end">
        <span class="font-bold-600" style="font-size: 3rem; line-height: 1;">提现金额: {{ clacWhitdrawAmount() }}</span>
        <span class="q-pr-md font-large">￥</span>
        <span class="font-small op-5">（支付平台费用：{{ transaction_fee }}%, 平台佣金：{{ 100 - interest }}% ）</span>
      </div>
      <div class="q-mt-md">
        <q-btn color="primary" label="申请提现" :disable="clacWhitdrawAmount () <= 0" @click="scurity_check = true" />
      </div>
    </div>
    <q-dialog v-model="scurity_check" persistent>
      <q-card bordered style="width: 32rem">
          <q-card-section class="row items-center">
            <q-input v-model="exchange_code" type="password" 
              outlined filled class="radius-xs overflow-hidden full-width"
              label="操作密码"
            />
            <q-inner-loading :showing="!!errorMsg" @click="errorMsg = null">
              <span class="text-negative">{{ errorMsg }}</span>
            </q-inner-loading>
          </q-card-section>
          <q-card-actions class="row items-center">
            <q-btn flat v-close-popup :label="$t('cancel')" />
            <q-space />
            <q-btn color="primary" :label="$t('confirm')" @click="withdraw()" />
          </q-card-actions>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="loading">
      <q-spinner-orbit size="3rem" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { date } from 'quasar'
import {createTransferOrder} from "src/api/strapi.js";

const { sales, pageInfo, partner_info } = defineProps(["sales", "pageInfo", "partner_info"]);
const { interest, transaction_fee } = partner_info;
const emit = defineEmits(["filterBy"]);
const columns = [
  {
    name: "desc",
    required: true,
    label: "名称",
    align: "left",
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: false,
  },
  { name: "cover", align: "center", label: "封面", field: "cover"},
  { name: "createdAt", label: "成交时间", field: "createdAt", sortable: true},
  { name: "author", label: "作者", field: "author"},
  { name: "price", align: "center", label: "价格", field: "price", sortable: true},
];

const rows = computed(() => {
  let res = [];
  for(const order of sales){
    res.push({
      id: order.id,
      name: order.card.name,
      cover: order.card.cover?.url,
      createdAt: date.formatDate(order.createdAt, 'DD日 HH:mm'),
      author: order.card.creator,
      price: order.card.price / 100,
    })
  }
  return res
});

const orderToggler = ref('all');
const orderTags = [
  {
    label: '全部',
    name: 'all'
  },
  {
    label: '订单提现',
    name: 'can_withdraw'
  },
]
watch(orderToggler, () => {
  if(orderToggler.value){
    emit('filterBy', orderToggler.value)
  }
},{immediate:false,deep:false})

const initialPagination = {
  sortBy: 'desc',
  descending: false,
  page: pageInfo.page,
  rowsPerPage: pageInfo.per_page,
  rowsNumber: pageInfo.count
}

const selected = ref([]);
const clacWhitdrawAmount = () => {
  const priceArray = selected.value.map(i => i.price);
  const totalPrice = priceArray.reduce((a, b) => a + b, 0);
  return Math.round(totalPrice * ((100 - transaction_fee) / 100) * (interest / 100) * 100) / 100;
};
const exchange_code = ref('');
const params = computed(() => {
  return {
    data: {
      orders: selected.value.map(i => i.id),
      exchange_code: exchange_code.value
    }
  }
})
const scurity_check = ref(false);
const loading = ref(false);
const errorMsg = ref('');
const withdraw = async() => {
  if(loading.value){
    return;
  }
  loading.value = true;
  try {
    const { data } = await createTransferOrder(params.value);
    if(data){
      console.log('data', data);
      loading.value = false
      scurity_check.value = false;
    }
  } catch (error) {
    // console.log('error', error);
    loading.value = false
    errorMsg.value = error.response.data.error.message;
  }
}
</script>
