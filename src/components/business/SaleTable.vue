<template>
  <div class="column q-mt-sm">
    <q-table
      flat
      bordered
      title="成交订单"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :selected-rows-label="clacWhitdrawAmount"
      selection="multiple"
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

    <div class="q-mt-md">提现金额: 
      <span class="q-pl-md">￥：</span>
      <span class="font-bold-600 q-pr-md" style="font-size: 3rem;">{{ clacWhitdrawAmount() }}</span>
      <span class="font-small op-5">（支付平台费用：0.6%, 平台佣金：20% ）</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { date } from 'quasar'

const { sales, pageInfo } = defineProps(["sales", "pageInfo"]);

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

const rows = ref([]);
for(const order of sales){
  rows.value.push({
    name: order.card.name,
    cover: order.card.cover?.url,
    createdAt: date.formatDate(order.createdAt, 'DD日 HH:mm'),
    author: order.card.creator,
    price: order.card.price / 100,
  })
}

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
  const computeCommission = (amount) => {
    return amount * 0.994 * 0.8
  }
  return computeCommission(totalPrice)
};
</script>
