/**
 * 敌人类型接口定义
 * 定义敌人的基础接口和相关数据结构
 */

/** 二维向量 */
export interface Vec2 {
    x: number;
    y: number;
}

/**
 * 敌人属性
 * 描述敌人的基础数值属性
 */
export interface EnemyAttributes {
    /** 当前生命值 */
    hp: number;
    /** 最大生命值 */
    maxHp: number;
    /** 攻击力 */
    attack: number;
    /** 防御力 */
    defense: number;
    /** 移动速度 */
    moveSpeed: number;
    /** 击杀掉落经验值 */
    expDrop: number;
    /** 击杀掉落金币数 */
    goldDrop: number;
}

/**
 * 敌人配置
 * 从配置表加载的敌人初始化数据
 */
export interface EnemyConfig {
    /** 敌人 ID */
    id: number;
    /** 敌人名称 */
    name: string;
    /** 基础属性 */
    attributes: EnemyAttributes;
    /** 敌人类型标识 */
    typeId: string;
    /** 攻击范围 */
    attackRange: number;
    /** 攻击冷却时间（秒） */
    attackCooldown: number;
    /** 技能列表 ID */
    skillIds: number[];
}

/**
 * 战斗上下文
 * 提供战斗逻辑执行所需的运行时信息
 */
export interface BattleContext {
    /** 玩家位置 */
    playerPosition: Vec2;
    /** 玩家当前生命值 */
    playerHp: number;
    /** 当前楼层索引 */
    floorIndex: number;
    /** 战斗已经过的时间（秒） */
    elapsedTime: number;
    /** 场景中所有敌人的位置列表 */
    enemyPositions: Vec2[];
}

/**
 * 战利品掉落
 * 描述敌人死亡后的掉落物
 */
export interface LootDrop {
    /** 掉落物类型：武器、道具、经验宝石、金币 */
    type: 'weapon' | 'item' | 'exp_gem' | 'gold';
    /** 掉落物 ID（武器或道具的配置 ID） */
    id?: string;
    /** 数量 */
    amount: number;
    /** 稀有度 */
    rarity?: string;
}

/**
 * 敌人类型接口
 * 所有敌人类型必须实现此接口
 */
export interface IEnemyType {
    /** 类型标识符 */
    typeId: string;
    /** 初始化敌人属性 */
    init(config: EnemyConfig): void;
    /** AI 行为更新（每帧调用） */
    updateAI(dt: number, context: BattleContext): void;
    /** 受击回调 */
    onHit(damage: number, source: Vec2): void;
    /** 死亡回调，返回掉落物列表 */
    onDeath(): LootDrop[];
    /** 获取当前属性 */
    getAttributes(): EnemyAttributes;
}
