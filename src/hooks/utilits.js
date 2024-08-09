import FileSaver from "file-saver";
import StarterKit from "@tiptap/starter-kit";
import { Editor } from "@tiptap/vue-3";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

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
    // 遍历数组的每个元素
    for (let item of arr) {
      // 如果元素中有name属性
      if (item.hasOwnProperty("name")) {
        // 如果name属性的值为空
        if (!item.name) {
          // 删除name属性
          delete item.name;
        } else {
          // 否则，删除jsonContent属性
          delete item.jsonContent;
        }
      }
    }
    // 返回修改后的数组
    return arr;
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
          // values.push(item[prop]);
        }
      }
      // 将新数组放入结果数组中
      result.push(values);
    }
    // 返回结果数组
    return result;
  }
  let arr = deleteField(cards);
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
    // 遍历cards列表中的每个card
    for (let card of cards) {
      // 获取card的name和jsonContent字段
      let name = card.name;
      let jsonContent = card.jsonContent;
      // 判断name是否包含指定的字符串，如果是，将card添加到filteredCards数组中
      if (name?.includes(string)) {
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
        // 获取jsonContent的HTML格式，然后判断是否包含指定的字符串，如果是，将card添加到filteredCards数组中
        let htmlContent = editor.getHTML();
        if (htmlContent.includes(string)) {
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

export function ensureTrailingSlash(path) {
  // 检查路径是否以 '/' 结束
  if (!path.endsWith('/')) {
    // 如果不以 '/' 结束，添加一个 '/'
    path += '/';
  }
  return path;
}