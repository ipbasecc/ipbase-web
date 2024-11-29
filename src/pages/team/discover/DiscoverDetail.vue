<template>
    <q-layout v-if="card" view="hhh LpR fFf" container class="absolute-full" @mousemove="handleMouseMove"
        @mouseup="handleMouseUp">
        <q-drawer v-if="!need_buy" v-model="rightDrawerOpen" side="right" bordered class="column"
            :width="rightDrawerWidth">
            <q-bar class="transparent border-bottom" style="height: 36px;">
                <q-tabs v-model="current_classExtend" inline-label dense no-caps stretch>
                    <template v-for="i in classExtends" :key="i.id">
                        <q-tab :name="i.name" :label="$t(i.label)" class="q-px-sm" />
                    </template>
                </q-tabs>
                <q-space />
            </q-bar>
            <div class="q-space relative-position">
                <template v-if="current_classExtend === 'class_overview'">
                    <KeepAlive>
                        <OverView wasAttached_to="card" class="absolute-full" :hideMedia="true"
                            @sync_version="sync_version" />
                    </KeepAlive>
                </template>
                <template v-if="current_classExtend === 'class_note'">
                    <NotebookList v-if="!uiStore.active_note_id" />
                    <NoteDetial v-else :active_note_id="uiStore.active_note_id" />
                </template>
                <template v-if="current_classExtend === 'class_documents'">
                    <template v-if="!card.private || useAuths('read', ['card_document'])">
                        <DocumentBody v-if="teamStore.active_document" :current_document="teamStore.active_document"
                            :withSaveBtn="true" :withImageBtn="true" :by_info="byInfo" />
                        <DocumentList v-else :documents="card.card_documents" :by_info="byInfo"
                            :sortAuth="useAuths('modify', ['card'])" />
                    </template>
                    <div v-else class="absolute-full flex flex-center op-3">
                        您无权查看此内容
                    </div>
                </template>
            </div>
            <div v-if="$q.screen.gt.xs"
                class="absolute-left full-height hover-col-resize flex flex-center toggle-container z-max"
                :class="dragWidth ? 'bg-primary ' : ''" :style="dragWidth ? 'width: 3px' : 'width: 10px'"
                @mousedown="handleMouseDown">
                <q-icon :name="`mdi-chevron-${!rightDrawerOpen ? 'left' : 'right'}`" color="primary" size="sm"
                    @click="toggleRightDrawer" class="cursor-pointer toggle-btn transition z-max"
                    :style="`transform: translateX(-16px)`" />
            </div>
        </q-drawer>

        <q-page-container>
            <q-page>
                <q-toolbar class="transparent z-fab absolute-top text-grey">
                    <q-btn dense flat icon="mdi-chevron-left" @click="closeDetial" />
                    <template v-if="!need_buy">
                        <q-space />
                        <q-btn dense flat padding="xs md" :label="version_label(activeVersion?.name)">
                            <q-menu class='radius-sm'>
                                <q-list bordered dense class='radius-sm q-pa-xs' style="min-width: 100px">
                                    <q-item v-for="i in overviews" :key="i.id" clickable v-close-popup class="radius-xs"
                                        @click="changeVersion(i)">
                                        <q-item-section>{{ version_label(i.name) }}</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                        <q-space />
                        <q-btn flat dense round icon="menu" @click="toggleRightDrawer" />
                    </template>
                </q-toolbar>
                <template v-if="!need_buy">
                    <Artplayer ref="artPlayerRef" :key="media" :option="{
                        url: media,
                        quality: quality,
                        ...player_options
                    }" class="absolute-full" />
                </template>
                <div v-else class="absolute-full flex flex-center">
                    <OrderCard :card>
                        <template #buyBtn>
                            <PayButton class="full-width" btnColor="negative" subject="card" :commodity="card"
                                @buyData="buyData" />
                        </template>
                    </OrderCard>
                </div>
            </q-page>
        </q-page-container>

    </q-layout>
</template>
<script setup>
    import { ref, onMounted, computed, onUnmounted, watchEffect, reactive, useTemplateRef } from 'vue'
    import { queryOneDiscover } from "src/api/strapi/project.js";
    import Artplayer from "src/components/VIewComponents/ArtPlayer.vue";
    import PayButton from 'src/components/order/PayButton.vue'
    import OrderCard from 'src/pages/team/card/components/OrderCard.vue'
    import OverView from "src/pages/team/components/OverView.vue";
    import NotebookList from 'src/pages/team/notebook/NotebookList.vue'
    import NoteDetial from 'src/pages/team/notebook/note/NoteDetial.vue'
    import DocumentList from "src/pages/team/document/DocumentList.vue";
    import DocumentBody from "src/pages/team/document/DocumentBody.vue";

    import { teamStore, uiStore } from 'src/hooks/global/useStore';
    import useOverview from 'src/pages/team/hooks/useOverview.js'
    import { useI18n } from 'vue-i18n'
    import { useMouse } from '@vueuse/core'
    const { t } = useI18n()
    const { activeCard } = defineProps(['activeCard'])
    const emit = defineEmits(['close'])

    const card = ref(null)
    const activeVersion = ref(null)
    const artPlayerRef = useTemplateRef('artPlayerRef')
    const player_options = {
        muted: false,
        autoplay: false,
        loop: false,
        mutex: true,
        fullscreen: true,
        fullscreenWeb: true,
    }
    const overviews = computed(() => {
        return card.value?.overviews
    })
    const version_label = (name) => {
        return name === 'Initial_Version' ? t('Initial_Version') : name
    }
    const media = ref(null)
    const quality = ref()
    const need_buy = ref(false);
    const queryOneDiscoverFn = async (_id) => {
        const res = await queryOneDiscover(_id)
        if (res?.data?.is_buyer === false) {
            card.value = activeCard
            need_buy.value = true
        } else {
            card.value = res?.data
            changeVersion(card.value?.overviews[0])

            need_buy.value = false
            teamStore.card = card.value
        }
    }
    const changeVersion = (version) => {
        activeVersion.value = version;
        const resps = useOverview(activeVersion.value);
        quality.value = resps.quality.value?.filter(q => q.url)
        media.value = quality.value[0]?.url || activeVersion.value?.media.url
    }
    const sync_version = (_id) => {
        const version = card.value?.overviews?.find(i => i.id === _id)
        if (version) {
            changeVersion(version)
        }
    }
    onMounted(() => {
        queryOneDiscoverFn(activeCard.id)
        
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    })
    onUnmounted(() => {
        teamStore.card = null
        teamStore.active_document = null
        
        card.value = null
        activeVersion.value = null
        media.value = null
        quality.value = null
        overviews.value = null
        
        if (artPlayerRef.value?.artplayer) {
            artPlayerRef.value.artplayer.destroy()
        }
        
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    })
    const buyData = async (data) => {
        console.log('buyData', data)
        if (data?.card_id) {
            await queryOneDiscoverFn(data.card_id)
        }
    }

    const rightDrawerOpen = ref(false)
    function toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value
    }

    const closeDetial = () => {
        emit('close')
    }

    const current_classExtend = ref("class_overview");
    const classExtends = ref([
        { id: 0, label: "class_overview", name: "class_overview", icon: "mdi-developer-board" },
        { id: 3, label: "class_documents", name: "class_documents", icon: "article" },
        { id: 5, label: "class_note", name: "class_note", icon: "mdi-checkbox-marked-outline" }
    ]);
    watchEffect(() => {
        if (!card.value?.card_documents || card.value?.card_documents?.length === 0) {
            classExtends.value = classExtends.value.filter(i => i.name !== "class_documents")
        }
    })

    const rightDrawerWidth = ref(640);
    const { x } = useMouse({ touch: false })
    const leftDrawerMinWidth = ref(360);
    const leftDrawerMaxWidth = ref(1280);
    const _ori_width = ref()
    const dragWidth = ref(false)
    const position = reactive({
        x: NaN,
        y: NaN
    })
    const handleMouseDown = () => {
        position.x = x.value;
        dragWidth.value = true
        _ori_width.value = rightDrawerWidth.value
        uiStore.dragging = true
    }
    const handleMouseUp = () => {
        dragWidth.value = false
        uiStore.dragging = false
    }
    const handleMouseMove = () => {
        if (!position.x || !dragWidth.value || !_ori_width.value) return

        const deltaX = x.value - position.x;
        if (_ori_width.value - deltaX >= leftDrawerMinWidth.value && _ori_width.value - deltaX <= leftDrawerMaxWidth.value) {
            rightDrawerWidth.value = _ori_width.value - deltaX
        } else if (_ori_width.value - deltaX > leftDrawerMaxWidth.value) {
            rightDrawerWidth.value = leftDrawerMaxWidth.value
        } else if (_ori_width.value - deltaX === leftDrawerMaxWidth.value) {
            rightDrawerWidth.value = leftDrawerMinWidth.value
        } else if (_ori_width.value - deltaX < 50) {
            uiStore.projectLeftDrawer = false
        }
    }
</script>
