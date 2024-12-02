<template>
    <q-card-section v-if="teamStore.card" class="column no-wrap q-space" style="width: 61%;min-width: 74rem;">
        <q-item>
            <slot name="backbtn" />
            <q-item-section side>
                <q-icon :name="resource_type.icon" />
            </q-item-section>
            <q-item-section>
                {{ card.name }}
            </q-item-section>
        </q-item>
        <div class="row no-wrap gap-xl q-space">
            <q-scroll-area class="q-space">
                <div class="q-space column items-center">
                    <q-list dense class="column no-wrap gap-md full-width">
                        <q-item>
                            <q-item-section>
                                <MediaViewer v-if="cover" :url="cover" :ratio="16/9" />
                            </q-item-section>
                        </q-item>
                        <q-item>
                            <q-item-section>
                                <q-item-label class="q-pt-sm">
                                    <div class="column no-wrap">
                                        <div v-if="overviews?.length > 1" class="row no-wrap items-center q-mb-sm">
                                            <q-tabs v-model="overview_name" dense>
                                                <q-tab v-for="o in overviews" :key="o.id"
                                                    :name="o.name" :label="version_name(o.name)"
                                                    @click="overview = o"
                                                />
                                            </q-tabs>
                                        </div>
                                        <q-item v-if="!card.is_buyer && !isCreator">
                                            <q-item-section>
                                                <q-item-label>
                                                    <q-chip outline square color="deep-orange" icon="info" :label="$t('is_not_buyer_tip')" />
                                                </q-item-label>
                                            </q-item-section>
                                        </q-item>
                                        <q-item v-if="overview?.media?.url" class="border radius-sm q-mt-sm" style="min-width: 16rem;">
                                            <q-item-section>
                                                <q-item-label>{{ $t(overview.name) }}</q-item-label>
                                                <q-item-label v-if="overview.description" caption lines="2">{{ overview.description }}</q-item-label>
                                            </q-item-section>
                                            <q-item-section side top class="flex flex-center" style="height: 30.67px;">
                                                <q-btn flat dense size="sm" round icon="mdi-dots-horizontal">
                                                    <q-menu class="radius-sm">
                                                        <q-list bordered dense class="radius-sm q-pa-xs">
                                                            <q-item clickable v-close-popup class="radius-xs" @click="downloadFile(overview.media.url, overview.name)">
                                                                <q-item-section side>
                                                                    <q-icon name="mdi-download" />
                                                                </q-item-section>
                                                                <q-item-section>{{ $t('download') }}</q-item-section>
                                                            </q-item>
                                                        </q-list>
                                                    </q-menu>
                                                </q-btn>
                                            </q-item-section>
                                        </q-item>
                                    </div>
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item v-if="!jsonContentEmpty(card.jsonContent)">
                            <q-item-section>
                                <q-item-label>{{ $t('sale_caption') }}</q-item-label>
                                <q-item-label class="q-pt-sm">
                                    <TipTap
                                        :jsonContent="card.jsonContent"
                                        :editable="false"
                                        :need="'json'"
                                        :square="true"
                                        :show_toolbar="false"
                                    />
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </q-scroll-area>
            <q-scroll-area style="flex: 0 0 24rem;">
                <q-list dense class="column no-wrap gap-md q-py-xs" >
                    <q-item class="border radius-sm">
                        <q-item-section v-if="card.price_by_auth?.length > 0">
                            <q-expansion-item v-for="i in card.price_by_auth" :key="i.auth_type"
                                :default-opened="auth_type_of_buy.includes(i.auth_type) || (auth_type_of_buy?.length === 0 && i.auth_type === 'commercial')"
                                expand-separator
                            >
                                <template v-slot:header>
                                    <div class="row no-wrap items-center q-space">
                                        <span class="font-large font-bold-600 q-mr-md">{{ $t(i.auth_type) }}</span>
                                        <q-chip outline square color="info" :label="`￥：${i.price / 100}`" />
                                    </div>
                                </template>
                                <div class="q-px-lg q-pb-lg column no-wrap gap-sm">
                                    {{ $t(`${i.auth_type}_caption`) }}
                                    <q-chip v-if="isCreator" outline square color="deep-orange" icon="info" :label="$t('is_creator_tip')" />
                                    <q-chip v-else-if="auth_type_of_buy.includes(i.auth_type)" outline square color="deep-orange" icon="info" :label="$t('already_buy_auth_tip')" />
                                    <PayButton v-else class="full-width" subject="card"
                                        :commodity="teamStore.card" :auth_type="i.auth_type"
                                        @buyData="buyData"
                                    />
                                </div>
                            </q-expansion-item>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="!jsonContentEmpty(card.auth_extened)">
                        <q-item-section>
                            <q-item-label>{{ $t('auth_extened_label') }}</q-item-label>
                            <q-item-label class="q-pt-sm">
                                <TipTap :jsonContent="card.auth_extened"
                                    :editable="false" :need="'json'"
                                    :square="true" :show_toolbar="false"
                                />
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </div>
    </q-card-section>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { teamStore } from 'src/hooks/global/useStore';
import { queryOneDiscover } from "src/api/strapi/project.js";
import { OSS } from "boot/oss";

import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
import PayButton from 'src/components/order/PayButton.vue'
import { useI18n } from 'vue-i18n';
import MediaViewer from 'src/components/VIewComponents/MediaViewer.vue'

const { t } = useI18n();
const {card_id} = defineProps(['card_id']);
const emit = defineEmits(['buyData']);

const jsonContentEmpty = (jsonContent) => {
    if(!jsonContent) return true;
    const emptyContent = { "type": "doc", "content": [ { "type": "paragraph" } ] };
    const _noContent = JSON.stringify(jsonContent) === JSON.stringify(emptyContent);
    return _noContent
}

const loading = ref(false);
const overview = ref();
const card = computed(() => teamStore.card);
const isCreator = computed(() => teamStore.card?.creator?.id === teamStore.init?.id);
const overview_name = computed(() => overview.value?.name);
const overviews = computed(() => teamStore.card?.overviews || []);
const cover = computed(() => teamStore.card?.cover?.url);
const resource_type = computed(() => teamStore.resourceType[0]);
const auth_type_of_buy = computed(() => teamStore.card?.authed_type || []);

const getOneDiscover = async (card_id) => {
    if(loading.value) return
    loading.value = true
    const {data} = await queryOneDiscover('card', 'resource', card_id);
    if (data) {
        console.log('card', data)
        loading.value = false
        teamStore.card = data;
        overview.value = teamStore.card.overviews?.find(i => i.id === teamStore.card.default_version)
    }
};

const buyData = (data) => {
  teamStore.card = data
  emit('buyData', data)
};

const version_name = (_name) => {
    return _name === 'default_version_name' ? t(_name) : _name;
};

const downloadFile = async (url, name) => {
    const res = await OSS.catchFile(url);    
    const link = document.createElement('a');
    link.href = res;
    link.download = name;
    link.click();
    // FileSaver.saveAs(res, name);
};
onMounted(async() => {
    await getOneDiscover(card_id);
})
onUnmounted(() => {
    teamStore.card = null
})
</script>