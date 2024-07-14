<template>
    <!-- 编辑创作人员在本作品的资料 -->
    <div
        class="q-pa-lg column no-wrap gap-sm"
        :class="$q.dark.mode ? 'bg-grey-9' : 'bg-grey-3'"
        style="flex: 0 0 380px;"
    >{{ makerParams }}
    <!-- 创作人员 -->
    <q-toolbar class="transparent">
        <span class="q-pr-sm">添加创作人:</span>
        <!-- 头像 -->
        <template v-if="makersBySelected">
            <template
                v-for="(i,index) in makersBySelected"
                :key="index"
            >
                <span class="cursor-pointer q-mx-xs" @click="editMaker(i.id)">
                    <AvatarCircle :size="34" :attributes="i.attributes" />
                </span>
            </template>
        </template>
        <!-- 添加 -->
        <q-btn dense round flat icon="mdi-plus" class="border">
            <q-menu v-if="store && store.userMatedate" v-model="addingMaker">
                <q-list style="min-width: 100px" class="q-pa-xs">
                <q-item class="q-pa-none">
                    <q-item-section>
                        <q-input
                        v-model="userIdBylazyQuerying"
                        dense
                        square
                        filled
                        type="text"
                        label="用户ID"
                        bottom-slots
                        >
                        <template v-slot:hint>
                            输入用户ID后等待...
                            <q-icon name="mdi-help-circle">
                            <q-tooltip class="transparent font-small shadow-0">
                                <q-card bordered style="max-width: 260px;" :class="$q.dark.mode ? 'bg-grey-2' : 'bg-grey-9'">
                                <q-card-section>
                                    <ul class="q-pl-lg q-py-xs">
                                    <li>输入用户ID后等待片刻，后台将查询用户</li>
                                    <li>如果下方出现了用户头像，你可以点击选择你的联合创作人</li>
                                    <li>如果没有，说明当前ID错误，没有所有者</li>
                                    </ul>
                                </q-card-section>
                                </q-card>
                            </q-tooltip>
                            </q-icon>
                        </template>
                        </q-input>
                    </q-item-section>
                </q-item>
                <q-separator spaced />
                <q-item
                    v-if="!makersIdsBySelected.includes(store.userId)"
                    clickable
                    v-close-popup
                    @click="attachMaker(store.userId,store.userMatedate.usersPermissionsUser)"
                >
                    <q-item-section avatar>
                        <AvatarCircle :size="34" :attributes="store.me" />
                    </q-item-section>
                    <q-item-section>我自己</q-item-section>
                </q-item>
                <q-item
                    v-if="userIdBylazyQuerying && userMatedataByQueryed"
                    clickable
                    v-close-popup
                    @click="attachMaker(userMatedataByQueryed.data.id,userMatedataByQueryed)"
                >
                    <q-item-section avatar>
                        <AvatarCircle :size="34" :attributes="userMatedataByQueryed.data.attributes" />
                    </q-item-section>
                <q-item-section>{{ userMatedataByQueryed.data.attributes.username }}</q-item-section>
                </q-item>
                </q-list>
            </q-menu>
        </q-btn>
    </q-toolbar>
    <template v-if="makersRef && makersRef.length > 0">
        <q-card
        bordered flat
        class="fit"
        >
        <template v-if="indexOfmotifyMaker">
            <template v-for="i in makersRef" :key="i.id">
                <template v-if="i.user.data.id === indexOfmotifyMaker">
                    <q-responsive
                        :ratio="4"
                        :style="`background-image: url(${
                            makersBySelected.find((item) => item.id === indexOfmotifyMaker).attributes.profile?.cover?.data?.attributes?.url ?
                            makersBySelected.find((item) => item.id === indexOfmotifyMaker).attributes.profile?.cover?.data?.attributes?.url :
                            defaultCover
                        });
                            background-size: cover;
                            background-repeat: no-repeat;`"
                    >
                        <div class="fit flex flex-center">
                            <AvatarCircle :size="128" :attributes="makersBySelected.find((item) => item.id === indexOfmotifyMaker).attributes" />
                        </div>
                    </q-responsive>
                    <div class="q-px-md q-py-lg">
                        <q-card-section class="q-py-sm">
                            <q-input
                                v-model="i.title"
                                square
                                filled
                                hide-bottom-space
                                type="text"
                                label="创作者称谓"
                            />
                        </q-card-section>
                        <q-card-section class="q-py-sm">
                            <q-input
                                v-model="i.role"
                                square
                                filled
                                hide-bottom-space
                                type="text"
                                label="在本作品创作中的角色"
                            />
                        </q-card-section>
                        <q-card-section class="q-py-sm">
                            <q-input
                                v-model="i.responsibility"
                                square
                                filled
                                autogrow
                                hide-bottom-space
                                type="text"
                                label="在本作品创作中的负责内容"
                            />
                        </q-card-section>
                        <q-card-section class="q-py-sm">
                            <q-input
                                v-model="i.description"
                                square
                                filled
                                hide-bottom-space
                                type="textarea"
                                label="更多详细说明"
                            />
                        </q-card-section>
                        <q-card-section class="q-py-sm">
                        <q-toggle v-model="i.isOwner" dense size="sm" left-label label="是作品所有者"/>
                        </q-card-section>
                        <q-card-section class="q-py-sm">
                            <q-toggle v-model="i.isExcutor" dense size="sm" left-label label="是作品责任人"/>
                        </q-card-section>
                    </div>
                    <q-card-section class="row border-top">
                        <q-space />
                        <q-btn dense padding="xs md" unelevated rounded color="primary" icon="remove" label="移除当前创作人员" @click="removeMaker(i.id,indexOfmotifyMaker)" />
                    </q-card-section>
                </template>
            </template>
        </template>
        <q-card-section v-else class="fit flex flex-center op-5">
            点击创作者头像编辑资料
        </q-card-section>
        </q-card>
    </template>
    <q-card v-else bordered flat class="fit flex flex-center">
        <q-card-section>
        <q-btn flat color="primary" icon="mdi-account-multiple-plus" label="添加创作者" @click="addingMaker = true" />
        </q-card-section>
    </q-card>
    </div>
</template>

<script setup>
import { ref, toRef, watch } from "vue";
import { FindUserMatedate } from "src/apollo/api/api.js";
import AvatarCircle from 'src/components/VIewComponents/AvatarCircle.vue';

const props = defineProps({
    makers: {
        type: Array,
        default() {
            return []
        }
    }
});
const emit = defineEmits(['conformMakers']);

const makersProps = toRef(props,'makers')
const makersRef = ref(makersProps.value);

const userIdBylazyQuerying = ref(); // 用户输入创作者ID后，延时600ms后查询是否有用户
const userMatedataByQueryed = ref(); // 延时查询查到的用户，此时展示在下拉菜单等待用户点击选择
const makersBySelected = ref(Array.isArray(makersRef.value) && makersRef.value.map(i => i.user.data)) || []; // 延时查询到后，用户点击选择，将选中的用户数据使用attachMaker方法push到此处
const makersIdsBySelected = ref(Array.isArray(makersRef.value) && makersRef.value.map(i => i.user.data?.id)) || []; // 所有添加好的创作者的id集合, 延时查询到后，用户点击选择，将选中的用户数据使用attachMaker方法push到此处


import useUserStore from "src/stores/user.js";
const store = useUserStore();

const addingMaker = ref(false);

const makerParams = ref();
watch(makersRef, () => {
    makerParams.value = makersRef.value.map(i => ({
        title: i.title,
        role: i.role,
        responsibility: i.responsibility,
        isOwner: i.isOwner,
        isExcutor: i.isExcutor,
        description: i.description,
        user: i.user.data?.id
    }))
},{immediate:true,deep:true});

const pushMakerToParams = (matedate) => {
    makersRef.value.push({
        title: '',
        role: '',
        responsibility: '',
        isOwner: false,
        isExcutor: false,
        description: '',
        user: matedate
    })
}
const attachMaker = (val,matedate) => {
    pushMakerToParams(matedate);
    makersIdsBySelected.value.push(val);
    makersBySelected.value.push(matedate.data)
    userIdBylazyQuerying.value = null;
}

const removeMaker = (parmasId,userId) => {
    makersRef.value = makersRef.value.filter(i => i.id !== parmasId);
    makersBySelected.value = makersBySelected.value.filter(i => i.id !== userId);
    makersIdsBySelected.value = makersIdsBySelected.value.filter(i => i !== userId);
}

const lazyQueryUserMatedata = async (val) => {
  const parmas = {userId: val};
    const {loading, error, result } = FindUserMatedate(parmas);
    watch(result, () => {
        if(result.value) {
            console.log('查到了数据',result.value);
            userMatedataByQueryed.value = result.value.usersPermissionsUser
        }
    },{deep:true})
}
watch(userIdBylazyQuerying,(newVal) => {
    console.log('newVal',newVal);
    if(newVal) {
        setTimeout(() => {
            lazyQueryUserMatedata(newVal)
        }, 600);
    } else {
      userMatedataByQueryed.value = ''
    }
},{deep:true});

const indexOfmotifyMaker = ref();
const editMaker = (val) => {
  indexOfmotifyMaker.value = indexOfmotifyMaker.value === val ? null : val
};

watch(makerParams, () => {
    emit('conformMakers',makerParams);
},{immediate:true,deep:true});

const conformMakers = () => {
    // emit('conformMakers',makerParams);
}
</script>

<style lang="scss" scoped></style>
