/**
 * 敌人生成器
 * 通过 TypeRegistry<IEnemyType> 创建敌人实例，使用 PoolManager 管理对象池
 * 负责敌人的生成、回收和每帧 AI 更新
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { PoolManager } from '../../../framework/ObjectPool';
import {
    IEnemyType,
    EnemyConfig,
    BattleContext,
} from '../Data/Interfaces/IEnemyType';

/**
 * 房间敌人生成配置
 * 描述一个房间中需要生成的敌人列表
 */
export interface RoomEnemyConfig {
    /** 敌人生成列表 */
    spawns: EnemySpawnEntry[];
}

/**
 * 单条敌人生成条目
 */
export interface EnemySpawnEntry {
    /** 敌人类型 ID（对应 TypeRegistry 中的注册 ID） */
    typeId: string;
    /** 生成数量 */
    count: number;
    /** 敌人配置数据 */
    config: EnemyConfig;
}

/** 对象池名称前缀 */
const ENEMY_POOL_PREFIX = 'enemy_';

/**
 * 敌人生成器
 * 管理敌人的创建、AI 更新和回收
 */
export class EnemySpawner {
    /** 敌人类型注册表 */
    private _enemyRegistry: TypeRegistry<IEnemyType>;
    /** 当前活跃的敌人列表 */
    private _activeEnemies: IEnemyType[] = [];

    /**
     * @param enemyRegistry 敌人类型注册表
     */
    constructor(enemyRegistry: TypeRegistry<IEnemyType>) {
        this._enemyRegistry = enemyRegistry;
    }

    /**
     * 根据房间配置生成敌人
     * @param roomConfig 房间敌人生成配置
     */
    spawnEnemies(roomConfig: RoomEnemyConfig): void {
        for (const spawn of roomConfig.spawns) {
            for (let i = 0; i < spawn.count; i++) {
                const poolName = ENEMY_POOL_PREFIX + spawn.typeId;
                let enemy = PoolManager.getInstance().get<IEnemyType>(poolName);

                if (!enemy) {
                    // 池中无可用对象或池未注册，通过注册表创建新实例
                    enemy = this._enemyRegistry.create(spawn.typeId);
                }

                if (enemy) {
                    enemy.init(spawn.config);
                    this._activeEnemies.push(enemy);
                }
            }
        }
    }

    /**
     * 回收敌人到对象池
     * @param enemy 要回收的敌人实例
     */
    recycleEnemy(enemy: IEnemyType): void {
        const index = this._activeEnemies.indexOf(enemy);
        if (index !== -1) {
            this._activeEnemies.splice(index, 1);
        }

        const poolName = ENEMY_POOL_PREFIX + enemy.typeId;
        PoolManager.getInstance().put(poolName, enemy);
    }

    /**
     * 每帧更新所有活跃敌人的 AI
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    update(dt: number, context: BattleContext): void {
        // 倒序遍历，方便在回调中安全移除
        for (let i = this._activeEnemies.length - 1; i >= 0; i--) {
            const enemy = this._activeEnemies[i];
            enemy.updateAI(dt, context);
        }
    }

    /**
     * 获取所有活跃敌人列表
     * @returns 活跃敌人数组（只读副本）
     */
    getActiveEnemies(): ReadonlyArray<IEnemyType> {
        return this._activeEnemies;
    }

    /**
     * 获取当前活跃敌人数量
     */
    get activeCount(): number {
        return this._activeEnemies.length;
    }

    /**
     * 清除所有活跃敌人（回收到对象池）
     */
    clearAll(): void {
        for (const enemy of this._activeEnemies) {
            const poolName = ENEMY_POOL_PREFIX + enemy.typeId;
            PoolManager.getInstance().put(poolName, enemy);
        }
        this._activeEnemies.length = 0;
    }

    /**
     * 重置生成器状态
     */
    reset(): void {
        this._activeEnemies.length = 0;
    }
}
