import { getCurrentInstance } from 'vue'

export function useImagePreview() {
  const { proxy } = getCurrentInstance()
  
  const preview = (url) => {
    if (proxy && proxy.$hevueImgPreview) {
      proxy.$hevueImgPreview(url)
    } else {
      console.error('hevueImgPreview not available')
    }
  }

  return {
    preview
  }
}