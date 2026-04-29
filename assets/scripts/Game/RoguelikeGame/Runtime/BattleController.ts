/**
 * 战斗流程控制器
 * 整合所有运行时系统，管理完整的 Run 生命周期
 * 纯逻辑模块，通过 EventManager 与 UI 层通信
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import { UIManager } from '../../../engine/ui/UIManager';

// 接口导入
import { IRoomType, FloorConfig } from '../Data/Interfaces/IRoomType';
import { IEnemyType, BattleContext } from '../Data/Interfaces/IEnemyType';
import { IWeaponType } from '../Data/Interfaces/IWeaponType';
import { IItemType } from '../Data/Interfaces/IItemType';
import { ILevelUpOption } from '../Data/Interfaces/ILevelUpOption';
import { IEventType } from '../Data/Interfaces/IEventType';
import { IShopGoods } from '../Data/Interfaces/IShopGoods';
import { IPetType } from '../Data/Interfaces/IPetType';
import { IClassType } from '../Data/Interfaces/IClassType';
import { INpcType } from '../Data/Interfaces/INpcType';

// 运行时系统导入
import { DungeonManager } from './DungeonManager';
import { RoomGenerator } from './RoomGenerator';
import { PlayerController } from './PlayerController';
import { InputHandler } from './InputHandler';
import { EnemySpawner } from './EnemySpawner';
import { DamageSystem } from './DamageSystem';
import { LevelUpManager } from './LevelUpManager';
import { WeaponManager } from './WeaponManager';
import { ItemManager } from './ItemManager';
import { PetManager } from './PetManager';
import { ClassManager } from './ClassManager';
import { NpcManager } from './NpcManager';
import { ShopManager } from './ShopManager';
import { EventRoomManager } from './EventRoomManager';
import { CostumeManager } from './CostumeManager';
import { MetaProgressionManager } from './MetaProgressionManager';

// 其他导入
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeConst } from '../RoguelikeConst';
import { RoguelikeGameState, RunResult } from '../RoguelikeGameState';
import { RoguelikeUIID } from '../RoguelikeUIConfig';

/**
 * 所有 TypeRegistry 实例的集合
 * 由 TypeRegistration.ts 创建并传入
 */
export interface TypeRegistries {
    room: TypeRegistry<IRoomType>;
    enemy: TypeRegistry<IEnemyType>;
    weapon: TypeRegistry<IWeaponType>;
    item: TypeRegistry<IItemType>;
    levelUpOption: TypeRegistry<ILevelUpOption>;
    event: TypeRegistry<IEventType>;
    shopGoods: TypeRegistry<IShopGoods>;
    pet: TypeRegistry<IPetType>;
    class: TypeRegistry<IClassType>;
    npc: TypeRegistry<INpcType>;
}

/**
 * 默认楼层生成配置
 */
const DEFAULT_FLOOR_CONFIG: FloorConfig = {
    baseRoomCount: RoguelikeConst.BASE_ROOM_COUNT,
    roomGrowth: RoguelikeConst.ROOM_GROWTH_PER_FLOOR,
    typeWeights: {
        battle: 40,
        elite: 15,
        boss: 10,
        event: 15,
        shop: 10,
        npc: 10,
    },
    eliteMinFloor: 2,
    bossRequired: true,
};

/**
 * 战斗流程控制器
 * 作为中央协调器，整合所有运行时子系统，管理 Run 的完整生命周期
 */
export class BattleController {
    // ─── 运行时子系统 ──────────────────────────────────────

    private _dungeonManager: DungeonManager;
    private _playerController: PlayerController;
    private _enemySpawner: EnemySpawner;
    private _levelUpManager: LevelUpManager;
    private _weaponManager: WeaponManager;
    private _itemManager: ItemManager;
    private _petManager: PetManager;
    private _classManager: ClassManager;
    private _npcManager: NpcManager;
    private _shopManager: ShopManager;
    private _eventRoomManager: EventRoomManager;
    private _costumeManager: CostumeManager;
    private _metaProgressionManager: MetaProgressionManager;

    // ─── 输入处理 ──────────────────────────────────────────

    private _inputHandler: InputHandler;

    // ─── 运行时状态 ────────────────────────────────────────

    /** 是否暂停 */
    private _isPaused: boolean = false;
    /** 战斗已经过的时间（秒） */
    private _battleTime: number = 0;
    /** 击杀数 */
    private _killCount: number = 0;
    /** 本次 Run 收集的金币 */
    private _goldCollected: number = 0;

    /**
     * @param inputHandler 输入处理器
     * @param registries 所有 TypeRegistry 实例
     */
    constructor(inputHandler: InputHandler, registries: TypeRegistries) {
        this._inputHandler = inputHandler;

        // 创建所有管理器实例
        const roomGenerator = new RoomGenerator(registries.room);
        this._dungeonManager = new DungeonManager(roomGenerator, DEFAULT_FLOOR_CONFIG);
        this._playerController = new PlayerController(inputHandler);
        this._enemySpawner = new EnemySpawner(registries.enemy);
        this._levelUpManager = new LevelUpManager(registries.levelUpOption);
        this._weaponManager = new WeaponManager(registries.weapon);
        this._itemManager = new ItemManager(registries.item);
        this._petManager = new PetManager(registries.pet);
        this._classManager = new ClassManager(registries.class);
        this._npcManager = new NpcManager(registries.npc);
        this._shopManager = new ShopManager(registries.shopGoods);
        this._eventRoomManager = new EventRoomManager(registries.event);
        this._costumeManager = new CostumeManager();
        this._metaProgressionManager = new MetaProgressionManager();

        // 注册事件监听
        this._registerEventListeners();
    }

    // ─── Run 生命周期 ──────────────────────────────────────

    /**
     * 开始新的 Run
     * 初始化玩家 → 应用永久升级 → 应用职业 → 生成第一楼层 → 进入起始房间 → 发送 RunStart
     * @param classTypeId 选择的职业类型 ID
     */
    startRun(classTypeId: string): void {
        // 重置运行时状态
        this._battleTime = 0;
        this._killCount = 0;
        this._goldCollected = 0;
        this._isPaused = false;

        // 1. 重置玩家状态
        this._playerController.reset();

        // 2. 应用永久升级到玩家初始属性
        this._metaProgressionManager.applyToPlayer(
            this._playerController.getPlayerRuntimeState()
        );

        // 3. 应用职业基础属性和技能
        this._classManager.selectClass(
            classTypeId,
            this._playerController.getPlayerRuntimeState()
        );
        this._playerController.setClass(this._classManager.getCurrentClass());

        // 4. 生成第一个楼层并进入起始房间
        this._dungeonManager.startDungeon();

        // 5. 发送 RunStart 事件
        EventManager.getInstance().emit(RoguelikeEvent.RunStart);
    }

    /**
     * 每帧更新
     * 如果未暂停，更新玩家、敌人、武器、宠物，并构建 BattleContext
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        if (this._isPaused) return;

        this._battleTime += dt;

        // 更新玩家
        this._playerController.update(dt);

        // 构建战斗上下文
        const context = this._buildBattleContext();

        // 更新敌人 AI
        this._enemySpawner.update(dt, context);

        // 更新所有已装备武器
        this._weaponManager.update(dt);

        // 更新宠物
        this._petManager.update(dt, context);
    }

    // ─── 暂停与恢复 ────────────────────────────────────────

    /**
     * 暂停战斗
     */
    pause(): void {
        if (this._isPaused) return;
        this._isPaused = true;
        EventManager.getInstance().emit(RoguelikeEvent.BattlePause);
    }

    /**
     * 恢复战斗
     */
    resume(): void {
        if (!this._isPaused) return;
        this._isPaused = false;
        EventManager.getInstance().emit(RoguelikeEvent.BattleResume);
    }

    // ─── 事件回调 ──────────────────────────────────────────

    /**
     * 玩家死亡处理
     * 暂停战斗 → 结算 Run → 发送 RunEnd → 打开死亡面板
     */
    onPlayerDeath(): void {
        this.pause();

        const result: RunResult = {
            cleared: false,
            floorReached: this._dungeonManager.currentFloorIndex,
            killCount: this._killCount,
            survivalTime: this._battleTime,
            goldCollected: this._goldCollected,
        };

        const settlement = RoguelikeGameState.getInstance().settleRun(result);

        EventManager.getInstance().emit(
            RoguelikeEvent.RunEnd,
            result,
            settlement
        );

        // 检查职业解锁条件
        this._classManager.checkUnlockConditions();

        // 打开死亡结算面板
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.DeathPanel);
    }

    /**
     * Boss 被击败处理
     * 开放下一楼层入口
     */
    onBossDefeated(): void {
        // Boss 击败后标记当前房间已清除
        this._dungeonManager.clearRoom();
    }

    /**
     * 进入下一楼层
     * 通过 DungeonManager 生成下一楼层
     */
    enterNextFloor(): void {
        this._dungeonManager.generateNextFloor();
    }

    // ─── 状态重置 ──────────────────────────────────────────

    /**
     * 重置所有管理器
     */
    reset(): void {
        this._dungeonManager.reset();
        this._playerController.reset();
        this._enemySpawner.reset();
        this._weaponManager.reset();
        this._itemManager.reset();
        this._petManager.reset();
        this._classManager.reset();
        this._npcManager.reset();
        this._shopManager.reset();
        this._eventRoomManager.reset();
        this._costumeManager.reset();
        this._metaProgressionManager.reset();

        this._isPaused = false;
        this._battleTime = 0;
        this._killCount = 0;
        this._goldCollected = 0;
    }

    // ─── 属性访问 ──────────────────────────────────────────

    /** 是否暂停 */
    get isPaused(): boolean { return this._isPaused; }
    /** 战斗时间（秒） */
    get battleTime(): number { return this._battleTime; }
    /** 击杀数 */
    get killCount(): number { return this._killCount; }
    /** 收集的金币 */
    get goldCollected(): number { return this._goldCollected; }

    /** 获取地牢管理器 */
    get dungeonManager(): DungeonManager { return this._dungeonManager; }
    /** 获取玩家控制器 */
    get playerController(): PlayerController { return this._playerController; }
    /** 获取敌人生成器 */
    get enemySpawner(): EnemySpawner { return this._enemySpawner; }
    /** 获取升级管理器 */
    get levelUpManager(): LevelUpManager { return this._levelUpManager; }
    /** 获取武器管理器 */
    get weaponManager(): WeaponManager { return this._weaponManager; }
    /** 获取道具管理器 */
    get itemManager(): ItemManager { return this._itemManager; }
    /** 获取宠物管理器 */
    get petManager(): PetManager { return this._petManager; }
    /** 获取职业管理器 */
    get classManager(): ClassManager { return this._classManager; }
    /** 获取 NPC 管理器 */
    get npcManager(): NpcManager { return this._npcManager; }
    /** 获取商店管理器 */
    get shopManager(): ShopManager { return this._shopManager; }
    /** 获取事件房间管理器 */
    get eventRoomManager(): EventRoomManager { return this._eventRoomManager; }
    /** 获取换装管理器 */
    get costumeManager(): CostumeManager { return this._costumeManager; }
    /** 获取永久成长管理器 */
    get metaProgressionManager(): MetaProgressionManager { return this._metaProgressionManager; }

    // ─── 内部方法 ──────────────────────────────────────────

    /**
     * 构建当前帧的战斗上下文
     * @returns BattleContext 供敌人 AI 和宠物使用
     */
    private _buildBattleContext(): BattleContext {
        const playerState = this._playerController.getState();
        const activeEnemies = this._enemySpawner.getActiveEnemies();

        return {
            playerPosition: { x: playerState.position.x, y: playerState.position.y },
            playerHp: playerState.attributes.hp,
            floorIndex: this._dungeonManager.currentFloorIndex,
            elapsedTime: this._battleTime,
            enemyPositions: activeEnemies.map(e => {
                const attrs = e.getAttributes();
                // 敌人位置由各自 AI 内部管理，此处提供占位
                return { x: 0, y: 0 };
            }),
        };
    }

    /**
     * 注册事件监听
     * 监听 EnemyKilled、PlayerDied、BossDefeated、LevelUpChoiceSelected 等事件
     */
    private _registerEventListeners(): void {
        const em = EventManager.getInstance();

        // 敌人被击杀
        em.on(RoguelikeEvent.EnemyKilled, this._onEnemyKilled, this);

        // 玩家死亡
        em.on(RoguelikeEvent.PlayerDied, this._onPlayerDied, this);

        // Boss 被击败
        em.on(RoguelikeEvent.BossDefeated, this._onBossDefeated, this);

        // 升级选项被选择
        em.on(RoguelikeEvent.LevelUpChoiceSelected, this._onLevelUpChoiceSelected, this);

        // 玩家升级
        em.on(RoguelikeEvent.PlayerLevelUp, this._onPlayerLevelUp, this);

        // 金币变化
        em.on(RoguelikeEvent.PlayerGoldChanged, this._onPlayerGoldChanged, this);
    }

    /**
     * 敌人被击杀回调
     * 增加击杀计数
     */
    private _onEnemyKilled(_enemy?: IEnemyType): void {
        this._killCount++;
    }

    /**
     * 玩家死亡回调
     */
    private _onPlayerDied(): void {
        this.onPlayerDeath();
    }

    /**
     * Boss 被击败回调
     */
    private _onBossDefeated(): void {
        this.onBossDefeated();
    }

    /**
     * 升级选项被选择回调
     * 应用选项效果并恢复战斗
     * @param option 选中的升级选项
     */
    private _onLevelUpChoiceSelected(option: ILevelUpOption): void {
        this._levelUpManager.applyChoice(
            option,
            this._playerController.getPlayerRuntimeState()
        );
        this.resume();
    }

    /**
     * 玩家升级回调
     * 暂停战斗并生成升级选项
     * @param _level 新等级
     */
    private _onPlayerLevelUp(_level: number): void {
        this.pause();
        this._levelUpManager.generateChoices(
            this._playerController.getPlayerRuntimeState(),
            RoguelikeConst.LEVEL_UP_CHOICES_COUNT
        );
    }

    /**
     * 玩家金币变化回调
     * 追踪本次 Run 收集的金币总量
     * @param currentGold 当前金币数
     */
    private _onPlayerGoldChanged(currentGold: number): void {
        this._goldCollected = currentGold;
    }
}
