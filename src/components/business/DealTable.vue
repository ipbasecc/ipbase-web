<template>
    <div class="column q-mt-sm">
        <q-toolbar class="transparent q-mb-md q-mt-lg">
            <q-tabs v-model="orderToggler">
                <q-tab v-for="i in orderTags" :key="i.name" :name="i.name" :label="i.label" />
            </q-tabs>
        </q-toolbar>
        <q-table flat bordered :rows="rows" :columns="columns" row-key="name"
            selection="single" v-model:selected="selected"
            :pagination="initialPagination">
            <template v-slot:body-cell-cover="props">
                <q-td :props="props">
                    <img :src="props.row.cover" alt="Cover Image" style="width: 100px; height: auto;" />
                </q-td>
            </template>
            <template v-slot:body-cell-party_a="props">
                <q-td :props="props">
                    <q-avatar size="2rem" color="primary" class="border">
                        <q-img v-if="props.row.party_a?.profile?.avatar?.url"
                            :src="props.row.party_a?.profile?.avatar?.url" :ratio="1" spinner-color="primary"
                            spinner-size="1rem" />
                        <span v-else>{{ props.row.party_a.username[0] }}</span>
                    </q-avatar>
                </q-td>
            </template>
        </q-table>

        <div v-if="orderToggler === 'can_withdraw'" class="column q-mt-md q-pa-md">
            <div class="row items-end">
                <span class="font-bold-600" style="font-size: 3rem; line-height: 1;">提现金额: {{ withdraw_amount }}</span>
                <span class="q-pr-md font-large">￥</span>
                <div class="column">
                    <span class="font-small op-5">成交时间在1天以上，才能提现！</span>
                    <span class="font-small op-5">
                        支付平台费用：{{ payment_service_fee }}%,
                        提现费用：{{ withdraw_service_fee }}%,
                        平台佣金：{{ deal_service_fee }}% ,
                        扣税：{{ tax_amount }}
                    </span>
                </div>
            </div>
            <div class="q-mt-md">
                <q-btn color="primary" label="申请提现" :disable="withdraw_amount <= 0" @click="scurity_check = true" />
            </div>
        </div>
        <q-dialog v-model="scurity_check" persistent>
            <q-card bordered style="width: 32rem">
                <template v-if="teamStore.init?.need_fill_business_account">
                    <q-card-section class="text-center text-h4 q-py-xl">
                        {{ $t('need_fill_business_account') }}
                    </q-card-section>
                    <q-card-actions align="right">
                        <q-btn color="primary" padding="xs md" :label="$t('fill_business_account')"
                            @click="fillBusinessAccount()" />
                    </q-card-actions>
                </template>
                <template v-else>
                    <q-card-section class="row items-center">
                        <q-input v-model="exchange_code" type="password" outlined filled
                            class="radius-xs overflow-hidden full-width" label="操作密码" />
                        <q-inner-loading :showing="!!errorMsg" @click="errorMsg = null">
                            <span class="text-negative">{{ errorMsg }}</span>
                        </q-inner-loading>
                    </q-card-section>
                    <q-card-actions class="row items-center">
                        <q-btn flat v-close-popup :label="$t('cancel')" />
                        <q-space />
                        <q-btn color="primary" :label="$t('confirm')" @click="withdraw()" />
                    </q-card-actions>
                </template>
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
    import { createTransferOrder, tax } from "src/api/strapi.js";
    import { teamStore, uiStore } from "src/hooks/global/useStore";
    import { useRouter } from 'vue-router';
import { $ui } from "src/boot/service";

    const router = useRouter();
    const { deals, pageInfo, partner_info, platform } = defineProps(["deals", "pageInfo", "partner_info", "platform"]);
    const { deal_service_fee } = partner_info;
    const { payment_service_fee, withdraw_service_fee } = platform;
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
        { name: "cover", align: "center", label: "封面", field: "cover" },
        { name: "completedAt", label: "成交时间", field: "createdAt", sortable: true },
        { name: "party_a", label: "作者", field: "author" },
        { name: "amount", align: "center", label: "金额", field: "amount", sortable: true },
    ];

    const rows = computed(() => {
        let res = [];
        for (const deal of deals) {
            res.push({
                id: deal.id,
                name: deal.name,
                cover: deal.cover?.url || $ui().no_image_url,
                completedAt: date.formatDate(deal.completedAt, 'DD日 HH:mm'),
                party_a: deal.party_a,
                amount: deal.amount / 100,
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
        if (orderToggler.value) {
            emit('filterBy', orderToggler.value)
        }
    }, { immediate: false, deep: false })

    const initialPagination = {
        sortBy: 'desc',
        descending: false,
        page: pageInfo.page,
        rowsPerPage: pageInfo.per_page,
        rowsNumber: pageInfo.count
    }

    const selected = ref([]);
    const withdraw_amount = ref(0);
    const tax_amount = ref(0);
    const clacWhitdrawAmount = async () => {
        const priceArray = selected.value.map(i => i.amount);
        let totalPrice = priceArray.reduce((a, b) => a + b, 0);
        totalPrice = totalPrice * 100
        const deal_service_fee_amount = totalPrice * deal_service_fee / 100;
        const withdraw_service_fee_amount = totalPrice * withdraw_service_fee / 100;
        const payment_service_fee_amount = totalPrice * payment_service_fee / 100;
        console.log('totalPrice', totalPrice, deal_service_fee_amount, withdraw_service_fee_amount, payment_service_fee_amount);

        const total = Math.round(totalPrice - deal_service_fee_amount - withdraw_service_fee_amount - payment_service_fee_amount) / 100;
        console.log('total', total);
        const res = await tax({
            amount: total
        });
        if (res > 0) {
            tax_amount.value = res;
            withdraw_amount.value = total - res;
        } else {
            tax_amount.value = 0;
            withdraw_amount.value = total;
        }
    };
    watch(selected, () => {
        if (selected.value.length > 0) {
            clacWhitdrawAmount();
        } else {
            withdraw_amount.value = 0;
        }
    }, { immediate: false, deep: false })

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
    const withdraw = async () => {
        if (loading.value) {
            return;
        }
        loading.value = true;
        try {
            const { data } = await createTransferOrder(params.value);
            if (data) {
                // console.log('data', data);
                loading.value = false
                scurity_check.value = false;
            }
        } catch (error) {
            // console.log('error', error);
            loading.value = false
            errorMsg.value = error.response.data.error.message;
        }
    }

    const fillBusinessAccount = () => {
        router.push('/business/info')
    }
</script>