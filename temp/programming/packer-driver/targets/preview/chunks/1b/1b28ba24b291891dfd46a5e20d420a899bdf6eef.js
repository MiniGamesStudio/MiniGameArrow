System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, UIManager, UIID, GameState, EventManager, CustomClientEvent, _dec, _class, _class2, _crd, ccclass, GameManager;

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "./UIManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIID(extras) {
    _reporterNs.report("UIID", "../UIScripts/UIData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameState(extras) {
    _reporterNs.report("GameState", "../Model/GameState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "./EventManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCustomClientEvent(extras) {
    _reporterNs.report("CustomClientEvent", "../Config/Config", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
    }, function (_unresolved_2) {
      UIManager = _unresolved_2.UIManager;
    }, function (_unresolved_3) {
      UIID = _unresolved_3.UIID;
    }, function (_unresolved_4) {
      GameState = _unresolved_4.GameState;
    }, function (_unresolved_5) {
      EventManager = _unresolved_5.EventManager;
    }, function (_unresolved_6) {
      CustomClientEvent = _unresolved_6.CustomClientEvent;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "54644vHSZhH94h9Kcc3gMp4", "GameManager", undefined);

      __checkObsolete__(['_decorator', 'Node']);

      ({
        ccclass
      } = _decorator);
      /**
       * 游戏管理器 — 全局生命周期管理
       */

      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec(_class = (_class2 = class GameManager {
        constructor() {
          this.m_GameWorldRoot = null;
          this.m_GameState = null;
        }

        static GetInstance() {
          if (this.m_Instance == null) {
            this.m_Instance = new GameManager();
          }

          return this.m_Instance;
        }

        Init(gameWorldRoot, uiRoot) {
          this.m_GameWorldRoot = gameWorldRoot;
          this.m_GameState = (_crd && GameState === void 0 ? (_reportPossibleCrUseOfGameState({
            error: Error()
          }), GameState) : GameState).getInstance();
          (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
            error: Error()
          }), UIManager) : UIManager).GetInstance().Init(uiRoot);
          (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
            error: Error()
          }), UIManager) : UIManager).GetInstance().OpenPanel((_crd && UIID === void 0 ? (_reportPossibleCrUseOfUIID({
            error: Error()
          }), UIID) : UIID).LoadingPanel);
        }

        Update(dt) {// 预留全局 update
        }

        LateUpdate(dt) {// 预留全局 lateUpdate
        }

        Destory() {
          (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance().clear();
          this.m_GameState = null;
        }

        PauseGame() {
          if (this.m_GameState) {
            this.m_GameState.isPaused = true;
            (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
              error: Error()
            }), EventManager) : EventManager).getInstance().emit((_crd && CustomClientEvent === void 0 ? (_reportPossibleCrUseOfCustomClientEvent({
              error: Error()
            }), CustomClientEvent) : CustomClientEvent).GamePaused);
          }
        }

        ResumeGame() {
          if (this.m_GameState) {
            this.m_GameState.isPaused = false;
            (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
              error: Error()
            }), EventManager) : EventManager).getInstance().emit((_crd && CustomClientEvent === void 0 ? (_reportPossibleCrUseOfCustomClientEvent({
              error: Error()
            }), CustomClientEvent) : CustomClientEvent).GameResumed);
          }
        }

      }, _class2.m_Instance = null, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1b28ba24b291891dfd46a5e20d420a899bdf6eef.js.map