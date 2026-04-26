import { Asset, Prefab, resources, instantiate, Node } from 'cc';

/**
 * 资源管理器 — 统一管理 resources 目录下资源的加载、缓存和释放
 *
 * 使用方式:
 *   const sp = await ResManager.getInstance().loadAsync<SpriteFrame>('texture/icon', SpriteFrame);
 *   ResManager.getInstance().load<Prefab>('ui/MyPanel', Prefab, (err, prefab) => { ... });
 *   ResManager.getInstance().releaseDir('levelData');
 */
export class ResManager {
    private static _instance: ResManager;

    /** 已加载资源的引用计数 path -> count */
    private _refMap: Map<string, number> = new Map();

    static getInstance(): ResManager {
        if (!this._instance) {
            this._instance = new ResManager();
        }
        return this._instance;
    }

    /**
     * 加载单个资源（回调方式）
     * @param path resources 下的路径
     * @param type 资源类型
     * @param callback 完成回调
     */
    load<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (err: Error | null, asset: T) => void): void {
        resources.load(path, type, (err, asset) => {
            if (!err && asset) {
                this.addRef(path);
            }
            callback(err, asset as T);
        });
    }

    /**
     * 加载单个资源（Promise 方式）
     */
    loadAsync<T extends Asset>(path: string, type: new (...args: any[]) => T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.load(path, type, (err, asset) => {
                if (err) reject(err);
                else resolve(asset);
            });
        });
    }

    /**
     * 加载目录下所有资源
     */
    loadDir<T extends Asset>(dir: string, type: new (...args: any[]) => T, callback: (err: Error | null, assets: T[]) => void): void {
        resources.loadDir(dir, type, (err, assets) => {
            if (!err && assets) {
                // 使用目录路径作为引用计数 key
                this.addRef(dir);
            }
            callback(err, assets as T[]);
        });
    }

    /**
     * 实例化 Prefab 的便捷方法
     */
    instantiatePrefab(path: string, callback: (err: Error | null, node: Node | null) => void): void {
        this.load(path, Prefab, (err, prefab) => {
            if (err || !prefab) {
                callback(err, null);
                return;
            }
            const node = instantiate(prefab);
            callback(null, node);
        });
    }

    /**
     * 释放单个资源（引用计数归零时真正释放）
     */
    release(path: string): void {
        const count = this._refMap.get(path);
        if (count !== undefined) {
            if (count <= 1) {
                this._refMap.delete(path);
                resources.release(path);
            } else {
                this._refMap.set(path, count - 1);
            }
        }
    }

    /**
     * 释放目录下所有资源
     */
    releaseDir(dir: string): void {
        // 清除该目录下的引用计数并逐个释放
        const keysToDelete: string[] = [];
        for (const [key] of this._refMap) {
            if (key === dir || key.startsWith(dir + '/')) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this._refMap.delete(key);
            resources.release(key);
        }
    }

    /**
     * 释放所有已缓存资源
     */
    releaseAll(): void {
        this._refMap.clear();
        resources.releaseAll();
    }

    /** 获取某资源的引用计数 */
    getRefCount(path: string): number {
        return this._refMap.get(path) ?? 0;
    }

    private addRef(path: string): void {
        const count = this._refMap.get(path) ?? 0;
        this._refMap.set(path, count + 1);
    }
}
