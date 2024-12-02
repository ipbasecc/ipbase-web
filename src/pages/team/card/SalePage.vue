<template>
    <q-card v-if="teamStore.card" bordered class="column no-wrap">
        <q-card-section class="row no-wrap q-pa-sm border-bottom">
            <q-btn flat dense padding="xs md" :label="$t('back')" v-close-popup />
            <q-space />
            <q-btn-dropdown v-if="teamStore.card?.isCreator" split no-caps :label="$t('save')" class="border" content-class="radius-sm" @click="update">
                <q-list dense bordered class="radius-sm q-pa-xs overflow-hidden">
                    <q-item v-if="!teamStore.card?.published" clickable class="radius-xs" @click="publishCard()">
                        <q-item-section side>
                            <q-icon name="mdi-eye" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="q-pr-md">{{ $t('publish') }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="!teamStore.card?.pulled" clickable class="radius-xs" @click="pulledCard()">
                        <q-item-section side>
                            <q-icon name="mdi-cart-off" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="q-pr-md">{{ $t('pulled') }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item v-else clickable class="radius-xs" @click="unpulledCard()">
                        <q-item-section side>
                            <q-icon name="mdi-eye" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="q-pr-md">{{ $t('unpulled') }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </q-card-section>
        <q-card-section class="row no-wrap gap-xl q-space">
            <template v-if="teamStore.card.hasDetialAuth">
                <q-scroll-area class="q-space">
                    <div class="q-space column items-center">
                        <q-list dense class="column no-wrap gap-md" style="width: 44rem;">
                            <q-item
                                :class="{ 'bg-negative radius-sm border': requireds.find(i => i.key === 'name').value }">
                                <q-item-section>
                                    <q-input v-model="update_params.data.name" type="text" :label="`${$t('name')}:`" />
                                </q-item-section>
                            </q-item>
                            <q-item-section>
                                <q-checkbox v-model="update_params.data.allow_discover" :label="$t('show_in_discover')" />
                            </q-item-section>
                            <q-item
                                :class="{ 'bg-negative radius-sm border': requireds.find(i => i.key === 'name').value }">
                                <q-item-section>
                                    <q-select filled v-model="resource_type" :options="teamStore.resourceType"
                                        :label="$t('resource_type')" :disable="!!teamStore.card.resource_type"
                                        color="deep-orange" popup-content-class="border q-pa-xs radius-sm"
                                        options-selected-class="text-deep-orange"
                                        popup-content-style="transform: translateY(4px);"
                                        class="radius-sm overflow-hidden"
                                        :display-value="resource_type ? $t(resource_type.label) : '*none*'"
                                        @update:model-value="update_params.data.resource_type = $event.value">
                                        <template v-slot:prepend>
                                            <q-icon :name="resource_type.icon" size="sm" />
                                        </template>
                                        <template v-slot:option="scope">
                                            <q-item v-bind="scope.itemProps" class="radius-xs">
                                                <q-item-section avatar>
                                                    <q-icon :name="scope.opt.icon" />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label>{{ $t(scope.opt.label) }}</q-item-label>
                                                    <q-item-label caption>{{ $t(scope.opt.description) }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </template>
                                    </q-select>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <q-item-label>{{ $t('preview_file') }}</q-item-label>
                                    <q-item-label class="q-pt-sm">
                                        <div class="relative-position" style="height: 360px">
                                            <q-responsive :ratio="16 / 9" class="full-width">
                                                <DrapUpload :isOSS="true"
                                                    :allowedFormats="['image/jpg', 'image/jpeg', 'image/png', 'video/mp4', 'video/m4v']"
                                                    :maxFileSize="15 * 1024 * 1024"
                                                    :caption="$t('drop_or_pick_preview')"
                                                    class="border-dashed border-op-sm radius-sm q-pa-xl"
                                                    @uploaded="setCover" />
                                                <q-img v-if="cover" :src="cover" :ratio="16 / 9" spinner-color="primary"
                                                    spinner-size="82px"
                                                    class="absolute-full op-3 radius-sm border z-unfab" />
                                            </q-responsive>
                                        </div>
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-item
                                :class="{ 'bg-negative radius-sm border': requireds.find(i => i.key === 'overviews').value }">
                                <q-item-section>
                                    <q-item-label class="row no-wrap">
                                        <span class="q-space">{{ $t('sale_content') }}</span>
                                        <q-toggle v-if="overviews.length > 0" v-model="mutiple_overview" dense />
                                    </q-item-label>
                                    <q-item-label class="q-pt-sm">
                                        <div class="column no-wrap">
                                            <div v-if="mutiple_overview" class="row no-wrap items-center q-mb-sm">
                                                <q-tabs v-model="overview_name" dense>
                                                    <q-tab v-for="o in overviews" :key="o.id" :name="o.name"
                                                        :label="version_name(o.name)" @click="overview = o" />
                                                </q-tabs>
                                                <div class="q-ml-sm">
                                                    <q-btn flat dense size="sm" round icon="mdi-plus">
                                                        <q-popup-proxy ref="new_overview_proxy"
                                                            class="radius-xs shadow-24">
                                                            <q-list bordered class="radius-xs q-pa-xs">
                                                                <q-input v-model="new_overview_name" dense square filled
                                                                    type="text" @keydown.enter="pushNewOverview">
                                                                    <template v-slot:append>
                                                                        <q-btn flat dense size="sm" round
                                                                            icon="mdi-check" @click="pushNewOverview"
                                                                            v-close-popup />
                                                                    </template>
                                                                </q-input>
                                                            </q-list>
                                                        </q-popup-proxy>
                                                    </q-btn>
                                                </div>
                                            </div>
                                            <DrapUpload v-if="!overview || !overview?.media?.url" :isOSS="true"
                                                :allowedFormats="contentAllowedFormats"
                                                :maxFileSize="1024 * 1024 * 1024" :caption="$t('drop_or_pick_resource')"
                                                class="border-dashed border-op-sm radius-sm q-pa-xl"
                                                @uploaded="setOverview" />
                                            <q-item v-else class="border radius-sm q-mt-sm" style="min-width: 16rem;">
                                                <q-item-section>
                                                    <q-item-label>{{ $t(overview.name) }}</q-item-label>
                                                    <q-item-label v-if="overview.description" caption lines="2">{{
                                                        overview.description
                                                        }}</q-item-label>
                                                </q-item-section>
                                                <q-item-section side top class="flex flex-center"
                                                    style="height: 30.67px;">
                                                    <q-btn flat dense size="sm" round icon="mdi-dots-horizontal">
                                                        <q-menu class="radius-sm">
                                                            <q-list bordered class="radius-sm q-pa-xs">
                                                                <q-item clickable v-close-popup class="radius-xs"
                                                                    @click="downloadFile(overview.media.url, overview.name)">
                                                                    <q-item-section side>
                                                                        <q-icon name="mdi-download" />
                                                                    </q-item-section>
                                                                    <q-item-section>{{ $t('download')
                                                                        }}</q-item-section>
                                                                </q-item>
                                                                <q-item clickable v-close-popup class="radius-xs"
                                                                    @click="removeVersion(overview.id)">
                                                                    <q-item-section side>
                                                                        <q-icon name="mdi-delete" />
                                                                    </q-item-section>
                                                                    <q-item-section>{{ $t('delete') }}</q-item-section>
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
                            {{ update_params.data.jsonContent }}
                            <q-item>
                                <q-item-section>
                                    <q-item-label>{{ $t('sale_caption') }}</q-item-label>
                                    <q-item-label class="q-pt-sm">
                                        <TipTap :jsonContent="card.jsonContent" :editable="isCreator" :need="'json'"
                                            :square="true" :show_toolbar="false" :autofocus="false"
                                            :contentChanged="true" class="border radius-sm"
                                            @tiptapUpdate="tiptapBlur" />
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </div>
                </q-scroll-area>
                <q-scroll-area style="flex: 0 0 32rem;">
                    <q-list dense class="priceArea column no-wrap gap-md">
                        <q-item class="border radius-sm no-padding overflow-hidden scorll-y">
                            <q-item-section v-if="mutliple_auth && update_params.data.price_by_auth?.length > 0">
                                <q-expansion-item v-for="i in update_params.data.price_by_auth" :key="i.auth_type"
                                    expand-icon-toggle :default-opened="i.auth_type === 'commercial'"
                                    :class="{ 'bg-primary-gdt text-white': expansionOpen === i.auth_type }"
                                    @mouseenter="expansionOpen = i.auth_type">
                                    <template v-slot:header>
                                        <div class="row no-wrap items-center q-space">
                                            <q-checkbox v-model="i.selected" color="positive"
                                                :label="$t(i.auth_type)" />
                                        </div>
                                    </template>
                                    <div class="q-px-lg column no-wrap gap-sm">
                                        <div class="text-yellow">
                                            {{ $t(`${i.auth_type}_caption`) }}
                                        </div>
                                        <q-input v-model="i.price" square filled class="q-mb-lg" type="number"
                                            :label="`${$t('price')}:`"
                                            :rules="[(val) => val < 0 ? $t('price_cannot_be_negative') : true]"
                                            @update:model-value="syncSelected(i)" />
                                    </div>
                                </q-expansion-item>
                            </q-item-section>
                        </q-item>
                        <q-item>
                            <q-item-section>
                                <q-item-label>{{ $t('auth_extened_label') }}</q-item-label>
                                <q-item-label class="q-pt-sm">
                                    <TipTap :jsonContent="card.auth_extened" :editable="isCreator" :need="'json'"
                                        :square="true" :show_toolbar="false" :autofocus="false" :contentChanged="true"
                                        class="border radius-sm" @tiptapUpdate="updateAuthExtened" />
                                </q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-checkbox
                            :class="{ 'bg-negative radius-sm border-negative text-white': requireds.find(i => i.key === 'agree_sale_argment').value }"
                            v-model="agree_sale_argment" color="positive" :label="$t('agree_service_argment')" />
                    </q-list>
                </q-scroll-area>
            </template>
        </q-card-section>
    </q-card>
</template>
<script setup>
    import { ref, computed, onMounted, onUnmounted, watchEffect, watch, useTemplateRef } from 'vue';
    import { teamStore } from 'src/hooks/global/useStore';
    import {
        findCard,
        addVersion,
        deleteVersion,
        updateCard,
    } from "src/api/strapi/project.js";
    import { OSS } from "boot/oss";

    import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'
    import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
    import { useQuasar } from 'quasar';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const $q = useQuasar();
    const { card_id } = defineProps(['card_id']);
    const emit = defineEmits(["publishCard", "pulledCard", "isPulledCard"]);

    const expansionOpen = ref('commercial');
    const contentAllowedFormats = computed(() => {
        let res = [];
        if (update_params.value?.data?.resource_type === 'video') {
            res = ['video/mp4', 'video/m4v'];
        }
        if (update_params.value?.data?.resource_type === 'audio') {
            res = ['audio/mp3', 'audio/wav'];
        }
        if (update_params.value?.data?.resource_type === 'file') {
            res = ['application/zip', 'application/rar'];
        }
        return res;
    })

    const can_save = ref(false);
    const loading = ref(false);
    const agree_sale_argment = ref(false);
    const card = computed(() => teamStore.card);
    const isCreator = computed(() => teamStore.card?.creator?.id === teamStore.init?.id);
    const mutiple_overview = ref(false);
    const overview = ref();
    const overview_name = computed(() => overview.value?.name);
    const overviews = ref([]);
    const cover = ref();
    const resource_type = ref(teamStore.resourceType[0]);

    const getCard = async (card_id) => {
        if (loading.value) return
        loading.value = true
        const { data } = await findCard(card_id);
        if (data) {
            loading.value = false
            teamStore.card = data;
            syncUpdateParams();
        }
    };
    const fill_price_by_auth = () => {
        // 按照授权类型填充授权价格
        if (card.value?.auth_types?.length > 0) {
            // 先构造出原始数据解构
            update_params.value.data.price_by_auth = card.value.auth_types.map(i => ({ price: 0, auth_type: i, selected: false }))
            // 如果是在修改授权价格，则先读取授权价格，并填充读取到已存在的授权价格，并选中对应授权
            if (card.value?.price_by_auth) {
                update_params.value.data.price_by_auth = update_params.value.data.price_by_auth.map(i => {
                    const _auth = card.value.price_by_auth.find(j => j.auth_type === i.auth_type)
                    return {
                        ...i,
                        price: _auth?.price / 100,
                        selected: !!_auth
                    }
                })
            }
        }
    }
    const syncUpdateParams = () => {
        update_params.value.data.name = teamStore.card.name;
        overview.value = teamStore.card.overviews?.find(i => i.id === teamStore.card.default_version)
        overviews.value = teamStore.card.overviews || [];
        update_params.value.data.overviews = overviews.value.map(i => i.id)
        cover.value = teamStore.card.cover?.url
        fill_price_by_auth();
        update_params.value.data.resource_type = resource_type.value.value
        mutiple_overview.value = overviews.value.length > 1
    }

    const mutliple_auth = ref(true)
    const update_params = ref({
        data: {
            name: '',
            overviews: [],
            price_by_auth: [],
            allow_discover: true
        }
    });
    const syncSelected = (i) => {
        if (i.price > 0) {
            i.selected = true;
        } else if (i.price < 0) {
            i.price = 0;
        }
    }

    const setCover = (val) => {
        // console.log('setCover', val);
        if (val?.id) {
            cover.value = val.attributes?.url
            update_params.value.data.cover = val.id
        }
    }
    const requireds = ref([
        {
            key: 'agree_sale_argment',
            message: t('agree_service_argment_required'),
            value: false,
        },
        {
            key: 'resource_type',
            message: t('resource_type_required'),
            value: false,
        },
        {
            key: 'name',
            message: t('name_required'),
            value: false,
        },
        {
            key: 'overviews',
            message: t('sale_content_required'),
            value: false,
        },
    ])
    watchEffect(() => {
        if (agree_sale_argment.value) {
            requireds.value.find(i => i.key === 'agree_sale_argment').value = false;
        }
        if (update_params.value.data.overviews?.length) {
            requireds.value.find(i => i.key === 'overviews').value = false;
        }
        if (update_params.value.data.name) {
            requireds.value.find(i => i.key === 'name').value = false;
        }
    })

    const new_overview_name = ref('');
    const version_name = (_name) => {
        return _name === 'default_version_name' ? t(_name) : _name;
    };

    const setOverview = async (val) => {
        if (!teamStore.card || !teamStore.project) return;
        if (val?.id) {
            let params = {
                attach_to: 'card',
                attach_to_id: teamStore.card.id,
                project_id: teamStore.project.id,
                data: {
                    name: overview_name.value || 'default_version_name',
                    media: val.id
                },
            };
            const { data } = await addVersion(params);
            if (data) {
                overview.value = data
                overviews.value = overviews.value.filter(i => i.name !== overview_name.value)
                if (mutiple_overview.value) {
                    overviews.value.push(data)
                    update_params.value.data.overviews = overviews.value.map(i => i.id)
                } else {
                    overviews.value = [data]
                    update_params.value.data.overviews = [data.id]
                    update_params.value.data.default_version = data.id
                }
                $q.notify({
                    message: t('add_version_completed'),
                    color: 'positive',
                    position: 'top'
                })
            } else {
                $q.notify({
                    message: t('add_version_failed'),
                    color: 'negative',
                    position: 'top'
                })
            }
        }
    }
    const removeVersion = async (id) => {
        const res = await deleteVersion(teamStore.card.id, id, 'card')
        if (res) {
            overviews.value = overviews.value.filter(i => i.id !== id)
            update_params.value.data.overviews = overviews.value.map(i => i.id)
            overview.value = overviews.value[0] || null;
        }
    }

    const new_overview_proxy = useTemplateRef('new_overview_proxy');
    const pushNewOverview = () => {
        const _ov = { name: new_overview_name.value }
        overviews.value.push(_ov)
        // overview.value 会首先被watch 触发，所以需要在下一次事件循环中赋值
        setTimeout(() => {
            new_overview_proxy.value?.hide();
            overview.value = _ov
        }, 0);

        new_overview_name.value = ''
    }
    const tiptapBlur = (val) => {
        update_params.value.data.jsonContent = val;
    }
    const updateAuthExtened = (val) => {
        update_params.value.data.auth_extened = val;
    }

    const update_unlocked = ref(false);
    const update = async () => {
        update_params.value.data.price_by_auth = update_params.value.data.price_by_auth.filter(i => i.selected)
        update_params.value.data.price_by_auth.forEach(i => {
            i.price = i.price < 0 ? 0 : i.price * 100;
            delete i.selected;
        })
        console.log('update_params.value', update_params.value);
        const price_0_auth = update_params.value.data.price_by_auth.filter(i => i.price === 0);
        if (price_0_auth.length > 0 && !update_unlocked.value) {
            $q.notify({
                message: t('price_0_tip'),
                color: 'negative',
                position: 'top',
                actions: [{
                    label: t('confirm'),
                    color: 'yellow',
                    handler: () => {
                        update_unlocked.value = true;
                        update();
                    }
                }]
            })
            return;
        }
        if (!update_params.value.data.name) {
            $q.notify({
                message: t('name_required'),
                color: 'negative',
                position: 'top',
            })
            requireds.value.find(i => i.key === 'name').value = true;
            return;
        }
        if (!update_params.value.data.overviews?.length) {
            $q.notify({
                message: t('sale_content_required'),
                color: 'negative',
                position: 'top',
            })
            requireds.value.find(i => i.key === 'overviews').value = true;
        }
        const { data } = await updateCard(teamStore.card.id, update_params.value)
        if (data) {
            watchEffect(() => {
                if (teamStore.card) {
                    syncUpdateParams();
                }
            }, { once: true });
        }
    }
    const publishCard = () => {
        if (!agree_sale_argment.value) {
            $q.notify({
                message: t('agree_service_argment_required'),
                color: 'negative',
                position: 'top',
            })
            requireds.value.find(i => i.key === 'agree_sale_argment').value = true;
            return;
        }
        const medias = teamStore.card?.overviews?.filter(i => i.media);
        if (medias?.length === 0) {
            cant_publish.value = true
        } else {
            emit('publishCard', teamStore.card?.id)
        }
    }

    const show_pulled_dlg = ref(false);
    const pulledCard = () => {
        if (show_pulled_dlg.value) {
            emit('pulledCard', teamStore.card?.id)
        } else {
            show_pulled_dlg.value = true
        }
    }
    const unpulledCard = () => {
        emit('unpulledCard', teamStore.card?.id)
    }

    const downloadFile = async (url, name) => {
        const res = await OSS.catchFile(url);
        console.log('res', res);

        const link = document.createElement('a');
        link.href = res;
        link.download = name;
        link.click();
        // FileSaver.saveAs(res, name);
    };
    onMounted(async () => {
        await getCard(card_id);
    })
    onUnmounted(() => {
        teamStore.card = null
    })
</script>

<style lang="scss" scoped>
    .q-input :deep(.q-field__spinner) {
        color: $field-spinner-color !important;
        background-color: $field-spinner-bg !important;
    }
</style>