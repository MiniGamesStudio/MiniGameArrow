/**
 * 输入处理器
 * 处理虚拟摇杆、攻击按钮和技能按钮的输入状态
 * 依赖 Cocos Creator 的 Node 和 EventTouch 进行输入绑定
 */

import { Node, EventTouch, UITransform, Vec3 } from 'cc';

/**
 * 二维方向向量（轻量级，用于输入方向）
 */
interface InputVec2 {
    x: number;
    y: number;
}

/** 零向量常量 */
const ZERO_VEC2: Readonly<InputVec2> = { x: 0, y: 0 };

/**
 * 将任意方向归一化为 8 方向
 * 将连续角度量化为 0°、45°、90°、135°、180°、225°、270°、315° 八个方向
 */
function normalizeToEightDirection(dir: InputVec2): InputVec2 {
    const len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
    if (len < 0.001) {
        return { x: 0, y: 0 };
    }

    // 计算角度（弧度）并量化为 8 方向
    const angle = Math.atan2(dir.y, dir.x);
    const sector = Math.round(angle / (Math.PI / 4));
    const snappedAngle = sector * (Math.PI / 4);

    return {
        x: Math.round(Math.cos(snappedAngle) * 1000) / 1000,
        y: Math.round(Math.sin(snappedAngle) * 1000) / 1000,
    };
}

/**
 * 输入处理器
 * 管理虚拟摇杆、攻击按钮和技能按钮的输入状态
 */
export class InputHandler {
    /** 虚拟摇杆输入方向（归一化 8 方向） */
    private _moveDirection: InputVec2 = { x: 0, y: 0 };
    /** 攻击按钮状态 */
    private _attackPressed: boolean = false;
    /** 技能按钮状态（按技能槽索引） */
    private _skillPressed: Map<number, boolean> = new Map();

    /** 摇杆触摸起始位置 */
    private _joystickOrigin: InputVec2 = { x: 0, y: 0 };
    /** 摇杆最大拖拽半径 */
    private _joystickRadius: number = 100;

    /**
     * 绑定虚拟摇杆节点
     * 监听触摸事件，将触摸偏移转换为 8 方向移动输入
     * @param joystickNode 摇杆触摸区域节点
     * @param radius 摇杆最大拖拽半径（默认 100）
     */
    bindJoystick(joystickNode: Node, radius: number = 100): void {
        this._joystickRadius = radius;

        joystickNode.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            const location = event.getUILocation();
            this._joystickOrigin = { x: location.x, y: location.y };
            this._moveDirection = { x: 0, y: 0 };
        }, this);

        joystickNode.on(Node.EventType.TOUCH_MOVE, (event: EventTouch) => {
            const location = event.getUILocation();
            const dx = location.x - this._joystickOrigin.x;
            const dy = location.y - this._joystickOrigin.y;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 1) {
                this._moveDirection = { x: 0, y: 0 };
                return;
            }

            // 归一化并限制在半径内
            const clampedDist = Math.min(distance, this._joystickRadius);
            const normalized: InputVec2 = {
                x: (dx / distance) * (clampedDist / this._joystickRadius),
                y: (dy / distance) * (clampedDist / this._joystickRadius),
            };

            this._moveDirection = normalizeToEightDirection(normalized);
        }, this);

        joystickNode.on(Node.EventType.TOUCH_END, () => {
            this._moveDirection = { x: 0, y: 0 };
        }, this);

        joystickNode.on(Node.EventType.TOUCH_CANCEL, () => {
            this._moveDirection = { x: 0, y: 0 };
        }, this);
    }

    /**
     * 绑定攻击按钮
     * 按下时设置攻击状态为 true，松开时设置为 false
     * @param btnNode 攻击按钮节点
     */
    bindAttackButton(btnNode: Node): void {
        btnNode.on(Node.EventType.TOUCH_START, () => {
            this._attackPressed = true;
        }, this);

        btnNode.on(Node.EventType.TOUCH_END, () => {
            this._attackPressed = false;
        }, this);

        btnNode.on(Node.EventType.TOUCH_CANCEL, () => {
            this._attackPressed = false;
        }, this);
    }

    /**
     * 绑定技能按钮
     * 按下时设置对应技能槽状态为 true，松开时设置为 false
     * @param slotIndex 技能槽索引
     * @param btnNode 技能按钮节点
     */
    bindSkillButton(slotIndex: number, btnNode: Node): void {
        btnNode.on(Node.EventType.TOUCH_START, () => {
            this._skillPressed.set(slotIndex, true);
        }, this);

        btnNode.on(Node.EventType.TOUCH_END, () => {
            this._skillPressed.set(slotIndex, false);
        }, this);

        btnNode.on(Node.EventType.TOUCH_CANCEL, () => {
            this._skillPressed.set(slotIndex, false);
        }, this);
    }

    /**
     * 获取当前移动方向
     * @returns 归一化的 8 方向向量
     */
    getMoveDirection(): InputVec2 {
        return this._moveDirection;
    }

    /**
     * 攻击按钮是否按下
     */
    isAttackPressed(): boolean {
        return this._attackPressed;
    }

    /**
     * 指定技能槽按钮是否按下
     * @param slotIndex 技能槽索引
     */
    isSkillPressed(slotIndex: number): boolean {
        return this._skillPressed.get(slotIndex) ?? false;
    }

    /**
     * 重置所有输入状态
     */
    reset(): void {
        this._moveDirection = { x: 0, y: 0 };
        this._attackPressed = false;
        this._skillPressed.clear();
    }
}
