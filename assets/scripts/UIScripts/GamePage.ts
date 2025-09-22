import { _decorator, Button, Component, Node, ProgressBar, Slider } from 'cc';
import { UIBase } from '../Core/UIBase';
import { UIManager } from '../Core/UIManager';
import { UIID } from './UIData';
const { ccclass, property } = _decorator;

@ccclass('GamePage')
export class GamePage extends UIBase {
    @property(Button)
    m_StartBtn:Button = null;

    onOpen(...args: any[]): void {   
        this.m_StartBtn.node.on('click', ()=>{
            UIManager.GetInstance().ClosePanel(UIID.MainPanel);
            UIManager.GetInstance().OpenPanel(UIID.GamePanel);
        });
    }

    onClose(): void {
        
    }
}