# Pixel Monster Shader

用于 Cocos Creator 3.8 的 32x32 程序化像素怪物 shader，主色从 `assets/subpackages/game/palettes/monster_palette.png` 这张色板图里采样。

## 使用方式

1. 在场景里创建一个带 `Sprite` 的节点。
2. 添加 `PixelMonsterSprite` 组件。
3. 可以不手动拖资源：组件会自动创建 32x32 SpriteFrame 载体，并从 `game` Bundle 的 `effects/pixel-monster`、`palettes/monster_palette/texture` 加载默认 shader 和色板。
4. 如果要换 shader 或色板，也可以手动将资源拖到 `effectAsset` / `paletteTexture` 覆盖默认值。
5. 调整参数：
   - `seed`：改变斑点和局部明暗。
   - `hueBias`：选择色环上的主色，范围建议 0-1。
   - `paletteRadius`：控制取色饱和度，越大越靠近色板外圈。
   - `pixelCount`：默认 32，对应 32x32 像素网格。

## 微信小游戏注意点

- shader 没有动态循环，也没有依赖 `textureSize`，适合 WebGL 1 兼容路径。
- 色板纹理 meta 已设置为 `nearest` 和 `clamp-to-edge`，避免取色被线性过滤混色。
- 如果要导出真实 32x32 图片素材，可以在编辑器中用该节点渲染到 `RenderTexture` 后保存为图片。
