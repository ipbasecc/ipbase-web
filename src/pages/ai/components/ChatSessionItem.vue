<template>
    <q-item 
      clickable 
      @click="emit('select', session)"
      v-ripple
      class="hovered-item radius-md q-pr-sm"
      :class="currentSessionId === session.id ? 'active-listitem border' : 'border-placeholder'">
      <q-item-section>
        <q-item-label lines="1">{{ session.title }}</q-item-label>
      </q-item-section>
      <q-item-section side class="hover-show">
        <q-btn dense flat round size="sm" icon="more_vert">
          <q-menu v-model="menuModel" class="no-padding radius-sm shadow-24" @show="onMenuShow(session)">
            <q-list bordered dense class="q-pa-xs radius-sm column gap-xs">
              <q-item class="no-padding radius-xs overflow-hidden">
                <q-input v-model="sessionTitle" dense filled square type="text" @keyup.enter="saveSessionTitle(session)">
                  <template #append>
                    <q-btn dense round flat size="sm" icon="check"
                      :disable="!sessionTitle.trim() || sessionTitle === session.title"
                      @click="saveSessionTitle(session)" />
                  </template>
                </q-input>
              </q-item>
              <q-item clickable @click="deleteSession(session)" class="radius-xs">
                <q-item-section>
                  <q-item-label>删除</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    session: {
      type: Object,
      required: true
    },
    currentSessionId: {
      type: String,
      required: true
    }
  });
  const emit = defineEmits(['select', 'save-title', 'delete'])
  
  const sessionTitle = ref(props.session.title);
  const menuModel = ref(false);
  
  // 菜单显示时的处理函数
  const onMenuShow = (session) => {
    sessionTitle.value = session.title;
  }
  
  // 保存会话标题
  const saveSessionTitle = (session) => {
    if (!sessionTitle.value.trim() || sessionTitle.value === session.title) return;
    emit('save-title', { session, title: sessionTitle.value });
  }
  
  // 删除会话
  const deleteSession = (session) => {
    emit('delete', session);
  }
  </script>