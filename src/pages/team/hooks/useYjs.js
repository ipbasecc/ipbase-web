import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// 递归函数，用于将JavaScript对象转化为Yjs的数据类型
function initToYDoc(val) {
  if (Array.isArray(val)) {
    const yArray = new Y.Array();
    val.forEach(item => {
      yArray.push([initToYDoc(item)]);
    });
    return yArray;
  } else if (typeof val === 'object' && val !== null) {
    const yMap = new Y.Map();
    Object.keys(val).forEach(key => {
      yMap.set(key, initToYDoc(val[key]));
    });
    return yMap;
  } else {
    return val;
  }
}

export function yinit(url,room,val) {
  const yDoc = new Y.Doc();

// 创建Y.Map实例，用于存储转换后的数据
  const yData = new Y.Map();

// 将数据转换为Y.js兼容的形式，并存储到Y.Map中
  yData.set('data', initToYDoc(val));
  return new WebsocketProvider(url, room, yDoc);
}
export function update() {

}
export function sync() {

}

export function toYDoc(doc, obj, rootName = 'rootName') {
  function convertToYType(item, parent, key) {
    if (Array.isArray(item)) {
      item = item.reverse()
      const yArray = new Y.Array();
      for (const element of item) {
        if (typeof element === 'object' && element !== null) {
          const yMap = new Y.Map();
          convertObjectToYMap(element, yMap);
          yArray.insert(0, [yMap]);
        } else {
          yArray.insert(0, [element]);
        }
      }
      parent.set(key, yArray);
    } else if (typeof item === 'object' && item !== null) {
      const yMap = new Y.Map();
      convertObjectToYMap(item, yMap);
      parent.set(key, yMap);
    } else {
      parent.set(key, item);
    }
  }

  function convertObjectToYMap(object, yMap) {
    for (const [key, value] of Object.entries(object)) {
      convertToYType(value, yMap, key);
    }
  }

  doc.get(rootName, Y.Map); // 这行确保了 rootName 对应的 Map 在 doc 中存在
  convertObjectToYMap(obj, doc.getMap(rootName));
  console.log('convertObjectToYMap', doc)
}
export function fromYDoc(yDoc, rootName = 'rootName') {
  const root = yDoc.getMap(rootName);
  if (!root) throw new Error(`Y.Doc does not contain a ${rootName} property`);

  function convertFromYType(yType) {
    if (yType instanceof Y.Map) {
      const obj = {};
      yType.forEach((value, key) => {
        obj[key] = convertFromYType(value);
      });
      return obj;
    } else if (yType instanceof Y.Array) {
      const arr = [];
      yType.forEach((value) => {
        arr.push(convertFromYType(value));
      });
      return arr;
    } else {
      return yType;
    }
  }
  return convertFromYType(root);
}
export function updateYDoc(doc, newObj, rootName = 'root') {
  const root = doc.get(rootName, Y.Map);

  function updateOrDeleteYType(item, yItem, key) {
    if (Array.isArray(item)) {
      updateYArray(yItem, item, key);
    } else if (typeof item === 'object' && item !== null) {
      updateYMap(yItem, item, key);
    } else {
      if (yItem !== item) {
        yItem.set(key, item);
      }
    }
  }

  function updateYArray(yArray, arr, key) {
    const yLen = yArray.length;
    const nLen = arr.length;

    // Update existing elements
    for (let i = 0; i < Math.min(yLen, nLen); i++) {
      const item = arr[i];
      if (Array.isArray(item) || (typeof item === 'object' && item !== null)) {
        updateOrDeleteYType(item, yArray.get(i), key);
      } else if (yArray.get(i) !== item) {
        yArray.set(i, item);
      }
    }

    // Remove extra elements in yArray
    if (yLen > nLen) {
      yArray.delete(nLen, yLen - nLen);
    }

    // Add missing elements to yArray
    if (nLen > yLen) {
      for (let i = yLen; i < nLen; i++) {
        const item = arr[i];
        if (Array.isArray(item) || (typeof item === 'object' && item !== null)) {
          const newItem = Array.isArray(item) ? new Y.Array() : new Y.Map();
          updateOrDeleteYType(item, newItem, key);
          yArray.insert(i, [newItem]);
        } else {
          yArray.insert(nLen, [item]);
        }
      }
    }
  }

  function updateYMap(yMap, obj, key) {
    // Update existing keys
    for (const [k, v] of Object.entries(obj)) {
      updateOrDeleteYType(v, yMap.get(k), k);
    }

    // Remove extra keys in yMap
    const keysToDelete = [];
    yMap.forEach((value, mapKey) => {
      if (!(mapKey in obj)) {
        keysToDelete.push(mapKey);
      }
    });
    keysToDelete.forEach(k => yMap.delete(k));
  }

  // Clear root and then add updated content
  root.clear();
  for (const [key, value] of Object.entries(newObj)) {
    const yItem = root.get(key);
    if (yItem) {
      updateOrDeleteYType(value, yItem, key);
    } else {
      if (Array.isArray(value)) {
        const yArray = new Y.Array();
        updateYArray(yArray, value, key);
        root.set(key, yArray);
      } else if (typeof value === 'object' && value !== null) {
        const yMap = new Y.Map();
        updateYMap(yMap, value, key);
        root.set(key, yMap);
      } else {
        root.set(key, value);
      }
    }
  }
}
