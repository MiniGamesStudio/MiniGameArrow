import { _decorator, Component, view, Size, screen, Widget } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScreenAdapter')
export class ScreenAdapter extends Component {
    @property(Size)
    public designResolution = new Size(0, 0);

    onLoad() {
        // 初始适配
        this.adjustScreen();
        // 监听屏幕大小变化（如浏览器窗口调整、设备旋转）
        view.on('resize', this.adjustScreen, this);
    }

    onDestroy() {
        view.off('resize', this.adjustScreen, this);
    }

    adjustScreen() {
        const canvas = this.node.getComponent('cc.Canvas');
        if (!canvas) return;

        const screenSize = view.getVisibleSize();
        const designRatio = this.designResolution.width / this.designResolution.height;
        const screenRatio = screenSize.width / screenSize.height;

        // 动态选择适配策略
        if (screenRatio >= designRatio) {
            // 屏幕更宽或比例相同 -> 固定高度，适配宽度可能出现的黑边
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        } else {
            // 屏幕更窄 -> 固定宽度，适配高度可能出现的黑边
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }
    }
}