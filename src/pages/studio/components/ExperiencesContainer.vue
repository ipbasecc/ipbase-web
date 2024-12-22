<template>
    <div class="column no-wrap gap-md q-space article">
        <div class="text-h4">工作经历</div>
        <VueDraggable v-model="experiences" :animation="200" :forceFallback="true" :fallbackOnBody="true"
          handle=".dragBar" filter=".undrag" group="cv"
          chosenClass="chosenGroupClass" ghostClass="ghostColumn" fallbackClass="chosenGroupClass"
          class="q-py-xs radius-sm column gap-sm no-wrap forbid"
        >
          <template v-for="element in experiences" :key="element.id">
            <q-expansion-item
                class="dragBar"
            >
                <template v-slot:header>
                    <q-item-section>
                        <q-item-label>{{ useExperience().company(element) }}</q-item-label>
                        <q-item-label caption lines="2">{{ useExperience().range(element) }}</q-item-label>
                    </q-item-section>

                    <q-item-section side>
                        <q-btn dense padding="xs md" color="primary" flat label="删除" @click="deleteExperience(element)" />
                    </q-item-section>
                </template>
                <q-item>
                    <q-item-section>
                        <q-item-label>{{ useExperience().title(element) }}</q-item-label>
                        <q-item-label caption lines="2">{{ useExperience().responsibility(element) }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-expansion-item>
          </template>
        </VueDraggable>
        <q-space />
        <q-card flat class="transparent">
            <q-card-section>
                <div class="row no-wrap gap-sm">
                    <q-input v-model="experience.start" outlined dense class="q-space">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy transition-show="slide-down" transition-hide="slide-up">
                                <q-date v-model="experience.start" mask="YYYY-MM-DD" minimal
                                    bordered v-close-popup />
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input v-model="experience.end" outlined dense class="q-space">
                        <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy transition-show="slide-down" transition-hide="slide-up">
                                <q-date v-model="experience.end" mask="YYYY-MM-DD" minimal>
                                    <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>
                <div class="text-h6 q-mt-sm">
                    <q-input v-model="experience.title" outlined dense type="text" label="职务" />
                </div>
                <div class="text-subtitle2 q-mt-sm">
                    <q-input v-model="experience.company" outlined dense type="text" label="公司" />
                </div>
                <div class="text-subtitle2 q-mt-sm">
                    <q-input v-model="experience.responsibility" outlined dense type="textarea" label="职责" />
                </div>
            </q-card-section>
            <q-card-section class="q-pt-none" align="right">
                <q-btn dense padding="xs md" color="primary" flat label="新增" @click="addExperience" />
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { VueDraggable } from 'vue-draggable-plus'
    const experiences = defineModel('experiences')
    const experience = ref({
        start: null,
        end: null,
        company: null,
        title: null,
        responsibility: null
    })
    const useExperience = () => {
        return {
            title(experience) {
                return experience.title;
            },
            range(experience) {
                return experience.start + ' - ' + experience.end;
            },
            company(experience) {
                return experience.company;
            },
            responsibility(experience) {
                return experience.responsibility;
            }
        }
    }
    const addExperience = () => {
        experiences.value.push(experience.value);
        experience.value = {
            start: null,
            end: null,
            company: null,
            title: null,
            responsibility: null
        }
    }
    const deleteExperience = (experience) => {
        experiences.value = experiences.value.filter(item => item.id !== experience.id);
    }
</script>