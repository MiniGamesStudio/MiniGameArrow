import { Asset, AssetManager, assetManager, Prefab, resources, instantiate, Node } from 'cc';

export const DEFAULT_BUNDLE_NAME = 'resources';

export interface BundlePreloadEntry<T extends Asset = Asset> {
    bundleName: string;
    path: string;
    type?: new (...args: any[]) => T;
}

export type BundlePreloadProgress = (finished: number, total: number, progress: number) => void;
export type BundlePreloadComplete = (err: Error | null) => void;

/**
 * 资源管理器 — 统一管理 resources 目录下资源的加载、缓存和释放
 * 引擎层：依赖 Cocos Creator 资源系统
 */
export class ResManager {
    private static _instance: ResManager;

    /** 已加载资源的引用计数 path -> count */
    private _refMap: Map<string, number> = new Map();
    /** 已加载 Bundle 缓存 bundleName -> bundle */
    private _bundleMap: Map<string, AssetManager.Bundle> = new Map();

    static getInstance(): ResManager {
        if (!this._instance) {
            this._instance = new ResManager();
        }
        return this._instance;
    }

    /** 加载单个 resources 资源（回调方式） */
    load<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (err: Error | null, asset: T | null) => void): void {
        this.loadFromBundle(DEFAULT_BUNDLE_NAME, path, type, callback);
    }

    /** 加载并缓存 Bundle */
    loadBundle(bundleName: string, callback: (err: Error | null, bundle: AssetManager.Bundle | null) => void): void {
        const name = bundleName || DEFAULT_BUNDLE_NAME;
        const cachedBundle = this._bundleMap.get(name) || assetManager.getBundle(name);
        if (cachedBundle) {
            this._bundleMap.set(name, cachedBundle);
            callback(null, cachedBundle);
            return;
        }

        assetManager.loadBundle(name, (err, bundle) => {
            if (!err && bundle) {
                this._bundleMap.set(name, bundle);
            }
            callback(err, bundle || null);
        });
    }

    /** 加载并缓存 Bundle（Promise 方式） */
    loadBundleAsync(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            this.loadBundle(bundleName, (err, bundle) => {
                if (err || !bundle) reject(err || new Error(`加载 Bundle 失败: ${bundleName}`));
                else resolve(bundle);
            });
        });
    }

    /** 从指定 Bundle 加载单个资源 */
    loadFromBundle<T extends Asset>(
        bundleName: string,
        path: string,
        type: new (...args: any[]) => T,
        callback: (err: Error | null, asset: T | null) => void
    ): void {
        this.loadBundle(bundleName, (bundleErr, bundle) => {
            if (bundleErr || !bundle) {
                callback(bundleErr || new Error(`Bundle 不存在: ${bundleName}`), null);
                return;
            }

            bundle.load(path, type, (err, asset) => {
                if (!err && asset) {
                    this.addRef(this.getAssetKey(bundleName, path));
                }
                callback(err, asset as T);
            });
        });
    }

    /** 从指定 Bundle 加载单个资源（Promise 方式） */
    loadFromBundleAsync<T extends Asset>(bundleName: string, path: string, type: new (...args: any[]) => T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.loadFromBundle(bundleName, path, type, (err, asset) => {
                if (err || !asset) reject(err || new Error(`加载资源失败: ${bundleName}/${path}`));
                else resolve(asset);
            });
        });
    }

    /** 预加载多个 Bundle 和关键入口资源 */
    preloadBundles(
        bundleNames: string[],
        entries: BundlePreloadEntry[] = [],
        onProgress?: BundlePreloadProgress,
        onComplete?: BundlePreloadComplete,
    ): void {
        const uniqueBundleNames = Array.from(new Set((bundleNames || []).filter(Boolean)));
        const total = uniqueBundleNames.length + entries.length;
        if (total <= 0) {
            onProgress?.(1, 1, 1);
            onComplete?.(null);
            return;
        }

        let finished = 0;
        let failed = false;
        const reportProgress = (): void => {
            onProgress?.(finished, total, Math.min(finished / total, 1));
        };
        const finishOne = (): void => {
            finished++;
            reportProgress();
        };
        const fail = (err: Error): void => {
            if (failed) return;
            failed = true;
            onComplete?.(err);
        };

        reportProgress();
        const preloadEntries = (): void => {
            if (failed) return;
            if (entries.length <= 0) {
                onComplete?.(null);
                return;
            }

            let pendingEntries = entries.length;
            entries.forEach(entry => {
                this.preloadBundleEntry(entry, err => {
                    if (err) {
                        fail(err);
                        return;
                    }
                    finishOne();
                    pendingEntries--;
                    if (pendingEntries <= 0 && !failed) {
                        onComplete?.(null);
                    }
                });
            });
        };

        let pendingBundles = uniqueBundleNames.length;
        if (pendingBundles <= 0) {
            preloadEntries();
            return;
        }
        uniqueBundleNames.forEach(bundleName => {
            this.loadBundle(bundleName, err => {
                if (err) {
                    fail(err);
                    return;
                }
                finishOne();
                pendingBundles--;
                if (pendingBundles <= 0) {
                    preloadEntries();
                }
            });
        });
    }

    private preloadBundleEntry(entry: BundlePreloadEntry, callback: (err: Error | null) => void): void {
        this.loadBundle(entry.bundleName, (bundleErr, bundle) => {
            if (bundleErr || !bundle) {
                callback(bundleErr || new Error(`Bundle 不存在: ${entry.bundleName}`));
                return;
            }

            const done = (err: Error | null): void => callback(err);
            if (entry.type) {
                bundle.preload(entry.path, entry.type, done);
                return;
            }

            bundle.preload(entry.path, done);
        });
    }

    /** 加载目录下所有 resources 资源 */
    loadDir<T extends Asset>(dir: string, type: new (...args: any[]) => T, callback: (err: Error | null, assets: T[]) => void): void {
        resources.loadDir(dir, type, (err, assets) => {
            if (!err && assets) {
                this.addRef(this.getAssetKey(DEFAULT_BUNDLE_NAME, dir));
            }
            callback(err, assets as T[]);
        });
    }

    /** 加载单个 resources 资源（Promise 方式） */
    loadAsync<T extends Asset>(path: string, type: new (...args: any[]) => T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.load(path, type, (err, asset) => {
                if (err || !asset) reject(err || new Error(`加载资源失败: ${path}`));
                else resolve(asset);
            });
        });
    }

    /** 实例化 Prefab 的便捷方法 */
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

    /** 释放单个资源（引用计数归零时真正释放） */
    release(path: string): void {
        const count = this._refMap.get(path);
        if (count !== undefined) {
            if (count <= 1) {
                this._refMap.delete(path);
                const { bundleName, assetPath } = this.parseAssetKey(path);
                const bundle = this._bundleMap.get(bundleName) || assetManager.getBundle(bundleName);
                bundle?.release(assetPath);
            } else {
                this._refMap.set(path, count - 1);
            }
        }
    }

    /** 释放目录下所有资源 */
    releaseDir(dir: string): void {
        const keysToDelete: string[] = [];
        for (const [key] of this._refMap) {
            if (key === dir || key.startsWith(dir + '/')) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this._refMap.delete(key);
            const { bundleName, assetPath } = this.parseAssetKey(key);
            const bundle = this._bundleMap.get(bundleName) || assetManager.getBundle(bundleName);
            bundle?.release(assetPath);
        }
    }

    /** 释放所有已缓存资源 */
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

    private getAssetKey(bundleName: string, path: string): string {
        return `${bundleName || DEFAULT_BUNDLE_NAME}:${path}`;
    }

    private parseAssetKey(key: string): { bundleName: string; assetPath: string } {
        const splitIndex = key.indexOf(':');
        if (splitIndex < 0) {
            return { bundleName: DEFAULT_BUNDLE_NAME, assetPath: key };
        }

        return {
            bundleName: key.slice(0, splitIndex) || DEFAULT_BUNDLE_NAME,
            assetPath: key.slice(splitIndex + 1),
        };
    }
}
