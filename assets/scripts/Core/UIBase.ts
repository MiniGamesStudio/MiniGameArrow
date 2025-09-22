import { _decorator, Component } from 'cc';
const {ccclass, property} = _decorator;

// UI 基类
@ccclass('UIBase')
export abstract class UIBase extends Component {
    public m_PanelID: number = 0;
    
    // 可供子类重写的方法
    abstract onOpen(...args: any[]): void
    abstract onClose(): void
}