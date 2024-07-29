function getFirstText(jsonData) {
    if (jsonData.type === 'text') {
        return jsonData.text;
    } else if (jsonData.content && jsonData.content.length > 0) {
        for (let i = 0; i < jsonData.content.length; i++) {
        const text = getFirstText(jsonData.content[i]);
        if (text !== null) {
            return text.slice(0, 18) + (text.length > 8 ? '...' : '');
        }
        }
    } else {
        return 'untitled_task';
    }
}
const genName = (i) => {
    let _
    if(i.name){
        _ = i.name.slice(0, 18) + (i.name.length > 18 ? '...' : '');
    } else {
        _ = getFirstText(i.jsonContent);
    }
    return _
}

export function useCardname (i) {
    return genName(i)
}
