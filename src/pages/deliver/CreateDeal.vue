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
                            <DrapUpload :isOSS="true" class="radius-md border-dashed border-xs border-op-sm bg-image-fill"
                                :allowedFormats="['image/jpg','image/jpeg','image/png']"
                                @uploaded="setDealCover" style="min-height: 8rem;"
                                :caption="$t('drop_or_pick_cover')" :maxFileSize="10 * 1024 * 1024"
                            />
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <div class="row items-center gap-sm">
                                <div class="row items-center gap-sm">
                                    <span>交付日期：</span>
                                    <q-icon name="event" size="sm" color="orange" class="cursor-pointer" />
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
                        <q-item-section class="border radius-xs q-pa-sm">
                            <q-item-label class="q-pl-xs q-pt-xs">需求标签</q-item-label>
                            <div class="row items-center q-pb-sm">
                                <q-chip v-for="i in params.data.tags" :key="i" square :label="i" removable @remove="removeTag(i)" />
                                <q-input v-model="tag" type="text" dense class="q-ml-sm" @keyup.enter="addTag" @keyup.esc="tag = ''">
                                    <template v-slot:append>
                                        <q-btn round dense size="sm" icon="mdi-plus" :disable="!tag" @click="addTag" />
                                    </template>
                                </q-input>
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-item>
                        <q-item-section>
                            <q-input v-model="params.data.description" type="textarea" multiline auto-grow borderless
                            class="border radius-xs q-px-md q-pb-sm q-pt-none"
                                label="任务描述" />
                        </q-item-section>
                    </q-item>
                    <q-item class="q-space">
                        <q-item-section>
                            <q-item-label class="q-mt-md q-py-sm">详细需求说明</q-item-label>
                            <TipTap :jsonContent="params.data.jsonContent" :editable="true" :need="'json'" :contentChanged="true"
                                :square="true" :show_toolbar="true" :show_bubbleMenu="true" styleClass="q-px-md q-py-sm"
                                class="q-space border radius-xs" :autofocus="false" @tiptapUpdate="updateJsonContent" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>

            <q-stepper-navigation>
                <q-btn @click="() => { done1 = true; step = 2 }" color="primary" label="下一步" />
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
                <q-btn @click="() => { done2 = true; step = 3 }" color="primary" label="下一步" />
                <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
            </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="补充细节" icon="add_comment" :done="done3">
            <div class="q-space">
                <TipTap :jsonContent="params.data.party_a_requirements" :editable="true" :need="'json'" :contentChanged="true"
                    :square="true" :show_toolbar="true" :show_bubbleMenu="true" styleClass="q-px-md q-py-sm"
                    class="q-space" :autofocus="false" @tiptapUpdate="updatePartyARequirements" />
            </div>

            <q-stepper-navigation>
                <q-btn color="primary" label="确认" @click="createDealFn" />
                <q-btn flat @click="step = 2" color="primary" label="上一步" class="q-ml-sm" />
            </q-stepper-navigation>
        </q-step>
    </q-stepper>
</template>
<script setup>
    import { ref } from 'vue'
    import { createDeal } from 'src/api/strapi'
    import { useQuasar } from 'quasar'
    import { useRouter } from 'vue-router'
    import TipTap from 'src/components/Utilits/tiptap/TipTap.vue'
import DrapUpload from 'src/components/VIewComponents/DrapUpload.vue'

    const $q = useQuasar()
    const router = useRouter()
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
        if(!tag.value) return
        params.value.data.tags.push(tag.value)
        tag.value = ''
    }

    const updateJsonContent = (content) => {
        params.value.data.jsonContent = content
    }
    const updatePartyARequirements = (content) => {
        params.value.data.party_a_requirements = content
    }
    const addTodo = () => {
        params.value.data.todogroups[0].todos.push({
            content: ''
        })
    }
    const removeTodo = (index) => {
        params.value.data.todogroups.splice(index, 1)
    }
    const setDealCover = (file) => {
        if(file?.id){
            params.value.data.cover = file.id
        }
    }
    const createDealFn = async () => {
        if(!params.value.data.amount){
            $q.notify({
                message: '请输入任务金额',
                color: 'red'
            })
            return
        }
        if(!params.value.data.name){
            $q.notify({
                message: '请输入任务名称',
                color: 'red'
            })
            return
        }
        if(!params.value.data.description){
            $q.notify({
                message: '请输入任务描述',
                color: 'red'
            })
            return
        }
        if(!params.value.data.deadline){
            $q.notify({
                message: '请输入交付日期',
                color: 'red'
            })
            return
        }
        if(!params.value.data.todogroups[0].todos.length){
            $q.notify({
                message: '请输入任务需求',
                color: 'red'
            })
            return
        }
        done3.value = true
        console.log(params.value.data)
        params.value.data.amount = params.value.data.amount * 100
        const res = await createDeal(params.value)
        if(res.data){
            $q.notify({
                message: '创建任务成功',
                color: 'green'
            })
            router.push(`/deliver/deal/${res.data.id}`)
        }
        if(res.error){
            $q.notify({
                message: res.error.message,
                color: 'red'
            })
        }
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
