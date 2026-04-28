# 技术设计文档：肉鸽动作游戏（Roguelike Action Game）

## 概述

本文档描述肉鸽动作游戏模块的技术设计方案。设计遵循现有项目的三层架构（框架层 → 引擎层 → 游戏层），参照 SurvivorGame 模块的组织模式，并引入 Extensible_System 可扩展架构和 FlatBuffers 数据管线。

## 1. 系统架构

### 1.1 整体分层

```
┌─────────────────────────────────────────────────────┐
│                    游戏层 (Game)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  FlowerGame   │  │ SurvivorGame │  │RoguelikeGame│ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────┤
│                   引擎层 (Engine)                     │
│  GameManager · UIManager · ResManager · AudioManager │
│  FlatBuffers_Runtime · ConfigManager (新增)           │
├─────────────────────────────────────────────────────┤
│                  框架层 (Framework)                    │
│  EventManager · ObjectPool · StorageManager          │
│  TimerManager · TypeRegistry · TypeFactory (新增)     │
└─────────────────────────────────────────────────────┘
```

### 1.2 RoguelikeGame 模块目录结构

```
assets/scripts/Game/RoguelikeGame/
├── RoguelikeGameEntry.ts        # 模块入口函数
├── RoguelikeConst.ts            # 游戏常量
├── RoguelikeEvent.ts            # 游戏事件枚举
├── RoguelikeGameState.ts        # 持久化状态
├── RoguelikeUIConfig.ts         # UI 面板注册
├── Data/                        # 数据定义与访问
│   ├── Interfaces/              # 基类接口定义
│   │   ├── IRoomType.ts
│   │   ├── IEnemyType.ts
│   │   ├── IWeaponType.ts
│   │   ├── IItemType.ts
│   │   ├── IEventType.ts
│   │   ├── IPetType.ts
│   │   ├── IClassType.ts
│   │   ├── INpcType.ts
│   │   ├── ILevelUpOption.ts
│   │   └── IShopGoods.ts
│   ├── Configs/                 # FlatBuffers 生成的访问代码
│   ├── EnemyData.ts
│   ├── WeaponData.ts
│   ├── ItemData.ts
│   ├── ClassData.ts
│   ├── PetData.ts
│   ├── NpcData.ts
│   ├── CostumeData.ts
│   ├── EventData.ts
│   └── ShopData.ts
├── Runtime/                     # 运行时系统
│   ├── BattleController.ts      # 战斗流程控制
│   ├── DungeonManager.ts        # 地牢管理
│   ├── RoomGenerator.ts         # 房间生成器
│   ├── PlayerController.ts      # 玩家控制
│   ├── InputHandler.ts          # 输入处理
│   ├── EnemySpawner.ts          # 敌人生成器
│   ├── DamageSystem.ts          # 伤害系统
│   ├── LootSystem.ts            # 战利品系统
│   ├── LevelUpManager.ts        # 升级管理
│   ├── WeaponManager.ts         # 武器管理
│   ├── ItemManager.ts           # 道具管理
│   ├── PetManager.ts            # 宠物管理
│   ├── ClassManager.ts          # 职业管理
│   ├── NpcManager.ts            # NPC 管理
│   ├── ShopManager.ts           # 商店管理
│   ├── EventRoomManager.ts      # 事件房间管理
│   ├── CostumeManager.ts        # 换装管理
│   └── MetaProgressionManager.ts # 永久成长管理
├── Types/                       # 可扩展类型实现
│   ├── Rooms/                   # 房间类型
│   │   ├── BattleRoom.ts
│   │   ├── EliteRoom.ts
│   │   ├── BossRoom.ts
│   │   ├── EventRoom.ts
│   │   ├── ShopRoom.ts
│   │   └── NpcRoom.ts
│   ├── Enemies/                 # 敌人类型
│   │   ├── MeleeEnemy.ts
│   │   ├── RangedEnemy.ts
│   │   ├── EliteEnemy.ts
│   │   └── BossEnemy.ts
│   ├── Weapons/                 # 武器类型
│   │   ├── MeleeWeapon.ts
│   │   ├── ProjectileWeapon.ts
│   │   ├── AoeWeapon.ts
│   │   └── OrbitWeapon.ts
│   ├── Pets/                    # 宠物类型
│   │   ├── AttackPet.ts
│   │   ├── DefensePet.ts
│   │   └── SupportPet.ts
│   ├── Classes/                 # 职业类型
│   ├── Npcs/                    # NPC 类型
│   │   ├── BlacksmithNpc.ts
│   │   ├── SkillMasterNpc.ts
│   │   ├── ClassMasterNpc.ts
│   │   └── MerchantNpc.ts
│   ├── Events/                  # 事件类型
│   │   ├── RewardEvent.ts
│   │   ├── TrapEvent.ts
│   │   ├── NpcInteractEvent.ts
│   │   └── AltarEvent.ts
│   └── LevelUpOptions/         # 升级选项类型
└── UI/                          # UI 面板脚本
    ├── RgLoadingPanel.ts
    ├── RgMainPanel.ts
    ├── RgBattleHUD.ts
    ├── RgLevelUpPanel.ts
    ├── RgPausePanel.ts
    ├── RgDeathPanel.ts
    ├── RgVictoryPanel.ts
    ├── RgShopPanel.ts
    ├── RgEventPanel.ts
    ├── RgNpcPanel.ts
    ├── RgClassSelectPanel.ts
    ├── RgTalentTreePanel.ts
    ├── RgCostumePanel.ts
    ├── RgPetPanel.ts
    └── RgMetaUpgradePanel.ts
```

### 1.3 新增基础模块目录结构

```
assets/scripts/framework/
├── TypeRegistry.ts              # 类型注册表（新增）
├── TypeFactory.ts               # 类型工厂（新增）
└── ... (现有文件不变)

assets/scripts/engine/
├── ConfigManager.ts             # FlatBuffers 配置管理器（新增）
├── FlatBuffersRuntime.ts        # FlatBuffers 运行时（新增）
└── ... (现有文件不变)

tools/
├── excel-exporter/              # Excel 导出工具（新增）
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts             # CLI 入口
│   │   ├── ExcelReader.ts       # Excel 读取器
│   │   ├── SchemaGenerator.ts   # FBS Schema 生成器
│   │   ├── SchemaCompiler.ts    # flatc 编译调用
│   │   ├── BinaryExporter.ts    # 二进制数据导出
│   │   ├── SchemaRegistry.ts    # Schema 注册表
│   │   └── ExportPipeline.ts    # 导出管线
│   └── config.json              # 导出配置
└── excel-config/                # Excel 配置源文件目录
    ├── enemy.xlsx
    ├── weapon.xlsx
    ├── item.xlsx
    ├── pet.xlsx
    ├── class.xlsx
    ├── npc.xlsx
    ├── costume.xlsx
    ├── event.xlsx
    ├── shop.xlsx
    └── dungeon.xlsx
```


## 2. 可扩展系统架构（Extensible_System）

### 2.1 核心组件

所有玩法系统统一采用四层可扩展架构：

```
┌─────────────────────────────────────────┐
│           Type_Config (配置层)            │
│  JSON/FlatBuffers 数据驱动类型定义         │
├─────────────────────────────────────────┤
│          Type_Registry (注册层)           │
│  类型标识符 → 元数据 + 工厂方法映射         │
├─────────────────────────────────────────┤
│          Type_Factory (工厂层)            │
│  根据类型标识符创建具体实例               │
├─────────────────────────────────────────┤
│         Base_Interface (接口层)           │
│  定义类型必须实现的属性和方法契约          │
└─────────────────────────────────────────┘
```

### 2.2 TypeRegistry 设计（框架层新增）

```typescript
// assets/scripts/framework/TypeRegistry.ts

interface TypeMeta<T> {
    typeId: string;
    factory: () => T;
    configLoader?: (config: any) => void;
}

export class TypeRegistry<T> {
    private _types: Map<string, TypeMeta<T>> = new Map();

    /** 注册新类型 */
    register(typeId: string, factory: () => T, configLoader?: (config: any) => void): void {
        if (this._types.has(typeId)) {
            console.warn(`TypeRegistry: 类型 [${typeId}] 已存在，将被覆盖`);
        }
        this._types.set(typeId, { typeId, factory, configLoader });
    }

    /** 创建类型实例 */
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

    /** 清空注册表 */
    clear(): void {
        this._types.clear();
    }
}
```

### 2.3 扩展示例：新增武器类型

```typescript
// 1. 实现 Base_Interface
// assets/scripts/Game/RoguelikeGame/Types/Weapons/ChainWeapon.ts
export class ChainWeapon implements IWeaponType {
    typeId = 'chain';
    attack(target: Vec2): void { /* 链式攻击逻辑 */ }
    getRange(): number { return 200; }
}

// 2. 注册到 TypeRegistry（在模块初始化时）
weaponRegistry.register('chain', () => new ChainWeapon());

// 3. 在 Excel 配置中添加 chain 类型的数据行即可生效
```

## 3. 基础模块设计（引擎层 / 框架层）

### 3.1 FlatBuffers 运行时（引擎层新增）

对应需求 10。

```typescript
// assets/scripts/engine/FlatBuffersRuntime.ts

import { ByteBuffer } from 'flatbuffers';

export class FlatBuffersRuntime {
    private static _instance: FlatBuffersRuntime;
    
    /** 已加载的二进制配置缓存：表名 → ByteBuffer */
    private _buffers: Map<string, ByteBuffer> = new Map();

    static getInstance(): FlatBuffersRuntime {
        if (!this._instance) this._instance = new FlatBuffersRuntime();
        return this._instance;
    }

    /** 异步加载单个 Binary_Config 文件 */
    async loadConfig(tableName: string, path: string): Promise<void> {
        // 通过 ResManager 加载二进制资源
        // 创建 ByteBuffer 并缓存
    }

    /** 批量加载所有配置 */
    async loadAll(configMap: Record<string, string>): Promise<void> {
        const promises = Object.entries(configMap).map(
            ([name, path]) => this.loadConfig(name, path)
        );
        await Promise.all(promises);
    }

    /** 获取指定表的 ByteBuffer（零拷贝） */
    getBuffer(tableName: string): ByteBuffer | null {
        return this._buffers.get(tableName) ?? null;
    }

    /** 释放所有缓存 */
    releaseAll(): void {
        this._buffers.clear();
    }
}
```

### 3.2 ConfigManager（引擎层新增）

```typescript
// assets/scripts/engine/ConfigManager.ts

export class ConfigManager {
    private static _instance: ConfigManager;
    
    /** 表名 → 类型安全的访问器 */
    private _accessors: Map<string, any> = new Map();

    static getInstance(): ConfigManager {
        if (!this._instance) this._instance = new ConfigManager();
        return this._instance;
    }

    /** 注册配置访问器（由 FlatBuffers 生成的代码提供） */
    registerAccessor<T>(tableName: string, accessor: T): void {
        this._accessors.set(tableName, accessor);
    }

    /** 获取配置访问器 */
    getAccessor<T>(tableName: string): T | null {
        return this._accessors.get(tableName) as T ?? null;
    }

    /** 按主键查询单条记录 */
    getById<T>(tableName: string, id: number | string): T | null {
        // 通过访问器的 lookup 方法查询
        return null;
    }
}
```

### 3.3 Excel 导出工具设计

对应需求 17。独立 Node.js 工具项目。

```
导出流程：
Excel (.xlsx) → ExcelReader → SchemaGenerator → FBS Schema (.fbs)
                                                      ↓
                                              SchemaCompiler (flatc)
                                                      ↓
                                              TypeScript 访问代码 + Binary_Config (.bin)
```

**ExportPipeline 核心流程：**

```typescript
// tools/excel-exporter/src/ExportPipeline.ts

export class ExportPipeline {
    async run(options: ExportOptions): Promise<ExportResult> {
        // 1. 扫描 Excel 源目录
        const files = await this.scanExcelFiles(options.sourceDir);
        
        // 2. 增量检测：比较文件修改时间与 SchemaRegistry
        const changedFiles = await this.detectChanges(files);
        
        // 3. 逐文件处理
        for (const file of changedFiles) {
            // 3a. 读取 Excel
            const sheets = ExcelReader.read(file);
            
            // 3b. 生成 FBS Schema
            const schema = SchemaGenerator.generate(sheets);
            
            // 3c. 检测 Schema 兼容性
            const compat = SchemaRegistry.checkCompatibility(schema);
            if (!compat.compatible && !options.force) {
                throw new IncompatibleSchemaError(compat.details);
            }
            
            // 3d. 编译 Schema → TypeScript
            await SchemaCompiler.compile(schema, options.outputDir);
            
            // 3e. 导出二进制数据
            BinaryExporter.export(sheets, schema, options.binaryDir);
            
            // 3f. 更新 SchemaRegistry
            SchemaRegistry.update(schema);
        }
        
        // 4. 输出统计摘要
        return { total: files.length, changed: changedFiles.length, ... };
    }
}
```

**Excel 表头约定：**

| 行号 | 用途 | 示例 |
|------|------|------|
| 第1行 | 字段名 | id, name, hp, speed, skills |
| 第2行 | 字段类型 | int, string, float, float, array:int |
| 第3行 | 注释说明 | 敌人ID, 名称, 生命值, 移动速度, 技能列表 |
| 第4行起 | 数据行 | 1001, 史莱姆, 100, 50, [1,2] |

**字段类型映射：**

| Excel 类型标注 | FlatBuffers 类型 | TypeScript 类型 |
|---------------|-----------------|----------------|
| int | int32 | number |
| float | float32 | number |
| bool | bool | boolean |
| string | string | string |
| enum:EnumName | EnumName (byte) | EnumName |
| array:int | [int32] | number[] |
| array:string | [string] | string[] |


## 4. 游戏模块入口与生命周期

对应需求 1。

### 4.1 模块入口

```typescript
// assets/scripts/Game/RoguelikeGame/RoguelikeGameEntry.ts

import { StorageManager } from '../../framework/StorageManager';
import { UIManager } from '../../engine/ui/UIManager';
import { ConfigManager } from '../../engine/ConfigManager';
import { FlatBuffersRuntime } from '../../engine/FlatBuffersRuntime';
import { EventManager } from '../../framework/EventManager';
import { registerRoguelikeGameUI, RoguelikeUIID } from './RoguelikeUIConfig';
import { RoguelikeGameState } from './RoguelikeGameState';
import { RoguelikeEvent } from './RoguelikeEvent';
import { registerAllTypes } from './Types/TypeRegistration';

export async function initRoguelikeGame(): Promise<void> {
    // 1. 设置存储前缀
    StorageManager.getInstance().setPrefix('roguelike_');
    
    // 2. 注册所有 UI 面板
    registerRoguelikeGameUI();
    
    // 3. 加载 FlatBuffers 配置数据
    await FlatBuffersRuntime.getInstance().loadAll(ROGUELIKE_CONFIG_MAP);
    
    // 4. 注册所有可扩展类型
    registerAllTypes();
    
    // 5. 初始化持久化状态
    RoguelikeGameState.getInstance();
    
    // 6. 发送初始化完成事件
    EventManager.getInstance().emit(RoguelikeEvent.ModuleInitialized);
    
    // 7. 打开加载界面
    UIManager.GetInstance().OpenPanel(RoguelikeUIID.LoadingPanel);
}
```

### 4.2 类型统一注册

```typescript
// assets/scripts/Game/RoguelikeGame/Types/TypeRegistration.ts

export function registerAllTypes(): void {
    // 房间类型
    roomRegistry.register('battle', () => new BattleRoom());
    roomRegistry.register('elite', () => new EliteRoom());
    roomRegistry.register('boss', () => new BossRoom());
    roomRegistry.register('event', () => new EventRoom());
    roomRegistry.register('shop', () => new ShopRoom());
    roomRegistry.register('npc', () => new NpcRoom());
    
    // 敌人类型
    enemyRegistry.register('melee', () => new MeleeEnemy());
    enemyRegistry.register('ranged', () => new RangedEnemy());
    enemyRegistry.register('elite', () => new EliteEnemy());
    enemyRegistry.register('boss', () => new BossEnemy());
    
    // 武器类型
    weaponRegistry.register('melee', () => new MeleeWeapon());
    weaponRegistry.register('projectile', () => new ProjectileWeapon());
    weaponRegistry.register('aoe', () => new AoeWeapon());
    weaponRegistry.register('orbit', () => new OrbitWeapon());
    
    // 宠物类型
    petRegistry.register('attack', () => new AttackPet());
    petRegistry.register('defense', () => new DefensePet());
    petRegistry.register('support', () => new SupportPet());
    
    // 事件类型
    eventTypeRegistry.register('reward', () => new RewardEvent());
    eventTypeRegistry.register('trap', () => new TrapEvent());
    eventTypeRegistry.register('npc_interact', () => new NpcInteractEvent());
    eventTypeRegistry.register('altar', () => new AltarEvent());
    
    // NPC 类型
    npcRegistry.register('blacksmith', () => new BlacksmithNpc());
    npcRegistry.register('skill_master', () => new SkillMasterNpc());
    npcRegistry.register('class_master', () => new ClassMasterNpc());
    npcRegistry.register('merchant', () => new MerchantNpc());
}
```

## 5. 玩家角色控制

对应需求 2。

### 5.1 数据模型

```typescript
// 玩家属性
interface PlayerAttributes {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    moveSpeed: number;
    pickupRange: number;
}

// 玩家运行时状态
interface PlayerRuntimeState {
    attributes: PlayerAttributes;
    position: Vec2;
    facing: Vec2;
    isMoving: boolean;
    isAttacking: boolean;
    isInvincible: boolean;
    invincibleTimer: number;
    equippedWeapons: IWeaponType[];
    equippedItems: IItemType[];
    currentClass: IClassType | null;
    currentPet: IPetType | null;
    gold: number;
    exp: number;
    level: number;
    talentPoints: number;
}
```

### 5.2 InputHandler

```typescript
// assets/scripts/Game/RoguelikeGame/Runtime/InputHandler.ts

export class InputHandler {
    /** 虚拟摇杆输入方向（归一化） */
    private _moveDirection: Vec2 = Vec2.ZERO;
    /** 攻击按钮状态 */
    private _attackPressed: boolean = false;
    /** 技能按钮状态（按技能槽索引） */
    private _skillPressed: Map<number, boolean> = new Map();

    /** 绑定虚拟摇杆节点 */
    bindJoystick(joystickNode: Node): void { /* ... */ }
    
    /** 绑定攻击按钮 */
    bindAttackButton(btnNode: Node): void { /* ... */ }
    
    /** 绑定技能按钮 */
    bindSkillButton(slotIndex: number, btnNode: Node): void { /* ... */ }

    getMoveDirection(): Vec2 { return this._moveDirection; }
    isAttackPressed(): boolean { return this._attackPressed; }
    isSkillPressed(slotIndex: number): boolean { return this._skillPressed.get(slotIndex) ?? false; }
}
```

## 6. 地牢随机生成

对应需求 3。

### 6.1 地牢数据结构

```typescript
interface DungeonFloor {
    floorIndex: number;
    rooms: RoomNode[];
    connections: RoomConnection[];
    startRoomId: string;
    bossRoomId: string;
}

interface RoomNode {
    id: string;
    typeId: string;          // 对应 TypeRegistry 中的类型 ID
    position: Vec2;          // 在地图上的位置
    cleared: boolean;
    config: any;             // 从 Type_Config 加载的配置数据
}

interface RoomConnection {
    fromRoomId: string;
    toRoomId: string;
}
```

### 6.2 RoomGenerator

```typescript
// assets/scripts/Game/RoguelikeGame/Runtime/RoomGenerator.ts

export class RoomGenerator {
    private _roomRegistry: TypeRegistry<IRoomType>;

    constructor(roomRegistry: TypeRegistry<IRoomType>) {
        this._roomRegistry = roomRegistry;
    }

    /** 生成一个楼层 */
    generateFloor(floorIndex: number, config: FloorConfig): DungeonFloor {
        // 1. 根据楼层配置确定房间数量和类型分布
        const roomCount = config.baseRoomCount + floorIndex * config.roomGrowth;
        const typeDistribution = this.calculateTypeDistribution(floorIndex, config);
        
        // 2. 生成房间节点（使用 TypeRegistry 创建）
        const rooms = this.generateRooms(roomCount, typeDistribution);
        
        // 3. 生成连接关系（确保所有房间可达）
        const connections = this.generateConnections(rooms);
        
        // 4. 验证可达性（BFS/DFS）
        this.validateReachability(rooms, connections);
        
        return { floorIndex, rooms, connections, startRoomId: rooms[0].id, bossRoomId: rooms[rooms.length - 1].id };
    }

    private generateRooms(count: number, distribution: Map<string, number>): RoomNode[] {
        const rooms: RoomNode[] = [];
        for (const [typeId, num] of distribution) {
            for (let i = 0; i < num; i++) {
                const room = this._roomRegistry.create(typeId);
                if (room) {
                    rooms.push({
                        id: generateUUID(),
                        typeId,
                        position: Vec2.ZERO, // 后续布局算法计算
                        cleared: false,
                        config: room.getDefaultConfig(),
                    });
                }
            }
        }
        return rooms;
    }
}
```

### 6.3 IRoomType 接口

```typescript
// assets/scripts/Game/RoguelikeGame/Data/Interfaces/IRoomType.ts

export interface IRoomType {
    typeId: string;
    /** 进入房间时的初始化逻辑 */
    onEnter(context: RoomContext): void;
    /** 房间清除条件检查 */
    checkClearCondition(context: RoomContext): boolean;
    /** 房间清除后的奖励逻辑 */
    onClear(context: RoomContext): void;
    /** 获取默认配置 */
    getDefaultConfig(): any;
}
```

## 7. 敌人系统

对应需求 4。

### 7.1 IEnemyType 接口

```typescript
export interface IEnemyType {
    typeId: string;
    /** 初始化敌人属性 */
    init(config: EnemyConfig): void;
    /** AI 行为更新（每帧调用） */
    updateAI(dt: number, context: BattleContext): void;
    /** 受击回调 */
    onHit(damage: number, source: Vec2): void;
    /** 死亡回调 */
    onDeath(): LootDrop[];
    /** 获取当前属性 */
    getAttributes(): EnemyAttributes;
}

interface EnemyAttributes {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    moveSpeed: number;
    expDrop: number;
    goldDrop: number;
}
```

### 7.2 EnemySpawner

```typescript
export class EnemySpawner {
    private _enemyRegistry: TypeRegistry<IEnemyType>;
    private _enemyPool: PoolManager;  // 复用框架层 ObjectPool

    /** 根据房间配置生成敌人 */
    spawnEnemies(roomConfig: RoomEnemyConfig): void {
        for (const spawn of roomConfig.spawns) {
            const enemy = this._enemyRegistry.create(spawn.typeId);
            if (enemy) {
                enemy.init(spawn.config);
                // 从对象池获取节点，绑定 enemy 实例
            }
        }
    }

    /** 回收敌人到对象池 */
    recycleEnemy(enemy: IEnemyType): void {
        // 回收到 PoolManager
    }
}
```

## 8. 武器与道具系统

对应需求 5。

### 8.1 IWeaponType 接口

```typescript
export interface IWeaponType {
    typeId: string;
    level: number;
    /** 执行攻击 */
    attack(origin: Vec2, direction: Vec2, context: BattleContext): void;
    /** 升级武器 */
    upgrade(): void;
    /** 获取武器属性 */
    getAttributes(): WeaponAttributes;
    /** 每帧更新（处理冷却、弹道等） */
    update(dt: number): void;
}

interface WeaponAttributes {
    baseDamage: number;
    attackSpeed: number;
    range: number;
    cooldown: number;
    projectileCount?: number;
}
```

### 8.2 IItemType 接口

```typescript
export interface IItemType {
    typeId: string;
    level: number;
    /** 应用道具效果到玩家 */
    applyEffect(player: PlayerRuntimeState): void;
    /** 移除道具效果 */
    removeEffect(player: PlayerRuntimeState): void;
    /** 升级道具 */
    upgrade(): void;
    /** 获取道具描述 */
    getDescription(): string;
}
```

## 9. 升级与成长系统

对应需求 6。

### 9.1 ILevelUpOption 接口

```typescript
export interface ILevelUpOption {
    typeId: string;
    /** 获取选项显示信息 */
    getDisplayInfo(): LevelUpDisplayInfo;
    /** 应用选项效果 */
    apply(player: PlayerRuntimeState): void;
    /** 检查是否可用（避免重复选择已满级的选项） */
    isAvailable(player: PlayerRuntimeState): boolean;
    /** 获取权重（影响出现概率） */
    getWeight(player: PlayerRuntimeState): number;
}

interface LevelUpDisplayInfo {
    icon: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

### 9.2 LevelUpManager

```typescript
export class LevelUpManager {
    private _optionRegistry: TypeRegistry<ILevelUpOption>;

    /** 生成升级选项 */
    generateChoices(player: PlayerRuntimeState, count: number): ILevelUpOption[] {
        const allOptions = this._optionRegistry.getRegisteredTypes()
            .map(typeId => this._optionRegistry.create(typeId)!)
            .filter(opt => opt.isAvailable(player));
        
        // 按权重随机选择 count 个选项
        return weightedRandomSelect(allOptions, 
            opt => opt.getWeight(player), count);
    }

    /** 计算升级所需经验 */
    getExpToNextLevel(currentLevel: number): number {
        return Math.floor(
            RoguelikeConst.BASE_EXP_TO_LEVEL * 
            Math.pow(RoguelikeConst.EXP_GROWTH_FACTOR, currentLevel)
        );
    }
}
```


## 10. 战斗伤害系统

对应需求 8。

### 10.1 DamageSystem

```typescript
export class DamageSystem {
    /** 计算最终伤害 */
    static calculateDamage(
        baseDamage: number,
        attackMultiplier: number,
        targetDefense: number
    ): number {
        return Math.max(1, Math.floor(baseDamage * attackMultiplier - targetDefense));
    }

    /** 应用伤害到目标 */
    static applyDamage(
        target: { hp: number; position: Vec2 },
        damage: number,
        sourcePosition: Vec2,
        knockbackForce: number
    ): DamageResult {
        target.hp -= damage;
        
        // 计算击退方向
        const knockbackDir = target.position.subtract(sourcePosition).normalize();
        
        return {
            finalDamage: damage,
            targetDead: target.hp <= 0,
            knockbackDirection: knockbackDir,
            knockbackForce,
            hitPosition: target.position.clone(),
        };
    }
}

interface DamageResult {
    finalDamage: number;
    targetDead: boolean;
    knockbackDirection: Vec2;
    knockbackForce: number;
    hitPosition: Vec2;
}
```

## 11. 永久成长系统

对应需求 7。

### 11.1 RoguelikeGameState

```typescript
// assets/scripts/Game/RoguelikeGame/RoguelikeGameState.ts

export class RoguelikeGameState {
    private static _instance: RoguelikeGameState;
    private static readonly STORAGE_KEY = 'roguelike_save';

    // 永久成长数据
    totalGold: number = 0;
    metaUpgrades: Map<string, number> = new Map();  // upgradeId → level
    unlockedClasses: string[] = ['warrior', 'mage'];
    unlockedCostumes: string[] = ['default'];
    npcAffinities: Map<string, number> = new Map();  // npcTypeId → affinity
    
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
        if (data) { /* 反序列化各字段 */ }
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
}
```

### 11.2 MetaProgressionManager

```typescript
export class MetaProgressionManager {
    /** 购买永久升级 */
    purchaseUpgrade(upgradeId: string): boolean {
        const state = RoguelikeGameState.getInstance();
        const config = ConfigManager.getInstance().getById<MetaUpgradeConfig>('meta_upgrade', upgradeId);
        if (!config) return false;
        
        const currentLevel = state.metaUpgrades.get(upgradeId) ?? 0;
        const cost = config.baseCost + config.costGrowth * currentLevel;
        
        if (state.totalGold < cost) return false;
        
        state.totalGold -= cost;
        state.metaUpgrades.set(upgradeId, currentLevel + 1);
        state.save();
        return true;
    }

    /** 将永久升级效果应用到玩家初始属性 */
    applyToPlayer(player: PlayerRuntimeState): void {
        const state = RoguelikeGameState.getInstance();
        for (const [upgradeId, level] of state.metaUpgrades) {
            const config = ConfigManager.getInstance().getById<MetaUpgradeConfig>('meta_upgrade', upgradeId);
            if (config) {
                // 根据 config.attributeType 和 level 计算加成
                player.attributes[config.attributeType] += config.valuePerLevel * level;
            }
        }
    }
}
```

## 12. 事件房间系统

对应需求 11。

### 12.1 IEventType 接口

```typescript
export interface IEventType {
    typeId: string;
    /** 获取事件显示信息 */
    getDisplayInfo(): EventDisplayInfo;
    /** 获取可选操作列表 */
    getOptions(context: EventContext): EventOption[];
    /** 执行选项效果 */
    executeOption(optionIndex: number, context: EventContext): EventResult;
    /** 检查事件是否已完成 */
    isCompleted(): boolean;
}

interface EventOption {
    label: string;
    description: string;
    cost?: { type: 'gold' | 'hp'; amount: number };
    preview?: string;  // 效果预览文本
}

interface EventResult {
    success: boolean;
    rewards?: LootDrop[];
    effects?: AttributeModifier[];
    message: string;
}
```

## 13. 商店系统

对应需求 12。

### 13.1 IShopGoods 接口

```typescript
export interface IShopGoods {
    typeId: string;
    /** 生成商品实例 */
    generateItem(floorIndex: number, rng: RandomGenerator): ShopItem;
    /** 购买商品 */
    purchase(item: ShopItem, player: PlayerRuntimeState): boolean;
}

interface ShopItem {
    id: string;
    goodsTypeId: string;
    name: string;
    description: string;
    price: number;
    rarity: string;
    icon: string;
    purchased: boolean;
}
```

### 13.2 ShopManager

```typescript
export class ShopManager {
    private _goodsRegistry: TypeRegistry<IShopGoods>;

    /** 生成商店库存 */
    generateInventory(floorIndex: number, itemCount: number): ShopItem[] {
        const allTypes = this._goodsRegistry.getRegisteredTypes();
        const items: ShopItem[] = [];
        const rng = new RandomGenerator(Date.now());
        
        for (let i = 0; i < itemCount; i++) {
            const typeId = rng.pickRandom(allTypes);
            const goods = this._goodsRegistry.create(typeId);
            if (goods) {
                items.push(goods.generateItem(floorIndex, rng));
            }
        }
        return items;
    }

    /** 购买商品 */
    purchaseItem(item: ShopItem, player: PlayerRuntimeState): boolean {
        if (player.gold < item.price) return false;
        
        const goods = this._goodsRegistry.create(item.goodsTypeId);
        if (!goods) return false;
        
        const success = goods.purchase(item, player);
        if (success) {
            player.gold -= item.price;
            item.purchased = true;
        }
        return success;
    }
}
```

## 14. 宠物系统

对应需求 13。

### 14.1 IPetType 接口

```typescript
export interface IPetType {
    typeId: string;
    level: number;
    /** 初始化宠物 */
    init(config: PetConfig): void;
    /** 每帧更新（AI 行为） */
    update(dt: number, context: BattleContext): void;
    /** 获取被动增益效果 */
    getPassiveEffects(): AttributeModifier[];
    /** 升级宠物 */
    upgrade(): void;
    /** 获取显示信息 */
    getDisplayInfo(): PetDisplayInfo;
}
```

## 15. 职业系统

对应需求 15。

### 15.1 IClassType 接口

```typescript
export interface IClassType {
    typeId: string;
    rarity: ClassRarity;
    /** 获取基础属性加成 */
    getBaseAttributes(): Partial<PlayerAttributes>;
    /** 获取天赋树定义 */
    getTalentTree(): TalentTreeDef;
    /** 获取职业技能列表 */
    getSkills(): IClassSkill[];
    /** 获取解锁条件 */
    getUnlockCondition(): UnlockCondition;
}

enum ClassRarity {
    Common = 'common',
    Elite = 'elite',
    Legendary = 'legendary',
    Hidden = 'hidden',
}

interface TalentTreeDef {
    tiers: TalentTierDef[];
    requiredPerTier: number;  // 解锁下一层需要的当前层天赋数
}

interface TalentTierDef {
    tierIndex: number;
    talents: TalentDef[];
}

interface TalentDef {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    effects: AttributeModifier[];
}
```

### 15.2 IClassSkill 接口

```typescript
export interface IClassSkill {
    skillId: string;
    level: number;
    cooldown: number;
    currentCooldown: number;
    resourceCost: number;
    /** 执行技能 */
    execute(context: BattleContext): void;
    /** 更新冷却 */
    updateCooldown(dt: number): void;
    /** 是否可用 */
    isReady(): boolean;
    /** 升级技能 */
    upgrade(): void;
}
```

### 15.3 ClassManager

```typescript
export class ClassManager {
    private _classRegistry: TypeRegistry<IClassType>;

    /** 获取已解锁的职业列表 */
    getUnlockedClasses(): IClassType[] {
        const state = RoguelikeGameState.getInstance();
        return state.unlockedClasses
            .map(id => this._classRegistry.create(id))
            .filter(c => c !== null) as IClassType[];
    }

    /** 选择职业并应用到玩家 */
    selectClass(classTypeId: string, player: PlayerRuntimeState): void {
        const classType = this._classRegistry.create(classTypeId);
        if (!classType) return;
        
        player.currentClass = classType;
        const baseAttrs = classType.getBaseAttributes();
        Object.assign(player.attributes, baseAttrs);
    }

    /** 分配天赋点 */
    allocateTalent(talentId: string, player: PlayerRuntimeState): boolean {
        if (player.talentPoints <= 0) return false;
        // 检查天赋层级解锁条件
        // 应用天赋效果
        player.talentPoints--;
        return true;
    }

    /** 职业转换（重置天赋，退还点数） */
    switchClass(newClassId: string, player: PlayerRuntimeState): void {
        // 移除旧职业效果
        // 重置天赋树，退还天赋点
        // 应用新职业
        this.selectClass(newClassId, player);
    }

    /** 检查职业解锁条件 */
    checkUnlockConditions(): string[] {
        const state = RoguelikeGameState.getInstance();
        const newlyUnlocked: string[] = [];
        
        for (const typeId of this._classRegistry.getRegisteredTypes()) {
            if (state.unlockedClasses.includes(typeId)) continue;
            const classType = this._classRegistry.create(typeId);
            if (classType && this.meetsCondition(classType.getUnlockCondition(), state)) {
                state.unlockedClasses.push(typeId);
                newlyUnlocked.push(typeId);
            }
        }
        
        if (newlyUnlocked.length > 0) state.save();
        return newlyUnlocked;
    }
}
```

## 16. NPC 系统

对应需求 16。

### 16.1 INpcType 接口

```typescript
export interface INpcType {
    typeId: string;
    /** 获取 NPC 显示信息 */
    getDisplayInfo(): NpcDisplayInfo;
    /** 获取可用服务列表 */
    getServices(context: NpcContext): NpcService[];
    /** 执行服务 */
    executeService(serviceId: string, context: NpcContext): ServiceResult;
    /** 获取对话内容 */
    getDialogue(affinityLevel: number): string[];
}

interface NpcService {
    serviceId: string;
    name: string;
    description: string;
    cost: number;
    available: boolean;
    unavailableReason?: string;
}

interface NpcContext {
    player: PlayerRuntimeState;
    affinity: number;
    npcNetwork: NpcNetworkState;
}
```

### 16.2 NPC 关系网络

```typescript
interface NpcRelation {
    npcA: string;
    npcB: string;
    relationType: 'cooperation' | 'competition' | 'mentorship';
}

interface NpcNetworkState {
    relations: NpcRelation[];
    affinities: Map<string, number>;
}

export class NpcManager {
    private _npcRegistry: TypeRegistry<INpcType>;
    private _network: NpcNetworkState;

    /** 增加好感度 */
    addAffinity(npcTypeId: string, amount: number): void {
        const state = RoguelikeGameState.getInstance();
        const current = state.npcAffinities.get(npcTypeId) ?? 0;
        state.npcAffinities.set(npcTypeId, current + amount);
        state.save();
        
        // 检查是否触发联动奖励
        this.checkCooperationRewards(npcTypeId);
    }

    /** 检查合作联动奖励 */
    private checkCooperationRewards(npcTypeId: string): void {
        const state = RoguelikeGameState.getInstance();
        for (const relation of this._network.relations) {
            if (relation.relationType !== 'cooperation') continue;
            if (relation.npcA !== npcTypeId && relation.npcB !== npcTypeId) continue;
            
            const otherNpc = relation.npcA === npcTypeId ? relation.npcB : relation.npcA;
            const affinityA = state.npcAffinities.get(relation.npcA) ?? 0;
            const affinityB = state.npcAffinities.get(relation.npcB) ?? 0;
            
            // 双方好感度都达到阈值时触发联动
            if (affinityA >= COOPERATION_THRESHOLD && affinityB >= COOPERATION_THRESHOLD) {
                EventManager.getInstance().emit(RoguelikeEvent.NpcCooperationReward, relation);
            }
        }
    }

    /** 获取竞争关系价格调整系数 */
    getCompetitionPriceModifier(npcTypeId: string): number {
        // 与竞争对手交互后，该 NPC 的价格可能上调
        return 1.0; // 默认无调整
    }
}
```

## 17. 换装系统

对应需求 14。

```typescript
export class CostumeManager {
    /** 获取已解锁的装扮列表 */
    getUnlockedCostumes(): CostumeInfo[] {
        const state = RoguelikeGameState.getInstance();
        // 从配置中读取所有装扮，标记解锁状态
        return [];
    }

    /** 装备装扮 */
    equipCostume(costumeId: string, slot: 'head' | 'body' | 'effect'): void {
        const state = RoguelikeGameState.getInstance();
        if (!state.unlockedCostumes.includes(costumeId)) return;
        // 更新装备状态并持久化
        state.save();
    }

    /** 解锁装扮 */
    unlockCostume(costumeId: string): void {
        const state = RoguelikeGameState.getInstance();
        if (!state.unlockedCostumes.includes(costumeId)) {
            state.unlockedCostumes.push(costumeId);
            state.save();
        }
    }
}
```

## 18. 战斗流程控制

### 18.1 BattleController

```typescript
export class BattleController {
    private _dungeonManager: DungeonManager;
    private _playerController: PlayerController;
    private _enemySpawner: EnemySpawner;
    private _damageSystem: DamageSystem;
    private _levelUpManager: LevelUpManager;
    private _weaponManager: WeaponManager;
    private _petManager: PetManager;
    private _isPaused: boolean = false;
    private _battleTime: number = 0;
    private _killCount: number = 0;

    /** 开始新的 Run */
    startRun(classTypeId: string): void {
        // 1. 初始化玩家（应用永久升级 + 职业属性）
        // 2. 生成第一个楼层
        // 3. 进入起始房间
        // 4. 发送 BattleStart 事件
    }

    /** 每帧更新 */
    update(dt: number): void {
        if (this._isPaused) return;
        
        this._battleTime += dt;
        this._playerController.update(dt);
        this._enemySpawner.update(dt);
        this._weaponManager.update(dt);
        this._petManager.update(dt);
        // 碰撞检测、伤害计算等
    }

    /** 暂停/恢复 */
    pause(): void { this._isPaused = true; }
    resume(): void { this._isPaused = false; }

    /** 玩家死亡 */
    onPlayerDeath(): void {
        this.pause();
        const result: RunResult = {
            cleared: false,
            floorReached: this._dungeonManager.currentFloor,
            killCount: this._killCount,
            survivalTime: this._battleTime,
        };
        const settlement = RoguelikeGameState.getInstance().settleRun(result);
        EventManager.getInstance().emit(RoguelikeEvent.RunEnd, result, settlement);
    }

    /** 进入下一楼层 */
    enterNextFloor(): void {
        this._dungeonManager.generateNextFloor();
        // 进入新楼层起始房间
    }
}
```

## 19. UI 面板设计

对应需求 9。

### 19.1 UI ID 枚举

```typescript
export enum RoguelikeUIID {
    None = 0,
    LoadingPanel = 201,
    MainPanel = 202,
    BattleHUD = 203,
    LevelUpPanel = 204,
    PausePanel = 205,
    DeathPanel = 206,
    VictoryPanel = 207,
    ShopPanel = 208,
    EventPanel = 209,
    NpcPanel = 210,
    ClassSelectPanel = 211,
    TalentTreePanel = 212,
    CostumePanel = 213,
    PetPanel = 214,
    MetaUpgradePanel = 215,
}
```

### 19.2 面板层级分配

| 面板 | UILayer | UIShowMode | 说明 |
|------|---------|------------|------|
| LoadingPanel | System | Normal | 加载界面 |
| MainPanel | Normal | Normal | 主界面 |
| BattleHUD | Normal | Normal | 战斗 HUD |
| LevelUpPanel | PopUp | Single | 升级选择 |
| PausePanel | PopUp | Single | 暂停面板 |
| DeathPanel | PopUp | Single | 死亡结算 |
| VictoryPanel | PopUp | Single | 胜利结算 |
| ShopPanel | PopUp | Single | 商店界面 |
| EventPanel | PopUp | Single | 事件界面 |
| NpcPanel | PopUp | Single | NPC 交互 |
| ClassSelectPanel | PopUp | Single | 职业选择 |
| TalentTreePanel | PopUp | Single | 天赋树 |
| CostumePanel | PopUp | Single | 换装面板 |
| PetPanel | PopUp | Single | 宠物面板 |
| MetaUpgradePanel | PopUp | Single | 永久升级 |

## 20. 事件系统设计

### 20.1 RoguelikeEvent 枚举

```typescript
export enum RoguelikeEvent {
    // 模块生命周期
    ModuleInitialized = "Roguelike.ModuleInitialized",
    
    // 战斗流程
    RunStart = "Roguelike.RunStart",
    RunEnd = "Roguelike.RunEnd",
    BattlePause = "Roguelike.BattlePause",
    BattleResume = "Roguelike.BattleResume",
    FloorEnter = "Roguelike.FloorEnter",
    RoomEnter = "Roguelike.RoomEnter",
    RoomClear = "Roguelike.RoomClear",
    
    // 玩家
    PlayerHPChanged = "Roguelike.PlayerHPChanged",
    PlayerDied = "Roguelike.PlayerDied",
    PlayerExpChanged = "Roguelike.PlayerExpChanged",
    PlayerLevelUp = "Roguelike.PlayerLevelUp",
    PlayerGoldChanged = "Roguelike.PlayerGoldChanged",
    
    // 升级
    LevelUpChoicesReady = "Roguelike.LevelUpChoicesReady",
    LevelUpChoiceSelected = "Roguelike.LevelUpChoiceSelected",
    
    // 敌人
    EnemyKilled = "Roguelike.EnemyKilled",
    BossDefeated = "Roguelike.BossDefeated",
    
    // 武器与道具
    WeaponAdded = "Roguelike.WeaponAdded",
    WeaponUpgraded = "Roguelike.WeaponUpgraded",
    ItemPickedUp = "Roguelike.ItemPickedUp",
    
    // 职业
    ClassSelected = "Roguelike.ClassSelected",
    ClassSwitched = "Roguelike.ClassSwitched",
    ClassUnlocked = "Roguelike.ClassUnlocked",
    TalentAllocated = "Roguelike.TalentAllocated",
    SkillUsed = "Roguelike.SkillUsed",
    
    // 宠物
    PetObtained = "Roguelike.PetObtained",
    PetReplaced = "Roguelike.PetReplaced",
    PetLevelUp = "Roguelike.PetLevelUp",
    
    // NPC
    NpcInteract = "Roguelike.NpcInteract",
    NpcAffinityChanged = "Roguelike.NpcAffinityChanged",
    NpcCooperationReward = "Roguelike.NpcCooperationReward",
    NpcServiceUsed = "Roguelike.NpcServiceUsed",
    
    // 商店
    ShopItemPurchased = "Roguelike.ShopItemPurchased",
    
    // 事件
    EventTriggered = "Roguelike.EventTriggered",
    EventOptionSelected = "Roguelike.EventOptionSelected",
    
    // 换装
    CostumeEquipped = "Roguelike.CostumeEquipped",
    CostumeUnlocked = "Roguelike.CostumeUnlocked",
    
    // 永久成长
    MetaUpgradePurchased = "Roguelike.MetaUpgradePurchased",
}
```

## 21. 正确性属性（Correctness Properties）

以下属性将通过 Property-Based Testing 验证：

### P1: 伤害计算正确性
- `∀ baseDamage, multiplier, defense: calculateDamage(baseDamage, multiplier, defense) >= 1`
- 伤害公式结果始终 ≥ 1

### P2: 地牢可达性
- `∀ floor generated by RoomGenerator: allRoomsReachable(floor) == true`
- 生成的地牢中所有房间之间存在可达路径

### P3: 经验公式单调递增
- `∀ level1 < level2: getExpToNextLevel(level1) < getExpToNextLevel(level2)`
- 升级所需经验随等级严格递增

### P4: 配置数据往返一致性
- `∀ valid config data D: deserialize(serialize(D)) == D`
- Excel → FlatBuffers → 读取的完整链路保持数据一致

### P5: 金币交易原子性
- `∀ purchase operation: player.gold_before - item.price == player.gold_after (if success)`
- 购买操作前后金币变化精确等于商品价格

### P6: 天赋树层级约束
- `∀ talent allocation: tier(talent) == 0 || allocatedInPreviousTier >= requiredPerTier`
- 只有满足前置层级条件才能分配更高层天赋

### P7: 类型注册表唯一性
- `∀ typeId registered in TypeRegistry: count(typeId) == 1`
- 每个类型 ID 在注册表中唯一

### P8: 对象池守恒
- `∀ pool operations: pool.activeCount + pool.freeCount == pool.totalCreated`
- 对象池中活跃对象 + 空闲对象 = 总创建数

### P9: NPC 好感度非负
- `∀ npc affinity operations: affinity >= 0`
- NPC 好感度始终非负

### P10: 武器槽上限约束
- `∀ weapon add operation: player.equippedWeapons.length <= MAX_WEAPON_SLOTS`
- 玩家装备的武器数量不超过上限
