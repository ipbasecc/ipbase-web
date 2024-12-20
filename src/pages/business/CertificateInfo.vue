<template>
    <q-scroll-area class="absolute-full q-pa-sm">
        <div class="row flex-center">
            <q-list style="width: 32rem;">
                <q-item>
                    <q-item-section>
                        <q-item-label class="row no-wrap gap-sm items-center text-h6 font-bold-600">
                            <span>账号认证信息</span>
                            <q-icon name="verified" :color="certification.verified ? 'positive' : 'grey-6'">
                                <q-tooltip :delay="750">
                                    {{ certification.verified ? $t('verified') : $t('unverified') }}
                                </q-tooltip>
                            </q-icon>
                            <q-space />
                            <q-btn v-if="hasCertification" dense padding="xs md" color="primary" :label="editMode ? $t('cancel') : $t('edit')" @click="editMode = !editMode" />
                        </q-item-label>
                        <q-item-label v-if="!hasCertification || editMode" caption class="text-orange">以下信息用于认证您的真实身份，以便您可以正常使用平台功能，请保证信息的真实有效</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <template v-if="hasCertification && !editMode">
                        <q-item-section>
                            <span><span class="font-bold-600 q-mr-md">真实姓名: </span>{{certification.real_name}}</span>
                        </q-item-section>
                    </template>
                    <q-item-section v-else>
                        <q-input v-model="params.data.real_name" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="真实姓名" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入真实姓名"
                        >
                            <template v-slot:prepend>
                                <q-icon name="mdi-account-box-outline" size="sm" />
                            </template>
                            <template v-slot:append>
                                <span class="text-h6 unselected">*</span>
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <template v-if="hasCertification && !editMode">
                        <q-item-section>
                            <span><span class="font-bold-600 q-mr-md">身份证号码: </span>{{certification.id_card_number}}</span>
                        </q-item-section>
                    </template>
                    <q-item-section v-else>
                        <q-input v-model="params.data.id_card_number" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="身份证号码" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入身份证号码"
                        >
                            <template v-slot:prepend>
                                <q-icon name="mdi-account-card-details" size="sm" />
                            </template>
                            <template v-slot:append>
                                <span class="text-h6 unselected">*</span>
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <template v-if="hasCertification && !editMode">
                        <q-item-section>
                            <span><span class="font-bold-600 q-mr-md">电话号码: </span>{{certification.phone}}</span>
                        </q-item-section>
                    </template>
                    <q-item-section v-else>
                        <q-input v-model="params.data.phone" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="电话号码" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入电话号码"
                        >
                            <template v-slot:prepend>
                                <q-icon name="mdi-cellphone-iphone" size="sm" />
                            </template>
                            <template v-slot:append>
                                <span class="text-h6 unselected">*</span>
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <template v-if="hasCertification && !editMode">
                        <q-item-section>
                            <span><span class="font-bold-600 q-mr-md">微信账号: </span>{{certification.wechat}}</span>
                        </q-item-section>
                    </template>
                    <q-item-section v-else>
                        <q-input v-model="params.data.wechat" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="微信账号" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入微信账号"
                        >
                            <template v-slot:prepend>
                                <q-icon name="mdi-wechat" size="sm" />
                            </template>
                            <template v-slot:append>
                                <span class="text-h6 unselected">*</span>
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <template v-if="hasCertification && !editMode">
                        <q-item-section>
                            <span><span class="font-bold-600 q-mr-md">QQ号码: </span>{{certification.qq}}</span>
                        </q-item-section>
                    </template>
                    <q-item-section v-else>
                        <q-input v-model="params.data.qq" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="QQ号码" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入QQ号码"
                        >
                            <template v-slot:prepend>
                                <q-icon name="mdi-qqchat" size="sm" />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <template v-if="hasCertification && !editMode">
                        <q-item-section>
                            <span><span class="font-bold-600 q-mr-md">支付宝账号: </span>{{certification.alipay}}</span>
                        </q-item-section>
                    </template>
                    <q-item-section v-else>
                        <q-input v-model="params.data.alipay" outlined filled type="text"
                            class="radius-xs overflow-hidden" label="支付宝账号" :color="$q.dark.mode ? 'grey-9' : 'grey-1'"
                            placeholder="请输入支付宝账号"
                        >
                            <template v-slot:prepend>
                                <AliPay :width="22" :height="22" color="#f0f0f0" />
                            </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <div class="column no-wrap gap-md">
                            <q-img
                                v-if="idCardFront"
                                :src="idCardFront"
                                :ratio="16/9"
                                height="160px"
                                class="bg-image-fill"
                                spinner-color="primary"
                                spinner-size="82px"
                                @click="$hevueImgPreview({
                                    url: idCardFront,
                                    clickMaskCLose: true
                                })"
                            >
                                <q-badge v-if="editMode" rounded floating>
                                    <q-btn dense size="sm" round icon="mdi-close" @click.stop="idCardFront = null" />
                                </q-badge>
                            </q-img>
                            <DrapUpload v-else :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill"
                                :allowedFormats="['image/jpg','image/jpeg','image/png']"
                                @uploaded="setIDCardFront" style="min-height: 8rem;"
                                :caption="$t('drop_or_pick_id_card')" :maxFileSize="10 * 1024 * 1024"
                            />
                            <q-img
                                v-if="idCardBack"
                                :src="idCardBack"
                                :ratio="16/9"
                                height="160px"
                                class="bg-image-fill"
                                spinner-color="primary"
                                spinner-size="82px"
                                @click="$hevueImgPreview({
                                    url: idCardBack,
                                    clickMaskCLose: true
                                })"
                            >
                                <q-badge v-if="editMode" rounded floating>
                                    <q-btn dense size="sm" round icon="mdi-close" @click.stop="idCardBack = null" />
                                </q-badge>
                            </q-img>
                            <DrapUpload v-else :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill"
                                :allowedFormats="['image/jpg','image/jpeg','image/png']"
                                @uploaded="setIDCardBack" style="min-height: 8rem;"
                                :caption="$t('drop_or_pick_id_card_back')" :maxFileSize="10 * 1024 * 1024"
                            />
                        </div>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <q-btn color="primary" :label="$t('confirm')" class="full-width" @click="processCertification()" />
                    </q-item-section>
                </q-item>
                <q-inner-loading :showing="loading">
                    <q-spinner-orbit size="3rem" color="primary" />
                </q-inner-loading>
            </q-list>
        </div>
    </q-scroll-area>
</template>
<script setup>
import { findSelfCertification, createCertificate, updateCertificate, deleteSelfCertification } from 'src/api/strapi.js'
import { isValidIdCard, isValidMobile } from 'src/hooks/utilits.js'
import { teamStore } from 'src/hooks/global/useStore';
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'
import AliPay from '../team/components/widgets/icons/AliPay.vue'

const $q = useQuasar()
const loading = ref(false)
const certification = ref({})
const params = ref({
    data: {
        real_name: '',
        id_card_number: '',
        phone: '',
        wechat: '',
        qq: '',
        alipay: '',
        id_card_images: [],
    },
});

const editMode = ref(false)
const hasCertification = ref(false)
const idCardFront = ref()
const idCardBack = ref()
const findSelfCertificationFn = async () => {
    const {data} = await findSelfCertification(teamStore.init?.id)
    // console.log(data)
    if(data && !data.code) {
        certification.value = data
        params.value.data = {
            ...data,
            id_card_images: data.id_card_images?.map(item => item.id)
        }
        hasCertification.value = true
        idCardFront.value = data.id_card_images[0]?.url
        idCardBack.value = data.id_card_images[1]?.url
    }
    if(data.code === 404) {
        hasCertification.value = false
        editMode.value = true
    }
}
onMounted(() => {
    findSelfCertificationFn()
})

const setIDCardFront = (val) => {
  if(val?.id){
    params.value.data.id_card_images[0] = val.id
    idCardFront.value = val.attributes?.url
  }
}
const setIDCardBack = (val) => {
    if(val?.id){
        params.value.data.id_card_images[1] = val.id
        idCardBack.value = val.attributes?.url
    }
}

const processCertification = async () => {
    if(!params.value.data.real_name) {
        $q.notify({
            type: 'negative',
            message: '请输入真实姓名',
            position: 'top',
        })
        return
    }
    if(!isValidIdCard(params.value.data.id_card_number)) {
        $q.notify({
            type: 'negative',
            message: '请输入正确的身份证号码',
            position: 'top',
        })
        return
    }
    if(!isValidMobile(params.value.data.phone)) {
        $q.notify({
            type: 'negative',
            message: '请输入正确的电话号码',
            position: 'top',
        })
        return
    }
    if(!params.value.data.wechat) {
        $q.notify({
            type: 'negative',
            message: '请输入微信账号',
            position: 'top',
        })
        return
    }
    if(params.value.data.id_card_images?.length !== 2) {
        $q.notify({
            type: 'negative',
            message: '请上传身份证正面和反面照片',
            position: 'top',
        })
        return
    }
    if(!hasCertification.value) {
        await createCertificate(params.value)
    } else {
        const {data} = await updateCertificate(teamStore.init?.id, params.value)
        if(data && !data.code) {
            $q.notify({
                type: 'positive',
                message: '认证信息已提交，请耐心等待审核',
                position: 'top',
            })
            certification.value = data
            hasCertification.value = true
            editMode.value = false
        }
    }
}
</script>
