<template>
    <span v-if="errorMsg" class="fit absolute-full flex flex-center">
        <ul>
            <li>meetSite: {{ meetSite }}</li>
            <li>displayName: {{ displayName }}</li>
            <li>roomName: {{ roomName }}</li>
        </ul>
    </span>
    <div v-else-if="meetAuth === false" class="fit absolute-full flex flex-center">
        {{ $t('meet_no_auth') }}
    </div>
    <div v-else v-bind="$attrs" ref="jitsiContainer" />
</template>

<script setup>
import { teamStore, uiStore } from 'src/hooks/global/useStore';
import { onMounted, useTemplateRef, ref, onBeforeUnmount, computed, watch } from 'vue';
import useMeet from './useMeet.js';
import { useQuasar } from 'quasar';
import { preloadMeetAPI, isMeetAPILoaded } from 'src/utils/meetLoader';

const $q = useQuasar();
const { roomName, displayName } = defineProps({
  roomName: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['meetEnded'])

const jitsiContainer = useTemplateRef('jitsiContainer');
const meet = ref();
const meetSite = process.env.MEET_SITE
const meetAuth = ref(void 0)

const createMeet = async () => {
    const { jitsi_token } = await useMeet(teamStore.project?.id)
    if(!jitsi_token) {
        meetAuth.value = false
        return
    }
    meetAuth.value = true

    try {
        // 检查 API 是否已加载，如果没有则等待加载
        if (!isMeetAPILoaded()) {
            await preloadMeetAPI(meetSite);
        }
        // API 已加载，直接初始化
        await initJitsiMeet(jitsi_token);
    } catch (error) {
        console.error('Failed to initialize Jitsi Meet:', error);
        errorMsg.value = 'Failed to load Jitsi Meet API';
    }
}

// 移除原有的 script 创建代码，直接定义 initJitsiMeet
async function initJitsiMeet(jitsi_token) {
    const options = {
        roomName: roomName, // 替换为你的会议室名称
        jwt: jitsi_token,
        parentNode: jitsiContainer.value,
        userInfo: {
            displayName: displayName, // 自动设置的用户名字
        },
        disableInviteFunctions: true,
        configOverwrite: {
            defaultLanguage: 'cn',  // 默认语言
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinConfig: {
                enabled: false
            },
            toolbarButtons: [
                'camera',
                'chat',
                'closedcaptions',
                'desktop',
                'download',
                // 'embedmeeting',
                'etherpad',
                'feedback',
                'filmstrip',
                'fullscreen',
                'hangup',
                'help',
                'highlight',
                'invite',
                'linktosalesforce',
                'livestreaming',
                'microphone',
                'noisesuppression',
                'participants-pane',
                'profile',
                'raisehand',
                'recording',
                'security',
                'select-background',
                'settings',
                'shareaudio',
                'sharedvideo',
                'shortcuts',
                'stats',
                'tileview',
                'toggle-camera',
                'videoquality',
                'whiteboard',
            ],
        },
        interfaceConfigOverwrite: {
            LANG_DETECTION: true,
            // DEFAULT_BACKGROUND: '#474747',// 背景颜色
            DEFAULT_LOCAL_DISPLAY_NAME: 'me',
        },
        sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-downloads'
    };
    
    meet.value = new JitsiMeetExternalAPI(meetSite, options);
    if($q.platform.is.electron){
      meet.value.on("_requestDesktopSources", async (request, callback) => {
        const { options } = request;
        window.jitsiAPI.getDesktopSources(options)
            .then(sources => callback({ sources }))
            .catch((error) => callback({ error }));
      });
    }
    
    // 监听会议结束事件
    meet.value.addEventListeners({
        // 当用户离开会议时触发
        videoConferenceLeft: handleConferenceLeft,
        // 当会议被终止时触发
        readyToClose: handleReadyToClose,
        // 可选：监听参与者离开事件
        participantLeft: handleParticipantLeft,
    });
}

// 处理会议结束事件
const handleConferenceLeft = (data) => {
  teamStore.project.meeting = false
  uiStore.init_meet = false
  uiStore.show_meet = false
  uiStore.meet = void 0
  // 可以在这里执行一些清理操作
  // 或者触发父组件的事件
  emit('meetEnded', data);
}

// 处理会议关闭事件
const handleReadyToClose = () => {
  emit('meetEnded', data);
  // 执行清理操作
  if (meet.value) {
    meet.value.dispose();
    meet.value = null;
  }
}

// 可选：处理参与者离开事件
const handleParticipantLeft = (participant) => {
  // console.log('Participant left:', participant);
}

// 清理会议实例的函数
const cleanupMeet = () => {
  if (meet.value) {
    // 移除所有事件监听器
    meet.value.removeEventListener('videoConferenceLeft', handleConferenceLeft);
    meet.value.removeEventListener('readyToClose', handleReadyToClose);
    meet.value.removeEventListener('participantLeft', handleParticipantLeft);
    
    // 销毁实例
    meet.value.dispose();
    meet.value = null;
  }
}

const errorMsg = ref();
onMounted(() => {
    if(!roomName || !displayName || !meetSite){
        errorMsg.value = '缺少入会参数，请检查 roomName 和 displayName'
    } else {
        createMeet();
    }
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  cleanupMeet();
  
  // 如果需要，也可以移除外部API脚本
  const script = document.querySelector('script[src*="external_api.js"]');
  if (script) {
    script.remove();
  }
});

</script>