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
let meet
const meetSite = process.env.MEET_SITE
const meetAuth = ref(void 0)

const createMeet = async () => {
    const { jitsi_token } = await useMeet(teamStore.project?.id)
    if(!jitsi_token) {
        meetAuth.value = false
        return
    }
    meetAuth.value = true
  // 确保外部 API 脚本已加载
  const script = document.createElement('script');
  script.src = `https://${meetSite}/external_api.js`;
  script.async = true;
  script.onload = () => {
    // 脚本加载完成后，初始化 Jitsi Meet
    initJitsiMeet();
  };
  script.onerror = () => {
    console.error('Failed to load the Jitsi Meet API script');
  };
  document.head.appendChild(script);

  async function initJitsiMeet() {
    // Jitsi Meet API 加载完成后，创建一个新的 JitsiMeetExternalAPI 实例
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
    };
    meet = new JitsiMeetExternalAPI(meetSite, options);
    // 监听会议结束事件
    meet.addEventListeners({
        // 当用户离开会议时触发
        videoConferenceLeft: handleConferenceLeft,
        // 当会议被终止时触发
        readyToClose: handleReadyToClose,
        // 可选：监听参与者离开事件
        participantLeft: handleParticipantLeft,
    });
  }
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
  if (meet) {
    meet.dispose();
    meet = null;
  }
}

// 可选：处理参与者离开事件
const handleParticipantLeft = (participant) => {
  console.log('Participant left:', participant);
}

// 清理会议实例的函数
const cleanupMeet = () => {
  if (meet) {
    // 移除所有事件监听器
    meet.removeEventListener('videoConferenceLeft', handleConferenceLeft);
    meet.removeEventListener('readyToClose', handleReadyToClose);
    meet.removeEventListener('participantLeft', handleParticipantLeft);
    
    // 销毁实例
    meet.dispose();
    meet = null;
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