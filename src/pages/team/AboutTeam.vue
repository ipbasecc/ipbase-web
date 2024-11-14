<template>
    <q-card
        :bordered="$q.screen.gt.xs"
        :flat="$q.screen.gt.xs"
        class="column no-wrap"
        :style="$q.screen.gt.xs ? 'min-width: 48rem; height: 61%' : ''"
    >
        <q-toolbar class="transparent">
            <q-avatar size="sm">
                <q-img
                    :src="team.team_logo?.url"
                    :ratio="1"
                    spinner-color="primary"
                    spinner-size="82px"
                />
            </q-avatar>
            <q-toolbar-title>
                {{team.display_name}}
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section v-if="team" class="q-space q-pa-none overflow-hidden">
            <TipTap
                :editable="useAuths('modify', ['team'])"
                :jsonContent="team.introduce"
                :need="'json'"
                :square="true"
                :withSaveBtn="true"
                :withImageBtn="true"
                :contentChanged
                @contentChanged="contentChanged = true"
                contentStyle="max-height: unset"
                @tiptapBlur="tiptapBlur"
            />
        </q-card-section>
    </q-card>
  <div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { teamStore } from "src/hooks/global/useStore.js";
import TipTap from "src/components/Utilits/tiptap/TipTap.vue";
import { updateTeam } from "src/api/strapi/team.js";

const team = computed(() => teamStore.team);
const params = ref({
  data: {
    introduce: null
  },
});
const DEFAULT_INTRODUCE = {
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 2
      },
      "content": [
        {
          "type": "text",
          "text": "管理人员尚未补充团队说明"
        }
      ]
    }
  ]
}
onMounted(() => {
    if(!team.value?.introduce) {
        team.value.introduce = DEFAULT_INTRODUCE;
    }
})
const contentChanged = ref(false);
const update = async () => {  
  const res = await updateTeam(team.value?.id, params.value);
  if (res?.data) {
    teamStore.team.introduce = res.data.introduce;
    contentChanged.value = false
  }
};

const count = ref(15);
let intervalId = null;
const startCountdown = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(async () => {
    count.value--;
    if (count.value === 0) {
      clearInterval(intervalId);
      await update();
    }
  }, 1000);
};

const tiptapUpdate = async (val) => {
    params.value.data.introduce = val;
  count.value = 15;
  startCountdown();
};
const tiptapBlur = async (val) => {
    params.value.data.introduce = val;
  await update();
};

</script>

<style scoped>
</style>