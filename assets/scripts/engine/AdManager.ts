import { sys } from 'cc';

/**
 * 广告管理器 — 统一管理各平台广告播放。
 * 目前支持微信小游戏(wx)与抖音小游戏(tt)的激励视频广告。
 */
export enum AdPlatform {
    Auto = 'auto',
    WeChat = 'wechat',
    Douyin = 'douyin',
}

export enum AdPlayResult {
    Completed = 'completed',
    Skipped = 'skipped',
    Failed = 'failed',
    Unsupported = 'unsupported',
    Busy = 'busy',
}

export interface RewardedVideoAdOptions {
    adUnitId?: string;
    platform?: AdPlatform;
}

export interface RewardedVideoAdResult {
    result: AdPlayResult;
    platform: AdPlatform;
    isEnded: boolean;
    message?: string;
    err?: unknown;
}

type MiniGameAdCloseResult = {
    isEnded?: boolean;
};

type MiniGameRewardedVideoAd = {
    show: () => Promise<void> | void;
    load?: () => Promise<void> | void;
    destroy?: () => void;
    onLoad?: (callback: () => void) => void;
    offLoad?: (callback: () => void) => void;
    onClose?: (callback: (res?: MiniGameAdCloseResult) => void) => void;
    offClose?: (callback: (res?: MiniGameAdCloseResult) => void) => void;
    onError?: (callback: (err: unknown) => void) => void;
    offError?: (callback: (err: unknown) => void) => void;
};

type MiniGameAdRuntime = {
    createRewardedVideoAd?: (options: { adUnitId: string }) => MiniGameRewardedVideoAd;
};

export class AdManager {
    private static _instance: AdManager;

    private _rewardedAdUnitIds: Map<AdPlatform, string> = new Map();
    private _rewardedAdCache: Map<string, MiniGameRewardedVideoAd> = new Map();
    private _isPlayingRewardedVideo: boolean = false;
    private _initialized: boolean = false;
    private _currentPlatform: AdPlatform = AdPlatform.Auto;
    private _currentRuntime: MiniGameAdRuntime | null = null;

    static getInstance(): AdManager {
        if (!this._instance) {
            this._instance = new AdManager();
        }
        return this._instance;
    }

    init(): void {
        if (this._initialized) return;

        this._currentPlatform = this.resolvePlatformBySystem();
        this._currentRuntime = this.getRuntime(this._currentPlatform);
        this._initialized = true;

        if (this._currentPlatform === AdPlatform.Auto || !this._currentRuntime?.createRewardedVideoAd) {
            console.warn('AdManager: 当前平台暂不支持广告');
        }
    }

    setRewardedVideoAdUnitId(platform: AdPlatform, adUnitId: string): void {
        if (!adUnitId) {
            this._rewardedAdUnitIds.delete(platform);
            return;
        }
        this._rewardedAdUnitIds.set(platform, adUnitId);
    }

    setRewardedVideoAdUnitIds(adUnitIds: Partial<Record<AdPlatform, string>>): void {
        Object.keys(adUnitIds).forEach(key => {
            const platform = key as AdPlatform;
            if (platform === AdPlatform.Auto) return;
            this.setRewardedVideoAdUnitId(platform, adUnitIds[platform]);
        });
    }

    async playRewardedVideoAd(options: RewardedVideoAdOptions = {}): Promise<RewardedVideoAdResult> {
        if (this._isPlayingRewardedVideo) {
            return {
                result: AdPlayResult.Busy,
                platform: options.platform ?? AdPlatform.Auto,
                isEnded: false,
                message: '已有激励视频广告正在播放',
            };
        }

        if (!this._initialized) {
            this.init();
        }

        const platform = this.resolvePlatform(options.platform);
        if (platform === AdPlatform.Auto) {
            return {
                result: AdPlayResult.Unsupported,
                platform,
                isEnded: false,
                message: '当前运行环境不支持激励视频广告',
            };
        }

        const runtime = this.getRuntimeByPlatform(platform);
        if (!runtime?.createRewardedVideoAd) {
            return {
                result: AdPlayResult.Unsupported,
                platform,
                isEnded: false,
                message: `当前平台未提供激励视频广告接口 [${platform}]`,
            };
        }

        const adUnitId = options.adUnitId || this._rewardedAdUnitIds.get(platform);
        if (!adUnitId) {
            return {
                result: AdPlayResult.Failed,
                platform,
                isEnded: false,
                message: `未配置激励视频广告位 ID [${platform}]`,
            };
        }

        this._isPlayingRewardedVideo = true;
        try {
            const ad = this.getOrCreateRewardedVideoAd(platform, adUnitId, runtime);
            return await this.showRewardedVideoAd(ad, platform);
        } catch (err) {
            return {
                result: AdPlayResult.Failed,
                platform,
                isEnded: false,
                message: '激励视频广告播放失败',
                err,
            };
        } finally {
            this._isPlayingRewardedVideo = false;
        }
    }

    destroy(): void {
        this._rewardedAdCache.forEach(ad => ad.destroy?.());
        this._rewardedAdCache.clear();
        this._rewardedAdUnitIds.clear();
        this._isPlayingRewardedVideo = false;
        this._initialized = false;
        this._currentPlatform = AdPlatform.Auto;
        this._currentRuntime = null;
    }

    private resolvePlatform(platform: AdPlatform = AdPlatform.Auto): AdPlatform {
        if (platform !== AdPlatform.Auto) return platform;
        if (this._currentPlatform !== AdPlatform.Auto) return this._currentPlatform;

        return this.resolvePlatformBySystem();
    }

    private resolvePlatformBySystem(): AdPlatform {
        if (sys.platform === sys.Platform.WECHAT_GAME) return AdPlatform.WeChat;
        if (sys.platform === sys.Platform.BYTEDANCE_MINI_GAME) return AdPlatform.Douyin;

        return AdPlatform.Auto;
    }

    private getRuntimeByPlatform(platform: AdPlatform): MiniGameAdRuntime | null {
        if (platform === this._currentPlatform) return this._currentRuntime;
        return this.getRuntime(platform);
    }

    private getRuntime(platform: AdPlatform): MiniGameAdRuntime | null {
        const globalObj = globalThis as unknown as { wx?: MiniGameAdRuntime; tt?: MiniGameAdRuntime };
        if (platform === AdPlatform.WeChat) return globalObj.wx ?? null;
        if (platform === AdPlatform.Douyin) return globalObj.tt ?? null;
        return null;
    }

    private getOrCreateRewardedVideoAd(platform: AdPlatform, adUnitId: string, runtime: MiniGameAdRuntime): MiniGameRewardedVideoAd {
        const cacheKey = `${platform}:${adUnitId}`;
        const cachedAd = this._rewardedAdCache.get(cacheKey);
        if (cachedAd) return cachedAd;

        const ad = runtime.createRewardedVideoAd({ adUnitId });
        this._rewardedAdCache.set(cacheKey, ad);
        return ad;
    }

    private showRewardedVideoAd(ad: MiniGameRewardedVideoAd, platform: AdPlatform): Promise<RewardedVideoAdResult> {
        return new Promise(resolve => {
            let finished = false;

            const cleanup = (): void => {
                ad.offClose?.(onClose);
                ad.offError?.(onError);
            };

            const finish = (result: RewardedVideoAdResult): void => {
                if (finished) return;
                finished = true;
                cleanup();
                resolve(result);
            };

            const onClose = (res?: MiniGameAdCloseResult): void => {
                const isEnded = res?.isEnded !== false;
                finish({
                    result: isEnded ? AdPlayResult.Completed : AdPlayResult.Skipped,
                    platform,
                    isEnded,
                    message: isEnded ? '激励视频广告播放完成' : '用户提前关闭激励视频广告',
                });
            };

            const onError = (err: unknown): void => {
                finish({
                    result: AdPlayResult.Failed,
                    platform,
                    isEnded: false,
                    message: '激励视频广告发生错误',
                    err,
                });
            };

            ad.onClose?.(onClose);
            ad.onError?.(onError);

            Promise.resolve(ad.show()).catch(() => {
                Promise.resolve(ad.load?.())
                    .then(() => Promise.resolve(ad.show()))
                    .catch(onError);
            });
        });
    }
}
