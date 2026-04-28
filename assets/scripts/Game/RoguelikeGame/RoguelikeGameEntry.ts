import { StorageManager } from '../../framework/StorageManager';
import { EventManager } from '../../framework/EventManager';
import { UIManager } from '../../engine/ui/UIManager';
import { FlatBuffersRuntime } from '../../engine/FlatBuffersRuntime';
import { registerRoguelikeGameUI, RoguelikeUIID } from './RoguelikeUIConfig';
import { RoguelikeGameState } from './RoguelikeGameState';
import { RoguelikeEvent } from './RoguelikeEvent';
import { ROGUELIKE_CONFIG_MAP } from './RoguelikeConst';

/**
 * 肉鸽动作游戏 — 游戏入口
 */
export async function initRoguelikeGame(): Promise<void> {
    // 1. 设置存储前缀
    StorageManager.getInstance().setPrefix('roguelike_');

    // 2. 注册所有 UI 面板
    registerRoguelikeGameUI();

    // 3. 加载 FlatBuffers 配置数据
    await FlatBuffersRuntime.getInstance().loadAll(ROGUELIKE_CONFIG_MAP);

    // 4. 注册所有可扩展类型（后续任务实现 registerAllTypes）
    // registerAllTypes();

    // 5. 初始化持久化状态
    RoguelikeGameState.getInstance();

    // 6. 发送初始化完成事件
    EventManager.getInstance().emit(RoguelikeEvent.ModuleInitialized);

    // 7. 打开加载界面
    UIManager.GetInstance().OpenPanel(RoguelikeUIID.LoadingPanel);
}
