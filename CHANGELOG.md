# 游戏框架重构记录

## 一、重构目标

将原本框架代码与插花游戏玩法代码混杂的项目，拆分为**纯通用游戏框架**和**独立业务玩法**两层，使框架可直接复用于其他类型游戏开发，同时保证插花游戏继续正常运行。

---

## 二、重构前的问题

### 2.1 架构耦合

| 问题 | 具体表现 |
|------|----------|
| GameManager 硬编码业务逻辑 | 直接 import `UIID`、`GameState`、`CustomClientEvent`，硬写 `StorageManager.setPrefix('flower_')` |
| UIManager / UIBase 依赖业务枚举 | `UIID` 枚举（含 `LoadingPanel`、`GamePanel` 等业务面板）定义在 `UIScripts/UIData.ts`，框架层反向依赖业务层 |
| 事件和常量混杂 | `Config.ts` 同时包含框架事件和插花游戏事件；`GameConst.ts` 同时包含框架常量和花朵飞行速度等业务常量 |
| 无数据模型层 | 游戏状态散落在 UI 组件中，关卡 JSON 数据无类型定义 |

### 2.2 代码质量

| 问题 | 具体表现 |
|------|----------|
| 大量魔法数字 | 花朵飞行速度 1000、消除时间 0.5s、旋转角度 30° 等硬编码在代码中 |
| 严重代码重复 | `Flower.ts` 碰撞检测中左/中/右三段几乎相同的 if-else（约 120 行重复） |
| GameManager 空壳 | `Update`、`LateUpdate`、`PauseGame`、`ResumeGame` 全是空方法 |
| EventManager 不必要继承 Component | 作为纯逻辑类却继承了 `Component` |
| 缺少基础子系统 | 无音频管理、资源管理、对象池、定时器、本地存储封装 |
| 拼写错误 | `DettachUIPage`（应为 `DetachUIPage`） |
| 无用 import | `Launcher.ts` 引入了 7 个未使用的模块 |
| 注释乱码 | `ScreenAdapter.ts` 中文注释因编码问题显示为乱码 |

---

## 三、重构后的架构

```
scripts/
├── Launcher.ts                     # 入口（唯一业务耦合点）
├── ScreenAdapter.ts                # 屏幕适配
│
├── Core/                           # ★ 纯框架层 — 零业务依赖
│   ├── GameManager.ts              #   中枢，通过 onGameReady 回调注入业务
│   ├── UIManager.ts                #   UI 面板管理（分层、缓存、生命周期）
│   ├── UIBase.ts                   #   UI 面板基类
│   ├── UIData.ts                   #   UILayer / UIShowMode / UIDataRegistry
│   ├── EventManager.ts             #   全局事件总线
│   ├── AudioManager.ts             #   音频管理（BGM + 音效）
│   ├── ResManager.ts               #   资源管理（加载/缓存/释放）
│   ├── ObjectPool.ts               #   对象池 + PoolManager
│   ├── TimerManager.ts             #   定时器管理
│   ├── StorageManager.ts           #   本地存储封装
│   ├── FrameworkEvent.ts           #   框架级事件枚举
│   └── FrameworkConst.ts           #   框架级常量
│
├── Game/FlowerGame/                # ★ 插花游戏业务层
│   ├── FlowerGameEntry.ts          #   游戏入口函数
│   ├── FlowerUIConfig.ts           #   UI ID 枚举 + 注册函数
│   ├── FlowerConst.ts              #   游戏常量
│   ├── FlowerEvent.ts              #   游戏事件
│   ├── FlowerGameState.ts          #   游戏状态/存档
│   └── FlowerLevelModel.ts         #   关卡数据类型定义
│
└── UIScripts/                      # UI 面板脚本（挂载在 prefab 上）
    ├── Flower.ts
    ├── FlowerPlatform.ts
    ├── GamePanel.ts
    ├── VictoryPanel.ts
    ├── LoadingPanel.ts
    ├── MainPanel.ts
    └── MainTopPage.ts
```

### 依赖方向

```
Launcher  ──→  Core/*（框架）
    │
    └──→  Game/FlowerGame/FlowerGameEntry（唯一业务入口）

UIScripts/*  ──→  Core/*（框架）
    │
    └──→  Game/FlowerGame/*（业务数据）

Core/*  ──→  Core/*（仅内部互引，不引用 Game/ 或 UIScripts/）
```

---

## 四、详细改动清单

### 4.1 新增文件

| 文件 | 说明 |
|------|------|
| `Core/AudioManager.ts` | 音频管理器。BGM 循环播放、音效单次播放、音量/静音控制、AudioClip 缓存。需传入常驻节点挂载 AudioSource |
| `Core/ResManager.ts` | 资源管理器。封装 `resources.load`，支持回调和 Promise 两种方式、引用计数、目录加载、Prefab 实例化便捷方法 |
| `Core/ObjectPool.ts` | 通用对象池。`ObjectPool` 单池 + `PoolManager` 按名称管理多池，支持预创建、最大容量限制 |
| `Core/TimerManager.ts` | 定时器管理器。与 Component 生命周期解耦，支持一次性/循环定时器、暂停/恢复，由 `GameManager.Update` 驱动 |
| `Core/StorageManager.ts` | 本地存储封装。基于 `sys.localStorage`，提供 string/number/bool/object 类型安全存取，key 前缀隔离 |
| `Core/UIData.ts` | 框架级 UI 数据定义。`UILayer`、`UIShowMode`、`UIData`、`UIDataRegistry`（注册表模式） |
| `Core/FrameworkEvent.ts` | 框架级事件枚举：`GamePaused`、`GameResumed`、`SceneChanged` |
| `Core/FrameworkConst.ts` | 框架级常量：加载时长、页面滑动时长、UI 资源路径前缀 |
| `Game/FlowerGame/FlowerGameEntry.ts` | 插花游戏入口函数。设置存储前缀、注册 UI 面板、加载存档、打开首屏 |
| `Game/FlowerGame/FlowerUIConfig.ts` | `FlowerUIID` 枚举 + `registerFlowerGameUI()` 注册函数 |
| `Game/FlowerGame/FlowerConst.ts` | 插花游戏常量（飞行速度、消除时间、旋转角度、资源路径等） |
| `Game/FlowerGame/FlowerEvent.ts` | 插花游戏事件枚举 |
| `Game/FlowerGame/FlowerGameState.ts` | 插花游戏状态管理（当前关卡、得分、存档读写） |
| `Game/FlowerGame/FlowerLevelModel.ts` | 关卡数据类型定义（`FlowerLevelData`、`FlowerPosition`、`SLOT_NAMES`、`SLOT_PRIORITY`） |

### 4.2 重构文件

| 文件 | 改动要点 |
|------|----------|
| `Launcher.ts` | 清理 7 个无用 import；`GameManager.Init` 增加 `persistNode` 和 `onGameReady` 参数；注册 game 事件的 off 清理 |
| `Core/GameManager.ts` | **去除所有业务依赖**。不再 import `UIID`/`GameState`/`CustomClientEvent`；`Init` 改为接受 `onGameReady` 回调；`PauseGame`/`ResumeGame` 实际驱动 AudioManager 和 TimerManager；`Destroy` 清理所有子系统 |
| `Core/UIManager.ts` | 从 `UIScripts/UIData` 改为引用 `Core/UIData`；UIID 参数类型从业务枚举改为 `number`；`CheckPanel` 中 `includes` 改为 `Set` 避免 ES 版本兼容问题 |
| `Core/UIBase.ts` | `m_UIID` 类型从 `UIID` 枚举改为 `number`；不再 import 业务层 `UIData`；修正拼写 `DettachUIPage` → `DetachUIPage`；`AttachUIPage` 返回值从 `Boolean` 改为 `void`（异步回调中 return 无意义）；增加 `root.isValid` 安全检查 |
| `Core/EventManager.ts` | 去除 `Component` 继承；`emit` 改为支持多参数 `...args`；遍历时使用 snapshot 防止回调中修改数组；新增 `offAllByTarget()` 和 `clear()` 方法 |
| `ScreenAdapter.ts` | 修复乱码注释，改为正常中文 |
| `UIScripts/Flower.ts` | **碰撞检测核心优化**：用 `SLOT_PRIORITY` 优先级表 + for 循环替代三段重复的 if-else（减少约 120 行）；拆分为 `registerTouchEvents`/`startDrag`/`setupDragCollider`/`animateFlowerBack`/`applyRotation` 等小方法；所有 import 改为引用 `Game/FlowerGame/*` |
| `UIScripts/FlowerPlatform.ts` | `setFlowerData` 用数组循环替代三段重复代码；`checkFlowerDissolve` 中匹配检查改用 `every()`；所有 import 改为引用 `Game/FlowerGame/*` |
| `UIScripts/GamePanel.ts` | `OnClose` 改用 `offAllByTarget(this)` 一行清理所有事件；所有 import 改为引用 `Game/FlowerGame/*` |
| `UIScripts/VictoryPanel.ts` | 所有 import 改为引用 `Game/FlowerGame/*`；清理无用 import |
| `UIScripts/LoadingPanel.ts` | 引用 `FrameworkConst` 和 `FlowerUIID`；清理无用 import |
| `UIScripts/MainPanel.ts` | 引用 `FrameworkConst`；清理无用 import；`addPage` 改为 private |
| `UIScripts/MainTopPage.ts` | 清理大量无用 import |

### 4.3 删除文件

| 文件 | 原因 |
|------|------|
| `UIScripts/UIData.ts` | 拆分为 `Core/UIData.ts`（框架）+ `Game/FlowerGame/FlowerUIConfig.ts`（业务） |
| `Config/Config.ts` | 拆分为 `Core/FrameworkEvent.ts`（框架）+ `Game/FlowerGame/FlowerEvent.ts`（业务） |
| `Config/GameConst.ts` | 拆分为 `Core/FrameworkConst.ts`（框架）+ `Game/FlowerGame/FlowerConst.ts`（业务） |
| `Model/GameState.ts` | 移至 `Game/FlowerGame/FlowerGameState.ts` |
| `Model/LevelModel.ts` | 移至 `Game/FlowerGame/FlowerLevelModel.ts` |

---

## 五、关键设计决策

### 5.1 回调注入替代硬编码

```typescript
// 重构前 — GameManager 硬编码业务
Init(gameWorldRoot, uiRoot) {
    StorageManager.getInstance().setPrefix('flower_');  // 硬编码
    UIManager.GetInstance().OpenPanel(UIID.LoadingPanel); // 硬编码
}

// 重构后 — 通过回调注入
Init(gameWorldRoot, uiRoot, persistNode, onGameReady?: () => void) {
    // ... 框架初始化 ...
    if (onGameReady) onGameReady(); // 业务侧决定做什么
}
```

### 5.2 注册表模式替代硬编码枚举

```typescript
// 重构前 — 框架层定义业务枚举
export enum UIID { None, LoadingPanel, MainPanel, GamePanel, VictoryPanel }

// 重构后 — 框架提供注册能力，业务侧注册
// Core/UIData.ts
UIDataRegistry.Register(id: number, layer, name, path, ...);

// Game/FlowerGame/FlowerUIConfig.ts
export enum FlowerUIID { None = 0, LoadingPanel = 1, ... }
UIDataRegistry.Register(FlowerUIID.LoadingPanel, UILayer.System, ...);
```

### 5.3 碰撞检测优先级表替代重复代码

```typescript
// 重构前 — 三段重复 if-else（约 120 行）
if (imgPos == -1) {
    var left = light.getChildByName("Left");
    if (left.children.length <= 0) { ... }
    var right = light.getChildByName("Right");
    if (right.children.length <= 0) { ... }
    var mid = light.getChildByName("Mid");
    if (mid.children.length <= 0) { ... }
} else if (imgPos == 1) {
    // 几乎相同的代码，只是顺序不同...
} else {
    // 又是几乎相同的代码...
}

// 重构后 — 优先级表 + 循环（约 15 行）
const SLOT_PRIORITY = {
    [Left]:  [Left, Right, Mid],
    [Mid]:   [Mid, Left, Right],
    [Right]: [Right, Mid, Left],
};

for (const pos of SLOT_PRIORITY[detectedPos]) {
    const slot = light.getChildByName(SLOT_NAMES[pos]);
    if (slot && slot.children.length <= 0) { /* 找到空槽 */ return; }
}
```

---

## 六、开发新玩法指南

以开发一个「消消乐」游戏为例：

### 第 1 步：创建业务目录

```
Game/MatchGame/
├── MatchGameEntry.ts       # 入口函数
├── MatchUIConfig.ts        # UI ID 枚举 + 注册
├── MatchConst.ts           # 游戏常量
├── MatchEvent.ts           # 游戏事件
├── MatchGameState.ts       # 游戏状态
└── MatchLevelModel.ts      # 关卡数据模型
```

### 第 2 步：实现入口函数

```typescript
// Game/MatchGame/MatchGameEntry.ts
export function initMatchGame(): void {
    StorageManager.getInstance().setPrefix('match_');
    registerMatchGameUI();
    MatchGameState.getInstance();
    UIManager.GetInstance().OpenPanel(MatchUIID.LoadingPanel);
}
```

### 第 3 步：切换 Launcher 入口

```typescript
// Launcher.ts — 只改这一行
import { initMatchGame } from "./Game/MatchGame/MatchGameEntry";

GameManager.GetInstance().Init(
    this.m_GameWorld, this.m_UIRoot, this.node,
    initMatchGame  // ← 替换为新游戏入口
);
```

框架层（`Core/*`）完全不需要修改。
