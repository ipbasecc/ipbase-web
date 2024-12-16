<template>
    <q-stepper v-model="step" header-nav ref="stepper" color="primary" animated keep-alive flat
        class="absolute-full transparent no-shadow column no-wrap">
        <q-step :name="1" title="基础信息" icon="settings" :done="done1">
            <div class="q-space">
                <q-list class="fit column no-wrap">
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.name" type="text" label="任务名称" />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.amount" type="number" label="任务金额" />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <div class="row items-center gap-sm">
                                <div class="row items-center gap-sm">
                                    <span>交付日期：</span>
                                    <q-icon name="event" class="cursor-pointer" />
                                    {{ params.data.deadline }}
                                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                                        <q-date
                                            v-model="params.data.deadline"
                                            today-btn
                                            mask="YYYY-MM-DD"
                                            minimal
                                            bordered
                                            v-close-popup
                                        />
                                    </q-popup-proxy>
                                </div>
                                <q-space />
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section class="border radius-xs q-px-sm">
                            <q-item-label class="q-pl-xs q-pt-xs">需求标签</q-item-label>
                            <div class="row items-center">
                                <q-chip v-for="i in params.data.tags" :key="i" square :label="i" removable @remove="removeTag(i)" />
                                <q-input v-model="tag" type="text" borderless class="q-ml-sm" @keyup.enter="addTag" @keyup.esc="tag = ''">
                                    <template v-slot:append>
                                        <q-btn round dense size="sm" icon="mdi-plus" @click="addTag" />
                                    </template>
                                </q-input>
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.description" type="textarea" multiline auto-grow
                                label="任务描述" />
                        </q-item-section>
                    </q-item>
                    <q-item class="q-space">
                        <q-item-section>
                            <q-item-label class="q-mt-md q-py-sm">详细需求说明</q-item-label>
                            <TipTap :jsonContent="params.data.jsonContent" :editable="true" :need="'json'" :contentChanged="true"
                                :square="true" :show_toolbar="true" :show_bubbleMenu="true" styleClass="q-px-md q-py-sm"
                                class="q-space" :autofocus="false" @tiptapUpdate="tiptapUpdate" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>

            <q-stepper-navigation>
                <q-btn @click="() => { done1 = true; step = 2 }" color="primary" label="Continue" />
            </q-stepper-navigation>
        </q-step>

        <q-step :name="2" title="任务要求" caption="Optional" icon="create_new_folder" :done="done2">
            <div class="q-space">
                <q-list bordered class="fit column no-wrap">
                    <q-item v-for="(item, index) in params.data.todogroups[0].todos" :key="index">
                        <q-item-section>
                            <q-input v-model="item.content" type="text" placeholder="请输入任务要求"
                                :autofocus="index === params.data.todogroups[0].todos.length - 1"
                                @keyup.enter="addTodo('keepAdd')"
                            >
                                <template v-if="item.content" v-slot:append>
                                    <q-btn round icon="mdi-minus" @click="removeTodo(index)" />
                                </template>
                            </q-input>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section side>
                            <q-btn round icon="mdi-plus" @click="addTodo" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>

            <q-stepper-navigation>
                <q-btn @click="() => { done2 = true; step = 3 }" color="primary" label="Continue" />
                <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
            </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="补充细节" icon="add_comment" :done="done3">
            <div class="q-space">
                <TipTap :jsonContent="params.data.party_a_requirements" :editable="true" :need="'json'" :contentChanged="true"
                    :square="true" :show_toolbar="true" :show_bubbleMenu="true" styleClass="q-px-md q-py-sm"
                    class="q-space" :autofocus="false" @tiptapUpdate="tiptapUpdate" />
            </div>

            <q-stepper-navigation>
                <q-btn color="primary" label="Finish" @click="createDealFn" />
                <q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
            </q-stepper-navigation>
        </q-step>
    </q-stepper>
</template>
<script setup>
    import { ref } from 'vue'
    import { createDeal } from 'src/api/strapi'
    import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'

    const step = ref(1)
    const done1 = ref(false)
    const done2 = ref(false)
    const done3 = ref(false)

    const params = ref({
        data: {
            name: '',
            amount: NaN,
            description: '',
            todogroups: [{
                name: '初始任务需求',
                todos: []
            }],
            jsonContent: {},
            deadline: '',
            tags: [],
            party_a_attachment: NaN,
            party_b_attachment: NaN,
            party_a_requirements: {},
            party_b_requirements: {},
        }
    })
    const tag = ref('')
    const removeTag = (tag) => {
        params.value.data.tags.splice(tag, 1)
    }
    const addTag = () => {
        params.value.data.tags.push(tag.value)
        tag.value = ''
    }

    const tiptapUpdate = (content) => {
        params.value.data.jsonContent = content
    }
    const addTodo = () => {
        params.value.data.todogroups[0].todos.push({
            content: ''
        })
    }
    const removeTodo = (index) => {
        params.value.data.todogroups.splice(index, 1)
    }
    const createDealFn = async () => {
        done3.value = true
        params.value.data.amount = params.value.data.amount * 100
        console.log(params.value.data)
        const res = await createDeal(params.value)
        console.log(res)
    }
</script>

<style>
    .q-stepper__content {
        flex-grow: 1 !important;
    }

    .q-stepper__step-content {
        width: 100% !important;
        height: 100% !important;
    }

    .q-stepper__step-inner {
        width: 100% !important;
        height: 100% !important;
        display: flex;
        flex-direction: column;
    }
</style>
