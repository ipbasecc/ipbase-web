<!-- src/pages/WechatLogin.vue -->
<template>
    <q-page class="flex flex-center">
        <div class="absolute-full column no-wrap">
            <q-toolbar class="bg-purple text-white">
                <q-btn flat round dense icon="assignment_ind" />
                <q-toolbar-title>
                    Toolbar
                </q-toolbar-title>
                <q-btn color="primary" icon="check" label="OK" @click="findChildrenFn()" />
            </q-toolbar>
            <div class="q-space row no-wrap">
                <q-list bordered v-if="root.teams.length">
                    <q-item clickable v-ripple v-for="team in root.teams" :key="team.id"
                        @click="findChildrenFn({team_id: team.id})"
                    >
                        <q-item-section>
                            <q-item-label>{{ team.display_name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-list bordered v-if="root.projects.length">
                    <q-item clickable v-ripple v-for="project in root.projects" :key="project.id"
                        @click="findChildrenFn({project_id: project.id})"
                    >
                        <q-item-section>
                            <q-item-label>{{ project.name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-list bordered v-if="root.kanbans.length">
                    <q-item clickable v-ripple v-for="kanban in root.kanbans" :key="kanban.id"
                        @click="findChildrenFn({kanban_id: kanban.id})"
                    >
                        <q-item-section>
                            <q-item-label>{{ kanban.title }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <q-list bordered v-if="root.cards.length">
                    <q-item clickable v-ripple v-for="card in root.cards" :key="card.id">
                        <q-item-section>
                            <q-item-label>{{ card.name }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>
    </q-page>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import { findChildren } from 'src/api/strapi/team.js'

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
        }
        if(params?.team_id){
            root.value.projects = data.projects;
        }
        if(params?.project_id){
            root.value.kanbans = data.boards.map(i => i.groups?.map(j => j.kanbans)).flat(3);
        }
        if(params?.kanban_id){
            root.value.cards = data.columns.map(i => i.cards).flat(2);
        }
    }

    onMounted(() => {
        
    })

    onUnmounted(() => {
        
    })

</script>