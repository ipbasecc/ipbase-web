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
import { onMounted, useTemplateRef, ref, onBeforeUnmount } from 'vue';
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
                // 'invite',
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
    
    // 更新事件监听
    meet.value.addEventListeners({
        // 现有的事件
        videoConferenceLeft: handleConferenceLeft,
        readyToClose: handleReadyToClose,
        participantLeft: handleParticipantLeft,
        // 添加连接状态事件
        connectionEstablished: handleConnectionEstablished,
        connectionFailed: handleConnectionFailed,
        participantKickedOut: handleParticipantKickedOut
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

// 添加新的事件处理函数
const handleConnectionEstablished = () => {
    console.log('Connection established');
    // 可以在这里处理重连成功的逻辑
};

const handleConnectionFailed = (error) => {
    console.log('Connection failed:', error);
    // 可以在这里处理连接失败的逻辑
};

const handleParticipantKickedOut = (params) => {
    // params.kicked.id - 被踢出的参与者ID
    // params.kicker.id - 执行踢出操作的参与者ID
    if (params.kicked.local) {
        // 本地用户被踢出
        handleConferenceLeft();
    }
};

// 清理会议实例的函数
const cleanupMeet = () => {
  if (meet.value) {
    // 移除所有事件监听器
    meet.value.removeEventListener('videoConferenceLeft', handleConferenceLeft);
    meet.value.removeEventListener('readyToClose', handleReadyToClose);
    meet.value.removeEventListener('participantLeft', handleParticipantLeft);
    meet.value.removeEventListener('connectionEstablished', handleConnectionEstablished);
    meet.value.removeEventListener('connectionFailed', handleConnectionFailed);
    meet.value.removeEventListener('participantKickedOut', handleParticipantKickedOut);
    
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
});

</script>