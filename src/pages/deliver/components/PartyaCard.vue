<template>
<q-card v-if="deal" bordered
    :flat="!$q.dark.mode" style="min-width: 16rem;"
>
    <q-img
        :src="deal.cover?.url || $ui().no_image_url"
        :ratio="16/9"
        spinner-color="primary"
        spinner-size="82px"
        :class="deal.cover?.url ? '' : 'op-5'"
    >
    <div v-if="deal.description" class="absolute-bottom row no-wrap">
        <section class="q-space column no-wrap gap-sm q-pa-md">
            <div class="text-subtitle2 cursor-pointer" @click="toDeal">{{ deal.description }}</div>
            <div v-if="deal.tags?.length > 0" class="row items-center">
                <q-chip v-for="(tag, index) in deal.tags" :key="index"
                square color="primary" :label="tag"
                :class="index === 0 ? 'q-ml-none' : index === deal.tags.length - 1 ? 'q-mr-none' : ''"
                />
            </div>
        </section>
    </div>
    </q-img>
    <q-card-section>
        <div class="text-h6 cursor-pointer" @click="toDeal">{{ deal.name }}</div>
        <div class="row items-baseline">
            <span class="bg-orange radius-xs border q-px-xs q-mr-xs" style="transform: translateY(-4px);">￥</span>
            <span class="text-h4">{{ deal.amount / 100 }}</span>
        </div>
        <q-item v-if="deal.party_a?.profile" class="q-pa-none cursor-pointer">
            <q-item-section side>
                <UserAvatar
                    :image="deal.party_a?.profile?.avatar?.url"
                    :user_id="deal.party_a?.mm_profile?.id"
                    :size="26"
                    :disable_card="true"
                    :mm_member="deal.party_a?.mm_profile"
                />
            </q-item-section>
            <q-item-section @click="goToStudio">
                <q-item-label>{{ deal.party_a?.profile?.title }}</q-item-label>
            </q-item-section>
        </q-item>
    </q-card-section>
</q-card>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { uiStore } from 'src/hooks/global/useStore.js'
import UserAvatar from "src/pages/team/components/user/UserAvatar.vue";

const router = useRouter()
const {deal} = defineProps(['deal'])
const toDeal = () => {
    router.push(`/deliver/deal/${deal.id}`)
}
const goToStudio = () => {
    console.log('deal', deal)
    router.push(`/studio/${deal.party_a?.id}/works`)
}
</script>