<template>
  <div class="column no-wrap gap-md q-pa-lg">
    <q-input v-model="profile.username" flat square filled type="text" label="用户名">
        <template v-slot:prepend>
          <q-icon name="badge" />
        </template>
    </q-input>
    <q-input v-model="profile.first_name" flat square filled type="text" label="名字">
        <template v-slot:prepend>
          <q-icon name="badge" />
        </template>
    </q-input>
    <q-input v-model="profile.last_name" flat square filled type="text" label="姓氏">
        <template v-slot:prepend>
          <q-icon name="badge" />
        </template>
    </q-input>
    <q-input v-model="profile.nickname" flat square filled type="text" label="昵称">
        <template v-slot:prepend>
          <q-icon name="badge" />
        </template>
    </q-input>
    <q-input v-model="profile.position" flat square filled type="text" label="职称">
        <template v-slot:prepend>
          <q-icon name="assignment_ind" />
        </template>
    </q-input>
    <q-btn color="primary" icon="check" label="确认" class="q-mt-lg" :disable="loading" @click="update" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import localforage from 'localforage'

import { pathMe } from 'src/api/mattermost.js';

const profile = ref({});
const _ = async () => {
    try {
        let res = await localforage.getItem('mm_me');
        if(res) {
            profile.value = res;
console.log(profile.value);
        }
    } catch (error) {
        
    }
}
_();

const loading = ref(false);
const update = async () => {
    loading.value = true;
    let res = await pathMe(profile.value);
    if(res) {
        loading.value = fade;
    }
}
</script>

<style lang="scss" scoped></style>
