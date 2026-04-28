# 需求文档：肉鸽动作游戏（Roguelike Action Game）

## 简介

基于现有 Cocos Creator 项目框架，开发一款肉鸽（Roguelike）动作游戏模块。游戏核心玩法为：玩家操控角色在随机生成的地牢关卡中战斗，通过击败敌人获取经验升级、拾取随机武器和道具，逐层深入直至通关或死亡。每次游戏流程（Run）具有随机性和不可重复性，死亡后从头开始，但可通过永久升级系统（Meta-Progression）保留部分成长。

本模块复用项目已有的引擎层（GameManager、UIManager、EventManager、ObjectPool 等），并参照 SurvivorGame 模块的架构模式进行开发。

## 术语表

- **Game_Module**：肉鸽动作游戏模块，作为独立游戏玩法挂载到现有引擎框架
- **Player_Character**：玩家操控的角色实体
- **Dungeon**：地牢，由多个 Room 组成的一次完整游戏流程
- **Room**：房间，地牢中的单个战斗/事件区域
- **Room_Generator**：房间生成器，负责随机生成房间布局和内容
- **Enemy**：敌人实体，包含普通怪、精英怪和 Boss
- **Enemy_Spawner**：敌人生成器，负责在房间中按规则生成敌人
- **Weapon**：武器，玩家的攻击手段，具有不同类型和属性
- **Item**：道具，提供被动增益效果的可拾取物品
- **Loot_System**：战利品系统，管理敌人掉落和房间奖励的随机生成
- **Level_Up_System**：升级系统，管理经验获取和升级时的随机选项
- **Meta_Progression**：永久成长系统，跨 Run 保留的升级内容
- **Battle_Controller**：战斗控制器，管理单次 Run 的战斗流程
- **HUD**：战斗界面，显示玩家血量、经验、小地图等信息
- **Input_Handler**：输入处理器，处理玩家的移动和攻击操作
- **Run**：一次完整的地牢探索流程，从进入到死亡或通关
- **Damage_System**：伤害系统，计算和应用伤害、击退等效果
- **Event_Room**：事件房间，地牢中的非战斗房间，提供随机事件（选择奖励、陷阱、NPC 互动等）
- **Event_Pool**：事件池，管理所有可触发事件的集合及其权重
- **Shop_Room**：商店房间，地牢中可用金币购买武器和道具的特殊房间
- **Shop_Inventory**：商店库存，管理商店中可售商品的生成和刷新
- **Gold**：金币，游戏内通用货币，通过击杀敌人和完成事件获取，用于商店购买和永久升级
- **Pet**：宠物，跟随玩家的辅助实体，提供战斗辅助或被动增益效果
- **Pet_System**：宠物系统，管理宠物的获取、装备、AI 行为和增益效果
- **Costume**：外观装扮，改变 Player_Character 视觉外观的装饰性物品
- **Costume_System**：换装系统，管理外观装扮的解锁、预览和装备
- **Class**：职业，定义 Player_Character 的战斗风格和成长方向，具有专属天赋和技能
- **Class_System**：职业系统，管理职业的解锁、切换、天赋树和技能分配
- **Class_Rarity**：职业稀有度，分为普通（Common）、精英（Elite）、传奇（Legendary）和隐藏（Hidden）四个等级
- **Talent**：天赋，职业专属的被动能力节点，通过天赋树解锁
- **Talent_Tree**：天赋树，每个职业拥有的被动能力成长路径，包含多个层级的 Talent 节点
- **Class_Skill**：职业技能，职业专属的主动战斗技能，可通过升级或 NPC 学习获得
- **NPC**：非玩家角色，在地牢或主界面中提供特定服务的功能性角色
- **NPC_System**：NPC 系统，管理所有 NPC 的生成、交互逻辑和关系网络
- **Blacksmith**：铁匠 NPC，提供武器强化和装备修理服务
- **Skill_Master**：技能师 NPC，提供职业技能学习和升级服务
- **Class_Master**：职业师 NPC，提供职业转换和高级职业解锁服务
- **Merchant**：商人 NPC，提供稀有道具交易服务
- **NPC_Affinity**：NPC 好感度，衡量玩家与特定 NPC 之间关系亲密程度的数值
- **NPC_Network**：NPC 关系网络，定义 NPC 之间的互动关系和联动效果
- **Excel_Exporter**：Excel 配置导出工具，读取 Excel 表格中的游戏配置数据，自动生成 FlatBuffers Schema 并编译导出为二进制数据文件
- **FlatBuffers_Runtime**：FlatBuffers 运行时库，在 Cocos Creator 项目中集成的 FlatBuffers 解析模块，负责加载和零拷贝读取二进制配置数据
- **FBS_Schema**：FlatBuffers Schema 文件（.fbs），描述配置数据结构的类型定义文件，由 Excel_Exporter 根据 Excel 表头自动生成
- **Binary_Config**：二进制配置文件，由 Excel_Exporter 使用 FlatBuffers 序列化生成的高效数据文件，替代 JSON 配置文件用于游戏运行时加载
- **Export_Pipeline**：导出管线，Excel_Exporter 的完整工作流程，包括 Excel 读取、Schema 生成、Schema 编译和二进制数据导出四个阶段
- **Schema_Registry**：Schema 注册表，记录所有已生成 FBS_Schema 的版本和哈希信息，用于增量导出和变更检测
- **Type_Registry**：类型注册表，一种设计模式，维护类型标识符到类型元数据和工厂方法的映射关系，支持运行时动态注册和查询新类型
- **Type_Factory**：类型工厂，基于工厂模式的实例创建器，根据类型标识符调用对应的注册工厂方法创建具体实例，新类型只需注册工厂方法即可扩展
- **Type_Config**：类型配置，通过 JSON 或 Binary_Config 文件定义的类型属性和行为参数，实现数据驱动的类型定义，新增类型无需修改核心代码
- **Base_Interface**：基类接口，每个可扩展系统定义的抽象基类或接口，规定该系统所有类型必须实现的属性和方法契约
- **Extensible_System**：可扩展系统，采用 Type_Registry + Type_Factory + Type_Config + Base_Interface 四层架构的玩法系统，支持通过配置和实现类扩展新类型

## 需求

### 需求 1：游戏模块初始化与生命周期

**用户故事：** 作为开发者，我希望肉鸽游戏作为独立模块接入现有引擎框架，以便复用已有的基础设施并保持架构一致性。

#### 验收标准

1. THE Game_Module SHALL 提供一个入口函数 `initRoguelikeGame()`，注册所有 UI 面板、初始化持久化状态并打开加载界面
2. THE Game_Module SHALL 遵循现有 SurvivorGame 模块的架构模式，包含 Entry、Const、Event、GameState、UIConfig 五个基础文件
3. THE Game_Module SHALL 通过 GameManager 的 `onGameReady` 回调注入，与引擎层解耦
4. WHEN Game_Module 初始化完成时，THE Game_Module SHALL 通过 EventManager 发送初始化完成事件

### 需求 2：玩家角色控制

**用户故事：** 作为玩家，我希望能流畅地操控角色移动和攻击，以便在地牢中进行动作战斗。

#### 验收标准

1. THE Input_Handler SHALL 支持虚拟摇杆控制角色八方向移动
2. WHEN 玩家触摸攻击按钮时，THE Player_Character SHALL 使用当前装备的武器执行攻击动作
3. WHILE Player_Character 处于移动状态，THE Player_Character SHALL 播放对应方向的移动动画
4. WHILE Player_Character 处于攻击状态，THE Player_Character SHALL 在攻击动画播放完毕前限制再次攻击
5. THE Player_Character SHALL 具有生命值（HP）、攻击力、移动速度、防御力四项基础属性
6. IF Player_Character 的生命值降至 0 或以下，THEN THE Battle_Controller SHALL 触发死亡流程并结束当前 Run

### 需求 3：地牢随机生成

**用户故事：** 作为玩家，我希望每次进入地牢时关卡布局都不同，以便获得肉鸽游戏的核心随机体验。

#### 验收标准

1. WHEN 玩家开始新的 Run 时，THE Room_Generator SHALL 随机生成一个包含多个房间的地牢楼层
2. THE Room_Generator SHALL 生成至少三种房间类型：战斗房间、精英房间和 Boss 房间
3. THE Room_Generator SHALL 确保生成的地牢中所有房间之间存在可达路径
4. THE Room_Generator SHALL 根据当前楼层深度调整房间数量和难度参数
5. WHEN 玩家击败 Boss 房间的敌人时，THE Battle_Controller SHALL 开放通往下一楼层的入口
6. FOR ALL 由 Room_Generator 生成的地牢布局，序列化后再反序列化 SHALL 产生等价的布局结构（往返一致性）
7. THE Room_Generator SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册房间类型，新增房间类型只需实现 Base_Interface 并注册到 Type_Registry，无需修改 Room_Generator 的核心生成逻辑
8. THE Room_Generator SHALL 通过 Type_Config 驱动房间类型的属性和行为参数，新增房间类型通过添加配置数据即可生效

### 需求 4：敌人系统

**用户故事：** 作为玩家，我希望遇到多样化的敌人，以便战斗体验丰富且具有挑战性。

#### 验收标准

1. THE Enemy_Spawner SHALL 支持至少三种敌人类型：近战型、远程型和精英型
2. WHEN 玩家进入战斗房间时，THE Enemy_Spawner SHALL 根据房间配置生成对应数量和类型的敌人
3. WHILE Enemy 处于存活状态，THE Enemy SHALL 根据自身类型执行对应的 AI 行为（追踪、巡逻或远程攻击）
4. WHEN Enemy 的生命值降至 0 时，THE Enemy SHALL 播放死亡动画并通过 Loot_System 生成掉落物
5. THE Enemy_Spawner SHALL 使用 ObjectPool 管理敌人实例的创建和回收
6. WHEN 玩家进入 Boss 房间时，THE Enemy_Spawner SHALL 生成具有多阶段攻击模式的 Boss 敌人
7. THE Enemy_Spawner SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册敌人类型和 AI 行为，新增敌人类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改 Enemy_Spawner 的核心生成和调度逻辑
8. THE Enemy SHALL 通过 Type_Config 驱动敌人属性和 AI 行为参数，新增敌人类型和 AI 行为模式通过添加配置数据即可生效

### 需求 5：武器与道具系统

**用户故事：** 作为玩家，我希望在探索过程中获得随机武器和道具，以便构建独特的角色 Build。

#### 验收标准

1. THE Weapon SHALL 支持至少四种类型：近战斩击、远程投射、范围伤害和环绕型
2. THE Loot_System SHALL 在敌人死亡时按配置的概率表生成武器或道具掉落
3. WHEN 玩家拾取武器时，THE Player_Character SHALL 装备该武器并替换或添加到武器槽
4. WHEN 玩家拾取道具时，THE Item SHALL 立即对 Player_Character 的属性产生增益效果
5. THE Loot_System SHALL 根据当前楼层深度调整掉落物的稀有度权重
6. THE Player_Character SHALL 最多同时装备的武器数量不超过 `MAX_WEAPON_SLOTS` 配置值
7. THE Weapon SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册武器类型，新增武器类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改武器系统的核心逻辑
8. THE Item SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册道具类型，新增道具类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改道具系统的核心逻辑
9. THE Weapon 和 Item SHALL 通过 Type_Config 驱动类型属性和效果参数，新增武器类型和道具类型通过添加配置数据即可生效

### 需求 6：升级与成长系统

**用户故事：** 作为玩家，我希望通过击杀敌人获得经验并升级，以便在单次 Run 中逐步变强。

#### 验收标准

1. WHEN Enemy 被击杀时，THE Enemy SHALL 掉落经验宝石
2. WHEN Player_Character 拾取经验宝石时，THE Level_Up_System SHALL 累加经验值并检查是否达到升级阈值
3. WHEN Player_Character 达到升级阈值时，THE Level_Up_System SHALL 暂停战斗并展示随机生成的升级选项面板
4. THE Level_Up_System SHALL 每次升级提供 3 个随机选项，包括：新武器、武器升级、新被动道具、被动道具升级或生命恢复
5. THE Level_Up_System SHALL 使用公式 `BASE_EXP * (EXP_GROWTH_FACTOR ^ currentLevel)` 计算每级所需经验值
6. WHEN 玩家选择升级选项后，THE Level_Up_System SHALL 应用选项效果并恢复战斗
7. THE Level_Up_System SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册升级选项类型，新增升级选项类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改 Level_Up_System 的核心选项生成和应用逻辑
8. THE Level_Up_System SHALL 通过 Type_Config 驱动升级选项的属性和效果参数，新增升级选项类型通过添加配置数据即可生效

### 需求 7：永久成长系统（Meta-Progression）

**用户故事：** 作为玩家，我希望每次 Run 结束后保留部分成长，以便感受到长期进步。

#### 验收标准

1. WHEN 一次 Run 结束时（无论死亡或通关），THE Meta_Progression SHALL 根据本次表现结算金币奖励
2. THE Meta_Progression SHALL 提供永久升级项目，包括：基础属性加成、初始武器解锁和起始道具解锁
3. WHEN 玩家在主界面购买永久升级时，THE Meta_Progression SHALL 扣除金币并将升级效果持久化存储
4. THE Meta_Progression SHALL 通过 StorageManager 持久化保存所有永久升级数据
5. WHEN 玩家开始新的 Run 时，THE Meta_Progression SHALL 将所有已购买的永久升级效果应用到 Player_Character 的初始属性

### 需求 8：战斗伤害系统

**用户故事：** 作为玩家，我希望战斗中的伤害计算清晰合理，以便理解角色成长的效果。

#### 验收标准

1. THE Damage_System SHALL 使用公式 `baseDamage * attackMultiplier - targetDefense` 计算最终伤害，最终伤害最小值为 1
2. WHEN Player_Character 受到伤害时，THE Damage_System SHALL 触发无敌帧，持续时间为 `PLAYER_INVINCIBLE_DURATION` 秒
3. WHEN 伤害产生时，THE Damage_System SHALL 在受击位置显示伤害数字浮动文本
4. WHEN Player_Character 受到伤害时，THE HUD SHALL 更新血量显示条
5. THE Damage_System SHALL 支持击退效果，将受击目标沿伤害方向推移

### 需求 9：用户界面系统

**用户故事：** 作为玩家，我希望界面清晰地展示游戏信息，以便专注于战斗操作。

#### 验收标准

1. THE HUD SHALL 在战斗中持续显示以下信息：玩家血量条、经验条、当前楼层、已装备武器图标
2. THE Game_Module SHALL 提供以下 UI 面板：加载面板、主界面、战斗 HUD、升级选择面板、暂停面板、死亡结算面板、胜利结算面板
3. WHEN 玩家点击暂停按钮时，THE Battle_Controller SHALL 暂停游戏并显示暂停面板
4. WHEN 一次 Run 结束时，THE Game_Module SHALL 显示结算面板，包含存活时间、击杀数、获得金币等统计数据
5. THE Game_Module SHALL 通过 UIManager 管理所有面板的打开和关闭，遵循现有 UILayer 层级规范

### 需求 10：数据配置与序列化（基础模块 / 引擎层）

**用户故事：** 作为开发者，我希望引擎层提供通用的 FlatBuffers 二进制配置数据加载和访问能力，以便所有游戏模块（包括肉鸽动作游戏模块及未来的其他游戏模块）都能复用该基础设施，获得高效的数据加载性能并支持快速调整数值平衡。

#### 验收标准

1. THE FlatBuffers_Runtime SHALL 作为引擎层基础模块实现，与具体游戏模块解耦，供所有游戏模块复用
2. THE FlatBuffers_Runtime SHALL 使用 TypeScript 接口定义通用的配置数据类型结构，类型定义与 FBS_Schema 保持一致
3. WHEN 加载配置文件时，THE FlatBuffers_Runtime SHALL 通过 ResManager 异步加载 Binary_Config 资源并以零拷贝方式读取数据
4. THE FlatBuffers_Runtime SHALL 提供通用的配置数据访问器，支持按字段名称直接读取配置值，任何游戏模块均可调用
5. FOR ALL 有效的配置数据对象，通过 Excel_Exporter 导出为 Binary_Config 后再由 FlatBuffers_Runtime 读取 SHALL 产生与原始 Excel 数据等价的结果（往返一致性）
6. IF Binary_Config 文件加载失败或数据格式不匹配，THEN THE FlatBuffers_Runtime SHALL 记录错误日志并返回明确的错误信息
7. THE Game_Module SHALL 通过引擎层 FlatBuffers_Runtime 加载和访问 Binary_Config 文件定义的敌人属性、武器属性、道具属性和波次配置，替代原有的 JSON 配置文件

### 需求 11：事件房间系统

**用户故事：** 作为玩家，我希望在地牢探索中遇到非战斗的随机事件房间，以便获得更丰富的策略选择和探索乐趣。

#### 验收标准

1. THE Room_Generator SHALL 在地牢楼层中生成 Event_Room，生成概率和数量由楼层配置决定
2. WHEN 玩家进入 Event_Room 时，THE Event_Room SHALL 从 Event_Pool 中按权重随机抽取一个事件并展示事件描述和可选操作
3. THE Event_Pool SHALL 包含至少四种事件类型：奖励选择事件、陷阱事件、NPC 互动事件和祭坛事件
4. WHEN 玩家在奖励选择事件中做出选择时，THE Event_Room SHALL 根据选项配置给予对应的武器、道具或属性加成
5. WHEN 玩家触发陷阱事件时，THE Event_Room SHALL 对 Player_Character 施加负面效果（扣除生命值、降低属性或施加限时减益）
6. WHEN 玩家与 NPC 互动事件交互时，THE Event_Room SHALL 提供交易、任务或信息提示等互动选项
7. WHEN 玩家触发祭坛事件时，THE Event_Room SHALL 提供以牺牲部分资源（生命值或金币）换取强力增益的选择
8. IF 玩家在 Event_Room 中未做出选择就离开房间，THEN THE Event_Room SHALL 保留该事件状态，允许玩家返回后继续交互
9. THE Game_Module SHALL 使用 JSON 配置文件定义所有事件类型、事件选项、奖励内容和权重参数
10. FOR ALL 有效的事件配置数据对象，序列化后再反序列化 SHALL 产生与原始对象等价的结果（往返一致性）
11. THE Event_Pool SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册事件类型，新增事件类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改 Event_Pool 的核心事件抽取和执行逻辑
12. THE Event_Pool SHALL 通过 Type_Config 驱动事件类型的属性、选项和效果参数，新增事件类型通过添加配置数据即可生效

### 需求 12：商店系统

**用户故事：** 作为玩家，我希望在地牢中遇到商店房间，以便用金币购买需要的武器和道具来强化角色。

#### 验收标准

1. THE Room_Generator SHALL 在地牢楼层中生成 Shop_Room，每个楼层至多生成一个 Shop_Room
2. WHEN 玩家进入 Shop_Room 时，THE Shop_Inventory SHALL 随机生成一组可售商品并展示商店界面
3. THE Shop_Inventory SHALL 生成的商品包含武器、道具和生命恢复药剂三种类别
4. THE Shop_Inventory SHALL 根据当前楼层深度调整商品的稀有度和价格范围
5. WHEN 玩家选择购买商品时，THE Shop_Room SHALL 检查 Player_Character 持有的 Gold 是否足够支付商品价格
6. IF Player_Character 持有的 Gold 不足以支付商品价格，THEN THE Shop_Room SHALL 显示金币不足提示并取消本次购买操作
7. WHEN 购买成功时，THE Shop_Room SHALL 扣除对应数量的 Gold 并将商品效果应用到 Player_Character
8. WHEN 购买成功时，THE Shop_Inventory SHALL 将已购买的商品从商店列表中移除
9. THE HUD SHALL 在战斗中持续显示 Player_Character 当前持有的 Gold 数量
10. WHEN Enemy 被击杀时，THE Loot_System SHALL 按配置的概率掉落 Gold
11. THE Game_Module SHALL 使用 JSON 配置文件定义商品池、价格区间和楼层稀有度权重
12. FOR ALL 有效的商店配置数据对象，序列化后再反序列化 SHALL 产生与原始对象等价的结果（往返一致性）
13. THE Shop_Inventory SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册商品类别，新增商品类别只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改 Shop_Inventory 的核心商品生成和交易逻辑
14. THE Shop_Inventory SHALL 通过 Type_Config 驱动商品类别的属性、价格规则和稀有度参数，新增商品类别通过添加配置数据即可生效

### 需求 13：宠物系统

**用户故事：** 作为玩家，我希望能携带宠物一起冒险，以便获得战斗辅助或被动增益，增加游戏的策略深度和趣味性。

#### 验收标准

1. THE Pet_System SHALL 支持至少三种宠物类型：攻击型（主动攻击附近敌人）、防御型（为 Player_Character 提供护盾或减伤）和辅助型（提供被动属性增益或拾取范围扩大）
2. THE Player_Character SHALL 在一次 Run 中最多同时携带一只 Pet
3. WHILE Player_Character 携带 Pet 时，THE Pet SHALL 跟随 Player_Character 移动并保持在指定跟随距离内
4. WHILE 攻击型 Pet 处于激活状态，THE Pet SHALL 自动检测攻击范围内的 Enemy 并执行攻击行为
5. WHILE 防御型 Pet 处于激活状态，THE Pet SHALL 周期性地为 Player_Character 生成护盾，护盾值由 Pet 等级和属性决定
6. WHILE 辅助型 Pet 处于激活状态，THE Pet SHALL 对 Player_Character 施加持续的被动增益效果
7. WHEN 玩家在 Event_Room 或升级选项中获得 Pet 时，THE Pet_System SHALL 激活该 Pet 并应用对应效果
8. IF Player_Character 已携带 Pet 且获得新的 Pet，THEN THE Pet_System SHALL 展示替换确认面板，由玩家选择保留或替换
9. THE Pet SHALL 具有等级属性，通过 Player_Character 的升级或特定道具提升 Pet 等级
10. WHEN Pet 等级提升时，THE Pet_System SHALL 增强 Pet 的攻击力、护盾值或增益效果数值
11. THE Game_Module SHALL 使用 JSON 配置文件定义宠物类型、属性数值、等级成长曲线和 AI 行为参数
12. FOR ALL 有效的宠物配置数据对象，序列化后再反序列化 SHALL 产生与原始对象等价的结果（往返一致性）
13. THE Pet_System SHALL 采用 Extensible_System 架构，通过 Type_Registry 注册宠物类型和 AI 行为，新增宠物类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改 Pet_System 的核心宠物管理和 AI 调度逻辑
14. THE Pet SHALL 通过 Type_Config 驱动宠物类型属性、等级成长曲线和 AI 行为参数，新增宠物类型和 AI 行为模式通过添加配置数据即可生效

### 需求 14：换装系统

**用户故事：** 作为玩家，我希望能更换角色的外观装扮，以便个性化自己的角色形象并获得收集乐趣。

#### 验收标准

1. THE Costume_System SHALL 支持至少三个装扮部位：头部、身体和特效（拖尾、光环等）
2. THE Costume_System SHALL 管理所有 Costume 的解锁状态，并通过 StorageManager 持久化保存
3. WHEN 玩家在主界面打开换装面板时，THE Costume_System SHALL 展示所有 Costume 列表，区分已解锁和未解锁状态
4. WHEN 玩家选择一个已解锁的 Costume 时，THE Costume_System SHALL 在预览区域实时展示装扮效果
5. WHEN 玩家确认装备 Costume 时，THE Costume_System SHALL 将选中的 Costume 应用到 Player_Character 并持久化保存装备状态
6. WHEN 玩家开始新的 Run 时，THE Player_Character SHALL 加载并显示当前已装备的 Costume 外观
7. THE Costume SHALL 为纯装饰性物品，装备 Costume 不影响 Player_Character 的任何战斗属性
8. WHEN 玩家通过 Meta_Progression 购买或通过成就解锁 Costume 时，THE Costume_System SHALL 更新对应 Costume 的解锁状态
9. THE Game_Module SHALL 提供换装面板 UI，包含部位筛选、装扮预览和一键装备功能
10. THE Game_Module SHALL 使用 JSON 配置文件定义所有 Costume 的部位、资源路径、解锁条件和展示信息
11. FOR ALL 有效的装扮配置数据对象，序列化后再反序列化 SHALL 产生与原始对象等价的结果（往返一致性）

### 需求 15：职业系统

**用户故事：** 作为玩家，我希望能选择和切换不同职业，以便通过专属天赋和技能构建差异化的战斗风格和成长路线。

#### 验收标准

1. THE Class_System SHALL 支持四种 Class_Rarity 等级的职业：普通职业、精英职业、传奇职业和隐藏职业
2. THE Class_System SHALL 在游戏初始状态下解锁至少两个普通职业供玩家选择
3. WHEN 玩家开始新的 Run 时，THE Class_System SHALL 展示职业选择面板，仅显示已解锁的职业供玩家选择
4. WHEN 玩家选择职业后，THE Class_System SHALL 将该职业的基础属性加成和初始技能应用到 Player_Character
5. THE Class SHALL 拥有独立的 Talent_Tree，包含至少三个层级的 Talent 节点
6. WHEN Player_Character 升级时，THE Class_System SHALL 授予天赋点数，玩家可在 Talent_Tree 中分配
7. THE Talent_Tree SHALL 要求玩家解锁当前层级一定数量的 Talent 后才能解锁下一层级的 Talent
8. THE Class SHALL 拥有至少两个专属 Class_Skill，每个 Class_Skill 具有独立的冷却时间和资源消耗
9. WHEN 玩家在战斗中使用 Class_Skill 时，THE Class_Skill SHALL 检查冷却时间和资源是否满足条件后执行技能效果
10. IF Class_Skill 处于冷却中或资源不足，THEN THE Class_System SHALL 显示不可用提示并拒绝执行该技能
11. THE Class_System SHALL 根据 Class_Rarity 等级设定职业解锁条件：精英职业通过累计通关次数解锁，传奇职业通过完成特定成就解锁，隐藏职业通过满足隐藏条件触发解锁
12. WHEN 玩家满足职业解锁条件时，THE Class_System SHALL 发送解锁通知并更新职业的可用状态
13. THE Class_System SHALL 通过 StorageManager 持久化保存职业解锁状态和天赋配置数据
14. THE HUD SHALL 在战斗中显示当前职业图标、Class_Skill 冷却状态和天赋点数信息
15. THE Game_Module SHALL 使用 JSON 配置文件定义所有职业的属性、天赋树结构、技能参数和解锁条件
16. FOR ALL 有效的职业配置数据对象，序列化后再反序列化 SHALL 产生与原始对象等价的结果（往返一致性）
17. THE Class_System SHALL 采用 Extensible_System 架构，通过 Type_Registry 分别注册职业类型、天赋类型和技能类型，新增职业、天赋或技能只需实现对应的 Base_Interface 并注册 Type_Factory 方法，无需修改 Class_System 的核心职业管理、天赋分配和技能执行逻辑
18. THE Class、Talent 和 Class_Skill SHALL 通过 Type_Config 驱动各自的属性和行为参数，新增职业、天赋和技能通过添加配置数据即可生效

### 需求 16：NPC 系统

**用户故事：** 作为玩家，我希望在地牢探索中遇到不同功能的 NPC，以便通过与 NPC 互动获得武器强化、技能学习、职业转换等服务，增加探索的策略深度。

#### 验收标准

1. THE NPC_System SHALL 支持至少四种 NPC 类型：Blacksmith（武器强化）、Skill_Master（技能学习与升级）、Class_Master（职业转换与解锁）和 Merchant（稀有道具交易）
2. THE Room_Generator SHALL 在地牢楼层中随机生成包含 NPC 的房间，NPC 类型和出现概率由楼层配置决定
3. WHEN 玩家接近 NPC 并触发交互时，THE NPC_System SHALL 显示该 NPC 的对话界面和可用服务列表
4. WHEN 玩家与 Blacksmith 交互时，THE Blacksmith SHALL 提供当前已装备武器的强化服务，消耗 Gold 提升武器的伤害和附加属性
5. WHEN 玩家与 Skill_Master 交互时，THE Skill_Master SHALL 展示当前职业可学习的 Class_Skill 列表和已有技能的升级选项
6. WHEN 玩家选择学习或升级 Class_Skill 时，THE Skill_Master SHALL 检查 Gold 和等级是否满足条件后应用技能变更
7. IF 玩家不满足 Class_Skill 的学习或升级条件，THEN THE Skill_Master SHALL 显示具体的条件不足提示
8. WHEN 玩家与 Class_Master 交互时，THE Class_Master SHALL 展示可转换的职业列表，仅显示满足前置条件的职业
9. WHEN 玩家确认职业转换时，THE Class_Master SHALL 将 Player_Character 的职业切换为目标职业，重置 Talent_Tree 并退还已分配的天赋点数
10. WHEN 玩家与 Merchant 交互时，THE Merchant SHALL 展示稀有度高于 Shop_Room 的专属商品列表
11. THE NPC_System SHALL 维护 NPC_Affinity 数值，每次与 NPC 成功交易或完成 NPC 委托任务后增加对应 NPC 的好感度
12. WHEN NPC_Affinity 达到特定阈值时，THE NPC_System SHALL 解锁该 NPC 的高级服务或专属折扣
13. THE NPC_Network SHALL 定义 NPC 之间的关系类型（合作、竞争、师徒），不同关系影响服务内容和价格
14. WHEN 玩家与存在合作关系的两个 NPC 均达到好感度阈值时，THE NPC_Network SHALL 触发联动奖励事件，提供额外的道具或服务
15. WHEN 玩家与存在竞争关系的 NPC 交互后，THE NPC_Network SHALL 根据竞争关系调整对立 NPC 的服务价格或可用性
16. IF 玩家在当前 Run 中未遇到特定 NPC，THEN THE NPC_System SHALL 在后续楼层中提高该 NPC 类型的出现概率
17. THE NPC_System SHALL 通过 StorageManager 持久化保存 NPC_Affinity 数据，跨 Run 保留好感度进度
18. THE Game_Module SHALL 使用 JSON 配置文件定义所有 NPC 的类型、服务内容、好感度阈值、关系网络和对话内容
19. FOR ALL 有效的 NPC 配置数据对象，序列化后再反序列化 SHALL 产生与原始对象等价的结果（往返一致性）
20. THE NPC_System SHALL 采用 Extensible_System 架构，通过 Type_Registry 分别注册 NPC 类型和服务类型，新增 NPC 类型只需实现 Base_Interface 并注册对应的 Type_Factory 方法，无需修改 NPC_System 的核心 NPC 生成、交互和关系管理逻辑
21. THE NPC SHALL 通过 Type_Config 驱动 NPC 类型属性、服务内容和 AI 行为参数，新增 NPC 类型和服务类型通过添加配置数据即可生效

### 需求 17：Excel 配置导出工具与 FlatBuffers 数据读取（基础模块 / 引擎层）

**用户故事：** 作为开发者，我希望引擎层提供通用的 Excel 配置导出工具和 FlatBuffers 数据读取能力，以便所有游戏模块（包括肉鸽动作游戏模块及未来的其他游戏模块）的策划人员都能直接编辑 Excel 即可更新游戏数据，同时游戏运行时获得高效的数据加载性能。

#### 验收标准

##### Excel 配置导出工具

1. THE Excel_Exporter SHALL 读取指定目录下的所有 Excel 文件（.xlsx 格式），解析每个工作表的表头行作为字段定义
2. THE Excel_Exporter SHALL 支持以下字段类型映射：整数（int）、浮点数（float）、布尔值（bool）、字符串（string）、枚举（enum）和数组（array）
3. WHEN Excel_Exporter 读取 Excel 文件时，THE Excel_Exporter SHALL 根据表头行的字段名称和类型标注自动生成对应的 FBS_Schema 文件
4. WHEN FBS_Schema 生成完成后，THE Excel_Exporter SHALL 调用 FlatBuffers 编译器（flatc）将 FBS_Schema 编译为 TypeScript 访问代码
5. WHEN Schema 编译成功后，THE Excel_Exporter SHALL 将 Excel 数据行序列化为 FlatBuffers 二进制格式并输出为 Binary_Config 文件
6. IF Excel 文件中存在空行或注释行（以 # 开头），THEN THE Excel_Exporter SHALL 跳过该行并继续处理后续数据
7. IF Excel 文件中存在类型不匹配的单元格数据，THEN THE Excel_Exporter SHALL 记录错误日志，报告具体的文件名、工作表名、行号和列名，并中止该表的导出
8. FOR ALL 有效的 Excel 配置数据，通过 Excel_Exporter 导出为 Binary_Config 后再由 FlatBuffers_Runtime 解析 SHALL 产生与原始 Excel 数据等价的结果（往返一致性）

##### 批量导出与增量导出

9. THE Excel_Exporter SHALL 支持批量导出模式，一次性处理指定目录下的所有 Excel 文件并输出对应的 Binary_Config 文件
10. THE Schema_Registry SHALL 记录每个 FBS_Schema 的内容哈希值和最后导出时间戳
11. WHEN 执行增量导出时，THE Excel_Exporter SHALL 比较 Excel 文件的修改时间与 Schema_Registry 中的记录，仅重新导出发生变更的文件
12. WHEN Excel 表头结构发生变更时，THE Excel_Exporter SHALL 检测到 FBS_Schema 与 Schema_Registry 中记录的哈希值不一致，并在控制台输出 Schema 变更警告信息
13. IF FBS_Schema 发生不兼容变更（删除字段或修改字段类型），THEN THE Excel_Exporter SHALL 输出不兼容变更的详细说明并要求开发者确认后才继续导出

##### 游戏内 FlatBuffers 读取

14. THE FlatBuffers_Runtime SHALL 集成到 Cocos Creator 项目中，支持在 Web 和原生平台上加载和解析 Binary_Config 文件
15. THE FlatBuffers_Runtime SHALL 提供类型安全的 TypeScript 访问接口，通过生成的访问代码直接读取配置字段，无需手动解析
16. WHEN 游戏启动时，THE FlatBuffers_Runtime SHALL 异步加载所有 Binary_Config 文件并注册到全局配置管理器中
17. THE FlatBuffers_Runtime SHALL 使用零拷贝读取方式访问 Binary_Config 数据，避免反序列化产生的额外内存分配
18. THE FlatBuffers_Runtime SHALL 提供按主键（ID 字段）查询单条记录和遍历全部记录两种数据访问方式
19. IF Binary_Config 文件不存在或数据校验失败，THEN THE FlatBuffers_Runtime SHALL 记录错误日志并返回明确的错误码，Game_Module 根据错误码决定是否回退到默认配置

##### 工具链自动化

20. THE Export_Pipeline SHALL 提供命令行接口（CLI），支持通过 `npm run export-config` 命令触发完整的导出流程
21. THE Export_Pipeline SHALL 在导出完成后输出统计摘要，包含处理的文件数量、成功数量、失败数量和总耗时
22. THE Export_Pipeline SHALL 支持配置文件指定 Excel 源目录、Binary_Config 输出目录、FBS_Schema 输出目录和 flatc 编译器路径
