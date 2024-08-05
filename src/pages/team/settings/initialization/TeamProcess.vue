<template>
    <div class="row q-space gap-md">
        <div class="column no-wrap gap-sm justify-end">
            <span class="font-large">您可以在团队中创建讨论频道、协作项目！</span>
            <q-form
                v-if="initMode === 'create_team'"
                @submit="createTeam()"
                class="q-gutter-md"
            >
                <q-input
                    filled
                    v-model="team.name"
                    label="Your name *"
                    hint="Name and surname"
                    lazy-rules
                    :rules="[ val => val && val.length > 0 || 'Please type something']"
                />

                <q-input
                    filled
                    type="textarea"
                    v-model="team.introduce"
                    label="introduce *"
                    lazy-rules
                    :rules="[
                    val => val !== null && val !== '' || 'Please type introduce'
                    ]"
                />

                <template v-for="i in modes" :key="i.value">
                    <q-radio v-model="team.config.mode" :val="i.value" :label="$t(i.label)" @update:model-value="syncParams()">
                    <q-tooltip v-if="i.value === 'toOne'">
                        {{ $t('team_toOne_mode_tip') }}
                    </q-tooltip>
                    </q-radio>
                </template>

                <div>
                    <q-btn label="创建团队" size="lg" padding="sm xl" type="submit" color="primary"/>
                    <q-btn label="加入团队" size="lg" padding="sm xl" color="primary" flat class="q-ml-sm" @click="initMode = 'join_team'" />
                </div>
            </q-form>
            <q-form
                v-if="initMode === 'join_team'"
                @submit="joinTeam()"
                class="q-gutter-md"
            >
                <q-input
                    filled
                    v-model="team.name"
                    label="Your name *"
                    hint="Name and surname"
                    lazy-rules
                    :rules="[ val => val && val.length > 0 || 'Please type something']"
                />
                <div>
                    <q-btn label="加入团队" size="lg" padding="sm xl" type="submit" color="primary" />
                    <q-btn label="创建团队" size="lg" padding="sm xl" color="primary" flat class="q-ml-sm" @click="initMode = 'create_team'" />
                </div>
            </q-form>
        </div>
        <div class="column flex-center col">
            <div class="text-h5 q-mb-md">Create a new user</div>
            <div class="text-subtitle1">This is the first step</div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['teamInitialized'])

const team = ref({
    name: '',
    introduce: '',
    config: {
        mode: 'toMany',
        disabled: []
    }
})
const modes = [
  {
    label: "toManyMode_team",
    value: "toMany",
  },
  {
    label: "toOneMode_team",
    value: "toOne",
  },
]
const initMode = ref('create_team');
const createTeam = async () => {    
    emit('teamInitialized')
}
const joinTeam = async () => {    
    emit('teamInitialized')
}
</script>

<style scoped>
</style>