const imageType = [
  ".jpg",
  ".jpeg",
  ".png",
  ".tif",
  ".tiff",
  ".svg",
  ".gif",
  "webp",
];
const videoType = [
  ".mp4",
  ".mov",
  ".avi",
  ".flv",
  ".m3u8",
  "webm",
  ".m4v",
  ".mpg",
  ".mpeg",
];
const audioType = [".mp3", ".wav", ".flac", ".aac", ".ogg"];
const officeType = [".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".csv"];
const attachmentType = [".zip", ".rar", ".7z", ".tar", ".gz", ".lz4", ".pdf"];

export function extractExt(filename) {
  // 假设 fileName 是一个包含文件名的字符串
  let ext = filename.match(/\.[0-9a-z]+$/i); // 匹配以点号开头的任意数字或字母的后缀
  if (ext) {
    let fileType;
    ext = ext[0]; // 取匹配结果的第一个元素
    if (imageType.includes(ext)) {
      fileType = "image";
    } else if (videoType.includes(ext)) {
      fileType = "video";
    } else if (audioType.includes(ext)) {
      fileType = "audio";
    } else if (ext === ".pdf") {
      fileType = "pdf";
    } else if (officeType.includes(ext)) {
      fileType = "office";
    } else {
      fileType = "others";
    }
    return fileType;
  } else {
    console.log("No extension found"); // 如果没有匹配到后缀，打印提示信息
    return null;
  }
}

export function clacTpeyIcon(filename) {
  // 假设 fileName 是一个包含文件名的字符串
  let ext = filename?.match(/\.[0-9a-z]+$/i); // 匹配以点号开头的任意数字或字母的后缀
  if (ext) {
    let icon;
    ext = ext[0]; // 取匹配结果的第一个元素
    if (imageType.includes(ext)) {
      icon = "mdi-file-image";
    } else if (videoType.includes(ext)) {
      icon = "mdi-file-video";
    } else if (audioType.includes(ext)) {
      icon = "mdi-file-music";
    } else if (ext === "pdf") {
      icon = "mdi-file-pdf";
    } else if (officeType.includes(ext)) {
      icon = "mdi-file-document";
    } else {
      icon = "mdi-file";
    }
    return icon;
  } else {
    console.log("No type found"); // 如果没有匹配到后缀，打印提示信息
    return null;
  }
}
