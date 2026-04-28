/**
 * 房间生成器
 * 根据楼层配置生成地牢楼层结构，包括房间节点和连接关系
 * 纯逻辑模块，不依赖 Cocos Creator
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import {
    IRoomType,
    RoomNode,
    RoomConnection,
    DungeonFloor,
    FloorConfig,
} from '../Data/Interfaces/IRoomType';

/** 简易自增 ID 生成器 */
let _roomIdCounter = 0;

/**
 * 生成唯一房间 ID
 * @returns 格式为 "room_<counter>" 的字符串
 */
function generateRoomId(): string {
    return `room_${++_roomIdCounter}`;
}

/**
 * 重置 ID 计数器（用于测试或新 Run 开始时）
 */
export function resetRoomIdCounter(): void {
    _roomIdCounter = 0;
}

/**
 * 房间生成器
 * 通过 TypeRegistry<IRoomType> 创建房间实例，生成楼层结构并确保可达性
 */
export class RoomGenerator {
    private _roomRegistry: TypeRegistry<IRoomType>;

    /**
     * @param roomRegistry 房间类型注册表
     */
    constructor(roomRegistry: TypeRegistry<IRoomType>) {
        this._roomRegistry = roomRegistry;
    }

    /**
     * 生成一个地牢楼层
     * @param floorIndex 楼层索引（从 0 开始）
     * @param config 楼层生成配置
     * @returns 完整的地牢楼层数据
     */
    generateFloor(floorIndex: number, config: FloorConfig): DungeonFloor {
        // 1. 计算房间总数
        const roomCount = Math.max(2, config.baseRoomCount + floorIndex * config.roomGrowth);

        // 2. 计算类型分布
        const typeDistribution = this._calculateTypeDistribution(roomCount, floorIndex, config);

        // 3. 生成房间节点
        const rooms = this._generateRooms(typeDistribution);

        // 4. 生成连接关系（确保所有房间可达）
        const connections = this._generateConnections(rooms);

        // 5. BFS 验证可达性，若不可达则补充连接
        this._ensureReachability(rooms, connections);

        // 6. 确定起始房间和 Boss 房间
        const startRoomId = rooms[0].id;
        const bossRoom = rooms.find(r => r.typeId === 'boss');
        const bossRoomId = bossRoom ? bossRoom.id : rooms[rooms.length - 1].id;

        return {
            floorIndex,
            rooms,
            connections,
            startRoomId,
            bossRoomId,
        };
    }

    /**
     * 根据权重配置计算各类型房间的数量分布
     * @param totalCount 房间总数
     * @param floorIndex 楼层索引
     * @param config 楼层配置
     * @returns typeId → 数量 的映射
     */
    private _calculateTypeDistribution(
        totalCount: number,
        floorIndex: number,
        config: FloorConfig
    ): Map<string, number> {
        const distribution = new Map<string, number>();
        const weights = config.typeWeights;
        const typeIds = Object.keys(weights);

        if (typeIds.length === 0) {
            return distribution;
        }

        // 过滤掉不满足楼层要求的精英房间
        const filteredWeights: Record<string, number> = {};
        for (const typeId of typeIds) {
            if (typeId === 'elite' && floorIndex < config.eliteMinFloor) {
                continue;
            }
            filteredWeights[typeId] = weights[typeId];
        }

        // 如果配置了 Boss 必定出现，先预留一个 Boss 房间
        let remaining = totalCount;
        if (config.bossRequired && filteredWeights['boss'] !== undefined) {
            distribution.set('boss', 1);
            remaining--;
            // Boss 不参与后续权重分配
            delete filteredWeights['boss'];
        }

        // 按权重分配剩余房间
        const totalWeight = Object.values(filteredWeights).reduce((sum, w) => sum + w, 0);
        if (totalWeight <= 0 || remaining <= 0) {
            return distribution;
        }

        const filteredTypeIds = Object.keys(filteredWeights);
        let allocated = 0;

        for (let i = 0; i < filteredTypeIds.length; i++) {
            const typeId = filteredTypeIds[i];
            const weight = filteredWeights[typeId];

            let count: number;
            if (i === filteredTypeIds.length - 1) {
                // 最后一个类型分配剩余数量，避免舍入误差
                count = remaining - allocated;
            } else {
                count = Math.round((weight / totalWeight) * remaining);
            }

            count = Math.max(0, count);
            const existing = distribution.get(typeId) ?? 0;
            distribution.set(typeId, existing + count);
            allocated += count;
        }

        return distribution;
    }

    /**
     * 根据类型分布生成房间节点列表
     * @param distribution typeId → 数量
     * @returns 房间节点数组
     */
    private _generateRooms(distribution: Map<string, number>): RoomNode[] {
        const rooms: RoomNode[] = [];

        for (const [typeId, count] of distribution) {
            for (let i = 0; i < count; i++) {
                const roomType = this._roomRegistry.create(typeId);
                const defaultConfig = roomType ? roomType.getDefaultConfig() : {};

                rooms.push({
                    id: generateRoomId(),
                    typeId,
                    position: { x: i * 200, y: 0 },
                    cleared: false,
                    config: defaultConfig,
                });
            }
        }

        return rooms;
    }

    /**
     * 生成房间连接关系
     * 使用线性链 + 随机额外连接的方式确保基本可达性
     * @param rooms 房间节点列表
     * @returns 连接关系数组
     */
    private _generateConnections(rooms: RoomNode[]): RoomConnection[] {
        const connections: RoomConnection[] = [];

        if (rooms.length <= 1) {
            return connections;
        }

        // 先建立线性链，确保基本连通
        for (let i = 0; i < rooms.length - 1; i++) {
            connections.push({
                fromRoomId: rooms[i].id,
                toRoomId: rooms[i + 1].id,
            });
        }

        // 添加少量随机额外连接，增加路径多样性
        const extraCount = Math.floor(rooms.length * 0.3);
        for (let i = 0; i < extraCount; i++) {
            const a = Math.floor(Math.random() * rooms.length);
            let b = Math.floor(Math.random() * rooms.length);
            if (a === b) continue;

            const fromId = rooms[Math.min(a, b)].id;
            const toId = rooms[Math.max(a, b)].id;

            // 避免重复连接
            const exists = connections.some(
                c => (c.fromRoomId === fromId && c.toRoomId === toId) ||
                     (c.fromRoomId === toId && c.toRoomId === fromId)
            );
            if (!exists) {
                connections.push({ fromRoomId: fromId, toRoomId: toId });
            }
        }

        return connections;
    }

    /**
     * BFS 验证所有房间可达性，若存在不可达房间则补充连接
     * @param rooms 房间节点列表
     * @param connections 连接关系数组（可变，会被修改）
     */
    private _ensureReachability(rooms: RoomNode[], connections: RoomConnection[]): void {
        if (rooms.length <= 1) return;

        // 构建邻接表
        const adjacency = new Map<string, Set<string>>();
        for (const room of rooms) {
            adjacency.set(room.id, new Set());
        }
        for (const conn of connections) {
            adjacency.get(conn.fromRoomId)?.add(conn.toRoomId);
            adjacency.get(conn.toRoomId)?.add(conn.fromRoomId);
        }

        // BFS 从第一个房间开始
        const visited = new Set<string>();
        const queue: string[] = [rooms[0].id];
        visited.add(rooms[0].id);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const neighbors = adjacency.get(current);
            if (neighbors) {
                for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }

        // 补充不可达房间的连接
        for (const room of rooms) {
            if (!visited.has(room.id)) {
                // 连接到最近的已访问房间
                const lastVisited = Array.from(visited).pop()!;
                connections.push({
                    fromRoomId: lastVisited,
                    toRoomId: room.id,
                });
                visited.add(room.id);

                // 更新邻接表
                adjacency.get(lastVisited)?.add(room.id);
                adjacency.get(room.id)?.add(lastVisited);
            }
        }
    }
}
