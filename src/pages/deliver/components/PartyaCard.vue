<template>
<q-card v-if="deal" bordered
    :flat="!$q.dark.mode" style="min-width: 16rem;"
>
    <q-img
        :src="deal.cover?.url || uiStore.no_image_url"
        :ratio="16/9"
        spinner-color="primary"
        spinner-size="82px"
        :class="deal.cover?.url ? '' : 'op-5'"
    >
    <div v-if="deal.description" class="column no-wrap gap-sm absolute-bottom">
        <div class="text-subtitle2 cursor-pointer q-pa-md" @click="toDeal">{{ deal.description }}</div>
        <div v-if="deal.tags?.length > 0" class="row items-center">
            <q-chip v-for="(tag, index) in deal.tags" :key="index"
            square color="primary" :label="tag"
            :class="index === 0 ? 'q-ml-none' : index === deal.tags.length - 1 ? 'q-mr-none' : ''"
            />
        </div>
    </div>
    </q-img>
    <q-card-section class="cursor-pointer" >
        <q-item v-if="deal.party_a?.profile" class="q-pa-none">
            <q-item-section side>
                <UserAvatar
                    :image="deal.party_a?.profile?.avatar?.url"
                    :user_id="deal.party_a?.mm_profile?.id"
                    :size="32"
                    :disable_cardRef="true"
                    :mm_member="deal.party_a?.mm_profile"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label>{{ deal.party_a?.profile?.title }}</q-item-label>
            </q-item-section>
        </q-item>
        <div class="text-h6 cursor-pointer" @click="toDeal">{{ deal.name }}</div>
        <div class="row items-center">
            <span>￥：</span>
            <span class="text-h4">{{ deal.amount / 100 }}</span>
        </div>
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
</script>
