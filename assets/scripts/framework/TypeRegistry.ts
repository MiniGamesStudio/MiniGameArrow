/**
 * 类型注册表 — 框架层纯逻辑版本
 * 不依赖任何引擎 API，适用于任意可扩展系统的类型注册与实例创建
 *
 * 使用方式:
 *   const registry = new TypeRegistry<IWeaponType>();
 *   registry.register('melee', () => new MeleeWeapon());
 *   const weapon = registry.create('melee');
 */

/** 类型元数据，描述一个已注册类型的标识、工厂方法和可选的配置加载器 */
export interface TypeMeta<T> {
    /** 类型唯一标识符 */
    typeId: string;
    /** 创建该类型实例的工厂方法 */
    factory: () => T;
    /** 可选的配置加载回调，用于从 Type_Config 初始化实例 */
    configLoader?: (config: any) => void;
}

export class TypeRegistry<T> {
    private _types: Map<string, TypeMeta<T>> = new Map();

    /**
     * 注册新类型
     * @param typeId        类型唯一标识符
     * @param factory       创建实例的工厂方法
     * @param configLoader  可选的配置加载回调
     */
    register(typeId: string, factory: () => T, configLoader?: (config: any) => void): void {
        if (this._types.has(typeId)) {
            console.warn(`TypeRegistry: 类型 [${typeId}] 已存在，将被覆盖`);
        }
        this._types.set(typeId, { typeId, factory, configLoader });
    }

    /**
     * 根据类型标识符创建实例
     * @param typeId 类型唯一标识符
     * @returns 类型实例，若未注册则返回 null
     */
    create(typeId: string): T | null {
        const meta = this._types.get(typeId);
        if (!meta) {
            console.warn(`TypeRegistry: 未注册的类型 [${typeId}]`);
            return null;
        }
        return meta.factory();
    }

    /** 获取所有已注册类型 ID */
    getRegisteredTypes(): string[] {
        return Array.from(this._types.keys());
    }

    /** 检查类型是否已注册 */
    has(typeId: string): boolean {
        return this._types.has(typeId);
    }

    /** 获取类型元数据（供 TypeFactory 等上层模块使用） */
    getMeta(typeId: string): TypeMeta<T> | null {
        return this._types.get(typeId) ?? null;
    }

    /** 清空注册表 */
    clear(): void {
        this._types.clear();
    }
}
