import { UIManager } from '../../engine/ui/UIManager';
import { CommonUIID, registerCommonGameUI } from './CommonUIConfig';

/**
 * 通用 UI 入口
 * 负责注册通用面板并打开首屏 loading。
 */
export function initCommonGame(): void {
    registerCommonGameUI();
    UIManager.GetInstance().OpenPanel(CommonUIID.LoadingPanel, CommonUIID.LoginPanel);
}
