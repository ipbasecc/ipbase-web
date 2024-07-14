<template>
    <div v-if="workStore && workStore.creator && creatorRef && creatorRef.length > 0" class="column no-wrap gap-sm">
        <div class="q-pt-sm font-large font-bold-600">创作者：</div>
        <template v-for="i in creatorRef" :key="i.id">
            <q-card
                bordered
                flat
                :style="i.isExcutor ? 'order: 1' : i.isOwner ? 'order: 5' : 'order: 10'"
                @click.stop="toggleShowmore(i.id)"
                class="cursor-pointer">
                <q-img
                    v-if="i.isExcutor || i.isOwner"
                    :src="i.user.data.attributes.profile?.cover?.data?.attributes.url || defaultCover"
                    :ratio="16/3"
                    spinner-color="primary"
                    spinner-size="22px"
                >
                    <section v-if="i.isExcutor || i.isOwner" class="absolute-full row flex-center transparent q-px-lg">
                        <div class="full-width row no-wrap gap-xs flex-center">
                            <q-space />
                            <q-chip v-if="i.isOwner" dense color="primary" label="所有者" class="q-px-sm q-mx-none text-white" />
                            <q-chip v-if="i.isExcutor" dense color="primary" label="负责人" class="q-px-sm q-mx-none text-white" />
                        </div>
                    </section>
                </q-img>
                <q-card-section class="row no-wrap gap-md">
                    <q-avatar
                        :size="i.isExcutor || i.isOwner ? '64px' : '48px'"
                        @click.stop="toChannel(i)"
                    >
                        <q-img
                            :src="i.user.data.attributes.profile?.avatar?.data?.attributes.url || defaultCover"
                            :ratio="1"
                            spinner-color="primary"
                            spinner-size="22px"
                        />
                            <q-tooltip v-if="i.user.data.attributes.user_channel?.data?.id">
                                访问他的主页
                            </q-tooltip>
                    </q-avatar>
                    <div class="column no-wrap justify-center q-space">
                        <div
                            class="font-medium font-bold-800 row no-wrap gap-xs items-center cursor-pointer"
                            @click.stop="toChannel(i)">
                            <span>
                                {{ i.user.data.attributes.username }}
                                <q-tooltip v-if="i.user.data.attributes.user_channel?.data?.id">
                                    访问他的主页
                                </q-tooltip>
                            </span>
                            <q-chip v-if="i.role" square dense flat color="primary" class="text-white" :label="i.role" />
                        </div>
                        <div v-if="i.user.data.attributes.profile?.title" class="font-small font-bold-400 row no-wrap items-center cursor-pointer">
                            <q-icon size="1rem" color="primary" name="mdi-home" />
                            {{ i.user.data.attributes.profile?.title }}
                        </div>
                        <div
                            v-if="!i.user.data.attributes.profile?.title && i.user.data.attributes.profile?.bio"
                            class="font-small font-bold-400">
                            {{ i.user.data.attributes.profile?.bio }}
                        </div>
                        <div v-if="showMoreTaget.includes(i.id)" class="column no-wrap gap-xs border-top q-pt-md q-mt-md">
                            <span>{{ i.description || '未补充说明信息' }}</span>
                            <span>{{ i.responsibility || '未补充负责内容信息' }}</span>
                        </div>
                    </div>
                </q-card-section>
                <div v-if="i.user.data.attributes.blocked" class="absolute-full flex flex-center blur-xs z-fab">
                    该用户已被封禁！
                </div>
            </q-card>
        </template>
    </div>
</template>
<script setup>
    import { ref, inject, watch } from 'vue';
    import useWorkStore from 'src/stores/work.js';
    import { useRouter } from 'vue-router';
    import useChannelStore from 'src/stores/channel.js';

    const workStore = useWorkStore();
    const channelStore = useChannelStore();

    const router = useRouter();

    const props = defineProps({
        creator: {
            type: Object,
            default(){
                return {}
            }
        },
    });
    const creatorRef = ref();
    watch(workStore,() => {
        if(workStore && workStore.creator) {
            creatorRef.value = workStore.creator;
        }
    },{immediate:true,deep:true})

    const defaultCover = inject('defaultCover');
    const showMoreTaget = ref([]);
    const toggleShowmore = (val) => {
        if(showMoreTaget.value.includes(val)){
            var index = showMoreTaget.value.indexOf(val);
            if (index > -1) {
                showMoreTaget.value.splice(index, 1);
            }
        } else {
            showMoreTaget.value.push(val)
        }
    }
    const toChannel = (i) => {
        if(i.user.data.attributes.user_channel.data?.id) {
            let user_channel_id = i.user.data.attributes.user_channel.data?.id;
            // channelStore.channel_ownerId = user_channel_id;
            // channelStore.needRefetch = true;
            router.push(`/${user_channel_id}`);
        }
    }
</script>
<style>
.creator-card-warpper {
    flex: 0 0 348px;
}
.creator-card {
    flex: 0 0 260px;
}
</style>
