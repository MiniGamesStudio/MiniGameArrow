import { StorageManager } from '../../framework/StorageManager';

/**
 * Run 结果数据
 */
export interface RunResult {
    /** 是否通关 */
    cleared: boolean;
    /** 到达的最高楼层 */
    floorReached: number;
    /** 击杀数 */
    killCount: number;
    /** 存活时间（秒） */
    survivalTime: number;
    /** 本次 Run 中获得的金币 */
    goldCollected: number;
}

/**
 * Run 结算数据
 */
export interface RunSettlement {
    /** 本次结算获得的金币奖励 */
    goldEarned: number;
    /** 本次解锁的新成就 */
    newAchievements: string[];
}

/**
 * 肉鸽动作游戏持久化状态
 */
export class RoguelikeGameState {
    private static _instance: RoguelikeGameState;
    private static readonly STORAGE_KEY = 'roguelike_save';

    // 永久成长数据
    totalGold: number = 0;
    metaUpgrades: Map<string, number> = new Map();
    unlockedClasses: string[] = ['warrior', 'mage'];
    unlockedCostumes: string[] = ['default'];
    npcAffinities: Map<string, number> = new Map();

    // 统计数据
    totalRuns: number = 0;
    totalClears: number = 0;
    bestFloor: number = 0;
    bestKillCount: number = 0;
    achievements: string[] = [];

    static getInstance(): RoguelikeGameState {
        if (!this._instance) {
            this._instance = new RoguelikeGameState();
            this._instance.load();
        }
        return this._instance;
    }

    load(): void {
        const data = StorageManager.getInstance().getObject<any>(RoguelikeGameState.STORAGE_KEY);
        if (data) {
            this.totalGold = data.totalGold ?? 0;
            this.metaUpgrades = new Map(Object.entries(data.metaUpgrades ?? {}));
            this.unlockedClasses = data.unlockedClasses ?? ['warrior', 'mage'];
            this.unlockedCostumes = data.unlockedCostumes ?? ['default'];
            this.npcAffinities = new Map(Object.entries(data.npcAffinities ?? {}));
            this.totalRuns = data.totalRuns ?? 0;
            this.totalClears = data.totalClears ?? 0;
            this.bestFloor = data.bestFloor ?? 0;
            this.bestKillCount = data.bestKillCount ?? 0;
            this.achievements = data.achievements ?? [];
        }
    }

    save(): void {
        StorageManager.getInstance().setObject(RoguelikeGameState.STORAGE_KEY, {
            totalGold: this.totalGold,
            metaUpgrades: Object.fromEntries(this.metaUpgrades),
            unlockedClasses: this.unlockedClasses,
            unlockedCostumes: this.unlockedCostumes,
            npcAffinities: Object.fromEntries(this.npcAffinities),
            totalRuns: this.totalRuns,
            totalClears: this.totalClears,
            bestFloor: this.bestFloor,
            bestKillCount: this.bestKillCount,
            achievements: this.achievements,
        });
    }

    /** Run 结算 */
    settleRun(result: RunResult): RunSettlement {
        this.totalRuns++;
        if (result.cleared) this.totalClears++;
        if (result.floorReached > this.bestFloor) this.bestFloor = result.floorReached;
        if (result.killCount > this.bestKillCount) this.bestKillCount = result.killCount;

        const goldEarned = this.calculateGoldReward(result);
        this.totalGold += goldEarned;
        this.save();

        return { goldEarned, newAchievements: this.checkAchievements(result) };
    }

    /** 计算金币奖励 */
    private calculateGoldReward(result: RunResult): number {
        let gold = result.goldCollected;
        if (result.cleared) gold = Math.floor(gold * 1.5);
        return gold;
    }

    /** 检查成就解锁 */
    private checkAchievements(_result: RunResult): string[] {
        // 后续任务中实现具体成就检查逻辑
        return [];
    }
}
