<template>
    <div style="min-width: 640px;">
        <q-card bordered>
            <q-card-section class="row no-wrap items-center gap-sm q-py-sm q-pr-sm border-bottom">
                <span>团队设置</span>
                <q-space />
                <q-btn flat dense size="sm" round icon="close" v-close-popup />
            </q-card-section>
            <q-card-section class="column no-wrap gap-md">
                <q-expansion-item
                    icon="perm_identity"
                    label="名称"
                    caption="修改团队的显示名称"
                    :content-inset-level="1"
                    default-opened
                >
                    <div class="q-pa-md q-pl-none column gap-sm">
                        <q-input v-model="parmars.display_name" square filled dense type="text" placeholder="显示名称" />
                        <div v-if="parmars.display_name != teamRef.display_name" class="row no-wrap gap-sm">
                            <q-btn flat dense label="取消" @click="parmars.display_name = teamRef.display_name" />
                            <q-btn flat dense label="确认" @click="patch({display_name: parmars.display_name})" />
                        </div>
                    </div>
                </q-expansion-item>
                <q-expansion-item
                    icon="perm_identity"
                    label="团队简介"
                    :content-inset-level="1"
                    default-opened
                >
                    <div class="q-pa-md q-pl-none column gap-sm">
                        <q-input v-model="parmars.description" square filled dense type="text" placeholder="团队简介" />
                        <div v-if="parmars.description != teamRef.description" class="row no-wrap gap-sm">
                            <q-btn flat dense label="取消" @click="parmars.description = teamRef.description" />
                            <q-btn flat dense label="确认" @click="patch({description: parmars.description})" />
                        </div>
                    </div>
                </q-expansion-item>
                <q-expansion-item
                    icon="perm_identity"
                    label="公司名称"
                    :content-inset-level="1"
                    default-opened
                >
                    <div class="q-pa-md q-pl-none column gap-sm">
                        <q-input v-model="parmars.company_name" square filled dense type="text" placeholder="公司名称" />
                        <div v-if="parmars.company_name != teamRef.company_name" class="row no-wrap gap-sm">
                            <q-btn flat dense label="取消" @click="parmars.company_name = teamRef.company_name" />
                            <q-btn flat dense label="确认" @click="patch({company_name: parmars.company_name})" />
                        </div>
                    </div>
                </q-expansion-item>
                <q-expansion-item
                    icon="perm_identity"
                    label="限制仅指定域名的邮箱允许加入"
                    :content-inset-level="1"
                    default-opened
                >
                    <div class="q-pa-md q-pl-none column gap-sm">
                        <q-input v-model="parmars.allowed_domains" square filled dense type="text" placeholder="输入指定域名" />
                        <div v-if="parmars.allowed_domains != teamRef.allowed_domains" class="row no-wrap gap-sm">
                            <q-btn flat dense label="取消" @click="parmars.allowed_domains = teamRef.allowed_domains" />
                            <q-btn flat dense label="确认" @click="patch({allowed_domains: parmars.allowed_domains})" />
                        </div>
                    </div>
                </q-expansion-item>
                <q-expansion-item
                    icon="perm_identity"
                    label="团队类型"
                    caption="是否允许任何在本服务器上的用户加入此团队"
                    :content-inset-level="1"
                    default-opened
                >
                    <div class="q-pa-md q-pl-none column gap-sm">
                        <div class="row no-wrap gap-lg full-width q-pa-md">
                            <div class="radius-sm border-sm border-solid q-space" :class="parmars.allow_open_invite ? 'border-primary' : 'border-op-full'">
                                <q-item clickable @click="parmars.allow_open_invite = true,patch({allow_open_invite: parmars.allow_open_invite})" class="radius-sm q-space">
                                    <q-item-section avatar>
                                        <q-avatar icon="public" />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>公开团队</q-item-label>
                                        <q-item-label caption lines="1">所有成员均可加入</q-item-label>
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-icon
                                            :name="parmars.allow_open_invite ? 'task_alt' : 'radio_button_unchecked'"
                                            :color="parmars.allow_open_invite ? 'green' : 'grey-3'"
                                        />
                                    </q-item-section>
                                </q-item>
                            </div>
                            <div class="radius-sm border-sm border-solid q-space" :class="!parmars.allow_open_invite ? 'border-primary' : 'border-op-full'">
                                <q-item clickable @click="parmars.allow_open_invite = false,patch({allow_open_invite: parmars.allow_open_invite})" class="radius-sm q-space">
                                    <q-item-section avatar>
                                        <q-avatar icon="lock_open" />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>私有团队</q-item-label>
                                        <q-item-label caption lines="1">仅限邀请加入</q-item-label>
                                    </q-item-section>
                                    <q-item-section side>
                                        <q-icon
                                            :name="!parmars.allow_open_invite ? 'task_alt' : 'radio_button_unchecked'"
                                            :color="!parmars.allow_open_invite ? 'green' : 'grey-3'"
                                        />
                                    </q-item-section>
                                </q-item>
                            </div>
                        </div>
                    </div>
                </q-expansion-item>
            </q-card-section>
            <q-card-section class="row no-wrap items-center gap-sm q-pa-sm border-top">
                <q-btn dense padding="xs md" color="primary" label="返回" v-close-popup />
            </q-card-section>
        </q-card>
    </div>
</template>
  
<script setup>
    import { ref, toRef } from "vue"
    import { patchTeam } from 'src/api/mattermost.js';

    const props = defineProps({
        team: {
            type: Object,
            default() {
                return {}
            }
        }
    });

    const teamRef = toRef(props, "team");

    const parmars = ref(
        {
            display_name: teamRef.value.display_name,
            description: teamRef.value.description,
            type: teamRef.value.type,
            company_name: teamRef.value.company_name,
            allowed_domains: teamRef.value.allowed_domains,
        }
    )
    const team_types = [
        { name: '是', val: 'O' },
        { name: '否', val: 'I' }
    ]
    const type = ref('I');

    const res_info = ref();
    const patch = async (parmars) => {
        let res = await patchTeam(teamRef.value.id,parmars);
        if(res) {
            res_info.value = res;
        }
    }
    const step = ref(1)
</script>
  
<style lang="scss" scoped></style>
  