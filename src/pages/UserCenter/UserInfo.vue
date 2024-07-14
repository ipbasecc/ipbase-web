<template>
    <div class="absolute-full overflow-hidden row justify-center" style="padding-top: 68px;">
        <div class="fit row no-wrap gap-sm q-py-md">
            <q-list v-if="route" class="usercenter_navlist full-height q-pa-md border-right">
                <template
                    v-for="(i,index) in userinfoItems"
                    :key="index"
                    >
                    <q-expansion-item
                        v-if="i.children"
                        :default-opened="i.children.map((i) => i.val).includes(active)"
                        :icon="i.icon"
                        :label="i.name"
                        header-class="radius-sm q-mb-xs"
                        :content-inset-level="0.5"
                    >
                        <q-item v-for="(i,index) in i.children" :key="index" clickable v-ripple
                            class="radius-sm q-mb-xs"
                            :class="active === i.val ? 'active-listitem text-white' : ''"
                            @click="setSection(i.val)"
                        >
                            <q-item-section avatar>
                                <q-icon :name="i.icon" />
                            </q-item-section>
                            <q-item-section>{{ i.name }}</q-item-section>
                        </q-item>
                    </q-expansion-item>
                    <q-item v-else clickable v-ripple
                        class="radius-sm q-mb-xs"
                        :class="active === i.val ? 'active-listitem text-white' : ''"
                        @click="setSection(i.val)"
                    >
                        <q-item-section avatar>
                            <q-icon :name="i.icon" />
                        </q-item-section>
                        <q-item-section>{{ i.name }}</q-item-section>
                    </q-item>
                </template>
            </q-list>
            <div class="column no-wrap items-center q-space userinfo scroll">
                <RouterView :key="active" />
            </div>
        </div>
    </div>
</template>
<script setup>
    import { onMounted, ref } from "vue";
    import { useRouter, useRoute } from "vue-router";
    const userinfoItems = ref([
        {name: '微名片', icon: 'recent_actors', val: 'bizcard'},
        {
            name: '内容管理',
            icon: 'edit_document',
            val: 'documents',
            children: [
                {name: '文章管理', icon: 'receipt_long', val: 'article'},
                {name: '视频管理', icon: 'receipt_long', val: 'video'},
                {name: '音频管理', icon: 'receipt_long', val: 'audio'},
            ]
        },
        {
            name: '设置',
            icon: 'tune',
            val: 'settings',
            children: [
                {name: '用户资料', icon: 'account_circle', val: 'basicinfo'},
                {name: '频道设置', icon: 'tune', val: 'settings'},
            ]
        },
    ]);

    const router = useRouter();
    const route = useRoute();
    const active = ref(route && route.meta.type || route.name);
    const setSection = (val) => {
        active.value = val;
        router.push(`/userinfo/${val}`)
    }
    onMounted(() => {
        if(!active.value) {
            setSection(userinfoItems.value[0].val)
        }
    })
</script>
<style>
.usercenter_navlist {
    flex: 0 0 16rem;
}
</style>
