self.onmessage = function (e) {
  function removeDuplicatesById(arr) {
    let newArr
    // 使用 Set 来存储已经遇到的 ID
    const ids = new Set();
    // 使用 filter 方法来过滤数组
    newArr = arr.filter(item => {
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
    return newArr
  }
  let { _kanban, _all_kanbans } = e.data;

  if(!_kanban) return;

  let all_columns;
  let all_cards;
  let all_todogroups;
  let all_todos;

  const processKanban = (_kanban) => {
    let _newArr;
    if(!_all_kanbans || _all_kanbans?.length === 0) {
      _newArr = [_kanban]
    } else {
      if (!_all_kanbans.map(i => i.id).includes(_kanban.id)) {
        _newArr = [..._all_kanbans, _kanban];
      } else {
        _newArr = _all_kanbans.map(k => k.id === _kanban.id ? _kanban : k);
      }
    }
    return removeDuplicatesById(_newArr);
  }
  _all_kanbans = processKanban(_kanban);

  function updateArray(sourceArray, targetArray, key) {
    const items = sourceArray.map(i => i[key]?.length > 0 ? i[key] : []).flat(2);
    targetArray.push(...items);
    return targetArray
  }
  function attachFeedback(sourceArray, targetArray) {
    const items = sourceArray.map(i => i.feedback || []);
    targetArray.push(...items);
    return targetArray
  }

  const syncTodos = () => {
    if(!all_todogroups) return
    all_todos = updateArray(all_todogroups, [], 'todos')
  }
  const syncTodogroups = () => {
    if(!all_cards) return
    all_todogroups = updateArray(all_cards, [], 'todogroups')
    syncTodos();
  }
  const syncFeedback = () => {
    if(!all_cards) return
    all_todogroups = attachFeedback(all_cards, [])
    syncTodos();
  }
  const syncCards = () => {
    if(!all_columns) return
    all_cards = updateArray(all_columns, [], 'cards')
    syncTodogroups();
    const feedbacks = all_cards?.length > 0 && all_cards.filter(i => i.feedback);
    if(feedbacks.length > 0){
      syncFeedback()
    }
  }
  const syncColumns = () => {
    all_columns = updateArray(_all_kanbans, [], 'columns')
    syncCards();
  }
  syncColumns();

  const res = {
    all_kanbans: _all_kanbans,
    all_columns: all_columns,
    all_cards: all_cards,
    all_todogroups: all_todogroups,
    all_todos: all_todos,
  }
  self.postMessage(res);
};
