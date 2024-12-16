<template>
    <div class="row justify-center">
        <div v-if="deal || (editMode && update_params.data)" class="column no-wrap gap-sm q-pa-md article" style="width: 760px;">
            <div class="text-h4 row items-center">
                <span v-if="!editMode" class="q-space">{{ deal.name }}</span>
                <q-input v-else v-model="update_params.data.name" class="q-space" type="text" label="任务名称" />
                <q-btn v-if="hasEditAuth && !editMode" round icon="mdi-pencil"
                    @click="toggleEditMode" />
                <q-btn v-if="editMode" label="更新合约" color="primary" @click="updateDealFn" />
            </div>
            <div v-if="deal.party_a" class="row gap-md items-center">
                <q-avatar v-if="deal.party_a?.profile?.avatar?.url" size="42px">
                    <img :src="deal.party_a.profile.avatar.url">
                    <q-icon name="verified" color="positive" size="xs" class="absolute-top-right shadow-12" />
                </q-avatar>
                <span>{{ deal.party_a?.username }} 发布于 {{ date.formatDate(deal.publishedAt, 'YYYY-MM-DD') }}</span>
            </div>
            <div class="row q-mt-lg">
                <q-card bordered class="full-width row no-wrap justify-around gap-lg items-center q-pa-md">
                    <div class="column flex-center gap-md">
                        <span class="text-h4">更新日期</span>
                        <span class="text-h5 q-px-sm q-py-xs">{{ date.formatDate(deal.updatedAt || deal.publishedAt,
                            'YYYY-MM-DD') }}</span>
                    </div>
                    <q-separator spaced inset vertical />
                    <div v-if="deal.deadline" class="column flex-center gap-md">
                        <span class="text-h4">截止日期</span>
                        <span class="text-h5 q-px-sm q-py-xs">
                            {{ date.formatDate(deal.deadline, 'YYYY-MM-DD') }}
                            <q-popup-proxy v-if="editMode" transition-show="scale" transition-hide="scale">
                                <q-date v-model="update_params.data.deadline" today-btn mask="YYYY-MM-DD" minimal
                                    bordered v-close-popup />
                            </q-popup-proxy>
                        </span>
                    </div>
                    <q-separator spaced inset vertical />
                    <div v-if="deal.amount" class="column flex-center gap-md">
                        <span class="text-h4">酬金</span>
                        <span class="text-h5 q-px-sm q-py-xs">
                            ￥：{{ deal.amount / 100 }}
                            <q-popup-proxy v-if="editMode" transition-show="scale" transition-hide="scale">
                                <q-input v-model="update_params.data.amount" type="number" label="酬金" />
                            </q-popup-proxy>
                        </span>
                    </div>
                    <q-separator spaced inset vertical />
                    <div v-if="deal.status" class="column flex-center gap-md">
                        <span class="text-h4">状态</span>
                        <span class="text-h5 radius-sm font-bold-600 border bg-orange text-white q-px-sm q-py-xs">
                            {{ $t(`deal_status_${deal.status}`) }}
                        </span>
                    </div>
                </q-card>
            </div>
            <div v-if="!deal.order || deal.order?.jeepay_order?.state !== '2'" class="row justify-start q-mt-lg">
                <PayButton v-if="deal.party_a?.id === teamStore.init?.id"
                    class="full-width" btnColor="negative" buyLabel="预存合同金"
                    subject="deal" :commodity="deal"
                    @buyData="buyData"
                />
                <q-chip v-else color="deep-orange" label="尚未预存合同金" />
            </div>
            <div class="text-h4 q-mt-lg">需求摘要</div>
            <div class="text-subtitle2">
                <span v-if="!editMode">{{ deal.description }}</span>
                <q-input v-else v-model="update_params.data.description" type="textarea" label="需求摘要" />
            </div>
            <div class="text-h4 q-mt-lg">任务标签</div>
            <div v-if="deal.tags?.length > 0" class="row items-center"
                :class="{ 'q-pa-sm radius-sm border': editMode }">
                <q-chip v-for="tag in tags" :key="tag" square color="primary" :label="tag"
                    :removable="editMode" @remove="removeTag(tag)" />
                <q-input v-model="tag" type="text" borderless dense @keyup.enter="addTag" @keyup.esc="tag = ''" />
            </div>
            <q-tabs v-model="tab" align="left" no-caps dense class="q-mt-lg">
                <q-tab v-for="i in tabs" :key="i" :name="i" :label="$t(`deal_${i}`)" />
            </q-tabs>
            <q-tab-panels v-model="tab" keep-alive class="transparent">
                <q-tab-panel v-for="i in tabs" :key="i" :name="i">
                    <TipTap v-if="i === 'jsonContent'" :jsonContent="deal.jsonContent" :editable="editMode"
                        :contentChanged="editMode" :need="'json'" :square="true" :show_toolbar="editMode"
                        :show_bubbleMenu="editMode" styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                        @tiptapUpdate="updateJsonContent" />
                    <ul v-if="i === 'todogroups' && deal.todogroups?.length > 0">
                        <li v-for="group in deal.todogroups" :key="group.id">
                            {{ group.name }}
                            <ol v-if="group.todos.length > 0">
                                <li v-for="todo in group.todos" :key="todo.id">
                                    <span v-if="!editMode">{{ todo.content }}</span>
                                    <q-input v-else v-model="todo.content" type="text" label="任务内容" />
                                </li>
                                <q-btn v-if="editMode" dense round icon="mdi-plus" @click="addTodo(group.id)" />
                            </ol>
                        </li>
                    </ul>
                    <TipTap v-if="i === 'party_a_requirements'" :jsonContent="deal.party_a_requirements" :need="'json'"
                        :square="true" :editable="editMode && deal.party_a?.id === teamStore.init?.id"
                        :contentChanged="editMode && deal.party_a?.id === teamStore.init?.id"
                        :show_toolbar="editMode && deal.party_a?.id === teamStore.init?.id"
                        :show_bubbleMenu="editMode && deal.party_a?.id === teamStore.init?.id"
                        styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                        @tiptapUpdate="updatePartyARequirements" />
                    <TipTap v-if="i === 'party_b_requirements'" :jsonContent="deal.party_b_requirements" :need="'json'"
                        :square="true" :editable="editMode && deal.party_b?.id === teamStore.init?.id"
                        :contentChanged="editMode && deal.party_b?.id === teamStore.init?.id"
                        :show_toolbar="editMode && deal.party_b?.id === teamStore.init?.id"
                        :show_bubbleMenu="editMode && deal.party_b?.id === teamStore.init?.id"
                        styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                        @tiptapUpdate="updatePartyBRequirements" />
                </q-tab-panel>
            </q-tab-panels>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, nextTick, ref, computed } from 'vue';
    import { findDeal, updateDeal } from 'src/api/strapi';
    import { teamStore } from 'src/hooks/global/useStore';
    import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
    import { date, useQuasar } from 'quasar'
import PayButton from 'src/components/order/PayButton.vue'

    const $q = useQuasar();
    const { deal_id } = defineProps(['deal_id']);

    const deal = ref(null);
    const tags = ref([]);

    const tab = ref('jsonContent');
    const tabs = ['jsonContent', 'todogroups', 'party_a_requirements'];
    const findDealFn = async () => {
        const { data } = await findDeal(deal_id);
        deal.value = data;
        if (data.party_b?.id === teamStore.init?.id) {
            tabs.push('party_b_requirements');
        }
        tags.value = data.tags;
    }
    onMounted(async () => {
        await nextTick();
        await findDealFn();
    })
    const buyData = async () => {
        await findDealFn();
    }

    const editMode = ref(false);
    const tag = ref('');
    const hasEditAuth = computed(() => deal.value?.party_a?.id === teamStore.init?.id || deal.value?.party_b?.id === teamStore.init?.id);
    const addTag = () => {
        if (update_params.value.data.tags?.includes(tag.value)) {
            $q.notify({
                message: '标签已存在',
                color: 'red',
                icon: 'mdi-alert-circle',
                position: 'top',
                timeout: 2000,
                actions: [{ label: '确定', color: 'white' }],
                onDismiss: () => {
                    tag.value = '';
                }
            });
            return;
        };
        update_params.value.data.tags.push(tag.value);
        tag.value = '';
    }
    const removeTag = (tag) => {
        update_params.value.data.tags = update_params.value.data.tags.filter(t => t !== tag);
    }

    const update_params = ref({
        data: {
            name: deal.value?.name,
            description: deal.value?.description,
            tags: deal.value?.tags,
            jsonContent: deal.value?.jsonContent,
            todogroups: deal.value?.todogroups,
            party_a_requirements: deal.value?.party_a_requirements,
            party_b_requirements: deal.value?.party_b_requirements,
        }
    })
    const syncUpdateParams = () => {
        update_params.value.data.name = deal.value?.name;
        update_params.value.data.description = deal.value?.description;
        update_params.value.data.tags = deal.value?.tags;
        update_params.value.data.jsonContent = deal.value?.jsonContent;
        update_params.value.data.todogroups = deal.value?.todogroups;
        update_params.value.data.party_a_requirements = deal.value?.party_a_requirements;
        update_params.value.data.party_b_requirements = deal.value?.party_b_requirements;
        tags.value = deal.value?.tags;
    }
    const toggleEditMode = () => {
        editMode.value = !editMode.value;
        if (editMode.value) {
            syncUpdateParams();
        }
    }
    onMounted(async () => {
        await nextTick();
        syncUpdateParams();
    })
    const updateJsonContent = (jsonContent) => {
        update_params.value.data.jsonContent = jsonContent;
    }
    const updatePartyARequirements = (party_a_requirements) => {
        update_params.value.data.party_a_requirements = party_a_requirements;
    }
    const updatePartyBRequirements = (party_b_requirements) => {
        update_params.value.data.party_b_requirements = party_b_requirements;
    }
    const addTodo = (group_id) => {
        update_params.value.data.todogroups.find(group => group.id === group_id).todos.push({ content: '' });
    }

    const updateDealFn = async () => {
        update_params.value.data.tags = tags.value;
        if (teamStore.init?.id === deal.value.party_b?.id) {
            update_params.value.data = {
                party_b_requirements: update_params.value.data.party_b_requirements,
                party_b_attachment: update_params.value.data.party_b_attachment,
            }
        }
        if (teamStore.init?.id === deal.value.party_a?.id) {
            delete update_params.value.data.party_a_requirements;
            delete update_params.value.data.party_a_attachment;
        }
        const { data } = await updateDeal(deal_id, update_params.value);
        deal.value = data;
        editMode.value = false;
        syncUpdateParams();
    }

</script>
