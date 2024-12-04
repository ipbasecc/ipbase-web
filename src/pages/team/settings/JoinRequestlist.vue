<template>
  <div class="q-pa-md fit">
    <q-list>
      <template v-if="join_requests.length > 0">
      <q-item v-for="item in join_requests" :key="item.id">
        <q-item-section top avatar>
          <q-avatar>
            <img v-if="item.request_user?.profile?.avatar?.url" :src="item.request_user?.profile?.avatar?.url" />
            <q-icon v-else name="person" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.request_user?.username }}</q-item-label>
          <q-item-label caption lines="2">{{ item.message }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-btn flat dense round size="sm" icon="more_vert">
            <q-menu class="radius-sm">
              <q-list bordered dense class="radius-sm q-pa-xs" style="min-width: 120px;">
                <q-item clickable v-close-popup class="radius-xs text-no-wrap"
                @click="approve(item.id, true)">
                  <q-item-section side>
                    <q-icon name="check" />
                  </q-item-section>
                  <q-item-section>{{ $t('accept') }}</q-item-section>
                </q-item>
                <q-item clickable v-close-popup class="radius-xs text-no-wrap"
                @click="approve(item.id, false)">
                  <q-item-section side>
                    <q-icon name="close" />
                  </q-item-section>
                  <q-item-section>{{ $t('reject') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item-section>
      </q-item>
      </template>
      <q-item v-else>
        <q-item-section side>
          <q-icon name="info" />
        </q-item-section>
        <q-item-section>
          {{ $t('no_join_request') }}
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import {onBeforeMount, ref} from 'vue'
import {checkJoinProjectRequest, approveJoinProjectRequest} from 'src/api/strapi/project.js'

const {project} = defineProps(['project']);

const join_requests = ref([]);

onBeforeMount(async () => {
  const {data} = await checkJoinProjectRequest(project?.id);
  if(data){
    join_requests.value = data;
  }
})

const approve = async (id, is_approved) => {
  const params = {
    data: {
      join_request_id: id,
      approved: is_approved
    }
  }
  const {data} = await approveJoinProjectRequest(project?.id, params);
  if(data){
    console.log('data', data);
    join_requests.value = join_requests.value.filter(item => item.id !== id);
  }
}
</script>
