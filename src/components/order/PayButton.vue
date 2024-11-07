<template>
    <div class="">
        <q-btn color="primary" icon="check" :label="$t('buy')" @click="openCreateOrder()" />
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
                        <div class="q-space flex flex-center q-pa-lg radius-md shadow-12" :class="$q.dark.mode ? 'bg-grey-9' : 'bg-white'">
                            <QrcodeVue v-if="payData?.data?.payData && state === 0"
                            :value="payData?.data?.payData" :size="360" level="H" />
                            <span v-if="2 === +state">
                                支付成功
                            </span>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { createOrder, notiy } from 'src/api/strapi.js'
import usePayment from './usePayment';
import { useRoute } from 'vue-router';
import QrcodeVue from "qrcode.vue";
import { teamStore } from "src/hooks/global/useStore.js";
import WxPay from 'src/pages/team/components/widgets/icons/WxPay.vue'
import AliPay from 'src/pages/team/components/widgets/icons/AliPay.vue'

const route = useRoute();
const { paymentWays } = usePayment();

const { subject, commodity } = defineProps(['subject','commodity'])
const emit = defineEmits(['buyData'])

const showCreate = ref(false);
const openCreateOrder = () => {
    showCreate.value = true;
    createOrderFn();
}
const wayCode = ref('WX_NATIVE');
const payData = ref();
const payOrderId = ref();
const color = computed(() => paymentWays.find(i => i.way === wayCode.value)?.color)

const params = computed(() => {
    return {
        commodity: {
            subject: subject,
            id: commodity.id
        },
        wayCode: wayCode.value,
        currency: 'cny',
    }
})
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
    const {data} = await createOrder(params.value);
    if(data){
        payData.value = data
        payOrderId.value = data.data.payOrderId
        state.value = 0
    }
}
const state = ref();
const income = computed(() => teamStore.income);
watch(income, () => {
    const { data, event } = income.value
    if(event === 'pay:completed' && data?.payOrderId === payOrderId.value){
        state.value = data?.state
        if(data.commodity){
            emit('buyData', data.commodity)
        }
        showCreate.value = false
    }
})
</script>