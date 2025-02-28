import { Platform } from 'quasar';

export function useConfig() {
  return {
    ui: {
        apps: [
          {
            val: "teams",
            label: 'team',
            icon: "developer_board",
            description: 'app_team_purpose',
            to: "teams",
            enable: true,
          },
          {
            val: "deliver",
            label: 'deliver',
            icon: "mdi-cards",
            description: 'app_deliver_purpose',
            to: "deliver",
            enable: true,
          },
          {
            val: "discover",
            label: 'discover',
            icon: "mdi-compass-outline",
            description: 'app_discover_purpose',
            to: "discover",
            enable: true,
          },
          {
            val: "affairs",
            label: 'affairs',
            icon: "mdi-checkbox-marked-circle-outline",
            description: 'app_affairs_purpose',
            to: "affairs",
            enable: true,
          },
          {
            val: "notebooks",
            label: 'notebooks',
            icon: "mdi-book-open-page-variant",
            description: 'app_notebooks_purpose',
            to: "notebooks",
            enable: true,
          },
          {
            val: "chats",
            label: 'chats',
            icon: "contacts",
            description: 'app_chat_purpose',
            to: "chats",
            enable: true,
          },
          {
            val: "threads",
            label: 'threads',
            icon: "mdi-message-bulleted",
            description: 'app_threads_purpose',
            to: "threads",
            enable: Platform.is.mobile,
          },
          {
            val: "brand",
            label: 'brand',
            icon: "mdi-creation",
            description: 'app_brand_purpose',
            to: "brand",
            enable: false
          },
          {
            val: "aichat",
            label: 'aichat',
            icon: "auto_awesome",
            description: 'app_aichat_purpose',
            to: "aichat",
            enable: Platform.is.desktop
          },
        ],
        localeOptions: [
          { val: "zh-CN", label: "中文", flag_key: 'cn' },
          { val: "en-US", label: "English", flag_key: 'gb' },
          { val: "de-DE", label: "Deutsch", flag_key: 'de' },
        ],
        colorMarks: [
          "primary",
          "secondary",
          "accent",
          "positive",
          "red",
          "info",
          "warning",
          "clear",
        ],
        can_drag_apps: ["teams", "deliver", "discover", "affairs", "notebooks", "chats", "aichat", "brand"],
        no_image_url: 'https://airspace.oss-cn-shanghai.aliyuncs.com/app/no_image.jpeg',
        supportExts: [
          "jpg", "png", "jpeg", "gif", "bmp", "svg", "webp",
          "mp4", "mov", "avi", "mkv", "flv", "wmv", "webm", "m4v", "mxf", "quicktime", "3gp", "3g2",
          "mp3", "wav", "flac", "aac", "ogg",
          "fbx", "obj", "abc", "gltf", "glb", "stl", "ply",
          "zip", "rar", "7z", "tar", "gz", "lz4",
          "doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv", "txt", "pdf", "md", "mdx"
        ],
        allowedFormatsImage: ['image/jpg', 'image/jpeg', 'image/png', 'image/svg', 'image/webp'],
        allowedFormatsVideo: ['video/mp4', 'video/m4v', 'video/mov', 'video/flv', 'video/webm'],
        allowedFormatsFile: ['text/plain', 'application/zip', 'application/tar', 'application/gzip'],
        unsupportFiles: [],
        emojis:[
          "💋",
          "🔥",
          "💗",
          "💢",
          "💯",
          "😬",
          "😍",
          "😇",
          "🤔",
          "😓",
          "🥵",
          "🤪",
          "🤬",
          "💩",
          "👻",
          "👽",
          "👾",
          "👿",
          "💀",
          "💣",
          "💥",
        ],
        colors: [
          '#1976D2', '#26A69A', '#9C27B0', '#21BA45', '#C10015', '#31CCEC', '#F2C037'
        ]
    },
    team: {
        process_status: [
          {
            name: "待处理",
            val: "pending",
            icon: "radio_button_unchecked",
            color: "grey",
          },
          {
            name: "处理中",
            val: "processing",
            icon: "change_circle",
            color: "primary",
          },
          {
            name: "遇阻",
            val: "blocked",
            icon: "radio_button_checked",
            color: "red",
          },
          { name: "待审核", val: "review", icon: "fact_check", color: "orange" },
          { name: "已完成", val: "completed", icon: "task_alt", color: "green" },
        ],
        multipleBoardType: ['classroom', 'resource'],
        saleTypes: ['classroom', 'resource'],
        authType: ['exclusive', 'commercial', 'non-commercia', 'educational', 'personal'],
        resourceType: [
          {
            label: 'video',
            value: 'video',
            description: 'resource_video_description',
            icon: 'mdi-video'
          },
          {
            label: 'audio',
            value: 'audio',
            description: 'resource_audio_description',
            icon: 'mdi-music'
          },
          {
            label: 'file',
            value: 'file',
            description: 'resource_file_description',
            icon: 'mdi-file'
          }
        ]
    },
    project: {
        status: [
          {
            name: "待处理",
            val: "pending",
            icon: "radio_button_unchecked",
            color: "grey",
          },
          {
            name: "处理中",
            val: "processing",
            icon: "change_circle",
            color: "primary",
          },
          {
            name: "遇阻",
            val: "blocked",
            icon: "radio_button_checked",
            color: "red",
          },
          { name: "待审核", val: "review", icon: "fact_check", color: "orange" },
          { name: "已完成", val: "completed", icon: "task_alt", color: "green" },
        ],
        multipleBoardType: ['classroom', 'resource'],
    }
  };
}