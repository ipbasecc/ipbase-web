<template>
    <div class="absolute-full q-pa-sm">
        <div class="row flex-center">
            <q-list style="min-width: 32rem; max-width: 100%">
                <form autocomplete="off">
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-h6 font-bold-600">经营账号信息</q-item-label>
                            <q-item-label caption class="text-orange">以下信息用于您在平台上的经营活动，请保证信息的真实有效</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.reel_name" outlined filled type="text"
                                class="radius-xs overflow-hidden" label="真实姓名" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                                placeholder="请输入真实姓名，以便在提现时进行验证"
                            >
                                <template v-slot:prepend>
                                    <q-icon name="mdi-account-box-outline" size="sm" />
                                </template>
                            </q-input>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.alipay_account"
                                outlined filled type="text" class="radius-xs overflow-hidden" label="支付宝账号"
                                placeholder="请输入您本人的支付宝账号，以便在提现时进行验证"
                            >
                                <template v-slot:prepend>
                                    <AliPay :width="22" :height="22" color="#f0f0f0" />
                                </template>
                            </q-input>
                        </q-item-section>
                    </q-item>
                </form>
                <q-item>
                    <q-item-section>
                        <q-input v-model="params.data.exchange_code"
                            outlined filled type="password" class="radius-xs overflow-hidden" label="操作密码"
                            placeholder="设置一个密码，交易中需要验证操作密码以保护账户安全"
                            >
                            <template v-slot:prepend>
                                <q-icon name="mdi-lock-outline" size="sm" />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-btn color="primary" :label="$t('confirm')" class="full-width" @click="updateAccountInfo()" />
                    </q-item-section>
                </q-item>
                <q-inner-loading :showing="loading">
                    <q-spinner-orbit size="3rem" color="primary" />
                </q-inner-loading>
            </q-list>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { updateUser } from 'src/api/strapi.js'
import { teamStore } from 'src/hooks/global/useStore';
import AliPay from '../team/components/widgets/icons/AliPay.vue'


const params = ref({
    data: {
        reel_name: '',
        alipay_account: '',
        exchange_code: ''
    },
});

const loading = ref(false);
const updateAccountInfo = async() => {
    console.log('updateAccountInfo');
    
    // if(loading.value) return
    // loading.value = true;
    const {data} = await updateUser(teamStore?.init?.id, params.value);  
    if(data){
        // loading.value = false
    }
}
</script>
<style lang="sass">
@keyframes autofill
  100%
    background-color: transparent

.q-input,
.q-select
  .q-field__native
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active
      -webkit-background-clip: text
      animation: autofill 0s forwards

  &.q-field--dark .q-field__native
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active
      -webkit-text-fill-color: transparent

</style>