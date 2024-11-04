import { preloadMeetAPI } from 'src/utils/meetLoader'

export default async () => {
  // 在后台预加载 API，但不等待它完成
  preloadMeetAPI(process.env.MEET_SITE).catch(err => {
    console.warn('Failed to preload Jitsi Meet API:', err)
  })
} 