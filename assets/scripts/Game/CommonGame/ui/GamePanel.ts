import { _decorator } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
const { ccclass } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends UIBase {
    OnInit(): void {}

    OnOpen(): void {}

    OnClose(): void {
        super.OnClose();
    }
}
