<template>
    <div class="absolute-full q-pa-sm">
        <div class="row flex-center">
            <q-list style="width: 32rem;">
                <q-item>
                    <q-item-section>
                        <q-item-label class="text-h6 font-bold-600">经营账号信息</q-item-label>
                        <q-item-label caption class="text-orange">以下信息用于您在平台上的经营活动，请保证信息的真实有效</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-input v-model="params.data.reel_name" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="提现验证姓名" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入提现验证时的姓名，以便在提现时进行验证"
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
                            placeholder="请输入提现支付宝账号，以便在提现时进行验证"
                        >
                            <template v-slot:prepend>
                                <AliPay :width="22" :height="22" color="#f0f0f0" />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <div class="row no-wrap items-center q-mt-md">
                    <q-separator spaced inset class="q-space" />
                    <span class="text-grey-7">操作密码</span>
                    <q-separator spaced inset class="q-space" />
                </div>
                <q-item>
                    <q-item-section class="1-py-none">
                        <q-item-label caption class="text-orange">操作密码用于交易中验证，请妥善保管</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <!-- 修改操作密码 -->
                        <!-- 用户选择使用旧操作密码验证 -->
                        <q-input v-if="!teamStore?.init?.need_fill_business_account && !forget_exchange_code"
                            v-model="params.data.old_exchange_code"
                            outlined filled type="password" class="radius-xs overflow-hidden" label="操作密码"
                            placeholder="请提供旧操作密码" aria-autocomplete="none"
                            >
                            <template v-slot:prepend>
                                <q-icon name="mdi-lock-outline" size="sm" />
                            </template>
                        </q-input>
                        <!-- 用户忘记旧操作密码 -->
                        <q-input v-else
                            v-model="params.data.password"
                            outlined filled type="password" class="radius-xs overflow-hidden" label="登陆密码"
                            placeholder="请提供登陆密码" aria-autocomplete="none"
                            :class="teamStore?.init?.need_fill_business_account ? 'q-mb-md' : ''"
                        >
                            <template v-slot:prepend>
                                <q-icon name="mdi-lock-outline" size="sm" />
                            </template>
                        </q-input>
                        <!-- 切换是否忘记旧操作密码 -->
                        <div v-if="!teamStore?.init?.need_fill_business_account" class="row justify-end q-mt-sm q-mb-md">
                            <q-btn flat dense size="sm" @click="toggleForgetExchangeCode()"
                            :label="forget_exchange_code ? '使用旧操作密码验证' : '忘记操作密码?'" />
                        </div>
                        <!-- 设置操作密码 -->
                        <q-input v-model="params.data.exchange_code"
                            outlined filled type="password" class="radius-xs overflow-hidden"
                            aria-autocomplete="none"
                            :label="teamStore?.init?.need_fill_business_account ? '设置操作密码' : '请提供新操作密码'"
                            :placeholder="teamStore?.init?.need_fill_business_account ? '设置一个密码，交易中需要验证操作密码以保护账户安全' : '请提供新操作密码'"
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
import { useQuasar } from 'quasar';

const $q = useQuasar();

const params = ref({
    data: {
        reel_name: '',
        alipay_account: '',
        exchange_code: '',
        old_exchange_code: null,
        password: null
    },
});

const loading = ref(false);
const updateAccountInfo = async() => {
    console.log('updateAccountInfo');
    
    if(loading.value) return
    loading.value = true;
    const {data} = await updateUser(teamStore?.init?.id, params.value);  
    if(data){
        console.log('data', data);
        
        loading.value = false
        teamStore.init.need_fill_business_account = false;
        $q.notify({
            message: '更新成功',
            color: 'positive',
            position: 'top',
            timeout: 3000,
        })
    }
}

const forget_exchange_code = ref(false);
const toggleForgetExchangeCode = () => {
    if(teamStore?.init?.need_fill_business_account) return;
    forget_exchange_code.value = !forget_exchange_code.value;
    if(forget_exchange_code.value){
        params.value.data.old_exchange_code = null;
    } else {
        params.value.data.password = null;
    }
}
</script>
