<template>
    <div class="absolute-full column flex-center">
        <q-toolbar class="transparent gap-md">
            <q-btn round dense size="sm" flat icon="chevron_left" @click="$router.go(-1)" />
            <div class="text-h6">创建一个团队</div>
        </q-toolbar>
        <div v-if="!created" class="q-space column flex-center gap-xl" style="min-width: 50vw;">
            <div class="full-width column items-start gap-md">
                <q-img
                    src="../../../../../public/logo.png"
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="82px"
                    width="8rem"
                    height="8rem"
                />
                <span class="font-xx-large font-bold-600">创建你的团队</span>
            </div>
            <q-stepper
                v-model="step"
                vertical
                color="primary"
                animated
                flat
                class="full-width transparent shadow-0"
            >
            <q-step
                :name="1"
                title="名称缩写"
                icon="settings"
                caption="由英文、数字、连接线组成的缩写，例如“易乎APP”，可以缩写为：“yihu”"
                :done="step > 1"
            >
                <q-input v-model="parmars.name" type="text" label="用于快速访问的短名" />
                <q-stepper-navigation>
                <q-btn @click="step = 2" dense color="primary" label="下一步" padding="xs md" />
                </q-stepper-navigation>
            </q-step>

            <q-step
                :name="2"
                title="团队名称"
                caption="输入你的团队正式名称、会在页面上向成员展示"
                icon="create_new_folder"
                :done="step > 2"
            >
                <q-input v-model="parmars.display_name" type="text" label="团队的正式名称" />
                <q-stepper-navigation>
                    <q-btn @click="step = 3" color="primary" label="下一步" padding="xs md" />
                    <q-btn flat @click="step = 1" dense color="primary" label="上一步" padding="xs md" class="q-ml-sm" />
                </q-stepper-navigation>
            </q-step>
            <q-step
                :name="3"
                title="选择团队类型"
                caption="请按照需要选择团队的隐私类型"
                icon="create_new_folder"
                :done="step > 3"
            >
                    <q-radio
                        v-for="i in team_types"
                        :key="i.val"
                        v-model="type"
                        :val="i.val"
                        :label="i.name"
                    />
                <q-stepper-navigation>
                <q-btn @click="step = 4" color="primary" padding="xs md" label="下一步" />
                <q-btn flat @click="step = 1" dense color="primary" padding="xs md" label="上一步" class="q-ml-sm" />
                </q-stepper-navigation>
            </q-step>

            <q-step
                :name="4"
                title="完成创建"
                icon="add_comment"
            >
                <q-stepper-navigation>
                    <q-btn color="primary" padding="xs md" dense label="创建" @click="create" class="q-mr-md" />
                    <q-btn flat @click="step = 1" padding="xs md" dense label="返回" class="q-ml-sm" />
                </q-stepper-navigation>
            </q-step>
            </q-stepper>
        </div>
        <div v-else class="q-space column flex-center gap-xl" style="min-width: 50vw;">
            <q-card bordered>
                <q-card-section>
                    创建成功，请稍候...
                </q-card-section>
            </q-card>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue"
  import { createTeam } from 'src/api/mattermost.js';
  import { useRouter } from "vue-router";

  const router = useRouter();
  const parmars = ref(
    {
        name: '',
        display_name: '',
        type: 'I'
    }
  )
  const team_types = [
    { name: '公开团队', val: 'O' },
    { name: '私有团队', val: 'I' }
  ]
  const type = ref('I');

  const created = ref(false);
  const res_info = ref();
  const create = async () => {
    let res = await createTeam(parmars.value);
    if(res) {
        res_info.value = res;
        created.value = true;
        router.push('/chat')
    }
  }
  const step = ref(1)
  </script>
  
  <style lang="scss" scoped></style>
  