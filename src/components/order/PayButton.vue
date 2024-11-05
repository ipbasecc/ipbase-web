<template>
    <div class="">
        <q-btn color="primary" icon="check" :label="$t('buy')" @click="openCreateOrder()" />
        <q-dialog v-model="showCreate" persistent>
            <q-card bordered class="column no-wrap" style="min-width: 24rem; min-height: 18rem;">
                <q-card-section class="q-space row flex-center">
                    <QrcodeVue v-if="payData?.data?.payData && state === 0"
                    :value="payData?.data?.payData" :size="360" level="H" />
                    <span v-if="2 === +state">
                        支持成功
                    </span>
                </q-card-section>
                <q-card-actions v-if="!state" align="right" class="border-top">
                    <q-btn flat :label="$t('cancel')" color="primary" v-close-popup />
                    <q-space />
                    <q-btn flat :label="$t('buy')" color="primary" @click="createOrderFn()" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { createOrder } from 'src/api/strapi.js'
import usePayment from './usePayment';
import { useRoute } from 'vue-router';
import QrcodeVue from "qrcode.vue";
import { teamStore } from "src/hooks/global/useStore.js";

const route = useRoute();
const { wayCodes } = usePayment();

const { subject, commodity } = defineProps(['subject','commodity'])

const showCreate = ref(false);
const openCreateOrder = () => {
    showCreate.value = true; JSON.parse
}

const wayCode = ref('WX_NATIVE');
const payData = ref();
const payOrderId = ref();
const createOrderFn = async () => {
    const params = {
        // commodity: {
        //     subject: subject,
        //     id: commodity.id
        // }
        commodity: {
            id: 2,
            subject: 'card',
        },
        wayCode: wayCode.value,
        currency: 'cny',
    }
    const {data} = await createOrder(params);
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
    }
})
</script>