/**
 * 事件管理器 — 全局事件总线，不再继承 Component
 */
export class EventManager {
    private static _instance: EventManager;
    private _events: Map<string, Array<{ callback: Function; target: any }>> = new Map();

    static getInstance(): EventManager {
        if (!this._instance) {
            this._instance = new EventManager();
        }
        return this._instance;
    }

    on(eventName: string, callback: Function, target?: any): void {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, []);
        }
        this._events.get(eventName)!.push({ callback, target });
    }

    off(eventName: string, callback: Function, target?: any): void {
        const handlers = this._events.get(eventName);
        if (handlers) {
            for (let i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i].callback === callback && handlers[i].target === target) {
                    handlers.splice(i, 1);
                }
            }
        }
    }

    emit(eventName: string, ...args: any[]): void {
        const handlers = this._events.get(eventName);
        if (handlers) {
            // 复制一份避免遍历中修改
            const snapshot = handlers.slice();
            snapshot.forEach(handler => {
                handler.callback.call(handler.target, ...args);
            });
        }
    }

    /** 移除某个 target 的所有监听 */
    offAllByTarget(target: any): void {
        this._events.forEach((handlers, eventName) => {
            for (let i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i].target === target) {
                    handlers.splice(i, 1);
                }
            }
        });
    }

    /** 清除所有事件 */
    clear(): void {
        this._events.clear();
    }
}
