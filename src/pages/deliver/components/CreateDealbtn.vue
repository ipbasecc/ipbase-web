<template>
    <q-btn v-bind="$attrs" round dense size="sm" icon="mdi-plus" class="border" @click="createDeal">
        <q-tooltip class="no-padding shadow-24">
            <q-card bordered class="q-px-md q-py-sm font-medium">
                发布需求
            </q-card>
        </q-tooltip>
    </q-btn>
    <q-dialog v-model="openCertificationPage" persistent>
        <q-card bordered>
            <q-card-section class="row items-center">
                <q-icon name="info" size="lg" />
                <span class="q-ml-sm">认证用户才可以发布需求!请先完成认证!</span>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat :label="$t('cancel')" color="primary" v-close-popup />
                <q-btn flat :label="$t('to_certification')" color="primary" v-close-popup @click="toCertification" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { uiStore, teamStore } from 'src/hooks/global/useStore';

const router = useRouter();

const openCertificationPage = ref(false);
const createDeal = () => {
    const isCertified = teamStore.init.by_certification?.verified;
    if(!isCertified) {
        openCertificationPage.value = true;
        return;
    }
    uiStore.deal_active_item = 'create_deal';
    router.push('/deliver/create');
}
const toCertification = () => {
    uiStore.app = 'business';
    router.push('/business/certificate');
}
</script>
