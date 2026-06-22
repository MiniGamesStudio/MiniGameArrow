'use strict';

const runtime = typeof tt !== 'undefined' ? tt : typeof wx !== 'undefined' ? wx : null;
const sharedCanvas = runtime && runtime.getSharedCanvas ? runtime.getSharedCanvas() : null;
const context = sharedCanvas ? sharedCanvas.getContext('2d') : null;

function clear() {
    if (!context || !sharedCanvas) return;
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
}

function drawMessage(message) {
    if (!context || !sharedCanvas) return;
    clear();
    context.fillStyle = 'rgba(0, 0, 0, 0.62)';
    context.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    context.fillStyle = '#ffffff';
    context.font = '28px Arial';
    context.textAlign = 'center';
    context.fillText(message, sharedCanvas.width * 0.5, sharedCanvas.height * 0.5);
}

function drawRankList(dataList, key) {
    if (!context || !sharedCanvas) return;
    clear();

    context.fillStyle = 'rgba(0, 0, 0, 0.62)';
    context.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);

    context.fillStyle = '#ffffff';
    context.font = '32px Arial';
    context.textAlign = 'center';
    context.fillText('好友排行榜', sharedCanvas.width * 0.5, 56);

    const sortedList = dataList
        .map((item) => {
            const kv = (item.KVDataList || []).find((data) => data.key === key);
            return {
                nickname: item.nickname || '匿名玩家',
                score: Number(kv && kv.value ? kv.value : 0),
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    if (sortedList.length <= 0) {
        drawMessage('暂无好友排行数据');
        return;
    }

    context.font = '24px Arial';
    sortedList.forEach((item, index) => {
        const y = 110 + index * 48;
        context.fillStyle = index % 2 === 0 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)';
        context.fillRect(40, y - 30, sharedCanvas.width - 80, 40);
        context.fillStyle = '#ffffff';
        context.textAlign = 'left';
        context.fillText(`${index + 1}. ${item.nickname}`, 60, y);
        context.textAlign = 'right';
        context.fillText(String(item.score), sharedCanvas.width - 60, y);
    });
}

function showFriendRank(key) {
    if (!runtime || !runtime.getFriendCloudStorage) {
        drawMessage('当前平台不支持好友排行榜');
        return;
    }

    runtime.getFriendCloudStorage({
        keyList: [key],
        success: (res) => {
            drawRankList(res.data || [], key);
        },
        fail: () => {
            drawMessage('好友排行榜加载失败');
        },
    });
}

if (runtime && runtime.onMessage) {
    runtime.onMessage((message) => {
        if (!message || !message.type) return;
        if (message.type === 'showFriendRank') {
            showFriendRank(message.key || 'level');
        } else if (message.type === 'hideFriendRank') {
            clear();
        }
    });
}

drawMessage('等待排行榜数据');
