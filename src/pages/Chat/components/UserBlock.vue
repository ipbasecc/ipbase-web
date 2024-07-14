<template>
    <q-item>
      <q-item-section avatar>
        <UserAvatar
            :user_id="userRef.id"
            :size="42"
        />
      </q-item-section>
      <q-item-section>{{ userRef.nickname || userRef.username }}</q-item-section>
    </q-item>
</template>

<script setup>
import { toRef } from "vue";
import UserAvatar from 'src/pages/Chat/components/wigets/UserAvatar.vue'

const props = defineProps({
    user: {
        type: Object,
        default() {
            return {}
        }
    }
})

const userRef = toRef(props,'user');
</script>

<style lang="scss" scoped></style>
