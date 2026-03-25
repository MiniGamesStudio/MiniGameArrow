/**
 * 游戏状态管理 — 集中管理游戏运行时数据
 */
export class GameState {
    private static _instance: GameState;

    /** 当前关卡 */
    currentLevel: number = 1;
    /** 当前得分 */
    score: number = 0;
    /** 是否暂停 */
    isPaused: boolean = false;
    /** 已解锁的最高关卡 */
    maxUnlockedLevel: number = 1;

    static getInstance(): GameState {
        if (!this._instance) {
            this._instance = new GameState();
            this._instance.load();
        }
        return this._instance;
    }

    /** 从本地存储加载进度 */
    load(): void {
        try {
            const saved = localStorage.getItem('flower_game_save');
            if (saved) {
                const data = JSON.parse(saved);
                this.maxUnlockedLevel = data.maxUnlockedLevel ?? 1;
            }
        } catch (e) {
            console.warn('GameState: 加载存档失败', e);
        }
    }

    /** 保存进度到本地存储 */
    save(): void {
        try {
            localStorage.setItem('flower_game_save', JSON.stringify({
                maxUnlockedLevel: this.maxUnlockedLevel,
            }));
        } catch (e) {
            console.warn('GameState: 保存存档失败', e);
        }
    }

    /** 通关当前关卡 */
    completeLevel(): void {
        if (this.currentLevel >= this.maxUnlockedLevel) {
            this.maxUnlockedLevel = this.currentLevel + 1;
            this.save();
        }
    }

    /** 重置运行时状态 */
    resetRuntimeState(): void {
        this.score = 0;
        this.isPaused = false;
    }
}
