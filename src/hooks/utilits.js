import FileSaver from "file-saver";
import StarterKit from "@tiptap/starter-kit";
import { Editor } from "@tiptap/vue-3";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { useQuasar } from 'quasar';

const $q = useQuasar()

export function isJSON(str) {
  if (typeof str == "string") {
    try {
      const obj = JSON.parse(str);
      return !!(typeof obj == "object" && obj);
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function downloadFile(uri) {
  FileSaver.saveAs(uri);
}

function genName(i, length) {
  function getFirstText(jsonData) {
    if (jsonData.type === "text") {
      return jsonData.text;
    } else if (jsonData.content && jsonData.content.length > 0) {
      for (let i = 0; i < jsonData.content.length; i++) {
        const text = getFirstText(jsonData.content[i]);
        if (text !== null) {
          return text.slice(0, length) + (text.length > length ? "..." : "");
        }
      }
    }
    return "未命名";
  }
  if (i.name) {
    return i.name.slice(0, length) + (i.name.length > length ? "..." : "");
  } else {
    return getFirstText(i.jsonContent);
  }
}
export function genCardName(i, length) {
  return genName(i, length);
}

export function calcCoordinate(cards) {
  function deleteField(arr) {
    // 使用map创建数组的副本，并应用修改
    return arr.map(item => {
      // 创建item的副本，避免直接修改原始对象
      let newItem = { ...item };
      // 如果元素中有name属性
      if (newItem.hasOwnProperty("name") && newItem.name) {
        // 如果name属性的值不为空，则删除jsonContent属性
        delete newItem.jsonContent;
      } else if (newItem.hasOwnProperty("name")) {
        // 如果name属性的值为空，则删除name属性
        delete newItem.name;
      }
      // 返回修改后的新对象
      return newItem;
    });
  }
  
  // 转换eCharts需要的数据
  function transform(arr, props) {
    // 创建一个空数组，用于存放结果
    let result = [];
    // 遍历原数组的每个元素
    for (let item of arr) {
      // 创建一个空数组，用于存放保留的值
      let values = [];
      for (let i = 0; i < props.length; i++) {
        // 获取当前属性
        let prop = props[i];
        // 如果原数组的元素有该属性，就将其值放入新数组中
        if (item.hasOwnProperty(prop)) {
          // 如果属性是name，且值为空，就使用jsonContent代替
          if (prop === "jsonContent") {
            values.push(genName(item, 16));
          } else {
            // 否则，就直接使用该值
            values.push(item[prop]);
          }
        }
      }
      // 将新数组放入结果数组中
      result.push(values);
    }
    // 返回结果数组
    return result;
  }
  
  // 使用deleteField函数处理cards数组，并确保不修改原始数组
  let arr = deleteField([...cards]); // 使用扩展运算符创建cards的副本
  let props = [
    "urgency",
    "importance",
    "name",
    "jsonContent",
    "id",
    "type",
    "score",
  ];
  return transform(arr, props);
}

// 接受一个字符串和一个cards列表作为参数
export function filterCardsByString(string, cards) {
  if (!string) {
    return cards;
  } else {
    // 定义一个空数组，用于存放筛选后的cards
    let filteredCards = [];
    // 将搜索字符串转换为小写
    const lowerCaseString = string.toLowerCase();
    // 遍历cards列表中的每个card
    for (let card of cards) {
      // 获取card的name和jsonContent字段
      let name = card.name;
      let jsonContent = card.jsonContent;
      // 判断name是否包含指定的字符串（忽略大小写），如果是，将card添加到filteredCards数组中
      if (name?.toLowerCase().includes(lowerCaseString)) {
        filteredCards.push(card);
      } else {
        // 如果name不包含指定的字符串，创建一个Tiptap的Editor实例，用于处理jsonContent
        let editor = new Editor({
          content: jsonContent,
          extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
              nested: true,
            }),
          ], // 这里可以根据您使用的扩展进行修改
        });
        // 获取jsonContent的HTML格式，然后判断是否包含指定的字符串（忽略大小写），如果是，将card添加到filteredCards数组中
        let htmlContent = editor.getHTML();
        if (htmlContent.toLowerCase().includes(lowerCaseString)) {
          filteredCards.push(card);
        }
        // 销毁Editor实例，释放资源
        editor.destroy();
      }
    }
    // 返回filteredCards数组，作为函数的结果
    return filteredCards;
  }
}

// 根据id去重数组
export function uniqueById(arr) {
  const uniqueItems = [];
  const seenIds = new Set();

  for (const item of arr) {
    if (!seenIds.has(item.id)) {
      uniqueItems.push(item);
      seenIds.add(item.id);
    }
  }

  return uniqueItems;
}
export function removeDuplicatesById(arr) {
  let nArr
  // 使用 Set 来存储已经遇到的 ID
  const ids = new Set();
  // 使用 filter 方法来过滤数组
  nArr = arr.filter(item => {
    // 检查 item 是否是有效的对象，且包含 id 属性，并且 id 不是 null、undefined、NaN 或空字符串
    if (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      item.id !== null &&
      item.id !== undefined &&
      !isNaN(Number(item.id)) && // 如果 id 应该是数字，确保它不是 NaN
      item.id !== '' && // 如果 id 应该是字符串，确保它不是空字符串
      !ids.has(item.id)
    ) {
      ids.add(item.id);
      return true;
    }
    // 如果 item 不满足条件，则返回 false
    return false;
  });
  return nArr
}

export function useGenBlob(val) {
  const blob = new Blob([val]);
  return window.URL.createObjectURL(blob);
}

export function removeHtmlTags(val) {
  // 使用正则表达式删除 HTML 标签
  return val.replace(/<\/?[^>]+(>|$)/g, "");
}

export function makeid(length) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function randomKey(length) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function colorByAt(at, dark) {
  // 使用数字生成RGB颜色值
  let r, g, b;
  if (dark) {
    // 保证每个分量颜色都在100以内，从而产生深色
    r = ((at + 2) * 100) % 100; // 红色分量
    g = ((at + 4) * 77) % 100; // 绿色分量
    b = ((at + 6) * 55) % 100; // 蓝色分量
  } else {
    r = (((at + 2) * 100) % 100) + 150; // 红色分量
    g = (((at + 4) * 77) % 100) + 150; // 绿色分量
    b = (((at + 6) * 55) % 100) + 150; // 蓝色分量
  }

  // 生成颜色字符串
  return `rgb(${r}, ${g}, ${b})`;
}

export function trimString(str, length = 12) {
  return str.length > length ? str.substring(0, length) + "..." : str;
}
export function objectsIsEqual(obj1, obj2) {
  // console.log(obj1, obj2)
  // 将对象的属性转换为有序的键值对数组
  function sortObjectProperties(obj) {
    return Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0]));
  }

  // 比较两个有序的键值对数组是否相同
  function compareSortedEntries(entries1, entries2) {
    if (entries1.length !== entries2.length) {
      return false;
    }
    for (let i = 0; i < entries1.length; i++) {
      if (entries1[i][0] !== entries2[i][0] || entries1[i][1] !== entries2[i][1]) {
        return false;
      }
    }
    return true;
  }

  const sortedEntries1 = sortObjectProperties(obj1);
  const sortedEntries2 = sortObjectProperties(obj2);

  return compareSortedEntries(sortedEntries1, sortedEntries2);
}

export function isValidUrl(string) {
  const pattern = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/;
  return pattern.test(string);
}
export function isValidHttpUrl(string) {
  try {
    const newUrl = new URL(string);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}
export function parseTeamParams(url) {
  // 创建一个URL对象
  const parsedUrl = new URL(url);
  // 获取查询参数
  return parsedUrl;
}
export function parseUrl(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  const params = {};
  for (const [key, value] of urlParams.entries()) {
      params[key] = value;
  }
  return params;
}
export function parseQueryParams(queryParams) {
  const params = {};
  for (const [key, value] of queryParams.entries()) {
      params[key] = value;
  }
  return params;
}

export function ensureTrailingSlash(path) {
  // 检查路径是否以 '/' 结束
  if (!path.endsWith('/')) {
    // 如果不以 '/' 结束，添加一个 '/'
    path += '/';
  }
  return path;
}

export function truncateText(text, length = 5) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export function toFixedDecimal(num, decimalPlaces) {
  return parseFloat(num.toFixed(decimalPlaces));
}
export function manualDecimal(num, decimalPlaces) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.floor(num * factor) / factor;
}

export function sortByField(arr, field, order = 'desc') {
  return arr.sort((a, b) => {    
    if(typeof a[field] !== 'number'){
      a[field] = Number(a[field])
    }
    if(typeof b[field] !== 'number'){
      b[field] = Number(b[field])
    }
    // 如果指定的字段在两个条目中都不存在，则保持原顺序
    if (!a[field] && !b[field]) {
      return 0;
    }
    // 如果a条目中不存在指定字段，则a排在前面
    if (!a[field]) {
      return -1;
    }
    // 如果b条目中不存在指定字段，则b排在前面
    if (!b[field]) {
      return 1;
    }
    // 根据指定的排序方法进行排序
    if (order === 'desc') {
      return b[field] - a[field];
    } else if (order === 'asc') {
      return a[field] - b[field];
    }
    // 默认为降序
    return b[field] - a[field];
  });
}

export function isUserInDMChannel(dmChannelName, userId) {
  /**
   * 判断私信频道名称是否包含指定的用户ID。
   *
   * @param {string} dmChannelName - 私信频道的名称，如 '97nsifbu1tgw78xxc5mafk3rxo__tuykwfena7b68nzutag89tr7pw'
   * @param {string} userId - 要检查的用户ID
   * @returns {boolean} 如果用户ID在频道名称中，则返回true，否则返回false
   */
  // 将频道名称按照'_'分割成数组
  const parts = dmChannelName.split('_');
  
  // 检查用户ID是否在分割后的数组中
  return parts.includes(userId);
}

export function extractDMUserID(dmChannelName, self_id) {
  /**
   * 判断私信频道名称是否包含指定的用户ID。
   *
   * @param {string} dmChannelName - 私信频道的名称，如 '97nsifbu1tgw78xxc5mafk3rxo__tuykwfena7b68nzutag89tr7pw'
   * @param {string} userId - 要检查的用户ID
   * @returns {boolean} 如果用户ID在频道名称中，则返回true，否则返回false
   */
  // 将频道名称按照'_'分割成数组
  const parts = dmChannelName.split('_');
  // console.log('parts', parts, parts.filter(i => i !== self_id && i !== '')[0]);
  
  
  // 检查用户ID是否在分割后的数组中
  return parts.filter(i => i !== self_id && i !== '')[0];
}

export function generateUrlParams(ops) {
  // 检查每个字段，如果值存在，则添加到参数字符串中
  let params = [];
  for (let key in ops) {
    if (ops[key] !== void 0 && ops[key] !== null && ops[key] !== '') {
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(ops[key])}`);
    }
  }

  // 如果有参数，则将它们以问号开始拼接到 URL
  if (params.length > 0) {
    return `${params.join('&')}`;
  } else {
    // 如果没有参数，则返回基础 URL
    return `?`;
  }
}

/**
 * 更新数组arrA以反映arrB中target对象的新排序位置
 * 
 * @param {Array<Object>} arrA - 原始数组，包含对象元素
 * @param {Array<Object>} arrB - 包含目标对象的新排序的子集数组
 * @param {Object} target - 位置变化的对象
 * @param {number} newIndex - 目标对象在新排序中的索引位置
 * @returns {Array<Object>} - 更新后的arrA数组
 */
export function reorderArrayABasedOnArrayB(arrA, arrB, target, newIndex ) {
  // 在新的arrB中查找target的后一个元素
  const after = arrB[newIndex + 1];
  const before = arrB[newIndex - 1];

  // 在arrA中找到target的索引
  const targetIndex = arrA.findIndex(item => item.id === target.id);

  // 从arrA中剔除target
  const [removed] = arrA.splice(targetIndex, 1);

  if (after) {
    // 在arrA中找到after的索引
    const afterIndex = arrA.findIndex(item => item.id === after.id);
    // 将target插入到after在arrA中位置的前一个位置
    arrA.splice(afterIndex, 0, removed);
  } else if (before) {
    // 在arrA中找到before的索引
    const beforeIndex = arrA.findIndex(item => item.id === before.id);
    // 将target插入到before在arrA中位置的后一个位置
    arrA.splice(beforeIndex + 1, 0, removed);
  } else {
    // 如果after和before都不存在，直接将target插入到arrA的末尾
    arrA.push(removed);
  }

  return arrA;
}

export const sumArr = ( arr ) => {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * 
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @returns min max 之间的随机整数
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min); // 向上取整
  max = Math.floor(max); // 向下取整
  return Math.floor(Math.random() * (max - min + 1)) + min; // 加1是因为不包括最大值
}

export function mergeObjects(target, source) {
  // 遍历对象b的每个属性
  for (let key in source) {
      if (source.hasOwnProperty(key)) {
          // 如果对象a也有这个属性，则使用b中的值替换a中的值
          target[key] = source[key];
      }
  }
  // 返回修改后的对象a
  return target;
}

export function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Date.now() / 1000; // 将当前时间转换为秒
  return payload.exp < currentTime;
}

export function getMimeExtension(mimeType) {
  const mimeMap = {
    'image/jpg': '.jpg',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/svg': '.svg',
    'image/webp': '.webp',
    'video/mov': '.mov',
    'video/mp4': '.mp4',
    'video/m4v': '.m4v',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'application/zip': '.zip',
    'application/rar': '.rar',
    'application/7z': '.7z',
    'application/pdf': '.pdf',
    'application/tar': '.tar',
  };

  return mimeMap[mimeType] || ''; // 如果找不到对应的扩展名，返回空字符串
}

export function getMimeExtensions(mimeTypes) {
  return mimeTypes.map(i => getMimeExtension(i)).join(', ');
}

export function mediaType(url) {
  console.log('url', url);
  
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const extension = path.substring(path.lastIndexOf('.') + 1).toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'svg', 'webp'];
  const videoExtensions = ['mov', 'mp4', 'm4v'];
  const audioExtensions = ['mp3', 'wav'];
  const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const pdfExtension = 'pdf';

  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (videoExtensions.includes(extension)) {
    return 'video';
  } else if (audioExtensions.includes(extension)) {
    return 'audio';
  } else if (officeExtensions.includes(extension)) {
    return 'office';
  } else if (extension === pdfExtension) {
    return 'pdf';
  } else {
    return 'others';
  }
}

export const clearCache = async () => {
  try {
    // 清除 Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }

    // 清除缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 刷新页面
    window.location.reload(true);

    $q.notify({
      type: 'positive',
      message: '缓存已清除'
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    $q.notify({
      type: 'negative',
      message: '清除缓存失败'
    });
  }
};