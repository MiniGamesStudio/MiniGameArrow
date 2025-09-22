System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, UIManager, UIID, _dec, _class, _class2, _crd, ccclass, GameManager;

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "./UIManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIID(extras) {
    _reporterNs.report("UIID", "../UIScripts/UIData", _context.meta, extras);
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
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "54644vHSZhH94h9Kcc3gMp4", "GameManager", undefined);

      __checkObsolete__(['_decorator', 'Node']);

      ({
        ccclass
      } = _decorator);

      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec(_class = (_class2 = class GameManager {
        constructor() {
          this.m_GamewWorldRoot = null;
        }

        static GetInstance() {
          if (this.m_Instance == null) {
            this.m_Instance = new GameManager();
          }

          return this.m_Instance;
        }

        Init(gameWorldRoot, uiRoot) {
          this.m_GamewWorldRoot = gameWorldRoot;
          (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
            error: Error()
          }), UIManager) : UIManager).GetInstance().Init(uiRoot);
          (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
            error: Error()
          }), UIManager) : UIManager).GetInstance().OpenPanel((_crd && UIID === void 0 ? (_reportPossibleCrUseOfUIID({
            error: Error()
          }), UIID) : UIID).LoadingPanel);
        }

        Update(dt) {}

        LateUpdate(dt) {}

        Destory() {}

        PauseGame() {}

        ResumeGame() {}

      }, _class2.m_Instance = null, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1b28ba24b291891dfd46a5e20d420a899bdf6eef.js.map