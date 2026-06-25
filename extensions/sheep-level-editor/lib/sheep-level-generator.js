'use strict';

const ROW_COUNT = 19;
const COL_COUNT = 12;
const DEFAULT_TYPE = 'normal';
const GENERATE_ATTEMPTS = 80;

const Direction = {
    Up: 'Up',
    Right: 'Right',
    Down: 'Down',
    Left: 'Left',
};

const DirectionCycle = [Direction.Up, Direction.Left, Direction.Down, Direction.Right];
const DirectionConfigs = {
    [Direction.Up]: { rowDelta: -1, colDelta: 0 },
    [Direction.Right]: { rowDelta: 0, colDelta: 1 },
    [Direction.Down]: { rowDelta: 1, colDelta: 0 },
    [Direction.Left]: { rowDelta: 0, colDelta: -1 },
};

const DefaultTypeConfigs = {
    [DEFAULT_TYPE]: {
        vertical: { rowSpan: 2, colSpan: 1 },
        horizontal: { rowSpan: 1, colSpan: 2 },
    },
};

function normalizeTypeConfigs(typeConfigs) {
    return {
        ...DefaultTypeConfigs,
        ...(typeConfigs || {}),
    };
}

function generateLevel(level, typeCounts, typeConfigs, options = {}) {
    const normalizedTypeConfigs = normalizeTypeConfigs(typeConfigs);
    const typeSequence = createTypeSequence(typeCounts);
    const requireSolvable = options.requireSolvable !== false;
    const fenceCount = Math.max(0, Math.floor(Number(options.fenceCount) || 0));
    let bestLevelData = null;

    for (let attempt = 0; attempt < GENERATE_ATTEMPTS; attempt++) {
        const sheep = requireSolvable
            ? generateSolvableLayout(typeSequence, normalizedTypeConfigs)
            : generateDenseLayout(typeSequence, normalizedTypeConfigs);
        if (sheep.length <= 0) continue;

        const levelData = {
            level,
            rowCount: ROW_COUNT,
            colCount: COL_COUNT,
            sheep,
        };
        if (requireSolvable && !canSolveLevel(levelData, normalizedTypeConfigs)) continue;

        if (fenceCount > 0) {
            const fences = generateFences(sheep, fenceCount, options, normalizedTypeConfigs);
            if (fences.length <= 0) continue;
            levelData.fences = fences;
            if (requireSolvable && !canSolveLevelWithFences(levelData, normalizedTypeConfigs)) continue;
        }

        if (!bestLevelData || levelData.sheep.length > bestLevelData.sheep.length) {
            bestLevelData = levelData;
        }
        const fenceSatisfied = fenceCount <= 0 || (levelData.fences && levelData.fences.length >= fenceCount);
        if (levelData.sheep.length >= typeSequence.length && fenceSatisfied) {
            return levelData;
        }
    }

    if (!bestLevelData) {
        const reason = requireSolvable ? '可解布局' : '可用布局';
        throw new Error(`第 ${level} 关生成失败，没有找到${reason}`);
    }

    return bestLevelData;
}

function generateFences(placed, fenceCount, options, typeConfigs) {
    const fences = [];
    const maxPerFence = Math.max(1, Math.floor(Number(options.fenceMaxAttempts) || 40));

    for (let index = 0; index < fenceCount; index++) {
        let added = false;
        for (let attempt = 0; attempt < maxPerFence; attempt++) {
            const candidate = randomFenceCandidate(placed, typeConfigs, options);
            if (!candidate) continue;
            if (fences.some((fence) => rectsOverlap(fence, candidate))) continue;

            const trialLevel = { sheep: placed, fences: fences.concat([candidate]) };
            if (!canSolveLevelWithFences(trialLevel, typeConfigs)) continue;

            fences.push(candidate);
            added = true;
            break;
        }
        if (!added) break;
    }

    return fences;
}

function randomFenceCandidate(placed, typeConfigs, options) {
    const minSize = 2;
    const maxSize = 4;
    const maxAttempts = 20;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const rowSpan = randInt(minSize, maxSize);
        const colSpan = randInt(minSize, maxSize);
        const row = randInt(0, ROW_COUNT - rowSpan);
        const col = randInt(0, COL_COUNT - colSpan);
        const region = { row, col, rowSpan, colSpan };

        let enclosedCount = 0;
        let partialOverlap = false;
        for (const sheep of placed) {
            const rect = getRect(sheep, typeConfigs);
            if (rectFullyInside(rect, region)) {
                enclosedCount++;
            } else if (rectsOverlap(rect, region)) {
                partialOverlap = true;
                break;
            }
        }
        if (partialOverlap) continue;
        if (enclosedCount < 1 || enclosedCount > 6) continue;

        const nonFencedCount = placed.length - enclosedCount;
        if (nonFencedCount < 1) continue;

        let eliminateCount = Number(options.fenceEliminateCount);
        if (!Number.isFinite(eliminateCount)) {
            eliminateCount = Math.max(1, Math.floor(nonFencedCount * 0.5));
        }
        eliminateCount = Math.max(1, Math.min(nonFencedCount, Math.floor(eliminateCount)));

        return { row, col, rowSpan, colSpan, eliminateCount };
    }

    return null;
}

function rectFullyInside(inner, outer) {
    return inner.row >= outer.row
        && inner.col >= outer.col
        && inner.row + inner.rowSpan <= outer.row + outer.rowSpan
        && inner.col + inner.colSpan <= outer.col + outer.colSpan;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function canSolveLevel(level, typeConfigs) {
    const normalizedTypeConfigs = normalizeTypeConfigs(typeConfigs);
    const sheepList = (level.sheep || []).map((sheep) => {
        const footprint = getFootprint(sheep.direction, sheep.type, normalizedTypeConfigs);
        return {
            ...sheep,
            rowSpan: footprint.rowSpan,
            colSpan: footprint.colSpan,
            removed: false,
        };
    });
    let remainCount = sheepList.length;

    while (remainCount > 0) {
        const removable = sheepList.find((sheep) => !sheep.removed && !isBlocked(sheep, sheepList, normalizedTypeConfigs));
        if (!removable) return false;

        removable.removed = true;
        remainCount--;
    }

    return true;
}

function canSolveLevelWithFences(level, typeConfigs) {
    const normalizedTypeConfigs = normalizeTypeConfigs(typeConfigs);
    const sheepList = (level.sheep || []).map((sheep) => {
        const footprint = getFootprint(sheep.direction, sheep.type, normalizedTypeConfigs);
        return {
            ...sheep,
            rowSpan: footprint.rowSpan,
            colSpan: footprint.colSpan,
            removed: false,
        };
    });
    const fences = (level.fences || []).map((fence) => ({
        row: fence.row,
        col: fence.col,
        rowSpan: fence.rowSpan,
        colSpan: fence.colSpan,
        eliminateCount: Math.max(0, Math.floor(Number(fence.eliminateCount) || 0)),
        removed: false,
    }));

    let eliminatedCount = 0;
    let remainCount = sheepList.length;
    updateFencesState(fences, eliminatedCount);

    while (remainCount > 0) {
        const removable = sheepList.find((sheep) => !sheep.removed
            && !isFencedByFences(sheep, fences)
            && !isBlocked(sheep, sheepList, normalizedTypeConfigs)
            && !isPathBlockedByFences(sheep, fences, normalizedTypeConfigs));
        if (!removable) return false;

        removable.removed = true;
        remainCount--;
        eliminatedCount++;
        updateFencesState(fences, eliminatedCount);
    }

    return true;
}

function isFencedByFences(sheep, fences) {
    const rect = { row: sheep.row, col: sheep.col, rowSpan: sheep.rowSpan, colSpan: sheep.colSpan };
    return fences.some((fence) => !fence.removed && rectsOverlap(rect, fence));
}

function isPathBlockedByFences(sheep, fences, typeConfigs) {
    const pathRects = getPathRects(sheep, typeConfigs);
    return fences.some((fence) => !fence.removed && pathRects.some((rect) => rectsOverlap(rect, fence)));
}

function updateFencesState(fences, eliminatedCount) {
    fences.forEach((fence) => {
        if (!fence.removed && eliminatedCount >= fence.eliminateCount) {
            fence.removed = true;
        }
    });
}

function hasUniqueSolution(level, typeConfigs) {
    const normalizedTypeConfigs = normalizeTypeConfigs(typeConfigs);
    const sheepList = (level.sheep || []).map((sheep) => {
        const footprint = getFootprint(sheep.direction, sheep.type, normalizedTypeConfigs);
        return {
            ...sheep,
            rowSpan: footprint.rowSpan,
            colSpan: footprint.colSpan,
            removed: false,
        };
    });
    let remainCount = sheepList.length;

    while (remainCount > 0) {
        const removableList = sheepList.filter((sheep) => !sheep.removed && !isBlocked(sheep, sheepList, normalizedTypeConfigs));
        if (removableList.length !== 1) return false;

        removableList[0].removed = true;
        remainCount--;
    }

    return true;
}

function createTypeSequence(typeCounts) {
    const sequence = [];
    (typeCounts || []).forEach((item) => {
        const type = item.type || DEFAULT_TYPE;
        const count = Math.max(0, Math.floor(Number(item.count) || 0));
        for (let i = 0; i < count; i++) {
            sequence.push(type);
        }
    });

    return sequence.length > 0 ? sequence : [DEFAULT_TYPE];
}

function generateSolvableLayout(typeSequence, typeConfigs) {
    const placed = [];
    const occupied = createOccupiedGrid();
    const remainingTypes = shuffle(typeSequence);
    const centerRow = (ROW_COUNT - 1) * 0.5;
    const centerCol = (COL_COUNT - 1) * 0.5;

    while (remainingTypes.length > 0) {
        const candidates = collectCandidatesForTypes(placed, occupied, centerRow, centerCol, typeConfigs, remainingTypes);
        if (candidates.length <= 0) break;

        candidates.sort((a, b) => a.score - b.score || Math.random() - 0.5);
        const next = candidates[Math.floor(Math.random() * Math.min(5, candidates.length))].item;
        placed.push(next);
        markOccupied(next, occupied, typeConfigs);
        removeOneType(remainingTypes, next.type);
    }

    return placed;
}

function generateDenseLayout(typeSequence, typeConfigs) {
    const placed = [];
    const occupied = createOccupiedGrid();
    const remainingTypes = shuffle(typeSequence);
    const centerRow = (ROW_COUNT - 1) * 0.5;
    const centerCol = (COL_COUNT - 1) * 0.5;

    while (remainingTypes.length > 0) {
        const candidates = collectDenseCandidatesForTypes(occupied, centerRow, centerCol, typeConfigs, remainingTypes);
        if (candidates.length <= 0) break;

        candidates.sort((a, b) => a.score - b.score || Math.random() - 0.5);
        const next = candidates[Math.floor(Math.random() * Math.min(16, candidates.length))].item;
        placed.push(next);
        markOccupied(next, occupied, typeConfigs);
        removeOneType(remainingTypes, next.type);
    }

    return placed;
}

function getUniqueTypes(types) {
    return [...new Set(types.map((type) => type || DEFAULT_TYPE))];
}

function removeOneType(types, type) {
    const index = types.indexOf(type || DEFAULT_TYPE);
    if (index >= 0) {
        types.splice(index, 1);
    }
}

function collectDenseCandidatesForTypes(occupied, centerRow, centerCol, typeConfigs, types) {
    return getUniqueTypes(types).flatMap((type) => collectDenseCandidates(occupied, centerRow, centerCol, typeConfigs, type));
}

function collectCandidatesForTypes(placed, occupied, centerRow, centerCol, typeConfigs, types) {
    return getUniqueTypes(types).flatMap((type) => collectCandidates(placed, occupied, centerRow, centerCol, typeConfigs, type));
}

function collectDenseCandidates(occupied, centerRow, centerCol, typeConfigs, type) {
    const candidates = [];
    const directionCycle = shuffle(DirectionCycle);
    directionCycle.forEach((direction, directionIndex) => {
        for (let row = 0; row < ROW_COUNT; row++) {
            for (let col = 0; col < COL_COUNT; col++) {
                const item = { row, col, direction, type };
                if (!canPlace(item, occupied, typeConfigs)) continue;

                const centerDistance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
                candidates.push({
                    item,
                    score: centerDistance + directionIndex * 0.2 + Math.random(),
                });
            }
        }
    });

    return candidates;
}

function collectCandidates(placed, occupied, centerRow, centerCol, typeConfigs, type) {
    const candidates = [];
    const directionCycle = shuffle(DirectionCycle);
    directionCycle.forEach((direction, directionIndex) => {
        for (let row = 0; row < ROW_COUNT; row++) {
            for (let col = 0; col < COL_COUNT; col++) {
                const item = { row, col, direction, type };
                if (!canPlace(item, occupied, typeConfigs)) continue;
                if (blocksAnyPlacedPath(item, placed, typeConfigs)) continue;

                const centerDistance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
                const dependencyScore = isPathBlockedByPlaced(item, placed, typeConfigs) ? 0 : 30;
                candidates.push({
                    item,
                    score: dependencyScore + directionIndex * 100 + centerDistance + Math.random(),
                });
            }
        }
    });

    return candidates;
}

function createOccupiedGrid() {
    const grid = [];
    for (let row = 0; row < ROW_COUNT; row++) {
        const rowData = [];
        for (let col = 0; col < COL_COUNT; col++) {
            rowData.push(false);
        }
        grid.push(rowData);
    }

    return grid;
}

function canPlace(item, occupied, typeConfigs) {
    const footprint = getFootprint(item.direction, item.type, typeConfigs);
    if (!isFootprintInside(item.row, item.col, footprint)) return false;

    for (let rowOffset = 0; rowOffset < footprint.rowSpan; rowOffset++) {
        for (let colOffset = 0; colOffset < footprint.colSpan; colOffset++) {
            if (occupied[item.row + rowOffset][item.col + colOffset]) return false;
        }
    }

    return true;
}

function markOccupied(item, occupied, typeConfigs) {
    const footprint = getFootprint(item.direction, item.type, typeConfigs);
    for (let rowOffset = 0; rowOffset < footprint.rowSpan; rowOffset++) {
        for (let colOffset = 0; colOffset < footprint.colSpan; colOffset++) {
            occupied[item.row + rowOffset][item.col + colOffset] = true;
        }
    }
}

function blocksAnyPlacedPath(item, placed, typeConfigs) {
    const itemRect = getRect(item, typeConfigs);
    return placed.some((placedItem) => getPathRects(placedItem, typeConfigs).some((pathRect) => rectsOverlap(itemRect, pathRect)));
}

function isPathBlockedByPlaced(item, placed, typeConfigs) {
    const pathRects = getPathRects(item, typeConfigs);
    return placed.some((placedItem) => {
        const placedRect = getRect(placedItem, typeConfigs);
        return pathRects.some((pathRect) => rectsOverlap(placedRect, pathRect));
    });
}

function isBlocked(sheep, sheepList, typeConfigs) {
    const pathRects = getPathRects(sheep, typeConfigs);
    return sheepList.some((other) => {
        if (other === sheep || other.removed) return false;

        const otherRect = getRect(other, typeConfigs);
        return pathRects.some((pathRect) => rectsOverlap(otherRect, pathRect));
    });
}

function getPathRects(item, typeConfigs) {
    const config = DirectionConfigs[item.direction];
    const footprint = getFootprint(item.direction, item.type, typeConfigs);
    const rects = [];
    let row = item.row + config.rowDelta;
    let col = item.col + config.colDelta;

    while (isFootprintInside(row, col, footprint)) {
        rects.push({ row, col, rowSpan: footprint.rowSpan, colSpan: footprint.colSpan });
        row += config.rowDelta;
        col += config.colDelta;
    }

    return rects;
}

function getRect(item, typeConfigs) {
    const footprint = 'rowSpan' in item
        ? { rowSpan: item.rowSpan, colSpan: item.colSpan }
        : getFootprint(item.direction, item.type, typeConfigs);
    return {
        row: item.row,
        col: item.col,
        rowSpan: footprint.rowSpan,
        colSpan: footprint.colSpan,
    };
}

function rectsOverlap(a, b) {
    return a.row < b.row + b.rowSpan
        && a.row + a.rowSpan > b.row
        && a.col < b.col + b.colSpan
        && a.col + a.colSpan > b.col;
}

function isFootprintInside(row, col, footprint) {
    return row >= 0
        && col >= 0
        && row + footprint.rowSpan <= ROW_COUNT
        && col + footprint.colSpan <= COL_COUNT;
}

function getFootprint(direction, type, typeConfigs) {
    const typeConfig = typeConfigs[type || DEFAULT_TYPE] || typeConfigs[DEFAULT_TYPE] || DefaultTypeConfigs[DEFAULT_TYPE];
    if (direction === Direction.Left || direction === Direction.Right) {
        return typeConfig.horizontal;
    }

    return typeConfig.vertical;
}

function shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        result[i] = result[randomIndex];
        result[randomIndex] = temp;
    }

    return result;
}

module.exports = {
    ROW_COUNT,
    COL_COUNT,
    DEFAULT_TYPE,
    DefaultTypeConfigs,
    generateLevel,
    canSolveLevel,
    canSolveLevelWithFences,
    hasUniqueSolution,
};
