export const SHEEP_LEVEL_ROW_COUNT = 16;
export const SHEEP_LEVEL_COL_COUNT = 8;

export enum SheepLevelDirection {
    Up = 'Up',
    Right = 'Right',
    Down = 'Down',
    Left = 'Left',
}

export interface SheepLevelItem {
    row: number;
    col: number;
    direction: SheepLevelDirection;
}

export interface SheepLevelData {
    level: number;
    rowCount: number;
    colCount: number;
    sheep: SheepLevelItem[];
}

type Footprint = {
    rowSpan: number;
    colSpan: number;
};

type DirectionConfig = {
    rowDelta: number;
    colDelta: number;
};

const DirectionCycle = [
    SheepLevelDirection.Up,
    SheepLevelDirection.Left,
    SheepLevelDirection.Down,
    SheepLevelDirection.Right,
];

const DirectionConfigs: Record<SheepLevelDirection, DirectionConfig> = {
    [SheepLevelDirection.Up]: { rowDelta: -1, colDelta: 0 },
    [SheepLevelDirection.Right]: { rowDelta: 0, colDelta: 1 },
    [SheepLevelDirection.Down]: { rowDelta: 1, colDelta: 0 },
    [SheepLevelDirection.Left]: { rowDelta: 0, colDelta: -1 },
};

const DefaultLevelCounts = [5, 7, 9, 10, 13, 16, 19, 23, 27, 32];

export class SheepLevelGenerator {
    static generateLevels(levelCounts: number[] = DefaultLevelCounts): SheepLevelData[] {
        const chain = this.generateCenterFoldedChain(Math.max(...levelCounts));
        return levelCounts.map((count, index) => ({
            level: index + 1,
            rowCount: SHEEP_LEVEL_ROW_COUNT,
            colCount: SHEEP_LEVEL_COL_COUNT,
            sheep: chain.slice(0, count),
        }));
    }

    static generateLevelJson(levelCounts: number[] = DefaultLevelCounts): string {
        return JSON.stringify({ levels: this.generateLevels(levelCounts) }, null, 2);
    }

    private static generateCenterFoldedChain(maxCount: number): SheepLevelItem[] {
        const chain: SheepLevelItem[] = [];
        const occupied = this.createOccupiedGrid();
        const centerRow = (SHEEP_LEVEL_ROW_COUNT - 1) * 0.5;
        const centerCol = (SHEEP_LEVEL_COL_COUNT - 1) * 0.5;
        const first: SheepLevelItem = {
            row: Math.max(0, Math.floor(centerRow) - 1),
            col: Math.floor(centerCol),
            direction: SheepLevelDirection.Up,
        };

        if (!this.canPlace(first, occupied)) return chain;

        chain.push(first);
        this.markOccupied(first, occupied);

        while (chain.length < maxCount) {
            const previous = chain[chain.length - 1];
            const candidates = this.collectCandidates(previous, chain.length, occupied, centerRow, centerCol);
            if (candidates.length <= 0) break;

            candidates.sort((a, b) => a.score - b.score || a.item.row - b.item.row || a.item.col - b.item.col);
            const next = candidates[0].item;
            chain.push(next);
            this.markOccupied(next, occupied);
        }

        return chain;
    }

    private static collectCandidates(
        previous: SheepLevelItem,
        chainLength: number,
        occupied: boolean[][],
        centerRow: number,
        centerCol: number,
    ): { item: SheepLevelItem; score: number }[] {
        const candidates: { item: SheepLevelItem; score: number }[] = [];
        for (let directionIndex = 0; directionIndex < DirectionCycle.length; directionIndex++) {
            const direction = DirectionCycle[(chainLength + directionIndex) % DirectionCycle.length];
            for (let row = 0; row < SHEEP_LEVEL_ROW_COUNT; row++) {
                for (let col = 0; col < SHEEP_LEVEL_COL_COUNT; col++) {
                    const item = { row, col, direction };
                    if (!this.canPlace(item, occupied)) continue;
                    if (!this.overlapsPreviousAfterOneStep(item, previous)) continue;

                    const centerDistance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
                    candidates.push({ item, score: directionIndex * 100 + centerDistance });
                }
            }
        }

        return candidates;
    }

    private static createOccupiedGrid(): boolean[][] {
        const grid: boolean[][] = [];
        for (let row = 0; row < SHEEP_LEVEL_ROW_COUNT; row++) {
            const rowData: boolean[] = [];
            for (let col = 0; col < SHEEP_LEVEL_COL_COUNT; col++) {
                rowData.push(false);
            }
            grid.push(rowData);
        }

        return grid;
    }

    private static canPlace(item: SheepLevelItem, occupied: boolean[][]): boolean {
        const footprint = this.getFootprint(item.direction);
        if (!this.isFootprintInside(item.row, item.col, footprint)) return false;

        for (let rowOffset = 0; rowOffset < footprint.rowSpan; rowOffset++) {
            for (let colOffset = 0; colOffset < footprint.colSpan; colOffset++) {
                if (occupied[item.row + rowOffset][item.col + colOffset]) return false;
            }
        }

        return true;
    }

    private static markOccupied(item: SheepLevelItem, occupied: boolean[][]): void {
        const footprint = this.getFootprint(item.direction);
        for (let rowOffset = 0; rowOffset < footprint.rowSpan; rowOffset++) {
            for (let colOffset = 0; colOffset < footprint.colSpan; colOffset++) {
                occupied[item.row + rowOffset][item.col + colOffset] = true;
            }
        }
    }

    private static overlapsPreviousAfterOneStep(item: SheepLevelItem, previous: SheepLevelItem): boolean {
        const config = DirectionConfigs[item.direction];
        const footprint = this.getFootprint(item.direction);
        const previousFootprint = this.getFootprint(previous.direction);
        const nextRow = item.row + config.rowDelta;
        const nextCol = item.col + config.colDelta;

        if (!this.isFootprintInside(nextRow, nextCol, footprint)) return false;

        return nextRow < previous.row + previousFootprint.rowSpan
            && nextRow + footprint.rowSpan > previous.row
            && nextCol < previous.col + previousFootprint.colSpan
            && nextCol + footprint.colSpan > previous.col;
    }

    private static isFootprintInside(row: number, col: number, footprint: Footprint): boolean {
        return row >= 0
            && col >= 0
            && row + footprint.rowSpan <= SHEEP_LEVEL_ROW_COUNT
            && col + footprint.colSpan <= SHEEP_LEVEL_COL_COUNT;
    }

    private static getFootprint(direction: SheepLevelDirection): Footprint {
        if (direction === SheepLevelDirection.Left || direction === SheepLevelDirection.Right) {
            return { rowSpan: 1, colSpan: 2 };
        }

        return { rowSpan: 2, colSpan: 1 };
    }
}
