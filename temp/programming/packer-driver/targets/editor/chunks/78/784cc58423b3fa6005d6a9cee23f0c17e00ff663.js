System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, EventManager, _crd;

  _export("EventManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e40803HO8NGoLzZLcBcDPRg", "EventManager", undefined);

      /**
       * 事件管理器 — 全局事件总线，不再继承 Component
       */
      _export("EventManager", EventManager = class EventManager {
        constructor() {
          this._events = new Map();
        }

        static getInstance() {
          if (!this._instance) {
            this._instance = new EventManager();
          }

          return this._instance;
        }

        on(eventName, callback, target) {
          if (!this._events.has(eventName)) {
            this._events.set(eventName, []);
          }

          this._events.get(eventName).push({
            callback,
            target
          });
        }

        off(eventName, callback, target) {
          const handlers = this._events.get(eventName);

          if (handlers) {
            for (let i = handlers.length - 1; i >= 0; i--) {
              if (handlers[i].callback === callback && handlers[i].target === target) {
                handlers.splice(i, 1);
              }
            }
          }
        }

        emit(eventName, ...args) {
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


        offAllByTarget(target) {
          this._events.forEach((handlers, eventName) => {
            for (let i = handlers.length - 1; i >= 0; i--) {
              if (handlers[i].target === target) {
                handlers.splice(i, 1);
              }
            }
          });
        }
        /** 清除所有事件 */


        clear() {
          this._events.clear();
        }

      });

      EventManager._instance = void 0;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=784cc58423b3fa6005d6a9cee23f0c17e00ff663.js.map