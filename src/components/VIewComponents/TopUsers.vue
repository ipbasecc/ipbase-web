<template>
  <q-list v-if="users">
    <q-item
        v-for="i in users" :key="i.id"
        :clickable="i.attributes.user_channel?.data?.id && true || false"
        v-ripple
        class="radius-xs hovered-item"
    >
        <OwnerCard :userData="i.attributes" :userId="i.id" :cardType="`user_card`" />
        <q-tooltip v-if="!i.attributes.user_channel?.data?.id">
            {{ $t('user_have_no_channel') }}
        </q-tooltip>
    </q-item>
  </q-list>
</template>

<script setup>
import {findUsers} from "src/apollo/api/api.js";
import {ref, watch} from "vue"
import OwnerCard from "src/components/VIewComponents/CardContainer/UserMaincard.vue"

const findUsersParams = ref({
    pagination: {
        page: 1,
        pageSize: 6,
    },
    sort: null,
});

const users = ref()

const { loading: ling, error, result, refetch, fetchMore } = findUsers(
  findUsersParams.value
);
watch(
  result,
  () => {
    users.value = result.value?.usersPermissionsUsers.data;
  },
  { immediate: true, deep: true }
);

// users.value = data.usersPermissionsUsers?.data;
  // watch(
  //   result,
  //   () => {
  //     users.value = result.value?.usersPermissionsUsers.data;
  //   },
  //   { immediate: true, deep: true }
  // );
// const queryUsers = () => {
// };
// queryUsers();
</script>

<style lang="scss" scoped></style>
