import { StorageManager } from '../../framework/StorageManager';

const CURRENT_LEVEL_KEY = 'common_current_level';

export class CommonGameProgress {
    static getCurrentLevel(defaultLevel: number = 1): number {
        const level = StorageManager.getInstance().getNumber(CURRENT_LEVEL_KEY, defaultLevel);
        return this.normalizeLevel(level, defaultLevel);
    }

    static setCurrentLevel(level: number): void {
        StorageManager.getInstance().setNumber(CURRENT_LEVEL_KEY, this.normalizeLevel(level, 1));
    }

    private static normalizeLevel(level: number, defaultLevel: number): number {
        if (!Number.isFinite(level)) return Math.max(1, Math.floor(defaultLevel));
        return Math.max(1, Math.floor(level));
    }
}
