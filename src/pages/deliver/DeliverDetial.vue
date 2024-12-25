<template>
    <q-scroll-area class="absolute-full">
    <div class="column">
        <div v-if="deal || (editMode && update_params.data)" class="row col-12 q-pa-sm">
            <div class="q-mt-sm">
                <q-btn flat dense round icon="mdi-chevron-left" @click="router.push('/deliver')" />
            </div>

            <div class="column no-wrap gap-sm q-ml-md">
                <div class="text-h4 row items-center">
                    <span v-if="!editMode" class="q-space">{{ deal.name }}</span>
                    <q-input v-else-if="is_party_a" v-model="update_params.data.name" class="q-space" type="text" label="任务名称" />
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
            
            <template v-if="hasEditAuth">
                <div v-if="!was_completed && !was_processing">
                    <q-btn v-if="!editMode" label="修改合约"
                        @click="toggleEditMode" />
                    <q-btn v-if="editMode" flat label="取消" color="primary" @click="editMode = false" />
                    <q-btn v-if="editMode" label="确认更新" color="primary" class="q-ml-sm" @click="updateDealFn" />
                </div>
                <div v-else-if="was_completed" class="text-caption op-5">
                    合作已完成，不能再修改
                </div>
                <div v-else-if="was_processing" class="text-caption op-5">
                    合约已签署，正在执行中，不能再修改
                </div>
            </template>
        </div>
        <div class="row no-wrap justify-center">
            <div v-if="deal || (editMode && update_params.data)" class="column no-wrap gap-xs q-pa-md article"
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
                            <div class="relative-position">
                                <span class="text-h4">
                                    酬金
                                </span>
                                <q-badge v-if="is_paied" floating color="positive" label="已预存" class="shadow-12" />
                            </div>
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
                    <q-chip v-for="tag in tags" :key="tag" square color="primary" :label="tag" class="text-white"
                        :removable="editMode && is_party_a" @remove="removeTag(tag)" />
                    <q-input v-if="editMode && is_party_a" v-model="tag" type="text" borderless dense @keyup.enter="addTag" @keyup.esc="tag = ''" />
                </div>
                <div v-if="!deal.order || deal.order?.jeepay_order?.state !== '2'" class="row justify-start q-mt-lg">
                    <PayButton v-if="deal.party_a?.id === teamStore.init?.id"
                        class="full-width" btnColor="negative" buyLabel="预存酬金"
                        subject="deal" :commodity="deal"
                        @buyData="buyData"
                    />
                    <q-chip v-else color="deep-orange" label="尚未预存酬金" />
                </div>
                <q-img
                    v-if="deal.cover?.url"
                    :src="deal.cover.url"
                    :ratio="16/9"
                    spinner-color="primary"
                    spinner-size="82px"
                    class="full-width radius-xs overflow-hidden q-mt-lg"
                    @click="$hevueImgPreview({
                        url: deal.cover.url,
                        clickMaskCLose: true
                    })"
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
                <TipTap v-if="tab === 'jsonContent'" :jsonContent="deal.jsonContent" :editable="editMode && is_party_a"
                    :contentChanged="editMode" :need="'json'" :square="true" :show_toolbar="editMode"
                    :show_bubbleMenu="editMode" styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                    @tiptapUpdate="updateJsonContent" />
                <ul v-if="tab === 'todogroups' && deal.todogroups?.length > 0">
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
                <TipTap v-if="tab === 'party_a_requirements'" :jsonContent="deal.party_a_requirements" :need="'json'"
                    :square="true" :editable="editMode && is_party_a"
                    :contentChanged="editMode"
                    :show_toolbar="editMode"
                    :show_bubbleMenu="editMode"
                    styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                    @tiptapUpdate="updatePartyARequirements" />
                <TipTap v-if="tab === 'party_b_requirements'" :jsonContent="deal.party_b_requirements" :need="'json'"
                    :square="true" :editable="editMode && is_party_b"
                    :contentChanged="editMode"
                    :show_toolbar="editMode"
                    :show_bubbleMenu="editMode"
                    styleClass="q-px-md q-py-sm" class="q-space" :autofocus="false"
                    @tiptapUpdate="updatePartyBRequirements" />
                <div v-if="tab === 'deliver'" class="column gap-sm">
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
                            <div v-if="deal.deliver_link" class="flex flex-center radius-sm border-dotted border-xs border-op-sm op-5" style="height: 8rem;">
                                {{ deal.deliver_link }}
                            </div>
                            <template v-if="is_party_b">
                                <q-input v-model="deliver_link" type="textarea" outlined />
                                <q-btn color="primary" icon="check" label="交付" :disable="!deliver_link" @click="deliverByLink" class="q-mt-sm" />
                            </template>
                            <div v-if="!deal.deliver_link" class="flex flex-center radius-sm border-dotted border-xs border-op-sm op-5"
                            style="height: 8rem;">
                                暂无交付链接
                            </div>
                        </q-tab-panel>
                        <q-tab-panel v-if="deliver_tab === 'deliver_file'" name="deliver_file" class="q-pa-none">
                            <template v-if="deal.deliver_files?.length > 0">
                                <q-list bordered class="column gap-sm radius-sm q-pa-xs">
                                    <q-item v-for="file in deal.deliver_files" :key="file.id" class="radius-xs" clickable v-ripple>
                                        <q-item-section>
                                            <q-item-label>{{ file.name }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-btn color="primary" flat dense padding="xs md" :label="`下载`"
                                            @click="downloadDeliverFile(file)" />
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </template>
                            <DrapUpload v-if="is_party_b" :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill q-mb-sm"
                                :allowedFormats="['application/rar','application/zip','application/x-tar']"
                                @uploaded="setDeliverFile" style="min-height: 8rem;"
                                :caption="$t('drop_or_pick_deliver_file')" :maxFileSize="1000 * 1024 * 1024"
                            />
                            <div v-else-if="!deal.deliver_files || deal.deliver_files?.length === 0" class="flex flex-center radius-sm border-dotted border-xs border-op-sm op-5"
                            style="height: 8rem;">
                                暂无交付文件
                            </div>
                        </q-tab-panel>
                    </q-tab-panels>
                    <template v-if="(deal.deliver_files?.length > 0 || deal.deliver_link) && deal.party_a?.id === teamStore.init?.id">
                        <q-btn v-if="deal.status === 'progressing' || deal.status === 'reviewing'" flat color="primary" label="确认验收" @click="completeDeliver" />
                        <div v-if="deal.status === 'completed'" class="q-pa-md radius-xs border text-center">已验收</div>
                    </template>
                </div>
            </div>
            <div v-if="deal" class="column gap-md q-px-xs q-py-md" style="flex: 0 0 260px;">
                <q-btn v-if="is_party_a" color="primary" dense icon="mdi-developer-board" :label="deal.collaborate_card ? '修改关联协作任务' : '关联协作任务'" @click="openSetCollaborateCard = true" />
                <q-chip v-if="!is_party_a && deal.collaborate_card" square outline color="deep-orange" icon="mdi-developer-board" label="已关联协作任务" />
                <q-responsive :ratio="3/4" class="full-width">
                    <PartybCard :party="deal.party_a">
                        <q-card-section class="column flex-center q-pa-sm border-top">
                            <template v-if="need_pay">
                                <div class="radius-xs border q-pa-sm full-width flex flex-center blur-sm text-positive">
                                    待预存酬金
                                    <q-tooltip class="text-medium">
                                        为保证合作顺利进行，请尽快预存酬金
                                    </q-tooltip>
                                </div>
                                <div v-if="is_party_a" class="full-width text-caption op-5 q-mt-xs">
                                    请尽快预存酬金，以便开启对接
                                </div>
                            </template>
                            <template v-else-if="need_satrt">
                                <div v-if="is_party_b" class="radius-xs border q-pa-sm full-width flex flex-center blur-sm text-positive">
                                    待对方开启对接
                                </div>
                                <q-btn v-if="is_party_a" color="primary" label="开启对接申请" class="full-width" @click="startMatch" />
                            </template>
                            <q-btn v-else-if="everyone_can_chat || party_b_can_chat" color="positive"
                                unelevated icon="mdi-forum" label="联系 TA" class="full-width" @click="openFloatChat()">
                                <q-badge v-if="unread_count > 0 && deal.party_a?.id !== teamStore.init?.id" color="red" floating :label="unread_count" />
                            </q-btn>
                            <q-btn v-else-if="is_party_a" color="primary" icon="mdi-message-alert"
                                :disable="!deal.talked_users ||deal.talked_users?.length === 0"
                                :label="`${talkHistory ? '关闭' : '查看'}对接历史`" class="full-width" @click="talkHistory = !talkHistory"
                            >
                                <q-badge v-if="unread_count > 0" color="red" floating :label="unread_count" />
                                <q-tooltip v-if="!deal.talked_users || deal.talked_users?.length === 0">
                                    暂无人员资讯该任务
                                </q-tooltip>
                            </q-btn>
                            <div v-if="was_processing && !is_party_a && !is_party_b" class="radius-xs border q-pa-sm full-width flex flex-center blur-sm text-positive">
                                合约已签署，正在执行中
                            </div>
                            <div v-if="was_completed" class="radius-xs border q-pa-sm full-width flex flex-center blur-sm text-positive">
                                合作已结束
                            </div>
                        </q-card-section>
                        <div class="absolute-top-right">
                            <q-chip square outline color="positive" label="甲方" />
                        </div>
                    </PartybCard>
                </q-responsive>
                <q-responsive v-if="deal.party_b" :ratio="3/4" class="full-width">
                    <PartybCard :party="deal.party_b">
                        <q-card-section class="column flex-center q-pa-sm border-top">
                            <TalkBtn :worker="deal.party_b" :deal="deal" />
                        </q-card-section>
                        <div class="absolute-top-right">
                            <q-chip square outline color="positive" label="乙方" />
                        </div>
                    </PartybCard>
                </q-responsive>
                <template v-if="is_party_a || is_party_b">
                    <q-list v-if="deal.delay?.length > 0" bordered class="radius-xs">
                        <q-item v-for="i in deal.delay" v-ripple clickable>
                            <q-item-section side top>
                                {{ i.from === 'party_a' ? '甲方' : '乙方' }}
                            </q-item-section>
                            <q-item-section>
                                <q-item-label caption lines="2">{{ i.reason }}</q-item-label>
                                <q-item-label>{{ i.date }}</q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                                <q-icon v-if="i.accepted" name="check" />
                                <q-btn v-else color="primary" dense size="sm" padding="xs sm" label="同意"
                                :disable="disable_delay(i)" @click="acceptDelay(i.id)">
                                    <q-tooltip v-if="disable_delay(i)">
                                        你要求的延期，需要对方同意！
                                    </q-tooltip>
                                </q-btn>
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <template v-if="deal.status === 'progressing' || deal.status === 'reviewing'">
                        <q-btn v-if="!delay_show" color="primary" flat label="要求延期" class="full-width" @click="toggleDelay" />
                        <q-input v-else v-model="delay_reason" type="text" label="延期理由" outlined autogrow @keydown.esc="toggleDelay">
                            <template v-slot:append>
                                <q-btn dense flat round size="sm" icon="mdi-calendar" :disable="!delay_reason">
                                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                                        <q-date
                                            v-model="delay_date"
                                            today-btn
                                            mask="YYYY-MM-DD"
                                            minimal
                                            bordered
                                            v-close-popup
                                            :options="getDelayDateOptions"
                                            @update:model-value="setDelay"
                                        />
                                    </q-popup-proxy>
                                    <q-tooltip v-if="!delay_reason">
                                        请输入延期理由
                                    </q-tooltip>
                                </q-btn>
                            </template>
                        </q-input>
                    </template>
                </template>
            </div>
        </div>
        <q-dialog v-model="showFloatChat" persistent>
            <FloatChat
                v-if="floatChatChannelId"
                :channel_id="floatChatChannelId"
                :target_user="deal.party_a"
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
        <q-dialog v-model="completed_tip" persistent>
            <q-card>
                <q-card-section class="row items-center">
                    <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
                    <span class="q-ml-sm">验收之后，当前协作将结束，酬金将进入对方账户，是否确认？</span>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat :label="$t('cancel')" color="primary" v-close-popup />
                    <q-btn flat :label="$t('confirm')" color="primary" v-close-popup @click="completeDeliver" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
    <q-dialog v-model="openSetCollaborateCard" persistent>
        <TaskSelector v-if="is_party_a" @select="setCollaborateCard">
            <template #header>
                <q-toolbar class="transparent border-bottom">
                    <q-toolbar-title>
                        选择协作任务
                    </q-toolbar-title>
                    <q-btn flat round dense size="sm" icon="close" @click="openSetCollaborateCard = false" />
                </q-toolbar>                
            </template>
        </TaskSelector>
    </q-dialog>
    </q-scroll-area>
</template>

<script setup>
    import { onMounted, nextTick, ref, computed, watch, watchEffect } from 'vue';
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
    import TalkBtn from './components/TalkBtn.vue'
    import TaskSelector from '../team/components/TaskSelector.vue'

    const $q = useQuasar();
    const router = useRouter();
    const { deal_id } = defineProps(['deal_id']);

    const deal = ref(null);
    const tags = ref([]);

    const tab = ref('jsonContent');
    const deliver_tab = ref('deliver_file');
    const tabs = ref(['jsonContent', 'todogroups', 'party_a_requirements']);
    const findDealFn = async () => {
        const { data } = await findDeal(deal_id);
        deal.value = data;
        if(data.party_b?.id === teamStore.init?.id || data.party_a?.id === teamStore.init?.id){
            tabs.value.includes('party_b_requirements') || tabs.value.push('party_b_requirements');
        }
        if(deal.value?.status === 'progressing' || deal.value?.status === 'reviewing'){
            tabs.value.includes('deliver') || tabs.value.push('deliver');
        }
        if(tabs.value.includes('deliver')){
            tab.value = 'deliver';
        }
        if(deal.value?.deliver_link){
            deliver_tab.value = 'deliver_link';
        }
        tags.value = data.tags;
    }
    const is_party_b = computed(() => deal.value?.party_b?.id === teamStore.init?.id);
    const is_party_a = computed(() => deal.value?.party_a?.id === teamStore.init?.id);
    const is_paied = computed(() => deal.value?.order?.jeepay_order?.state === '2');

    const need_pay = computed(() => !deal.value?.order || deal.value.order.jeepay_order?.state !== '2');
    const need_satrt = computed(() => deal.value?.status === 'deposited');
    const everyone_can_chat = computed(() => !is_party_a.value && (deal.value?.status === 'pending_matching' || deal.value?.status === 'matching'));
    const party_b_can_chat = computed(() => is_party_b.value &&
        (deal.value?.status === 'progressing'
        || deal.value?.status === 'reviewing'
        || deal.value?.status === 'completed')
    );
    const was_processing = computed(() => ['progressing', 'reviewing'].includes(deal.value?.status));
    const was_completed = computed(() => ['completed', 'withdrawn'].includes(deal.value?.status));

    const showFloatChat = ref(false);
    const talkHistory = ref(false);
    const floatChatChannelId = ref(null);
    const unread_count = ref(0);
    const unread_count_map = ref({});
    const d_channels_ids = ref([]);
    const openFloatChat = async () => {
        if(!floatChatChannelId.value) {
            await createDirectFn();
        }
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
        if((deal.value?.party_a?.id !== teamStore.init?.id
            || deal.value?.party_b?.id !== teamStore.init?.id
            || deal.value?.talked_users?.includes(teamStore.init?.id))
        && floatChatChannelId.value) {
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
    })
    watch(deal, async () => {
        if(deal.value){
            await checkUnreadCount();
        }
    },{immediate: true})
    const openChat = async (d_channel_id) => {
        unread_count.value = unread_count.value - unread_count_map.value[d_channel_id];
        unread_count_map.value[d_channel_id] = 0;
        if(unread_count_map.value.length === 0){
            unread_count.value = 0
        }
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
            delete update_params.value.data.party_b_requirements;
            delete update_params.value.data.party_b_attachment;
        }
        await updateDeal(deal_id, update_params.value);
        editMode.value = false;
        syncUpdateParams();
    }
    const openSetCollaborateCard = ref(false);
    const setCollaborateCard = async (card) => {
        await updateDeal(deal_id, { data: { collaborate_card: card.id } });
        openSetCollaborateCard.value = false;
    }
    const startMatch = async () => {
        await updateDeal(deal_id, { data: { status: 'pending_matching' } });
    }
    watchEffect(() => {
        if(deal.value?.status === 'deposited' && deal.value?.order?.jeepay_order?.state === '2'){
            startMatch();
        }
    })
    const setPartyB = async (party_b) => {
        await updateDeal(deal_id, { data: { party_b: party_b.id } });
    }
    const agreeDeal = async () => {
        await updateDeal(deal_id, { data: { agree: true } });
    }
    const delay_date = ref('');
    const delay_reason = ref('');
    const delay_show = ref(false);
    const disable_delay = (delay_item) => {
        if(delay_item.from === 'party_a'){
            return deal.value?.party_b?.id !== teamStore.init?.id;
        }
        if(delay_item.from === 'party_b'){
            return deal.value?.party_a?.id !== teamStore.init?.id;
        }
    }
    const toggleDelay = () => {
        delay_show.value = !delay_show.value;
    }
    function getDelayDateOptions (day) {
        return day >= date.formatDate(deal.value?.deadline, 'YYYY/MM/DD');
    }
    const setDelay = async () => {
        if(!delay_date.value) {
            $q.notify({
                message: '请选择延期日期',
                color: 'red',
                icon: 'mdi-alert-circle',
                position: 'top',
                timeout: 2000,
            });
            return;
        }
        if(!delay_reason.value) {
            $q.notify({
                message: '请输入延期理由',
                color: 'red',
                icon: 'mdi-alert-circle',
                position: 'top',
                timeout: 2000,
            });
            return;
        }
        await updateDeal(deal_id, { data: { delay_date: delay_date.value, delay_reason: delay_reason.value } });
        toggleDelay();
    }
    const acceptDelay = async (delay_id) => {
        await updateDeal(deal_id, { data: { accept_delay_id: delay_id } });
    }

    const deliver_link = ref('');
    const deliverByLink = async () => {
        await updateDeal(deal_id, { data: { deliver_link: deliver_link.value } });
    }
    const deliver_files = ref([]);
    const setDeliverFile = async (file) => {
        deliver_files.value = deal.value?.deliver_files?.map(i => i.id) || [];
        if(file?.id){
            deliver_files.value.push(file.id);
        }
        await updateDeal(deal_id, { data: { deliver_files: deliver_files.value } });
    }
    const downloadDeliverFile = async (file) => {
        const urlObj = new URL(file.url);
        const str = urlObj.pathname.substring(urlObj.pathname.lastIndexOf("/") + 1);
        // 获取文件名
        const filename = decodeURIComponent(str);
        FileSaver.saveAs(file.url, filename);
    }
    const completed_tip = ref(false);
    const completeDeliver = async () => {
        if(!completed_tip.value){
            completed_tip.value = true;
            return;
        }
        await updateDeal(deal_id, { data: { status: 'completed' } });
        completed_tip.value = false;
    }

    watch(
    mm_wsStore,
    async () => {
      // 判断消息类型
      if (mm_wsStore?.event?.event === "posted") {
        let message = JSON.parse(mm_wsStore.event.data.post);
        if(message.message === '') return;
        
        if(deal.value?.party_a?.id === teamStore.init?.id){
            if(!deal.value?.talked_users || deal.value?.talked_users?.length === 0){
                await findDealFn();
                await checkUnreadCount();
            }
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
            } else {
                await findDealFn();
                await checkUnreadCount();
            }
        } else if(!showFloatChat.value){
            unread_count.value++;
        }
      }
    },
    { immediate: true, deep: true }
);
const income = computed(() => teamStore.income);
watch(income, async () => {
    const { data, event } = income.value
    const { deal_id } = data;
    if(event === 'deal:updated' && deal_id === deal.value?.id){
        await findDealFn();
    }
})

const matchingNotify = () => {
    if(deal.value?.status !== 'matching') return;
    console.log('deal', deal.value)
    // 甲方
    // 甲方同意，乙方未同意
    if(is_party_a.value && deal.value?.party_a_accept && !deal.value?.party_b_accept){
        $q.notify({
            message: '您已同意与对方合作，请尽督促对方快阅读合作协议，双方均同意协议内容后，正式进入执行阶段',
            color: 'primary',
            icon: 'mdi-check-circle',
            position: 'top',
            timeout: 2000,
        });
    }
    // 乙方同意，甲方未同意
    if(is_party_a.value && !deal.value?.party_a_accept && deal.value?.party_b_accept){
        $q.notify({
            message: '对方已同意与您合作，请尽快阅读合作协议，补充你的协议内容，双方均同意协议内容后，正式进入执行阶段',
            color: 'primary',
            icon: 'mdi-check-circle',
            position: 'top',
            timeout: 2000,
        });
    }
    // 乙方
    // 甲方同意，乙方未同意
    if(is_party_b.value && deal.value?.party_a_accept && !deal.value?.party_b_accept){
        $q.notify({
            message: '对方已同意与您合作，请尽快阅读合作协议，补充你的协议内容，双方均同意协议内容后，正式进入执行阶段',
            color: 'primary',
            icon: 'mdi-check-circle',
            position: 'top',
            timeout: 2000,
        });
    }
    // 甲方未同意，乙方同意
    if(is_party_b.value && !deal.value?.party_a_accept && deal.value?.party_b_accept){
        $q.notify({
            message: '您已同意与对方合作，请尽督促对方快阅读合作协议，双方均同意协议内容后，正式进入执行阶段',
            color: 'primary',
            icon: 'mdi-check-circle',
            position: 'top',
            timeout: 2000,
        });
    }
}
const isMatching = computed(() => deal.value?.status === 'matching');
watch(isMatching, () => {
    if(isMatching.value){
        matchingNotify();
    }
},{immediate: true})
</script>
