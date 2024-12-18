<template>
    <div class="row justify-center">
        <div v-if="deal || (editMode && update_params.data)" class="row col-12 q-pa-sm">
            <div class="">
                <q-btn flat dense round icon="mdi-chevron-left" @click="router.back()" />
            </div>

            <div class="column no-wrap gap-sm q-ml-md">
                <div class="text-h4 row items-center">
                    <span v-if="!editMode" class="q-space">{{ deal.name }}</span>
                    <q-input v-else-if="is_party_a" v-model="update_params.data.name" class="q-space" type="text" label="任务名称" />
                    <q-btn v-if="hasEditAuth && !editMode" round icon="mdi-pencil"
                        @click="toggleEditMode" />
                    <q-btn v-if="editMode" label="更新合约" color="primary" @click="updateDealFn" />
                </div>
                <div v-if="deal.party_a" class="row gap-md items-center">
                    <q-avatar v-if="deal.party_a?.profile?.avatar?.url" size="32px">
                        <img :src="deal.party_a.profile.avatar.url">
                        <q-icon name="verified" color="positive" size="xs" class="absolute-top-right shadow-12" />
                    </q-avatar>
                    <span>{{ deal.party_a?.username }} 发布于 {{ date.formatDate(deal.publishedAt, 'YYYY-MM-DD') }}</span>
                </div>
            </div>
            <q-space />
        </div>
        <div v-if="deal || (editMode && update_params.data)" class="column no-wrap gap-sm q-pa-md article"
        style="width: 760px;">
            <div class="row">
                <q-card bordered class="full-width row no-wrap justify-around gap-lg items-center q-pa-md">
                    <div v-if="deal.status" class="column flex-center gap-md">
                        <span class="text-h4">状态</span>
                        <span class="text-h5 radius-sm font-bold-600 border bg-orange text-white q-px-sm q-py-xs">
                            {{ $t(`deal_status_${deal.status}`) }}
                        </span>
                    </div>
                    <q-separator spaced inset vertical />
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
                            <q-popup-proxy v-if="editMode && is_party_a" transition-show="scale" transition-hide="scale">
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
                            <q-popup-proxy v-if="editMode && is_party_a" transition-show="scale" transition-hide="scale">
                                <q-input v-model="update_params.data.amount" type="number" label="酬金" />
                            </q-popup-proxy>
                        </span>
                    </div>
                </q-card>
            </div>
            <div v-if="deal.tags?.length > 0" class="row items-center"
                :class="{ 'q-pa-sm radius-sm border': editMode }">
                <span>能力要求：</span>
                <q-chip v-for="tag in tags" :key="tag" square color="primary" :label="tag"
                    :removable="editMode && is_party_a" @remove="removeTag(tag)" />
                <q-input v-if="editMode && is_party_a" v-model="tag" type="text" borderless dense @keyup.enter="addTag" @keyup.esc="tag = ''" />
            </div>
            <div v-if="!deal.order || deal.order?.jeepay_order?.state !== '2'" class="row justify-start q-mt-lg">
                <PayButton v-if="deal.party_a?.id === teamStore.init?.id"
                    class="full-width" btnColor="negative" buyLabel="预存合同金"
                    subject="deal" :commodity="deal"
                    @buyData="buyData"
                />
                <q-chip v-else color="deep-orange" label="尚未预存合同金" />
            </div>
            <q-img
                v-if="deal.cover?.url"
                :src="deal.cover.url"
                :ratio="16/9"
                spinner-color="primary"
                spinner-size="82px"
                class="full-width radius-xs overflow-hidden q-mt-lg"
            />
            <div class="text-h4">需求摘要</div>
            <div class="text-subtitle2">
                <span v-if="!editMode">{{ deal.description }}</span>
                <q-input v-else-if="is_party_a" v-model="update_params.data.description" type="textarea" label="需求摘要" />
            </div>
            <q-banner v-if="deal.party_b && (is_party_a || is_party_b)" rounded class="border">
                <span v-if="is_party_a">
                    <template v-if="deal.party_b_accept && !deal.party_a_accept">
                        乙方已同意合约内容，请尽快审阅协议内容
                    </template>
                    <template v-if="!deal.party_b_accept && !deal.party_a_accept">
                        已与 {{ deal.party_b?.username }} 达成合作意向，请督促其阅读合约并尽快补充合约中乙方部分
                    </template>
                    <template v-if="!deal.party_b_accept && deal.party_a_accept">
                        你已同意合约内容，请等待乙方审阅协议内容
                    </template>
                </span>
                <span v-if="is_party_b">
                    <template v-if="deal.party_a_accept && !deal.party_b_accept">
                        甲方已同意合约内容，请尽快审阅协议内容
                    </template>
                    <template v-if="!deal.party_a_accept && !deal.party_b_accept">
                        已与 {{ deal.party_a?.username }} 达成合作意向，请尽快阅读合约并补充合约中乙方部分
                    </template>
                    <template v-if="deal.party_b_accept && !deal.party_a_accept">
                        你已同意合约内容，请等待甲方审阅协议内容
                    </template>
                </span>
                <template v-if="(is_party_a && !deal.party_a_accept) || (is_party_b && !deal.party_b_accept)" v-slot:action>
                    <q-btn color="deep-orange" flat label="同意合约内容" @click="agreeDeal" />
                </template>
                <span v-if="deal.party_a_accept && deal.party_b_accept">
                    已进入“执行”阶段，请与对方保持沟通
                </span>
            </q-banner>
            <q-tabs v-model="tab" align="left" no-caps dense class="q-mt-lg">
                <q-tab v-for="i in tabs" :key="i" :name="i" :label="$t(`deal_${i}`)" />
            </q-tabs>
            <q-tab-panels v-model="tab" keep-alive class="transparent">
                <q-tab-panel v-for="i in tabs" :key="i" :name="i">
                    <TipTap v-if="i === 'jsonContent'" :jsonContent="deal.jsonContent" :editable="editMode && is_party_a"
                        :contentChanged="editMode" :need="'json'" :square="true" :show_toolbar="editMode"
                        :show_bubbleMenu="editMode" styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                        @tiptapUpdate="updateJsonContent" />
                    <ul v-if="i === 'todogroups' && deal.todogroups?.length > 0">
                        <li v-for="group in deal.todogroups" :key="group.id">
                            {{ group.name }}
                            <ol v-if="group.todos.length > 0">
                                <li v-for="todo in group.todos" :key="todo.id">
                                    <span v-if="!editMode">{{ todo.content }}</span>
                                    <q-input v-else-if="is_party_a" v-model="todo.content" type="text" label="任务内容" />
                                </li>
                                <q-btn v-if="editMode && is_party_a" dense round icon="mdi-plus" @click="addTodo(group.id)" />
                            </ol>
                        </li>
                    </ul>
                    <TipTap v-if="i === 'party_a_requirements'" :jsonContent="deal.party_a_requirements" :need="'json'"
                        :square="true" :editable="editMode && is_party_a"
                        :contentChanged="editMode"
                        :show_toolbar="editMode"
                        :show_bubbleMenu="editMode"
                        styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                        @tiptapUpdate="updatePartyARequirements" />
                    <TipTap v-if="i === 'party_b_requirements'" :jsonContent="deal.party_b_requirements" :need="'json'"
                        :square="true" :editable="editMode && is_party_b"
                        :contentChanged="editMode"
                        :show_toolbar="editMode"
                        :show_bubbleMenu="editMode"
                        styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                        @tiptapUpdate="updatePartyBRequirements" />
                    <div v-if="i === 'deliver'" class="column gap-sm">
                        <q-tabs
                            v-model="deliver_tab"
                            align="left"
                            no-caps
                            dense
                        >
                            <q-tab name="deliver_link" label="链接交付" />
                            <q-tab name="deliver_file" label="文件交付" />
                        </q-tabs>
                        <q-tab-panels v-model="deliver_tab" keep-alive class="transparent">
                            <q-tab-panel v-if="deliver_tab === 'deliver_link'" name="deliver_link" class="q-pa-none">
                                <q-input v-if="is_party_b" v-model="deliver_link" type="textarea" outlined />
                                <div v-else class="flex flex-center radius-sm border-dotted border-xs border-op-sm op-5" style="height: 8rem;">
                                    {{ deal.deliver_link ? deal.deliver_link : '暂无交付链接' }}
                                </div>
                            </q-tab-panel>
                            <q-tab-panel v-if="deliver_tab === 'deliver_file'" name="deliver_file" class="q-pa-none">
                                <DrapUpload v-if="is_party_b" :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill"
                                    :allowedFormats="['application/rar','application/zip','application/x-tar']"
                                    @uploaded="setDeliverFile" style="min-height: 8rem;"
                                    :caption="$t('drop_or_pick_deliver_file')" :maxFileSize="1000 * 1024 * 1024"
                                />
                                <template v-else>
                                    <q-list v-if="deal.deliver_files?.length > 0" bordered>
                                        <q-item v-for="file in deal.deliver_files" :key="file.id" clickable v-ripple>
                                            <q-item-section>
                                                <q-item-label>{{ file.name }}</q-item-label>
                                            </q-item-section>
                                            <q-item-section side>
                                                <q-btn color="primary" icon="mdi-download" :label="`下载`" @click="downloadDeliverFile(file)" />
                                            </q-item-section>
                                        </q-item>
                                    </q-list>
                                    <div v-else class="flex flex-center radius-sm border-dotted border-xs border-op-sm op-5" style="height: 8rem;">暂无交付文件</div>
                                </template>
                            </q-tab-panel>
                        </q-tab-panels>
                    </div>
                </q-tab-panel>
            </q-tab-panels>
        </div>
        <div v-if="deal" class="column q-px-sm q-py-md" style="flex: 0 0 260px;">
            <q-responsive :ratio="3/4" class="full-width">
                <PartybCard :party="deal.party_a">
                    <q-card-section class="column flex-center q-pa-sm border-top">
                        <q-btn v-if="deal.status === 'deposited'" color="primary" label="开启对接申请" class="full-width" @click="startMatch" />
                        <q-btn v-else-if="(deal.status === 'pending_matching' || deal.status === 'matching') && !is_party_a || is_party_b" color="positive"
                            unelevated icon="mdi-forum" label="联系 TA" class="full-width" @click="openFloatChat()">
                            <q-badge v-if="unread_count > 0 && deal.party_a?.id !== teamStore.init?.id" color="red" floating :label="unread_count" />
                        </q-btn>
                        <q-btn v-else-if="is_party_a" color="primary" icon="mdi-message-alert"
                        :disable="!deal.talked_users ||deal.talked_users?.length === 0"
                        :label="`${talkHistory ? '关闭' : '查看'}对接历史`" class="full-width" @click="talkHistory = !talkHistory">
                            <q-badge v-if="unread_count > 0" color="red" floating :label="unread_count" />
                                <q-tooltip v-if="!deal.talked_users || deal.talked_users?.length === 0">
                                    暂无人员资讯该任务
                                </q-tooltip>
                        </q-btn>
                        <div v-else class="radius-xs border q-pa-sm full-width flex flex-center blur-sm text-positive">
                            已完成合作对接
                        </div>
                    </q-card-section>
                </PartybCard>
            </q-responsive>
        </div>
        <q-dialog v-model="showFloatChat" persistent>
            <FloatChat
                :channel_id="floatChatChannelId"
                :target_user="deal.party_a"
                @MsgSended="MsgSended"
            />
        </q-dialog>
        <div v-if="deal?.party_a?.id === teamStore.init?.id && deal?.talked_users?.length > 0" class="absolute-bottom-right q-pa-md">
            <q-btn color="primary" icon="mdi-forum" dense round>
                <q-menu v-model="talkHistory" persistent anchor="bottom end" self="bottom right" class="transparent">
                    <DealTalkerchat :deal :unread_count_map @openChat="openChat" @set_party_b="setPartyB" />
                </q-menu>
                <q-badge v-if="unread_count > 0" color="red" floating :label="unread_count" />
            </q-btn>
        </div>
    </div>
</template>

<script setup>
    import { onMounted, nextTick, ref, computed, watch } from 'vue';
    import { findDeal, updateDeal } from 'src/api/strapi';
    import { createDirect, getChannelUnreads } from 'src/api/mattermost';
    import { teamStore, mm_wsStore } from 'src/hooks/global/useStore';
    import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
    import { useRouter } from 'vue-router'
    import { date, useQuasar } from 'quasar'
    import PayButton from 'src/components/order/PayButton.vue'
    import FloatChat from 'src/pages/team/chat/FloatChat.vue'
    import DealTalkerchat from './components/DealTalkerchat.vue'
    import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'
    import FileSaver from 'file-saver';
    import PartybCard from './components/PartybCard.vue'

    const $q = useQuasar();
    const router = useRouter();
    const { deal_id } = defineProps(['deal_id']);

    const deal = ref(null);
    const tags = ref([]);

    const tab = ref('jsonContent');
    const deliver_tab = ref('deliver_file');
    const tabs = ['jsonContent', 'todogroups', 'party_a_requirements'];
    const findDealFn = async () => {
        const { data } = await findDeal(deal_id);
        deal.value = data;
        if (data.party_b?.id === teamStore.init?.id || data.party_a?.id === teamStore.init?.id) {
            tabs.push('party_b_requirements');
            if(data.status === 'progressing' || data.status === 'reviewing'){
                tabs.push('deliver');
            }
        }
        tags.value = data.tags;
    }
    const is_party_b = computed(() => deal.value?.party_b?.id === teamStore.init?.id);
    const is_party_a = computed(() => deal.value?.party_a?.id === teamStore.init?.id);
    const showFloatChat = ref(false);
    const talkHistory = ref(false);
    const floatChatChannelId = ref(null);
    const unread_count = ref(0);
    const unread_count_map = ref({});
    const d_channels_ids = ref([]);
    const openFloatChat = () => {
        unread_count.value = 0;
        showFloatChat.value = true;
    }
    const createDirectFn = async () => {
        const a = deal.value.party_a?.mm_profile?.id;
        const b = teamStore.init?.mm_profile?.id;
        const {data} = await createDirect(a, b);
        floatChatChannelId.value = data.id;
    }
    const checkUnreadCount = async () => {
        if(!deal.value) return;
        if(deal.value?.party_a?.id !== teamStore.init?.id && floatChatChannelId.value) {
            await createDirectFn();
            const {data} = await getChannelUnreads(teamStore.init?.mm_profile?.id, floatChatChannelId.value);
            unread_count.value = data.msg_count;
        }
        if(deal.value?.party_a?.id === teamStore.init?.id && deal.value?.talked_users?.length > 0) {
            
            for(const talked_user of deal.value.talked_users) {
                const d_chat = await createDirect(talked_user.mm_profile?.id, teamStore.init?.mm_profile?.id);
                if(d_chat.data?.id) {
                    deal.value.talked_users.find(i => i.id === talked_user.id).d_channel_id = d_chat.data?.id;
                    d_channels_ids.value.push(d_chat.data?.id);
                    const {data} = await getChannelUnreads(teamStore.init?.mm_profile?.id, d_chat.data?.id);
                    unread_count_map.value[d_chat.data?.id] = data.msg_count;
                    unread_count.value += data.msg_count;
                }
            }
        }
    }
    onMounted(async () => {
        await findDealFn();
        await nextTick();
        await checkUnreadCount();
    })
    const MsgSended = async () => {
        const talked_users_ids = deal.value?.talked_users?.map(i => i.id) || [];
        if(!talked_users_ids.includes(teamStore.init?.id)){
            const add_talked_user_params = {
                data: {
                    new_talked_user: teamStore.init?.id,
                }
            }
            const { data } = await updateDeal(deal_id, add_talked_user_params);
            deal.value = data;
        }
    }
    const openChat = async (d_channel_id) => {
        unread_count.value = unread_count.value - unread_count_map.value[d_channel_id];
        unread_count_map.value[d_channel_id] = 0;
        console.log('unread_count_map', unread_count_map.value);
    }
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
    const startMatch = async () => {
        const { data } = await updateDeal(deal_id, { data: { status: 'pending_matching' } });
        deal.value = data;
    }
    const setPartyB = async (party_b) => {
        const { data } = await updateDeal(deal_id, { data: { party_b: party_b.id } });
        deal.value = data;
    }
    const agreeDeal = async () => {
        const { data } = await updateDeal(deal_id, { data: { agree: true } });
        deal.value = data;
    }

    const deliver_link = ref('');
    const deliver_files = ref([]);
    const setDeliverFile = async (file) => {
        if(file?.id){
            deliver_files.value.push(file.id);
        }
        const { data } = await updateDeal(deal_id, { data: { deliver_files: deliver_files.value } });
        deal.value = data;
    }
    const downloadDeliverFile = async (file) => {
        const urlObj = new URL(file.url);
        const str = urlObj.pathname.substring(urlObj.pathname.lastIndexOf("/") + 1);
        // 获取文件名
        const filename = decodeURIComponent(str);
        FileSaver.saveAs(file.url, filename);
    }

    watch(
    mm_wsStore,
    async () => {
      // 判断消息类型
      if (mm_wsStore?.event?.event === "posted") {
        let message = JSON.parse(mm_wsStore.event.data.post);
        if(floatChatChannelId.value === message?.channel_id && !showFloatChat.value) {
            if(message?.message === '' || message?.user_id === teamStore.init?.mm_profile?.id) return;
            unread_count.value++;
        }

        if (d_channels_ids.value?.includes(message?.channel_id)) {
            if(message?.message === '' || message?.user_id === teamStore.init?.mm_profile?.id) return;
            if(!unread_count_map.value[message?.channel_id]) {
                unread_count_map.value[message?.channel_id] = 0;
            }
            unread_count_map.value[message?.channel_id]++;
            unread_count.value++;
            console.log('unread_count_map', unread_count_map.value);
            console.log('unread_count', unread_count.value);
        } else {
            await findDealFn();
            await checkUnreadCount();
        }
      }
    },
    { immediate: true, deep: true }
);
</script>
