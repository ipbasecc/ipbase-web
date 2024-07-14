<template>
    <div class="row items-center no-wrap gap-xs cursor-pointer" @click.stop="setLiked()">
        <q-icon :name="isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'" />
        {{ liked_countRef }}
    </div>
    ·
    <div class="row items-center no-wrap gap-xs cursor-pointer" @click.stop="setUnliked()">
        <q-icon :name="isUnliked ? 'mdi-thumb-down' : 'mdi-thumb-down-outline'" />
        {{ unliked_countRef }}
    </div>
</template>
<script setup>
import { ref, toRef, watch, watchEffect } from 'vue'
import { api } from 'boot/axios'
import useUserStore from "src/stores/user.js";
import { useQuasar } from 'quasar'
const $q = useQuasar()

const props = defineProps({
    liked_count: {
        type: Number,
        default: 0
    },
    unliked_count: {
        type: Number,
        default: 0
    },
    elementid: {
        type: String,
        required: true
    },
    element: {
        type: Object,
        default () {
            return
        }
    },
});
const liked_countRef = ref(toRef(props,'liked_count').value);
const unliked_countRef = ref(toRef(props,'unliked_count').value);
const elementidRef = toRef(props,'elementid');
const elementRef = toRef(props,'element');

const userStore = useUserStore();
const isLiked = ref(elementRef.value.liked_by.data.length > 0);
const isUnliked = ref(elementRef.value.unliked_by.data.length > 0);
const logged = ref();

watchEffect(() => {
    logged.value = userStore.logged;
})

const setLiked = async () => {
    if(!logged.value) { 
        $q.notify('请登录侯再“点踩”');
        return
    };
    if(isUnliked.value) {
        $q.notify('您踩过此内容，如果要点赞，请再次点“踩”取消你的“踩”之后，再点“赞”');
        return
    }

    try {
        const response = await api.put(`elements/${elementidRef.value}/like`);
        if(response) {
            console.log('后端设置成功，开始更新客户端数据',response);
            if(response.data == 'is_unliked') {
                $q.notify('您踩过此内容，如果要点赞，请再次点“踩”取消你的“踩”之后，再点“赞”');
                isLiked.value = false
            } else {
                liked_countRef.value = response.data?.new_liked_count;
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
const setUnliked = async () => {
    if(!logged.value) { 
        $q.notify('请登录侯再“点踩”');
        return
    };
    if(isLiked.value) {
        $q.notify('您赞过此内容，如果要点踩，请再次点“赞”取消你的“赞”之后，再点“踩”');
        return
    }

    try {
        const response = await api.put(`elements/${elementidRef.value}/unlike`);
        if(response) {
            console.log('后端设置成功，开始更新客户端数据',response);
            if(response.data == 'is_liked') {
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