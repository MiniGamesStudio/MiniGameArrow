# 肉鸽动作游戏 — 开发过程记录

## 项目概述

基于现有 Cocos Creator 项目框架，开发一款肉鸽（Roguelike）动作游戏模块。游戏核心玩法为：玩家操控角色在随机生成的地牢关卡中战斗，通过击败敌人获取经验升级、拾取随机武器和道具，逐层深入直至通关或死亡。

---

## 一、需求讨论过程

### 第一轮：核心需求（10 个模块）

用户提出「做一款肉鸽动作游戏」，经过讨论确定了 10 个核心需求模块：

1. **游戏模块初始化与生命周期** — 复用现有引擎框架，遵循 SurvivorGame 架构模式
2. **玩家角色控制** — 虚拟摇杆移动、攻击操作、基础属性系统
3. **地牢随机生成** — 多房间类型、可达性保证、楼层递进难度
4. **敌人系统** — 多种敌人类型、AI 行为、Boss 多阶段战斗、对象池管理
5. **武器与道具系统** — 四种武器类型、随机掉落、稀有度权重
6. **升级与成长系统** — 经验宝石、随机升级选项、指数经验曲线
7. **永久成长系统（Meta-Progression）** — 跨 Run 金币结算、永久升级、持久化存储
8. **战斗伤害系统** — 伤害公式、无敌帧、击退效果、伤害数字
9. **用户界面系统** — 战斗 HUD、7 个 UI 面板、UIManager 层级管理
10. **数据配置与序列化** — JSON 配置、TypeScript 类型定义、往返一致性

### 第二轮：新增 4 个系统

用户要求加入事件房间、商店、宠物系统、换装系统：

11. **事件房间系统** — 四种事件类型（奖励选择、陷阱、NPC 互动、祭坛），事件状态保留
12. **商店系统** — 商品随机生成、金币购买流程、楼层深度影响稀有度和价格
13. **宠物系统** — 三种宠物类型（攻击/防御/辅助），跟随 AI、等级成长、替换确认
14. **换装系统** — 三个装扮部位（头部/身体/特效），纯装饰性、预览与持久化

### 第三轮：新增职业系统和 NPC 系统

用户要求加入职业系统（普通/精英/传奇/隐藏）和 NPC 系统（铁匠/技能师/职业师/商人）：

15. **职业系统** — 四种稀有度，每个职业有独立天赋树（至少三层）和专属技能（至少两个），不同稀有度有不同解锁条件
16. **NPC 系统** — 四种 NPC 类型，各有专属服务。NPC 之间有合作/竞争/师徒关系，好感度系统跨 Run 持久化

### 第四轮：新增 Excel 导出工具

用户要求开发 Excel 配置导出工具，使用 FlatBuffers 格式：

17. **Excel 配置导出工具与 FlatBuffers 数据读取** — Excel 读取、Schema 自动生成、flatc 编译、二进制导出、增量导出、零拷贝读取

### 第五轮：可扩展性与基础模块归属

用户要求：
- 每个玩法系统要可扩展，方便后续添加新类型
- 数据配置和读取工具放到基础模块中

更新内容：
- 9 个玩法系统新增 Extensible_System 架构验收标准（Type_Registry + Type_Factory + Type_Config + Base_Interface）
- 需求 10 和 17 标注为「基础模块 / 引擎层」，供所有游戏模块复用

---

## 二、技术设计要点

### 整体架构

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

### 可扩展系统架构

所有玩法系统统一采用四层可扩展架构：

- **Type_Config（配置层）** — JSON/FlatBuffers 数据驱动类型定义
- **Type_Registry（注册层）** — 类型标识符 → 元数据 + 工厂方法映射
- **Type_Factory（工厂层）** — 根据类型标识符创建具体实例
- **Base_Interface（接口层）** — 定义类型必须实现的属性和方法契约

新增类型只需：实现接口 → 注册工厂方法 → 添加配置数据，无需修改核心逻辑。

### 正确性属性（10 条）

- P1: 伤害计算结果始终 ≥ 1
- P2: 生成的地牢中所有房间可达
- P3: 升级所需经验随等级严格递增
- P4: Excel → FlatBuffers → 读取的完整链路保持数据一致
- P5: 购买操作前后金币变化精确等于商品价格
- P6: 天赋树层级解锁条件约束
- P7: 类型注册表中每个 ID 唯一
- P8: 对象池活跃 + 空闲 = 总创建数
- P9: NPC 好感度始终非负
- P10: 武器装备数量不超过上限

---

## 三、实现过程

### 阶段 1：框架层 + 引擎层基础模块

| 文件 | 说明 |
|------|------|
| `framework/TypeRegistry.ts` | 泛型类型注册表，支持 register/create/has/clear |
| `framework/TypeFactory.ts` | 封装 TypeRegistry，提供批量创建和带配置初始化 |
| `engine/FlatBuffersRuntime.ts` | FlatBuffers 二进制配置加载，零拷贝读取，ByteBuffer 封装 |
| `engine/ConfigManager.ts` | 配置表访问器管理，按主键查询和遍历 |

### 阶段 2：游戏模块基础文件

| 文件 | 说明 |
|------|------|
| `RoguelikeConst.ts` | 游戏常量（玩家属性、经验公式、武器槽等） |
| `RoguelikeEvent.ts` | 事件枚举（40+ 个事件，覆盖所有系统） |
| `RoguelikeGameState.ts` | 持久化状态（金币、升级、解锁、好感度、统计） |
| `RoguelikeUIConfig.ts` | UI 面板注册（15 个面板，ID 201-215） |
| `RoguelikeGameEntry.ts` | 模块入口函数（初始化流程 7 步） |

### 阶段 3：数据接口层（11 个接口文件）

| 接口 | 关键方法 |
|------|----------|
| `IRoomType` | onEnter, checkClearCondition, onClear |
| `IEnemyType` | init, updateAI, onHit, onDeath |
| `IWeaponType` | attack, upgrade, update |
| `IItemType` | applyEffect, removeEffect, upgrade |
| `ILevelUpOption` | getDisplayInfo, apply, isAvailable, getWeight |
| `IEventType` | getOptions, executeOption, isCompleted |
| `IShopGoods` | generateItem, purchase |
| `IPetType` | init, update, getPassiveEffects, upgrade |
| `IClassType` | getBaseAttributes, getTalentTree, getSkills |
| `IClassSkill` | execute, updateCooldown, isReady |
| `INpcType` | getServices, executeService, getDialogue |

### 阶段 4：运行时核心系统（15 个管理器）

| 管理器 | 核心职责 |
|--------|----------|
| `DamageSystem` | 伤害公式 max(1, floor(base * mult - def))，击退计算 |
| `InputHandler` | 虚拟摇杆 8 方向，攻击/技能按钮状态 |
| `PlayerController` | 玩家状态管理、移动、攻击冷却、无敌帧、经验/金币 |
| `RoomGenerator` | 楼层生成、类型分布、连接关系、BFS 可达性验证 |
| `DungeonManager` | 楼层切换、房间进入/清除、相邻房间查询 |
| `EnemySpawner` | 敌人创建（TypeRegistry）、对象池回收、AI 更新调度 |
| `LootSystem` | 掉落概率表、楼层深度稀有度调整 |
| `WeaponManager` | 武器装备（MAX_WEAPON_SLOTS）、升级、每帧更新 |
| `ItemManager` | 道具拾取即时生效、重复拾取升级 |
| `LevelUpManager` | 加权随机选项生成、经验公式、选项效果应用 |
| `MetaProgressionManager` | 永久升级购买、费用计算、初始属性应用 |
| `ShopManager` | 商品随机生成、购买交易流程 |
| `EventRoomManager` | 加权随机事件抽取、选项执行、状态保留 |
| `PetManager` | 宠物激活/替换、AI 更新、被动增益 |
| `ClassManager` | 职业选择/切换、天赋分配（层级约束）、解锁检测 |
| `NpcManager` | 好感度管理、合作联动奖励、竞争价格调整 |
| `CostumeManager` | 装扮解锁/装备、三部位管理、纯装饰性 |
| `BattleController` | 中央协调器，整合所有系统，管理 Run 完整生命周期 |

### 阶段 5：可扩展类型实现（22 个类型 + 1 个注册模块）

| 类别 | 类型 |
|------|------|
| 房间（6） | BattleRoom, EliteRoom, BossRoom, EventRoom, ShopRoom, NpcRoom |
| 敌人（4） | MeleeEnemy（追踪近战）, RangedEnemy（保持距离射击）, EliteEnemy（狂暴机制）, BossEnemy（3 阶段） |
| 武器（4） | MeleeWeapon（扇形）, ProjectileWeapon（弹道）, AoeWeapon（圆形 AOE）, OrbitWeapon（环绕旋转） |
| 宠物（3） | AttackPet（自动攻击）, DefensePet（周期护盾）, SupportPet（被动增益） |
| 事件（4） | RewardEvent, TrapEvent, NpcInteractEvent, AltarEvent（献祭换力量） |
| NPC（4） | BlacksmithNpc（武器强化）, SkillMasterNpc（技能学习）, ClassMasterNpc（职业转换）, MerchantNpc（稀有交易） |
| 注册（1） | TypeRegistration — 6 个 TypeRegistry 实例 + registerAllTypes() |

### 阶段 6：UI 面板（15 个）

| 面板 | 层级 | 功能 |
|------|------|------|
| RgLoadingPanel | System | 加载进度，自动跳转主界面 |
| RgMainPanel | Normal | 开始游戏、永久升级、换装、职业、宠物入口 |
| RgBattleHUD | Normal | HP/EXP/楼层/武器/金币/职业/技能冷却 |
| RgLevelUpPanel | PopUp | 3 个随机选项，稀有度颜色 |
| RgPausePanel | PopUp | 继续/退出 |
| RgDeathPanel | PopUp | 存活时间、击杀数、金币、成就 |
| RgVictoryPanel | PopUp | 通关统计、奖励加成 |
| RgShopPanel | PopUp | 商品列表、购买、金币不足提示 |
| RgEventPanel | PopUp | 事件描述、选项按钮、消耗显示 |
| RgNpcPanel | PopUp | 对话、服务列表、好感度条 |
| RgClassSelectPanel | PopUp | 职业列表、属性预览、技能预览 |
| RgTalentTreePanel | PopUp | 层级天赋节点、点数分配、重置 |
| RgCostumePanel | PopUp | 部位筛选、预览、装备 |
| RgPetPanel | PopUp | 宠物信息、替换确认 |
| RgMetaUpgradePanel | PopUp | 升级列表、等级/费用、效果预览 |

### 阶段 7：Excel 导出工具

| 文件 | 说明 |
|------|------|
| `package.json` | 依赖：xlsx, flatbuffers, commander |
| `tsconfig.json` | ES2020, commonjs, strict |
| `config.json` | 默认路径配置 |
| `ExcelReader.ts` | 读取 .xlsx，3 行表头解析，类型验证，跳过注释行 |
| `SchemaGenerator.ts` | 生成 .fbs Schema，6 种类型映射 |
| `SchemaCompiler.ts` | 调用 flatc 编译 → TypeScript |
| `BinaryExporter.ts` | FlatBuffers Builder 序列化 → .bin |
| `SchemaRegistry.ts` | SHA256 哈希追踪，兼容性检测，增量导出 |
| `ExportPipeline.ts` | 完整管线编排，统计摘要输出 |
| `index.ts` | CLI 入口，commander 参数解析 |

### 阶段 8：数据配置定义

| 文件 | 说明 |
|------|------|
| `ConfigTables.ts` | 11 个配置表 TypeScript 接口 + 占位访问器注册 |

---

## 四、文件清单

### 新增基础模块（4 个）

```
assets/scripts/framework/TypeRegistry.ts
assets/scripts/framework/TypeFactory.ts
assets/scripts/engine/FlatBuffersRuntime.ts
assets/scripts/engine/ConfigManager.ts
```

### 游戏模块基础文件（5 个）

```
assets/scripts/Game/RoguelikeGame/RoguelikeConst.ts
assets/scripts/Game/RoguelikeGame/RoguelikeEvent.ts
assets/scripts/Game/RoguelikeGame/RoguelikeGameState.ts
assets/scripts/Game/RoguelikeGame/RoguelikeUIConfig.ts
assets/scripts/Game/RoguelikeGame/RoguelikeGameEntry.ts
```

### 数据接口层（11 个）

```
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IRoomType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IEnemyType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IWeaponType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IItemType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/ILevelUpOption.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IEventType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IShopGoods.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IPetType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IClassType.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/IClassSkill.ts
assets/scripts/Game/RoguelikeGame/Data/Interfaces/INpcType.ts
```

### 数据配置定义（1 个）

```
assets/scripts/Game/RoguelikeGame/Data/ConfigTables.ts
```

### 运行时系统（18 个）

```
assets/scripts/Game/RoguelikeGame/Runtime/DamageSystem.ts
assets/scripts/Game/RoguelikeGame/Runtime/InputHandler.ts
assets/scripts/Game/RoguelikeGame/Runtime/PlayerController.ts
assets/scripts/Game/RoguelikeGame/Runtime/RoomGenerator.ts
assets/scripts/Game/RoguelikeGame/Runtime/DungeonManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/EnemySpawner.ts
assets/scripts/Game/RoguelikeGame/Runtime/LootSystem.ts
assets/scripts/Game/RoguelikeGame/Runtime/WeaponManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/ItemManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/LevelUpManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/MetaProgressionManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/ShopManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/EventRoomManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/PetManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/ClassManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/NpcManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/CostumeManager.ts
assets/scripts/Game/RoguelikeGame/Runtime/BattleController.ts
```

### 可扩展类型实现（23 个）

```
assets/scripts/Game/RoguelikeGame/Types/TypeRegistration.ts
assets/scripts/Game/RoguelikeGame/Types/Rooms/BattleRoom.ts
assets/scripts/Game/RoguelikeGame/Types/Rooms/EliteRoom.ts
assets/scripts/Game/RoguelikeGame/Types/Rooms/BossRoom.ts
assets/scripts/Game/RoguelikeGame/Types/Rooms/EventRoom.ts
assets/scripts/Game/RoguelikeGame/Types/Rooms/ShopRoom.ts
assets/scripts/Game/RoguelikeGame/Types/Rooms/NpcRoom.ts
assets/scripts/Game/RoguelikeGame/Types/Enemies/MeleeEnemy.ts
assets/scripts/Game/RoguelikeGame/Types/Enemies/RangedEnemy.ts
assets/scripts/Game/RoguelikeGame/Types/Enemies/EliteEnemy.ts
assets/scripts/Game/RoguelikeGame/Types/Enemies/BossEnemy.ts
assets/scripts/Game/RoguelikeGame/Types/Weapons/MeleeWeapon.ts
assets/scripts/Game/RoguelikeGame/Types/Weapons/ProjectileWeapon.ts
assets/scripts/Game/RoguelikeGame/Types/Weapons/AoeWeapon.ts
assets/scripts/Game/RoguelikeGame/Types/Weapons/OrbitWeapon.ts
assets/scripts/Game/RoguelikeGame/Types/Pets/AttackPet.ts
assets/scripts/Game/RoguelikeGame/Types/Pets/DefensePet.ts
assets/scripts/Game/RoguelikeGame/Types/Pets/SupportPet.ts
assets/scripts/Game/RoguelikeGame/Types/Events/RewardEvent.ts
assets/scripts/Game/RoguelikeGame/Types/Events/TrapEvent.ts
assets/scripts/Game/RoguelikeGame/Types/Events/NpcInteractEvent.ts
assets/scripts/Game/RoguelikeGame/Types/Events/AltarEvent.ts
assets/scripts/Game/RoguelikeGame/Types/Npcs/BlacksmithNpc.ts
assets/scripts/Game/RoguelikeGame/Types/Npcs/SkillMasterNpc.ts
assets/scripts/Game/RoguelikeGame/Types/Npcs/ClassMasterNpc.ts
assets/scripts/Game/RoguelikeGame/Types/Npcs/MerchantNpc.ts
```

### UI 面板（15 个）

```
assets/scripts/Game/RoguelikeGame/UI/RgLoadingPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgMainPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgBattleHUD.ts
assets/scripts/Game/RoguelikeGame/UI/RgLevelUpPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgPausePanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgDeathPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgVictoryPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgShopPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgEventPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgNpcPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgClassSelectPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgTalentTreePanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgCostumePanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgPetPanel.ts
assets/scripts/Game/RoguelikeGame/UI/RgMetaUpgradePanel.ts
```

### Excel 导出工具（10 个）

```
tools/excel-exporter/package.json
tools/excel-exporter/tsconfig.json
tools/excel-exporter/config.json
tools/excel-exporter/src/index.ts
tools/excel-exporter/src/ExcelReader.ts
tools/excel-exporter/src/SchemaGenerator.ts
tools/excel-exporter/src/SchemaCompiler.ts
tools/excel-exporter/src/BinaryExporter.ts
tools/excel-exporter/src/SchemaRegistry.ts
tools/excel-exporter/src/ExportPipeline.ts
tools/excel-config/README.md
```

### Spec 文档（4 个）

```
.kiro/specs/roguelike-action-game/.config.kiro
.kiro/specs/roguelike-action-game/requirements.md
.kiro/specs/roguelike-action-game/design.md
.kiro/specs/roguelike-action-game/tasks.md
```

---

## 五、后续工作

1. **Prefab 制作** — 在 Cocos Creator 编辑器中为 15 个 UI 面板创建对应的 Prefab 文件
2. **Excel 配置填充** — 按照 `tools/excel-config/README.md` 的表头约定创建 10 个 Excel 配置文件
3. **美术资源** — 角色、敌人、武器、宠物、NPC 的 Spine/帧动画资源
4. **音效音乐** — 战斗 BGM、技能音效、UI 音效
5. **Launcher 接入** — 将 `Launcher.ts` 中的 `initFlowerGame` 替换为 `initRoguelikeGame`
6. **属性测试** — 实现 10 条正确性属性的 Property-Based Testing
7. **性能优化** — 对象池预热、敌人 AI 分帧更新、碰撞检测空间分区
8. **数值平衡** — 通过 Excel 配置调整敌人属性、武器伤害、掉落概率等数值
