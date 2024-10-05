
import localforage from "localforage";
export async function attachExpand(kanban) {
    if (kanban.columns && kanban.columns.length > 0) {
        kanban.columns = kanban.columns.map(async (i) => {
        if (i.cards && i.cards.length > 0) {
            // 使用 Promise.all 来等待所有异步操作完成
            const cardPromises = i.cards.map(async (card) => {
            const expandStatus = await localforage.getItem(
                `___card_expandStatus_${card.id}`
            );
            return { ...card, expand: expandStatus || "expand" };
            });

            // 等待所有 card 的异步操作完成
            const updatedCards = await Promise.all(cardPromises);
            return { ...i, cards: updatedCards };
        } else {
            return { ...i, cards: [] };
        }
        });

        // 等待所有 column 的异步操作完成
        kanban.columns = await Promise.all(kanban.columns);
    }
    return kanban;
}