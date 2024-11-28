<template>
    <q-btn v-bind="$attrs" :color="btnColor ? btnColor : 'primary'" icon="check" :label="$t(buyLabel || 'buy')" @click="openCreateOrder()" />
    <q-dialog v-model="showCreate" persistent>
        <q-card bordered class="column no-wrap" style="min-width: 24rem; min-height: 18rem;">
            <q-card-section class="q-space column no-wrap q-pa-none" :class="`bg-${color}`">
                <q-toolbar class="transparent no-padding">
                    <q-tabs
                        v-model="wayCode"
                        align="justify"
                        class="q-space text-white"
                        :indicator-color="color"
                    >
                        <q-tab v-for="i in paymentWays" :name="i.way" :key="i.way" :class="`bg-${i.color}`">
                            <q-item>
                                <q-item-section avatar>
                                    <WxPay v-if="i.way === 'WX_NATIVE'" :width="36" :height="36" color="#FFFFFF" />
                                    <AliPay v-else :width="36" :height="36" color="#FFFFFF" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ i.title }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-tab>
                    </q-tabs>
                </q-toolbar>
                <div class="q-space flex flex-center q-pa-lg">
                    <div class="q-space fit column flex-center q-pa-lg radius-md shadow-12" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-white'">
                        <q-responsive :ratio="1" class="fit">
                            <QrcodeVue v-if="payData?.data?.payData && state === 0 && wayCode === 'WX_NATIVE'"
                            :value="payData?.data?.payData" :size="360" level="H" />
                            <q-item v-if="payData?.data?.payData && state === 0 && wayCode === 'ALI_PC'"
                            class="fit">
                                <q-item-section>
                                    <q-item-label>{{ ali_pc_payTip.title }}</q-item-label>
                                    <q-item-label caption lines="2">{{ ali_pc_payTip.desc }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <div v-if="loading" class="fit column flex-center">
                                正在生成订单，请稍等...
                            </div>
                        </q-responsive>
                        <span v-if="2 === +state">
                            支付成功
                        </span>
                    </div>
                </div>
            </q-card-section>
            <q-card-section class="q-pa-sm">
                <q-btn flat :label="$t('cancel')" v-close-popup />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { createOrder } from 'src/api/strapi.js'
import usePayment from './usePayment';
import QrcodeVue from "qrcode.vue";
import { teamStore, uiStore } from "src/hooks/global/useStore.js";
import WxPay from 'src/pages/team/components/widgets/icons/WxPay.vue'
import AliPay from 'src/pages/team/components/widgets/icons/AliPay.vue'

const { paymentWays } = usePayment();

const { subject, commodity, btnColor, buyLabel } = defineProps(['subject','commodity', 'btnColor', 'buyLabel'])
const emit = defineEmits(['buyData'])

const showCreate = ref(false);
const openCreateOrder = () => {
    showCreate.value = true;
    createOrderFn();
}
defineExpose({
    openCreateOrder
})
const wayCode = ref('WX_NATIVE');
const payData = ref();
const payOrderId = ref();
const color = computed(() => paymentWays.find(i => i.way === wayCode.value)?.color)
const distroy_order = ref(null);

const params = computed(() => {
    return {
        commodity: {
            subject: subject,
            id: commodity.id,
            name: commodity.name
        },
        wayCode: wayCode.value,
        currency: 'cny',
        distroy_order: distroy_order.value
    }
})
const ali_pc_payTip = ref({
    title: '等待支付中...',
    desc: '请在新开的支付宝页面中完成支付。'
});
const loading = ref(false)
const createOrderFn = async () => {
    if (!params.value.commodity.subject || typeof params.value.commodity.subject !== 'string') {
        console.error('Invalid subject type. Expected string.');
        return;
    }
    if (!params.value.commodity.id || typeof params.value.commodity.id !== 'number') {
        console.error('Invalid id type. Expected number.');
        return;
    }
    if (!params.value.wayCode || typeof params.value.wayCode !== 'string') {
        console.error('Invalid wayCode type. Expected string.');
        return;
    }
    if (!params.value.currency || typeof params.value.currency !== 'string') {
        console.error('Invalid currency type. Expected string.');
        return;
    }
    loading.value = true
    const {data} = await createOrder(params.value);
    if(data){
        if(wayCode.value === 'WX_NATIVE'){
            payData.value = data
        }
        if(wayCode.value === 'ALI_PC'){
            const url = data.data?.payData
            window.open(url, '_blank');
        }
        payOrderId.value = data.data.payOrderId
        state.value = 0
        distroy_order.value = payOrderId.value
        loading.value = false
    }
}

watch(wayCode, () => {
    if(wayCode.value){
        createOrderFn();
    }
})

onBeforeUnmount(() => {
    distroy_order.value = null;
})

const state = ref();
const income = computed(() => teamStore.income);
watch(income, () => {
    const { data, event } = income.value
    if(event === 'pay:completed' && data?.payOrderId === payOrderId.value){
        console.log('data', data)
        state.value = data?.state
        if(data.card_id){
            if(data.commodity){
                data.commodity.payState = {
                    cardState: {
                        isPaied: true
                    }
                }
                emit('buyData', data.commodity)
            } else {
                emit('buyData', data)
            }
        }
        if(data.project_id){
            emit('buyData', data)
        }
        showCreate.value = false
    }
})
</script>