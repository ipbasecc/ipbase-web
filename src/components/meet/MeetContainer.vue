<template>
    <span v-if="errorMsg" class="fit absolute-full flex flex-center">
        <ul>
            <li>meetSite: {{ meetSite }}</li>
            <li>displayName: {{ displayName }}</li>
            <li>roomName: {{ roomName }}</li>
            <li>errorMsg: {{ errorMsg }}</li>
        </ul>
    </span>
    <div v-else-if="meetAuth === false" class="fit absolute-full flex flex-center jitsi">
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
import { jwtDecode } from "jwt-decode";

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
const meetSite = import.meta.env.VITE_MEET_SITE
const meetAuth = ref(void 0)

const isReconnecting = ref(false);  // 添加重连状态标志
const isModerator = ref(false)

const _params = {
    data: {
        project_id: teamStore.project?.id,
        room_name: roomName
    }
}
const createMeet = async () => {
    // console.log('_params', _params);
    
    const { jitsi_token } = await useMeet(_params)
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
        
        // 解析 token 获取过期时间
        const decodedToken = jwtDecode(jitsi_token);
        console.log('decodedToken', decodedToken);
        isModerator.value = decodedToken.context?.user?.moderator
        const expiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
        
        await initJitsiMeet(jitsi_token);
        startTokenRefresh(expiresIn);
    } catch (error) {
        console.error('Failed to initialize Jitsi Meet:', error);
        errorMsg.value = 'Failed to load Jitsi Meet API';
    }
}

const startTokenRefresh = (expiresIn) => {
    // 在 token 过期前30分钟刷新
    const refreshInterval = (expiresIn - 1800) * 1000; // 转换为毫秒
    
    if (refreshInterval <= 0) {
        console.warn('Token is about to expire or has expired');
        return;
    }
    
    let refreshTimer = setInterval(async () => {
        try {
            const { jitsi_token } = await useMeet(_params)
            if (jitsi_token && meet.value) {
                const decodedToken = jwtDecode(jitsi_token);
                
                const newExpiresIn = decodedToken.exp - Math.floor(Date.now() / 1000);
                
                meet.value.executeCommand('token', jitsi_token);
                clearInterval(refreshTimer);
                startTokenRefresh(newExpiresIn);
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
        }
    }, refreshInterval);
}

// 移除原有的 script 创建代码，直接定义 initJitsiMeet
async function initJitsiMeet(jitsi_token) {
    // console.log('jitsi_token', jitsi_token);
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
            desktopSharingFrameRate: {
                min: 5,
                max: 60
            },
            constraints: {
                video: {
                    height: {
                        ideal: 720,
                        max: 1080,
                        min: 240
                    }
                }
            }
        },
        interfaceConfigOverwrite: {
            LANG_DETECTION: true,
            // DEFAULT_BACKGROUND: '#474747',// 背景颜色
            DEFAULT_LOCAL_DISPLAY_NAME: 'me',
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_POWERED_BY: false,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            HIDE_INVITE_MORE_HEADER: true
        },
        sandbox: 'allow-scripts allow-same-origin allow-popups allow-forms allow-downloads'
    };
    
    meet.value = new JitsiMeetExternalAPI(meetSite, options);
    if($q.platform.is.electron){
        meet.value.on("_requestDesktopSources", async (request, callback) => {
            console.log('_requestDesktopSources request:', request);
            const { options } = request;
            try {
                // 确保 options 包含正确的 types
                const sourceOptions = {
                    ...options,
                    types: options.types || ['window', 'screen']
                };
                const sources = await window.jitsiAPI.getDesktopSources(sourceOptions);
                
                // 对 Windows 平台的源进行特殊处理
                const processedSources = sources.map(source => ({
                    ...source,
                    id: source.id,
                    name: source.name || 'Unknown',
                    thumbnailURL: source.thumbnailURL,
                    type: source.type,
                    display_id: source.display_id
                }));
                
                console.log('Available sources:', processedSources);
                callback({ sources: processedSources });
            } catch (error) {
                console.error('Failed to get desktop sources:', error);
                callback({ error: error.message || 'Failed to get sources' });
            }
        });
    }
    
    // 更新事件监听
    meet.value.addEventListeners({
        // 当用户点击"离开"按钮时触发
        hangup: handleHangup,
        // 当用户被踢出或网络断开等原因离开会议时触发
        videoConferenceLeft: handleConferenceLeft,
        // 当会议准备关闭时触发,用于清理资源
        readyToClose: handleReadyToClose,
        // 当其他参与者离开会议时触发
        participantLeft: handleParticipantLeft,
        // 当与Jitsi服务器建立连接成功时触发
        connectionEstablished: handleConnectionEstablished,
        // 当与Jitsi服务器连接失败时触发
        connectionFailed: handleConnectionFailed,
        // 当用户被管理员踢出会议时触发
        participantKickedOut: handleParticipantKickedOut,
        // 当连接中断时触发
        connectionInterrupted: handleConnectionInterrupted
    });
}

const distoryMeet = (state) => {
    if (!isReconnecting.value) {  // 只有在非重连状态下才触发 meetEnded
        emit('meetEnded', state);
        
        // 执行清理操作
        if (meet.value) {
            meet.value.dispose();
            meet.value = null;
        }
    }
}

// 处理用户主动挂断
const handleHangup = async () => {
    console.log('User hung up the call');
    //检查是不是其他成员都已经离开了会议
    const participants = await meet.value.getParticipantsInfo();
    const others = participants.filter(p => !p.isLocal);

    const state = others.length === 0 ? 'close' : 'left' // 其他人都离开了，触发关闭事件
    distoryMeet(state);
}

// 处理会议离开事件（非主动挂断）
const handleConferenceLeft = (data) => {
    console.log('Conference left:', data);
    if (data?.error) {
        // 处理错误导致的离开
        distoryMeet('error');
    } else {
        // 处理 主持人离开时关闭，其他原因的离开（如被踢出）
        const state = isModerator.value ? 'close' : 'left'
        distoryMeet(state);
    }
}

// 处理会议关闭事件
const handleReadyToClose = () => {
    console.log('Meeting is ready to close');
    distoryMeet('close');
}

// 可选：处理参与者离开事件
const handleParticipantLeft = async (participant) => {
    // console.log('Participant left:', participant);
}


// 添加新的事件处理函数
const handleConnectionEstablished = () => {
    console.log('Connection established');
    isReconnecting.value = false;  // 重置重连状态
};

const handleConnectionFailed = (error) => {
    console.log('Connection failed:', error);
    // 可以在这里处理连接失败的逻辑
};

const handleConnectionInterrupted = () => {
    console.log('Connection interrupted, attempting to reconnect...');
    isReconnecting.value = true;  // 设置重连状态
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
    meet.value.removeEventListener('hangup', handleHangup);
    meet.value.removeEventListener('videoConferenceLeft', handleConferenceLeft);
    meet.value.removeEventListener('readyToClose', handleReadyToClose);
    meet.value.removeEventListener('participantLeft', handleParticipantLeft);
    meet.value.removeEventListener('connectionEstablished', handleConnectionEstablished);
    meet.value.removeEventListener('connectionFailed', handleConnectionFailed);
    meet.value.removeEventListener('participantKickedOut', handleParticipantKickedOut);
    meet.value.removeEventListener('connectionInterrupted', handleConnectionInterrupted);
    
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