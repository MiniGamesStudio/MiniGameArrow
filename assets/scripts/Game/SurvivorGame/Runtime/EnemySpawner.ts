import { Vec3 } from 'cc';
import { EnemyConfig, WaveConfig } from '../Data/EnemyData';
import { SurvivorConst } from '../SurvivorConst';
import { SurvivorEvent } from '../SurvivorEvent';
import { EventManager } from '../../../Core/EventManager';
import { BattleSession } from './BattleSession';

/**
 * 敌人生成器 — 根据波次配置在玩家周围生成敌人
 */
export class EnemySpawner {
    private _waveConfigs: WaveConfig[] = [];
    private _enemyConfigs: Map<string, EnemyConfig> = new Map();
    private _spawnTimer: number = 0;
    private _waveTimer: number = 0;
    private _currentWaveIndex: number = 0;

    /** 当前场上活跃敌人数 */
    activeEnemyCount: number = 0;

    /** 注册敌人配置 */
    registerEnemyConfig(config: EnemyConfig): void {
        this._enemyConfigs.set(config.id, config);
    }

    /** 设置波次配置 */
    setWaveConfigs(waves: WaveConfig[]): void {
        this._waveConfigs = waves;
    }

    /** 获取敌人配置 */
    getEnemyConfig(id: string): EnemyConfig | null {
        return this._enemyConfigs.get(id) ?? null;
    }

    /** 获取当前波次配置 */
    getCurrentWave(): WaveConfig | null {
        if (this._currentWaveIndex < this._waveConfigs.length) {
            return this._waveConfigs[this._currentWaveIndex];
        }
        return null;
    }

    /**
     * 每帧更新，返回需要生成的敌人列表
     */
    update(dt: number, session: BattleSession): SpawnRequest[] {
        if (session.isPaused || session.isOver) return [];

        const requests: SpawnRequest[] = [];
        const wave = this.getCurrentWave();
        if (!wave) return requests;

        // 波次计时
        this._waveTimer += dt;
        if (this._waveTimer >= wave.duration) {
            this._waveTimer -= wave.duration;
            this._currentWaveIndex++;
            session.currentWave = this._currentWaveIndex;

            const newWave = this.getCurrentWave();
            if (newWave) {
                EventManager.getInstance().emit(SurvivorEvent.WaveStart, this._currentWaveIndex);

                // 新波次有 Boss 时生成
                if (newWave.hasBoss && newWave.bossId) {
                    const bossConfig = this._enemyConfigs.get(newWave.bossId);
                    if (bossConfig) {
                        requests.push({ config: bossConfig, isBoss: true });
                        this.activeEnemyCount++;
                        EventManager.getInstance().emit(SurvivorEvent.BossSpawn, newWave.bossId);
                    }
                }
            }
            return requests;
        }

        // 生成计时
        this._spawnTimer += dt;
        if (this._spawnTimer >= wave.spawnInterval) {
            this._spawnTimer -= wave.spawnInterval;

            if (this.activeEnemyCount < SurvivorConst.ENEMY_MAX_COUNT) {
                const count = Math.min(wave.spawnCount, SurvivorConst.ENEMY_MAX_COUNT - this.activeEnemyCount);
                for (let i = 0; i < count; i++) {
                    const enemyId = this.pickRandomEnemy(wave);
                    if (enemyId) {
                        const config = this._enemyConfigs.get(enemyId);
                        if (config) {
                            requests.push({ config, isBoss: false });
                            this.activeEnemyCount++;
                        }
                    }
                }
            }
        }

        return requests;
    }

    /** 按权重随机选择敌人 */
    private pickRandomEnemy(wave: WaveConfig): string | null {
        const pool = wave.enemyPool;
        if (!pool || pool.length === 0) return null;

        let totalWeight = 0;
        for (const entry of pool) totalWeight += entry.weight;
        if (totalWeight <= 0) return pool[0].enemyId;

        let rand = Math.random() * totalWeight;
        for (const entry of pool) {
            rand -= entry.weight;
            if (rand <= 0) return entry.enemyId;
        }
        return pool[pool.length - 1].enemyId;
    }

    /**
     * 计算生成位置 — 在玩家周围的环形区域随机取点
     */
    static calcSpawnPosition(playerPos: Vec3): Vec3 {
        const angle = Math.random() * Math.PI * 2;
        const dist = SurvivorConst.ENEMY_SPAWN_MIN_DIST +
            Math.random() * (SurvivorConst.ENEMY_SPAWN_MAX_DIST - SurvivorConst.ENEMY_SPAWN_MIN_DIST);
        return new Vec3(
            playerPos.x + Math.cos(angle) * dist,
            playerPos.y + Math.sin(angle) * dist,
            0
        );
    }

    /** 敌人死亡时调用，安全递减 */
    decrementActiveCount(): void {
        if (this.activeEnemyCount > 0) {
            this.activeEnemyCount--;
        }
    }

    reset(): void {
        this._spawnTimer = 0;
        this._waveTimer = 0;
        this._currentWaveIndex = 0;
        this.activeEnemyCount = 0;
    }
}

/**
 * 生成请求
 */
export interface SpawnRequest {
    config: EnemyConfig;
    isBoss: boolean;
}
