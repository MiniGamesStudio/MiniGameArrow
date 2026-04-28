import { BufferAsset, resources } from 'cc';

/**
 * 轻量级 ByteBuffer 封装 — 提供零拷贝读取能力
 * 包装 ArrayBuffer + DataView，供 FlatBuffers 生成代码使用
 */
export class ByteBuffer {
    private _bytes: Uint8Array;
    private _view: DataView;
    private _position: number = 0;

    constructor(bytes: Uint8Array) {
        this._bytes = bytes;
        this._view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }

    /** 从 ArrayBuffer 创建 */
    static fromArrayBuffer(buffer: ArrayBuffer): ByteBuffer {
        return new ByteBuffer(new Uint8Array(buffer));
    }

    /** 获取底层字节数组（零拷贝） */
    bytes(): Uint8Array {
        return this._bytes;
    }

    /** 获取 DataView */
    dataView(): DataView {
        return this._view;
    }

    /** 获取缓冲区总长度 */
    capacity(): number {
        return this._bytes.byteLength;
    }

    /** 获取/设置当前读取位置 */
    position(): number {
        return this._position;
    }

    setPosition(pos: number): void {
        this._position = pos;
    }

    /** 读取 int32 */
    readInt32(offset: number): number {
        return this._view.getInt32(offset, true);
    }

    /** 读取 float32 */
    readFloat32(offset: number): number {
        return this._view.getFloat32(offset, true);
    }

    /** 读取 uint8 (bool) */
    readUint8(offset: number): number {
        return this._view.getUint8(offset);
    }

    /** 读取 int16 */
    readInt16(offset: number): number {
        return this._view.getInt16(offset, true);
    }

    /** 读取 uint16 */
    readUint16(offset: number): number {
        return this._view.getUint16(offset, true);
    }
}

/**
 * FlatBuffers 配置加载错误码
 */
export enum ConfigLoadError {
    None = 0,
    FileNotFound = 1,
    ParseFailed = 2,
    InvalidFormat = 3,
}

/**
 * 配置加载结果
 */
export interface ConfigLoadResult {
    success: boolean;
    error: ConfigLoadError;
    message: string;
}

/**
 * FlatBuffers 运行时 — 引擎层，管理二进制配置文件的加载和零拷贝读取
 * 作为基础模块供所有游戏模块复用
 *
 * 使用方式:
 *   await FlatBuffersRuntime.getInstance().loadAll({ enemy: 'config/enemy', weapon: 'config/weapon' });
 *   const buf = FlatBuffersRuntime.getInstance().getBuffer('enemy');
 */
export class FlatBuffersRuntime {
    private static _instance: FlatBuffersRuntime;

    /** 已加载的二进制配置缓存：表名 → ByteBuffer */
    private _buffers: Map<string, ByteBuffer> = new Map();

    static getInstance(): FlatBuffersRuntime {
        if (!this._instance) {
            this._instance = new FlatBuffersRuntime();
        }
        return this._instance;
    }

    /**
     * 异步加载单个 Binary_Config 文件
     * @param tableName 配置表名（用于缓存键）
     * @param path      资源路径（resources 目录下的相对路径）
     * @returns 加载结果
     */
    loadConfig(tableName: string, path: string): Promise<ConfigLoadResult> {
        return new Promise((resolve) => {
            resources.load(path, BufferAsset, (err, asset) => {
                if (err || !asset) {
                    const message = `FlatBuffersRuntime: 加载配置失败 [${tableName}] path=${path} ${err?.message ?? ''}`;
                    console.error(message);
                    resolve({
                        success: false,
                        error: ConfigLoadError.FileNotFound,
                        message,
                    });
                    return;
                }

                try {
                    const arrayBuffer = asset.buffer();
                    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                        const message = `FlatBuffersRuntime: 配置数据为空 [${tableName}]`;
                        console.error(message);
                        resolve({
                            success: false,
                            error: ConfigLoadError.InvalidFormat,
                            message,
                        });
                        return;
                    }

                    // 零拷贝：直接包装 ArrayBuffer，不做额外拷贝
                    const buffer = ByteBuffer.fromArrayBuffer(arrayBuffer);
                    this._buffers.set(tableName, buffer);

                    resolve({
                        success: true,
                        error: ConfigLoadError.None,
                        message: '',
                    });
                } catch (e) {
                    const message = `FlatBuffersRuntime: 解析配置失败 [${tableName}] ${(e as Error).message}`;
                    console.error(message);
                    resolve({
                        success: false,
                        error: ConfigLoadError.ParseFailed,
                        message,
                    });
                }
            });
        });
    }

    /**
     * 批量加载所有配置（并行）
     * @param configMap 表名 → 资源路径 的映射
     * @returns 所有加载结果
     */
    async loadAll(configMap: Record<string, string>): Promise<Map<string, ConfigLoadResult>> {
        const results = new Map<string, ConfigLoadResult>();
        const entries = Object.entries(configMap);

        const promises = entries.map(async ([tableName, path]) => {
            const result = await this.loadConfig(tableName, path);
            results.set(tableName, result);
        });

        await Promise.all(promises);
        return results;
    }

    /**
     * 获取指定表的 ByteBuffer（零拷贝读取）
     * @param tableName 配置表名
     * @returns ByteBuffer 实例，未加载则返回 null
     */
    getBuffer(tableName: string): ByteBuffer | null {
        return this._buffers.get(tableName) ?? null;
    }

    /** 检查指定表是否已加载 */
    hasBuffer(tableName: string): boolean {
        return this._buffers.has(tableName);
    }

    /** 获取所有已加载的表名 */
    getLoadedTables(): string[] {
        return Array.from(this._buffers.keys());
    }

    /** 释放指定表的缓存 */
    releaseConfig(tableName: string): void {
        this._buffers.delete(tableName);
    }

    /** 释放所有缓存 */
    releaseAll(): void {
        this._buffers.clear();
    }
}
