import { _decorator, CCFloat, Color, Component, EffectAsset, Material, resources, Sprite, SpriteFrame, Texture2D, UITransform, Vec4 } from 'cc';

const { ccclass, executeInEditMode, property } = _decorator;

@ccclass('PixelMonsterSprite')
@executeInEditMode(true)
export class PixelMonsterSprite extends Component {
    @property(Sprite)
    targetSprite: Sprite = null;

    @property(EffectAsset)
    effectAsset: EffectAsset = null;

    @property(Texture2D)
    paletteTexture: Texture2D = null;

    @property(Color)
    outlineColor: Color = new Color(0, 0, 0, 255);

    @property(Color)
    eyeColor: Color = new Color(255, 255, 255, 255);

    @property({ type: CCFloat, tooltip: '换一个值会改变轮廓、五官、斑点和局部明暗。' })
    seed = 3;

    @property({ type: CCFloat, tooltip: '0-1 对应色环一周，用来选择怪物主色。' })
    hueBias = 0.36;

    @property({ type: CCFloat, tooltip: '从色板中心向外取色的半径，越大越饱和。' })
    paletteRadius = 0.78;

    @property({ type: CCFloat, tooltip: '像素格数量，默认 32 即 32x32。' })
    pixelCount = 32;

    private _material: Material = null;
    private _sprite: Sprite = null;
    private _effectAsset: EffectAsset = null;
    private _lastState = '';
    private readonly _params = new Vec4();
    private _carrierTexture: Texture2D = null;
    private _carrierSpriteFrame: SpriteFrame = null;
    private _isLoadingDefaultEffect = false;
    private _isLoadingDefaultPalette = false;

    onLoad(): void {
        this.loadDefaultEffect();
        this.loadDefaultPalette();
        this.applyMaterial();
    }

    onEnable(): void {
        this.loadDefaultEffect();
        this.loadDefaultPalette();
        this.applyMaterial();
    }

    onValidate(): void {
        this.invalidateMaterial();
    }

    update(): void {
        const sprite = this.targetSprite || this.getComponent(Sprite);
        if (!sprite) {
            return;
        }

        this.loadDefaultEffect();
        this.loadDefaultPalette();

        if (!this.effectAsset) {
            return;
        }

        const state = this.getMaterialState(sprite);
        if (state === this._lastState) {
            return;
        }

        this.applyMaterial();
    }

    applyMaterial(): void {
        const sprite = this.targetSprite || this.getComponent(Sprite);
        if (!sprite || !this.effectAsset) {
            return;
        }

        this.ensureSpriteCarrier(sprite);
        this.loadDefaultPalette();

        if (!this._material || this._effectAsset !== this.effectAsset || this._sprite !== sprite) {
            this._material = new Material();
            this._material.initialize({ effectAsset: this.effectAsset });
            sprite.customMaterial = this._material;
            this._sprite = sprite;
            this._effectAsset = this.effectAsset;
        }

        if (this.paletteTexture) {
            this._material.setProperty('paletteTex', this.paletteTexture);
        }

        this._params.set(
            this.seed,
            this.hueBias,
            this.paletteRadius,
            Math.max(1, this.pixelCount),
        );

        this._material.setProperty('outlineColor', this.outlineColor);
        this._material.setProperty('eyeColor', this.eyeColor);
        this._material.setProperty('params', this._params);
        sprite.customMaterial = this._material;
        sprite.markForUpdateRenderData();
        this._lastState = this.getMaterialState(sprite);
    }

    private invalidateMaterial(): void {
        this._lastState = '';
        if (this.isValid) {
            this.applyMaterial();
        }
    }

    private ensureSpriteCarrier(sprite: Sprite): void {
        if (!this._carrierTexture) {
            this._carrierTexture = new Texture2D();
            (this._carrierTexture as any).reset({
                width: 32,
                height: 32,
            });
        }

        if (!this._carrierSpriteFrame) {
            this._carrierSpriteFrame = new SpriteFrame();
            this._carrierSpriteFrame.texture = this._carrierTexture;
        }

        if (sprite.spriteFrame !== this._carrierSpriteFrame) {
            sprite.spriteFrame = this._carrierSpriteFrame;
        }

        const transform = sprite.getComponent(UITransform);
        if (transform && (transform.width <= 0 || transform.height <= 0)) {
            transform.setContentSize(32, 32);
        }
    }

    private loadDefaultEffect(): void {
        if (this.effectAsset || this._isLoadingDefaultEffect) {
            return;
        }

        this._isLoadingDefaultEffect = true;
        resources.load('effects/pixel-monster', EffectAsset, (err, effectAsset) => {
            this._isLoadingDefaultEffect = false;
            if (err || !effectAsset || this.effectAsset) {
                return;
            }

            this.effectAsset = effectAsset;
            this.invalidateMaterial();
        });
    }

    private loadDefaultPalette(): void {
        if (this.paletteTexture || this._isLoadingDefaultPalette) {
            return;
        }

        this._isLoadingDefaultPalette = true;
        resources.load('palettes/monster_palette/texture', Texture2D, (err, texture) => {
            this._isLoadingDefaultPalette = false;
            if (err || !texture || this.paletteTexture) {
                return;
            }

            this.paletteTexture = texture;
            this.invalidateMaterial();
        });
    }

    private getMaterialState(sprite: Sprite): string {
        return [
            sprite.uuid,
            sprite.spriteFrame?.uuid ?? '',
            this.effectAsset?.uuid ?? '',
            this.paletteTexture?.uuid ?? '',
            this.outlineColor.r,
            this.outlineColor.g,
            this.outlineColor.b,
            this.outlineColor.a,
            this.eyeColor.r,
            this.eyeColor.g,
            this.eyeColor.b,
            this.eyeColor.a,
            this.seed,
            this.hueBias,
            this.paletteRadius,
            this.pixelCount,
        ].join('|');
    }
}
