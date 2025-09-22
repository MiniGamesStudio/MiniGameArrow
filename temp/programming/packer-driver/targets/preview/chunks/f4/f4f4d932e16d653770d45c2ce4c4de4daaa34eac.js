System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, _dec, _class, _crd, ccclass, property, UIBase;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f7720YoTB9DTZFTu7EsgTFf", "UIBase", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator); // UI 基类

      _export("UIBase", UIBase = (_dec = ccclass('UIBase'), _dec(_class = class UIBase extends Component {
        constructor() {
          super(...arguments);
          this.m_PanelID = 0;
        } // 可供子类重写的方法


      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f4f4d932e16d653770d45c2ce4c4de4daaa34eac.js.map