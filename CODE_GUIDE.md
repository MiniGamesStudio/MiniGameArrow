# 代码说明指南

本文档说明 `assets/scripts` 下的主要代码结构、启动流程、模块职责和后续开发注意事项。项目基于 Cocos Creator 3.8.8，脚本主要使用 TypeScript。

## 总体结构

`assets/scripts` 当前按三层组织：

```text
assets/scripts/
├── engine/       # Cocos 相关引擎层：启动、UI、音频、资源、配置运行时
├── framework/    # 纯逻辑框架层：事件、存储、定时器、对象池、类型注册
└── Game/         # 玩法层：FlowerGame、RoguelikeGame、SurvivorGame
```

推荐依赖方向：

```text
Game/*     -> engine/* + framework/*
engine/*   -> framework/*
framework/* 不依赖 Cocos 引擎 API
```

新增代码应尽量遵守这个方向，避免 `framework` 反向依赖 `engine` 或具体玩法。

## 启动流程

主入口是 `assets/scripts/engine/Launcher.ts`。

启动链路：

```text
Launcher.onLoad
  -> director.addPersistRootNode
  -> 监听 Game.EVENT_HIDE / Game.EVENT_SHOW
  -> GameManager.Init(gameWorld, uiRoot, persistNode, initFlowerGame)
  -> Launcher.update 每帧调用 GameManager.Update
```

`GameManager.Init` 负责初始化通用系统：

1. 初始化存储入口 `StorageManager`
2. 初始化音频 `AudioManager`
3. 初始化 UI 层级 `UIManager`
4. 执行玩法入口 `onGameReady`

`onGameReady` 支持同步或异步函数，因此后续可切换到 `initRoguelikeGame` 这类需要异步加载配置的入口。

当前实际启动玩法是 `FlowerGame`：

```ts
GameManager.GetInstance().Init(
    this.m_GameWorld,
    this.m_UIRoot,
    this.node,
    initFlowerGame
);
```

## engine 层

### `GameManager`

路径：`assets/scripts/engine/GameManager.ts`

职责：

- 初始化和销毁通用系统
- 每帧驱动 `TimerManager`
- 处理前后台暂停/恢复事件
- 保存游戏世界根节点
- 通过回调注入具体玩法入口

销毁时会清理：

- `TimerManager`
- `PoolManager`
- `NodePoolManager`
- `AudioManager`
- `UIManager`
- `EventManager`
- `ConfigManager`
- `FlatBuffersRuntime`
- `ResManager`

### `UIManager`

路径：`assets/scripts/engine/ui/UIManager.ts`

职责：

- 创建 UI 层级节点
- 通过 `UIDataRegistry` 查询 UI 配置
- 加载、实例化、显示、隐藏、关闭面板
- 管理面板缓存数量
- 取消异步加载中的 pending 面板

UI 层级定义在 `UIData.ts`：

```text
Background -> Normal -> PopUp -> Tips -> System -> TopMost
```

打开 UI：

```ts
UIManager.GetInstance().OpenPanel(FlowerUIID.LoadingPanel);
```

关闭 UI：

```ts
UIManager.GetInstance().ClosePanel(FlowerUIID.LoadingPanel);
```

注意事项：

- 面板脚本应继承 `UIBase`
- UI prefab 需要挂载对应的 `UIBase` 子类组件
- `OpenPanel` 返回的是运行时 `panelID`，资源可能仍在异步加载中
- 如果关闭 pending 面板，`UIManager` 会通过内部记录取消后续实例化

### `UIBase`

路径：`assets/scripts/engine/ui/UIBase.ts`

职责：

- 提供面板生命周期：`OnInit`、`OnOpen`、`OnClose`
- 提供 `CloseSelf`
- 提供按钮绑定辅助 `SetBtnEvent`
- 管理子页面 `AttachUIPage` / `DetachUIPage`

开发约定：

- 面板打开逻辑写在 `OnOpen`
- 事件解绑、子页面清理写在 `OnClose`
- 子类重写 `OnClose` 时应调用 `super.OnClose()`
- 按钮绑定优先使用 `SetBtnEvent`，避免重复监听

### `ResManager`

路径：`assets/scripts/engine/ResManager.ts`

职责：

- 封装 `resources.load`
- 维护简单引用计数
- 提供 `loadAsync`、`loadDir`、`instantiatePrefab`
- 提供资源释放接口

当前部分 UI 仍直接使用 `resources.load`。后续如果要统一资源生命周期，可逐步迁移到 `ResManager`。

### `AudioManager`

路径：`assets/scripts/engine/AudioManager.ts`

职责：

- 管理 BGM 和 SFX
- 缓存音频资源
- 支持音量和静音
- 销毁时清理 AudioSource 节点

### `NodePool`

路径：`assets/scripts/engine/NodePool.ts`

职责：

- 面向 Cocos `Node` 的对象池
- 支持按名称管理多个节点池
- 回收时移除父节点并隐藏
- 获取时跳过已失效节点
- 防止重复回收同一节点

## framework 层

### `EventManager`

路径：`assets/scripts/framework/EventManager.ts`

职责：

- 全局事件总线
- 支持 `on`、`once`、`off`、`emit`
- 支持按 target 移除监听

使用示例：

```ts
EventManager.getInstance().on(FlowerEvent.CheckVictory, this.onCheckVictory, this);
EventManager.getInstance().emit(FlowerEvent.CheckVictory);
EventManager.getInstance().offAllByTarget(this);
```

约定：

- UI 面板在 `OnOpen` 注册事件
- UI 面板在 `OnClose` 调用 `offAllByTarget(this)`
- 事件名集中定义在各模块的 `*Event.ts`

### `TimerManager`

路径：`assets/scripts/framework/TimerManager.ts`

职责：

- 提供与 Cocos Component 解耦的定时器
- 支持一次性定时器和循环定时器
- 由 `GameManager.Update(dt)` 每帧驱动

使用示例：

```ts
const id = TimerManager.getInstance().once(1, () => {
    // 1 秒后执行
});

TimerManager.getInstance().cancel(id);
```

定时器回调中可以安全地 `cancel` 或 `clear`，当前帧不会继续处理已被移除的旧定时器。

### `StorageManager`

路径：`assets/scripts/framework/StorageManager.ts`

职责：

- 封装字符串、数字、布尔、对象读写
- 支持 key 前缀隔离
- 支持替换存储后端

当前默认后端是 Web `localStorage`。如目标平台是微信小游戏，建议实现并注入 `wx.getStorageSync` / `wx.setStorageSync` 后端。

### `ObjectPool`

路径：`assets/scripts/framework/ObjectPool.ts`

职责：

- 纯逻辑对象池
- 支持对象创建、获取、回收、销毁回调
- 防止同一对象重复回收到池中

### `TypeRegistry` / `TypeFactory`

路径：

- `assets/scripts/framework/TypeRegistry.ts`
- `assets/scripts/framework/TypeFactory.ts`

职责：

- 为可扩展类型提供注册和创建能力
- Roguelike 的房间、敌人、武器、宠物、事件、NPC、地形都基于此模式注册

使用方式：

```ts
const registry = new TypeRegistry<IWeaponType>();
registry.register('melee', () => new MeleeWeapon());
const weapon = registry.create('melee');
```

## Game 层

### FlowerGame

路径：`assets/scripts/Game/FlowerGame`

当前默认启动玩法，链路相对完整。

主要文件：

- `FlowerGameEntry.ts`：玩法入口
- `FlowerUIConfig.ts`：UI 注册
- `FlowerGameState.ts`：关卡进度和存档
- `ui/LoadingPanel.ts`：加载页
- `ui/MainPanel.ts`：主界面
- `ui/GamePanel.ts`：关卡加载和胜负判定
- `ui/FlowerPlatform.ts`：花槽平台逻辑
- `ui/Flower.ts`：花朵拖拽、碰撞、匹配逻辑

运行流程：

```text
initFlowerGame
  -> 设置存储前缀 flower_
  -> registerFlowerGameUI
  -> FlowerGameState.getInstance
  -> OpenPanel(LoadingPanel)
  -> LoadingPanel 打开 MainPanel
  -> MainPanel 打开 GamePanel
  -> GamePanel 加载关卡 JSON 和 FlowerPlatform prefab
  -> Flower 拖拽 / 碰撞 / 消除
  -> 胜利后保存进度并打开 VictoryPanel
```

### RoguelikeGame

路径：`assets/scripts/Game/RoguelikeGame`

代码量最大，包含 Runtime、Types、UI、Data 等结构，但当前仍属于未完全闭环状态。

主要目录：

```text
RoguelikeGame/
├── Data/        # 接口、配置表占位访问器
├── Runtime/     # 战斗、地牢、玩家、武器、宠物、商店、NPC 等运行时系统
├── Types/       # 房间、敌人、武器、宠物、事件、NPC、地形等具体类型
└── UI/          # Rg*Panel 系列面板
```

入口：`RoguelikeGameEntry.ts`

当前入口做了以下事情：

1. 设置存储前缀 `roguelike_`
2. 注册 Roguelike UI
3. 异步加载 FlatBuffers 配置
4. 注册配置访问器
5. 注册所有可扩展类型
6. 初始化持久化状态
7. 发送 `ModuleInitialized`
8. 打开 `RgLoadingPanel`

注意：`BattleController` 是 Roguelike 运行时中枢，但当前还没有可靠的场景 bootstrap 持有并每帧驱动它。后续应新增场景组件，例如：

```text
RgBattleScene
  -> 创建 InputHandler
  -> 组装 TypeRegistries
  -> new BattleController(...)
  -> update(dt) 调用 controller.update(dt)
  -> UI 按钮调用 controller.startRun(classId)
```

在此之前，不建议让 UI 直接伪造完整战斗状态。

### SurvivorGame

路径：`assets/scripts/Game/SurvivorGame`

当前是类幸存者玩法骨架，Runtime 层已有战斗会话、敌人生成、武器、被动、升级等逻辑，但 UI prefab 和面板脚本链路仍不完整。

主要文件：

- `SurvivorGameEntry.ts`
- `SurvivorUIConfig.ts`
- `Runtime/BattleController.ts`
- `Runtime/EnemySpawner.ts`
- `Runtime/WeaponManager.ts`
- `Runtime/PassiveManager.ts`
- `Runtime/LevelUpManager.ts`

已修复旧的 `Core/EventManager` 引用，现在统一使用 `framework/EventManager`。

## UI 开发流程

新增一个 UI 面板通常需要：

1. 新建 prefab，并挂载继承 `UIBase` 的脚本
2. 在玩法的 `*UIConfig.ts` 中增加 UI ID 和 prefab 路径
3. 在合适的位置调用 `UIManager.GetInstance().OpenPanel(id, ...args)`
4. 在 `OnOpen` 中绑定按钮、注册事件、刷新数据
5. 在 `OnClose` 中解绑事件、清理临时状态，并调用 `super.OnClose()`

示例：

```ts
OnOpen(...args: any[]): void {
    this.SetBtnEvent(this.m_CloseBtn, () => {
        this.CloseSelf();
    });
    EventManager.getInstance().on(SomeEvent.Refresh, this.refresh, this);
}

OnClose(): void {
    super.OnClose();
    EventManager.getInstance().offAllByTarget(this);
}
```

## 玩法切换

当前 `Launcher.ts` 写死为：

```ts
import { initFlowerGame } from "../Game/FlowerGame/FlowerGameEntry";
```

如要切换 Roguelike，需要改为：

```ts
import { initRoguelikeGame } from "../Game/RoguelikeGame/RoguelikeGameEntry";
```

并传入：

```ts
initRoguelikeGame
```

注意：切换前应确保对应玩法的 UI prefab、场景组件和资源路径都存在。

## 配置与类型注册

Roguelike 使用两套注册：

- `ConfigTables.registerConfigAccessors()`：注册配置表访问器
- `TypeRegistration.registerAllTypes()`：注册房间、敌人、武器、宠物、事件、NPC、地形等类型

注册函数支持重复调用前清理旧记录，便于模块重新初始化。

## 当前已知状态

较成熟：

- `FlowerGame` 主流程完整，可作为当前主要开发和调试目标
- `engine` / `framework` 的基础生命周期已补强

仍需规划：

- `RoguelikeGame` 需要补 BattleController bootstrap 和真实战斗驱动
- `RoguelikeGame` 部分 UI 仍有 TODO 或占位刷新逻辑
- `SurvivorGame` 需要补完整 UI prefab / Panel 脚本链路
- 微信小游戏存储建议接入微信 storage backend
- 资源加载策略建议逐步统一到 `ResManager`
- 项目 `tsc` 当前会受 Cocos 类型声明、测试 Jest 类型配置和依赖解析影响，不能作为直接通过标准

## 开发约定建议

- 新增公共能力优先放 `framework` 或 `engine`，不要直接塞进玩法模块
- 纯逻辑代码尽量不 import `cc`
- UI 面板事件必须在关闭时解绑
- 异步加载回调里要检查节点或组件是否仍有效
- 对象池回收前要确认对象没有重复入池
- 新玩法入口应只负责注册、加载、初始化和打开首屏，不直接承担复杂运行时逻辑
- 运行时中枢应由场景组件或 bootstrap 持有，并在 `update(dt)` 中驱动

