// 定义一个文件类型的枚举
const FileType = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    OTHER: 'other'
}
  
// 定义一个图片文件后缀的数组
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']

// 定义一个视频文件后缀的数组
const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv']

// 定义一个音频文件后缀的数组
const audioExtensions = ['.mp3', '.wav', '.aac', '.wma', '.ogg', '.m4a']

// 定义一个根据文件后缀判断文件类型的方法
export default function filetype(fileName, ext) {
  let extension
  if(ext) {
    extension = ext
  } else {
    // console.log(fileName);
    // 获取文件名中最后一个点的位置
    let dotIndex = fileName.lastIndexOf('.')
    // 如果没有找到点，说明文件没有后缀，返回其它类型
    if (dotIndex === -1) {
      return FileType.OTHER
    }
    // 获取文件后缀，转换为小写
    extension = fileName.substring(dotIndex).toLowerCase()
  }
  // 判断文件后缀，返回类型
  if (imageExtensions.includes(extension)) {
    return FileType.IMAGE
  }
  if (videoExtensions.includes(extension)) {
    return FileType.VIDEO
  }
  if (audioExtensions.includes(extension)) {
    return FileType.AUDIO
  }
  // 否则，返回其它类型
  return FileType.OTHER
}
  