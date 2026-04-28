/**
 * 类型工厂 — 框架层纯逻辑版本
 * 封装 TypeRegistry 的 create 调用，提供批量创建和带配置初始化的便捷方法
 * 不依赖任何引擎 API，适用于任意可扩展系统的实例创建
 *
 * 使用方式:
 *   const registry = new TypeRegistry<IWeaponType>();
 *   registry.register('melee', () => new MeleeWeapon(), (cfg) => { ... });
 *   const factory = new TypeFactory(registry);
 *   const weapon = factory.createWithConfig('melee', { damage: 10 });
 *   const weapons = factory.createBatch(['melee', 'projectile']);
 *   const randomWeapons = factory.createRandom(3);
 */

import { TypeRegistry } from './TypeRegistry';

/**
 * 通用类型工厂，基于 TypeRegistry 提供便捷的实例创建方法
 */
export class TypeFactory<T> {
    private _registry: TypeRegistry<T>;

    /**
     * @param registry 关联的类型注册表
     */
    constructor(registry: TypeRegistry<T>) {
        this._registry = registry;
    }

    /**
     * 创建实例并应用配置
     * 先通过 TypeRegistry 创建实例，再调用注册时提供的 configLoader 加载配置
     * @param typeId  类型唯一标识符
     * @param config  传递给 configLoader 的配置数据
     * @returns 已初始化的实例，若未注册则返回 null
     */
    createWithConfig(typeId: string, config: any): T | null {
        const meta = this._registry.getMeta(typeId);
        if (!meta) {
            console.warn(`TypeFactory: 未注册的类型 [${typeId}]`);
            return null;
        }
        const instance = meta.factory();
        if (meta.configLoader) {
            meta.configLoader(config);
        }
        return instance;
    }

    /**
     * 批量创建多个类型实例
     * 跳过未注册的类型并输出警告
     * @param typeIds 类型标识符数组
     * @returns 成功创建的实例数组（不含 null）
     */
    createBatch(typeIds: string[]): T[] {
        const results: T[] = [];
        for (const typeId of typeIds) {
            const instance = this._registry.create(typeId);
            if (instance !== null) {
                results.push(instance);
            }
        }
        return results;
    }

    /**
     * 从已注册类型中随机创建指定数量的实例
     * @param count 需要创建的实例数量
     * @param rng   可选的随机数生成器，返回 [0, 1) 范围的浮点数；默认使用 Math.random
     * @returns 随机创建的实例数组
     */
    createRandom(count: number, rng?: () => number): T[] {
        const registeredTypes = this._registry.getRegisteredTypes();
        if (registeredTypes.length === 0) {
            console.warn('TypeFactory: 注册表为空，无法随机创建实例');
            return [];
        }

        const random = rng ?? Math.random;
        const results: T[] = [];

        for (let i = 0; i < count; i++) {
            const index = Math.floor(random() * registeredTypes.length);
            const typeId = registeredTypes[index];
            const instance = this._registry.create(typeId);
            if (instance !== null) {
                results.push(instance);
            }
        }

        return results;
    }

    /** 获取关联的类型注册表 */
    getRegistry(): TypeRegistry<T> {
        return this._registry;
    }
}
