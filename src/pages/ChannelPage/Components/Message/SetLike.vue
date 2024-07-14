<template>
    <q-btn dense flat round :icon="isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'" @click="setLiked" style="transform: translateY(-5px);">
        <q-badge v-if="liked_countRef" floating>{{ liked_countRef }}</q-badge>
    </q-btn>
    <div style="transform: translateY(5px);">
        <q-btn dense size="sm" flat round :icon="isUnliked ? 'mdi-thumb-down' : 'mdi-thumb-down-outline'" @click="setUnliked">
            <!-- <q-badge v-if="itemRef.attributes.unliked_count" floating>{{ itemRef.attributes.unliked_count }}</q-badge> -->
        </q-btn>
    </div>
</template>
<script setup>
    import { ref, toRef, watch } from "vue";
    import { useQuasar, Notify } from 'quasar';
    import { api } from 'boot/axios'
    import useUserStore from 'src/stores/user.js';
    const userStore = useUserStore();

    const $q = useQuasar();
    const props = defineProps({
        msgId: {
            type: String,
            default: ''
        },
        item: {
            type: Object,
            default () {
                return {};
            }
        }
    });
    const msgIdRef = toRef(props,'msgId');
    const itemRef = toRef(props,'item');

    const isLiked = ref(
        Array.isArray(itemRef.value.attributes.liked_by?.data) &&
        itemRef.value.attributes.liked_by.data.length > 0 &&
        itemRef.value.attributes.liked_by.data.map(i => i.id).includes(userStore.userId)
        ? true
        : false
    );
    const isUnliked = ref(
        Array.isArray(itemRef.value.attributes.unliked_by?.data) &&
        itemRef.value.attributes.unliked_by.data.length > 0 &&
        itemRef.value.attributes.unliked_by.data.map(i => i.id).includes(userStore.userId)
        ? true
        : false
    );
    const liked_countRef = ref(itemRef.value.attributes.liked_count);
    const unliked_countRef = ref(itemRef.value.attributes.unliked_count);
const Rsps = ref();
const setLiked = async (id) => {
    if(!userStore.logged) {
        $q.notify('请登录侯再“点踩”');
        return
    };
    if(isUnliked.value) {
        $q.notify('您踩过此内容，如果要点赞，请再次点“踩”取消你的“踩”之后，再点“赞”');
        return
    }

    try {
        const response = await api.put(
            `messages/${msgIdRef.value}/like`,
            {
                user_id: Number(userStore.userId),
                message_id: Number(msgIdRef.value)
            }, // 此处有大坑，id不知为何类型是String，后端需要的是Number
        );
        if(response) {
            console.log('后端设置成功，开始更新客户端数据',response);
            Rsps.value = response.data;
            if(response.data === 'is_unliked') {
                $q.notify('您踩过此内容，如果要点赞，请再次点“踩”取消你的“踩”之后，再点“赞”');
                isLiked.value = false
            } else {
                liked_countRef.value = response.data.new_liked_count;
                isLiked.value = !isLiked.value
            }
        }
    } catch (error) {
        console.error(error);
        if (response.error.status === 403) {
            $q.notify('您无权进行该操作');
            return
        }
    }
}
const setUnliked = async (id) => {
    if(!userStore.logged) {
        $q.notify('请登录侯再“点踩”');
        return
    };
    if(isLiked.value) {
        $q.notify('您赞过此内容，如果要点踩，请再次点“赞”取消你的“赞”之后，再点“踩”');
        return
    }

    try {
        const response = await api.put(
            `messages/${msgIdRef.value}/unlike`,
            {
                user_id: Number(userStore.userId),
                message_id: Number(msgIdRef.value)
            }, // 此处有大坑，id不知为何类型是String，后端需要的是Number
        );
        if(response) {
            console.log('后端设置成功，开始更新客户端数据',response);
            if(response.data === 'is_liked') {
                $q.notify('您赞过此内容，如果要点踩，请再次点“赞”取消你的“赞”之后，再点“踩”');
                isUnliked.value = false
            } else {
                unliked_countRef.value = response.data?.new_unliked_count;
                isUnliked.value = !isUnliked.value
            }
        }
    } catch (error) {
        console.error(error);
        if (response.error.status === 403) {
            $q.notify('您无权进行该操作');
            return
        }
    }
}
</script>
