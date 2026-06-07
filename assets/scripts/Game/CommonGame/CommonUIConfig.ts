import { UIDataRegistry, UILayer, UIShowMode } from '../../engine/ui/UIData';

/**
 * 通用 UI ID 枚举
 */
export enum CommonUIID {
    None = 0,
    LoadingPanel = 1,
    MainPanel = 2,
}

/**
 * 注册通用 UI 面板到框架
 */
export function registerCommonGameUI(): void {
    UIDataRegistry.Register(CommonUIID.LoadingPanel, UILayer.System, "LoadingPanel", "ui/LoadingPanel");
    UIDataRegistry.Register(CommonUIID.MainPanel, UILayer.Normal, "MainPanel", "ui/MainPanel", UIShowMode.Normal, 1);
}
