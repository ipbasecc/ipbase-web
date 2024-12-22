<template>
    <q-card bordered class="column no-wrap" style="min-width: 64rem;min-height: 32rem;">
        <slot name="header" />
        <q-card-section class="q-space">
            <div class="row no-wrap absolute-full q-pa-sm gap-sm">
                <q-list bordered v-if="root.teams.length" class="select-column radius-xs">
                    <q-item clickable v-ripple v-for="team in root.teams" :key="team.id"
                        @click="findChildrenFn({team_id: team.id})"
                    >
                        <q-item-section>
                            <q-item-label>{{ team.display_name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-list bordered v-if="root.projects.length" class="select-column radius-xs">
                    <q-item clickable v-ripple v-for="project in root.projects" :key="project.id"
                        @click="findChildrenFn({project_id: project.id})"
                    >
                        <q-item-section>
                            <q-item-label>{{ project.name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-list bordered v-if="root.kanbans.length" class="select-column radius-xs  ">
                    <q-item clickable v-ripple v-for="kanban in root.kanbans" :key="kanban.id"
                        @click="findChildrenFn({kanban_id: kanban.id})"
                    >
                        <q-item-section>
                            <q-item-label>{{ kanban.title }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-list bordered v-if="root.cards.length" class="select-column radius-xs">
                    <q-item clickable v-ripple v-for="card in root.cards" :key="card.id" @click="select(card)">
                        <q-item-section>
                            <q-item-label>{{ card.name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import { findChildren } from 'src/api/strapi/team.js'

    const emit = defineEmits(['select'])
    const select = (card) => {
        emit('select', card)
    }

    const root = ref({
        teams: [],
        projects: [],
        kanbans: [],
        cards: [],
    })

    const findChildrenFn = async (params) => {
        const { data } = await findChildren(params);
        if(!params){
            root.value.teams = data;
            root.value.projects = [];
            root.value.kanbans = [];
            root.value.cards = [];
        }
        if(params?.team_id){
            root.value.projects = data.projects;
            root.value.kanbans = [];
            root.value.cards = [];
        }
        if(params?.project_id){
            root.value.kanbans = data.boards.map(i => i.groups?.map(j => j.kanbans)).flat(3);
            root.value.cards = [];
        }
        if(params?.kanban_id){
            root.value.cards = data.columns.map(i => i.cards).flat(2);
        }
    }

    onMounted(() => {
        findChildrenFn();
    })

    onUnmounted(() => {
        
    })

</script>

<style scoped>
.select-column {
    width: 16rem;
}
</style>