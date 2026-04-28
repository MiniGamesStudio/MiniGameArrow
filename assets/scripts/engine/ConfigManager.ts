import { FlatBuffersRuntime, ByteBuffer } from './FlatBuffersRuntime';

/**
 * 配置表访问器接口 — 由 FlatBuffers 生成代码实现
 * 每个配置表对应一个访问器，提供类型安全的数据读取
 */
export interface IConfigAccessor<T> {
    /** 获取记录总数 */
    getCount(): number;
    /** 按索引获取记录 */
    getByIndex(index: number): T | null;
    /** 按主键（ID）查询单条记录 */
    getById(id: number | string): T | null;
    /** 遍历所有记录 */
    forEach(callback: (item: T, index: number) => void): void;
    /** 获取所有记录 */
    getAll(): T[];
}

/**
 * 配置管理器 — 引擎层，统一管理所有配置表的访问器
 * 作为基础模块供所有游戏模块复用
 *
 * 使用方式:
 *   ConfigManager.getInstance().registerAccessor('enemy', new EnemyConfigAccessor(buffer));
 *   const enemy = ConfigManager.getInstance().getById<EnemyConfig>('enemy', 1001);
 */
export class ConfigManager {
    private static _instance: ConfigManager;

    /** 表名 → 配置访问器 */
    private _accessors: Map<string, IConfigAccessor<any>> = new Map();

    static getInstance(): ConfigManager {
        if (!this._instance) {
            this._instance = new ConfigManager();
        }
        return this._instance;
    }

    /**
     * 注册配置访问器
     * @param tableName 配置表名（与 FlatBuffersRuntime 中的表名一致）
     * @param accessor  类型安全的配置访问器实例
     */
    registerAccessor<T>(tableName: string, accessor: IConfigAccessor<T>): void {
        if (this._accessors.has(tableName)) {
            console.warn(`ConfigManager: 访问器 [${tableName}] 已存在，将被覆盖`);
        }
        this._accessors.set(tableName, accessor);
    }

    /**
     * 获取配置访问器
     * @param tableName 配置表名
     * @returns 访问器实例，未注册则返回 null
     */
    getAccessor<T>(tableName: string): IConfigAccessor<T> | null {
        const accessor = this._accessors.get(tableName);
        if (!accessor) {
            console.warn(`ConfigManager: 未注册的访问器 [${tableName}]`);
            return null;
        }
        return accessor as IConfigAccessor<T>;
    }

    /**
     * 按主键查询单条记录（便捷方法）
     * @param tableName 配置表名
     * @param id        主键值
     * @returns 记录数据，未找到则返回 null
     */
    getById<T>(tableName: string, id: number | string): T | null {
        const accessor = this.getAccessor<T>(tableName);
        if (!accessor) return null;
        return accessor.getById(id);
    }

    /**
     * 获取指定表的所有记录（便捷方法）
     * @param tableName 配置表名
     * @returns 所有记录数组，未注册则返回空数组
     */
    getAll<T>(tableName: string): T[] {
        const accessor = this.getAccessor<T>(tableName);
        if (!accessor) return [];
        return accessor.getAll();
    }

    /**
     * 获取指定表的记录总数
     * @param tableName 配置表名
     * @returns 记录数，未注册则返回 0
     */
    getCount(tableName: string): number {
        const accessor = this._accessors.get(tableName);
        if (!accessor) return 0;
        return accessor.getCount();
    }

    /** 检查指定表的访问器是否已注册 */
    hasAccessor(tableName: string): boolean {
        return this._accessors.has(tableName);
    }

    /** 获取所有已注册的表名 */
    getRegisteredTables(): string[] {
        return Array.from(this._accessors.keys());
    }

    /** 移除指定表的访问器 */
    removeAccessor(tableName: string): void {
        this._accessors.delete(tableName);
    }

    /** 清空所有访问器 */
    clear(): void {
        this._accessors.clear();
    }
}
