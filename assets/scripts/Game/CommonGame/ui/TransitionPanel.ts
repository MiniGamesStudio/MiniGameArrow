import { _decorator, Node, tween, Vec3 } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { CommonUIID } from '../CommonUIConfig';
const { ccclass } = _decorator;

export interface TransitionPanelOptions {
    onComplete?: () => void;
}

@ccclass('TransitionPanel')
export class TransitionPanel extends UIBase {
    private m_Root: Node = null;
    private m_OnComplete: (() => void) | null = null;

    OnOpen(options: TransitionPanelOptions = {}): void {
        this.m_OnComplete = options.onComplete || null;
        this.m_Root = this.findChildByName(this.node, 'Root') || this.node;
        this.playTransition();
    }

    OnClose(): void {
        if (this.m_Root && this.m_Root.isValid) {
            tween(this.m_Root).stop();
        }
        this.m_OnComplete = null;
        this.m_Root = null;
        super.OnClose();
    }

    private playTransition(): void {
        if (!this.m_Root || !this.m_Root.isValid) {
            this.finishTransition();
            return;
        }

        this.m_Root.setScale(new Vec3(0.85, 0.85, 1));
        tween(this.m_Root)
            .to(0.2, { scale: new Vec3(1.08, 1.08, 1) })
            .to(0.12, { scale: new Vec3(1, 1, 1) })
            .delay(0.25)
            .call(() => this.finishTransition())
            .start();
    }

    private finishTransition(): void {
        const onComplete = this.m_OnComplete;
        UIManager.GetInstance().ClosePanel(CommonUIID.TransitionPanel);
        onComplete?.();
    }

    private findChildByName(root: Node, name: string): Node | null {
        if (!root) return null;
        if (root.name === name) return root;

        for (const child of root.children) {
            const matched = this.findChildByName(child, name);
            if (matched) return matched;
        }

        return null;
    }
}
