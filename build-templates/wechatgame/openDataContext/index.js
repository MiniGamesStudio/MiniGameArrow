'use strict';

const runtime = typeof wx !== 'undefined' ? wx : typeof tt !== 'undefined' ? tt : null;
const sharedCanvas = runtime && runtime.getSharedCanvas ? runtime.getSharedCanvas() : null;
const context = sharedCanvas ? sharedCanvas.getContext('2d') : null;
const RANK_IMAGE_SOURCES = [
    'openDataContext/images/rank_bg1.png',
    'openDataContext/images/rank_bg2.png',
    'openDataContext/images/rank_bg3.png',
    'openDataContext/images/rank_bg4.png',
    'openDataContext/images/rank_one.png',
    'openDataContext/images/rank_two.png',
    'openDataContext/images/rank_three.png',
];
const rankImages = [];
const avatarImages = {};
let rankImagesLoaded = false;
let rankImagesLoading = false;

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

function createImage() {
    if (runtime && runtime.createImage) return runtime.createImage();
    if (typeof Image !== 'undefined') return new Image();
    return null;
}

function loadRankImages(callback) {
    if (rankImagesLoaded) {
        callback();
        return;
    }
    if (rankImagesLoading) {
        setTimeout(() => loadRankImages(callback), 50);
        return;
    }

    rankImagesLoading = true;
    let loadedCount = 0;
    const finishOne = () => {
        loadedCount += 1;
        if (loadedCount >= RANK_IMAGE_SOURCES.length) {
            rankImagesLoaded = true;
            rankImagesLoading = false;
            callback();
        }
    };

    RANK_IMAGE_SOURCES.forEach((src, index) => {
        const image = createImage();
        if (!image) {
            console.warn('OpenDataContext: create rank image failed', src);
            finishOne();
            return;
        }

        image.onload = () => {
            rankImages[index] = image;
            finishOne();
        };
        image.onerror = (err) => {
            console.warn('OpenDataContext: rank image load failed', src, err);
            finishOne();
        };
        image.src = src;
    });
}

function setSharedCanvasSize(width, height) {
    if (!sharedCanvas) return;

    const nextWidth = Number(width) || 620;
    const nextHeight = Number(height) || 760;
    console.log('OpenDataContext: sharedCanvas size', sharedCanvas.width, sharedCanvas.height, nextWidth, nextHeight);
}

function drawRankMark(rank, x, y) {
    const rankMark = rankImages[rank + 3];
    if (rank <= 3 && rankMark) {
        context.drawImage(rankMark, x - 2, y - 29, 40, 40);
        return;
    }

    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText(String(rank), x + 18, y);
}

function drawRankBackground(rank, x, y, width, height) {
    const background = rankImages[Math.min(rank, 4) - 1];
    if (background) {
        context.drawImage(background, x, y, width, height);
        return;
    }

    context.fillStyle = 'rgba(255, 255, 255, 0.12)';
    context.fillRect(x, y, width, height);
}

function drawAvatar(item, x, y, size) {
    const image = item.avatarUrl ? avatarImages[item.avatarUrl] : null;

    context.save();
    context.beginPath();
    context.arc(x + size * 0.5, y + size * 0.5, size * 0.5, 0, Math.PI * 2);
    context.clip();
    if (image) {
        context.drawImage(image, x, y, size, size);
    } else {
        context.fillStyle = item.isSelf ? '#ffc44a' : '#7f8fa6';
        context.fillRect(x, y, size, size);
        context.fillStyle = '#ffffff';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.fillText((item.nickname || '?').charAt(0), x + size * 0.5, y + size * 0.68);
    }
    context.restore();
}

function formatNickname(nickname) {
    const text = nickname || '匿名玩家';
    return text.length > 6 ? `${text.slice(0, 6)}..` : text;
}

function loadAvatarImages(dataList, callback) {
    const avatarUrls = dataList
        .map((item) => item && item.avatarUrl)
        .filter((url) => !!url && avatarImages[url] === undefined);
    if (avatarUrls.length <= 0) {
        callback();
        return;
    }

    let finishedCount = 0;
    const finishOne = () => {
        finishedCount += 1;
        if (finishedCount >= avatarUrls.length) callback();
    };

    avatarUrls.forEach((url) => {
        const image = createImage();
        if (!image) {
            avatarImages[url] = null;
            finishOne();
            return;
        }

        image.onload = () => {
            avatarImages[url] = image;
            finishOne();
        };
        image.onerror = (err) => {
            console.warn('OpenDataContext: avatar image load failed', url, err);
            avatarImages[url] = null;
            finishOne();
        };
        image.src = url;
    });
}

function drawRankList(dataList, key) {
    if (!context || !sharedCanvas) return;
    clear();

    context.textBaseline = 'alphabetic';
    context.fillStyle = 'rgba(0, 0, 0, 0.62)';
    context.fillRect(0, 0, sharedCanvas.width, sharedCanvas.height);

    context.fillStyle = '#ffffff';
    context.font = '32px Arial';
    context.textAlign = 'center';
    context.fillText('好友排行榜', sharedCanvas.width * 0.5, 56);

    const fullList = dataList
        .map((item) => {
            const kv = (item.KVDataList || []).find((data) => data.key === key);
            return {
                nickname: formatNickname(item.nickname),
                avatarUrl: item.avatarUrl,
                isSelf: !!item.isSelf,
                score: Number(kv && kv.value ? kv.value : 0),
            };
        })
        .sort((a, b) => b.score - a.score);

    const selfIndex = fullList.findIndex((item) => item.isSelf);
    const selfItem = selfIndex >= 0 ? fullList[selfIndex] : null;
    const hasSelfScore = !!(selfItem && selfItem.score > 0);

    const sortedList = fullList.slice(0, 13);
    console.log('OpenDataContext: drawRankList data count', sortedList.length, sortedList);

    if (sortedList.length <= 0) {
        drawMessage('暂无好友排行数据');
        return;
    }

    context.font = '24px Arial';
    sortedList.forEach((item, index) => {
        const rank = index + 1;
        const y = 110 + index * 48;
        drawRankBackground(rank, 40, y - 30, sharedCanvas.width - 80, 40);
        if (item.isSelf) {
            context.strokeStyle = 'rgba(255, 255, 255, 0.82)';
            context.lineWidth = 2;
            context.strokeRect(40, y - 30, sharedCanvas.width - 80, 40);
        }

        drawRankMark(rank, 58, y);
        drawAvatar(item, 104, y - 28, 36);

        context.fillStyle = '#ffffff';
        context.textAlign = 'left';
        context.fillText(item.nickname, 152, y);
        context.textAlign = 'right';
        context.fillText(String(item.score), sharedCanvas.width - 60, y);
    });

    drawSelfRankFooter(hasSelfScore, selfIndex, selfItem);
}

function drawSelfRankFooter(hasSelfScore, selfIndex, selfItem) {
    if (!context || !sharedCanvas) return;

    const y = sharedCanvas.height - 14;
    const rectX = 40;
    const rectW = sharedCanvas.width - 80;
    const rectTop = y - 30;

    if (!hasSelfScore || !selfItem) {
        context.fillStyle = 'rgba(255, 220, 96, 0.18)';
        context.fillRect(rectX, rectTop, rectW, 40);
        context.strokeStyle = 'rgba(255, 220, 96, 0.5)';
        context.lineWidth = 1;
        context.strokeRect(rectX, rectTop, rectW, 40);
        context.fillStyle = '#ffe27a';
        context.font = '26px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('暂未进入排行榜', sharedCanvas.width * 0.5, rectTop + 20);
        context.textBaseline = 'alphabetic';
        return;
    }

    const selfRank = selfIndex + 1;
    drawRankBackground(selfRank, rectX, rectTop, rectW, 40);
    context.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    context.lineWidth = 2;
    context.strokeRect(rectX, rectTop, rectW, 40);

    context.font = '24px Arial';
    drawRankMark(selfRank, 58, y);
    drawAvatar(selfItem, 104, y - 28, 36);

    context.fillStyle = '#ffffff';
    context.textAlign = 'left';
    context.fillText(selfItem.nickname || '我', 152, y);
    context.textAlign = 'right';
    context.fillText(String(selfItem.score), sharedCanvas.width - 60, y);
}

function getSelfCloudStorage(key, callback) {
    if (!runtime || !runtime.getUserCloudStorage) {
        callback(null);
        return;
    }

    runtime.getUserCloudStorage({
        keyList: [key],
        success: (res) => {
            callback({
                nickname: '我',
                KVDataList: res.KVDataList || [],
                isSelf: true,
            });
        },
        fail: (err) => {
            console.warn('OpenDataContext: getUserCloudStorage fail', err);
            callback(null);
        },
    });
}

function getCloudStorageValue(item, key) {
    const kv = (item && item.KVDataList || []).find((data) => data.key === key);
    return kv && kv.value ? String(kv.value) : '';
}

function buildRankData(friendData, selfData, key) {
    // Shallow-clone each entry so we can flag the current user without mutating the source.
    const rankData = friendData ? friendData.map((item) => ({ ...item })) : [];

    // Some platforms already flag the current user via isSelf — trust it when present.
    if (rankData.some((item) => item.isSelf)) {
        return rankData;
    }

    if (!selfData) {
        return rankData;
    }

    const selfValue = getCloudStorageValue(selfData, key);
    // No score submitted yet: self is not ranked, nothing to flag.
    if (!selfValue) {
        return rankData;
    }

    // Friend list includes self but didn't flag it — mark the entry whose stored
    // value matches self's. (Falls back to value match because the open-data domain
    // cannot reliably compare openids with the current user.)
    let marked = false;
    for (const item of rankData) {
        if (getCloudStorageValue(item, key) === selfValue) {
            item.isSelf = true;
            marked = true;
        }
    }

    // Self isn't in the friend list at all — append the self entry.
    if (!marked) {
        rankData.push(selfData);
    }

    return rankData;
}

function showFriendRank(key, width, height) {
    if (!runtime || !runtime.getFriendCloudStorage) {
        drawMessage('当前平台不支持好友排行榜');
        return;
    }

    setSharedCanvasSize(width, height);
    runtime.getFriendCloudStorage({
        keyList: [key],
        success: (res) => {
            console.log('OpenDataContext: getFriendCloudStorage success data', res.data);
            getSelfCloudStorage(key, (selfData) => {
                const rankData = buildRankData(res.data, selfData, key);
                console.log('OpenDataContext: merged rank data', rankData);
                drawRankList(rankData, key);
                loadRankImages(() => drawRankList(rankData, key));
                loadAvatarImages(rankData, () => drawRankList(rankData, key));
            });
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
            showFriendRank(message.key || 'level', message.width, message.height);
        } else if (message.type === 'hideFriendRank') {
            clear();
        }
    });
}

drawMessage('等待排行榜数据');
