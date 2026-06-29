import { _decorator, Node } from 'cc';
import { MiniGamePlatform, PlatformManager, PlatformResult } from '../../../engine/PlatformManager';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { CommonGameProgress } from '../CommonGameProgress';
import { CommonUIID } from '../CommonUIConfig';
const { ccclass, property } = _decorator;

@ccclass('MainPage')
export class MainPage extends UIBase {
    @property(Node)
    m_TopRoot: Node = null;
    @property(Node)
    m_LeftRoot: Node = null;
    @property(Node)
    m_RightRoot: Node = null;
    @property(Node)
    m_MiddleRoot: Node = null;

    OnInit(): void {}

    OnOpen(): void {
        this.initUI();
    }

    OnClose(): void {
        super.OnClose();
        this.clearRoot(this.m_LeftRoot);
        this.clearRoot(this.m_RightRoot);
        this.clearRoot(this.m_MiddleRoot);
    }

    private initUI(): void {
        this.clearRoot(this.m_LeftRoot);
        this.clearRoot(this.m_RightRoot);
        this.clearRoot(this.m_MiddleRoot);

        this.InitUIButtons();
    }

    private InitUIButtons(): void {
        const buttons = this.CreateUIButtonsByTable(this.m_MiddleRoot, [
            {
                buttonName: "StartGame",
                buttonText: "开始游戏",
                buttonIcon: "buttons/Button01_145_Orange",
                onClick: () => {
                    const currentLevel = CommonGameProgress.getCurrentLevel(1);
                    UIManager.GetInstance().OpenPanelWithCallback(CommonUIID.GamePanel, () => {
                        UIManager.GetInstance().ClosePanel(CommonUIID.MainPanel);
                    }, currentLevel);
                },
            },
        ]);

        buttons.forEach((button, index) => {
            button.node.setPosition(0, 120 - index * 90, 0);
        });

        const rightButtonConfigs = [
            {
                buttonName: "Rank",
                buttonText: "排行榜",
                buttonIcon: "texture/Icon_ImageIcon_Ranking",
                onClick: () => {
                    UIManager.GetInstance().OpenPanel(CommonUIID.RankPanel);
                },
            },
        ];

        if (PlatformManager.getInstance().getPlatform() === MiniGamePlatform.WeChat) {
            rightButtonConfigs.push({
                buttonName: "GameClub",
                buttonText: "游戏圈",
                buttonIcon: "texture/Icon_ImageIcon_Ranking",
                onClick: () => {
                    this.openWeChatGameClub();
                },
            });
        }

        // if (PlatformManager.getInstance().getPlatform() === MiniGamePlatform.Douyin) {
        //     rightButtonConfigs.push({
        //         buttonName: "Sidebar",
        //         buttonText: "侧边栏",
        //         buttonIcon: "buttons/Icon_ImageIcon_Ranking",
        //         onClick: () => {
        //             this.openDouyinSidebar();
        //         },
        //     });
        // }

        const rightButtons = this.CreateUIButtonsByTable(this.m_RightRoot, rightButtonConfigs);

        rightButtons.forEach((button, index) => {
            button.node.setPosition(0, 80 - index * 90, 0);
        });
    }

    /** 微信游戏圈 OPENLINK 值（由微信开放平台/渠道下发） */
    private static readonly GAME_CLUB_OPEN_LINK = '-SSEykJvFV3pORt5kTNpS2-MczMSa1aUsUcE1ADW8e3l2BGtUIHxCLNVcvBXDjV0y8e81_K9sVzCb-FNDAK_50EBVFxe2MmRSnYv27_-Euv2Bye0q9FqwbW_ApJi_MoJ5CbomTGuKDMRlv7whMeOFUGFaganV4W3p14yBJs-ovJrKGZDQa7BwIEcmhUcHA9QzLv4ddvJkmINyixQWsQUad1hi9iUapw42CxLEJ3-Hp76oqp82oGmhdlUs_bnIOrMeYc-c4NTv4KCUkOI8T0H0WUrVlbe-QZB8Hq-edxoceJEJADWXJD6g7B8PV7A9vmuQQDsVAXNEpiykZ_EE5cLZg';

    private async openWeChatGameClub(): Promise<void> {
        const result = await PlatformManager.getInstance().openGameClubPage(MainPage.GAME_CLUB_OPEN_LINK);
        if (result.result !== PlatformResult.Success) {
            console.warn('MainPage: 拉起微信游戏圈失败', result);
        }
    }

    private async openDouyinSidebar(): Promise<void> {
        const result = await PlatformManager.getInstance().navigateToSidebar();
        if (result.result !== PlatformResult.Success) {
            console.warn('MainPage: 跳转抖音侧边栏失败', result);
        }
    }

    private clearRoot(root: Node): void {
        if (!root) return;

        root.children.forEach(node => {
            node.removeFromParent();
            node.destroy();
        });
    }
}
