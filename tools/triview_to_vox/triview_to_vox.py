"""
三视图转 MagicaVoxel .vox 文件工具
===================================

使用方法:
    python triview_to_vox.py --front front.png --right right.png --top top.png -o model.vox --size 32

参数说明:
    --front  正视图 (XY平面, 从Z正方向看)
    --right  右视图 (ZY平面, 从X正方向看)
    --top    顶视图 (XZ平面, 从Y正方向看)
    -o       输出 .vox 文件路径
    --size   体素模型的最大尺寸 (默认32, 最大256)
    --threshold  透明度阈值, alpha低于此值视为空白 (默认128)
    --color-source  上色参考视图: front/right/top (默认front)

原理:
    1. 将三张视图缩放到目标体素分辨率
    2. 对每个像素判断是否为"实体"(alpha > threshold)
    3. 三个视图投影取交集 -> 只有三个方向都判定为实体的位置才放置体素
    4. 从指定视图提取颜色信息
    5. 写入 MagicaVoxel .vox 格式文件
"""

import struct
import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("错误: 需要安装 Pillow 库")
    print("请运行: pip install Pillow")
    sys.exit(1)


# ============================================================
# .vox 文件写入器 (MagicaVoxel 150 格式)
# ============================================================

class VoxWriter:
    """最小化的 MagicaVoxel .vox 文件写入器"""

    def __init__(self):
        self.voxels = []      # [(x, y, z, color_index), ...]
        self.palette = []     # [(r, g, b, a), ...] 最多255色
        self.size = (0, 0, 0)

    def set_size(self, sx, sy, sz):
        self.size = (sx, sy, sz)

    def add_voxel(self, x, y, z, color_index):
        """添加一个体素, color_index 从1开始 (0是空)"""
        self.voxels.append((x, y, z, color_index))

    def set_palette(self, colors):
        """设置调色板, colors 是 [(r,g,b,a), ...] 列表, 最多255个"""
        self.palette = colors[:255]

    def _pack_chunk(self, chunk_id: bytes, content: bytes, children: bytes = b""):
        """打包一个 chunk"""
        return chunk_id + struct.pack("<II", len(content), len(children)) + content + children

    def write(self, filepath):
        """写入 .vox 文件"""
        # SIZE chunk
        sx, sy, sz = self.size
        size_content = struct.pack("<III", sx, sy, sz)
        size_chunk = self._pack_chunk(b"SIZE", size_content)

        # XYZI chunk
        xyzi_content = struct.pack("<I", len(self.voxels))
        for x, y, z, ci in self.voxels:
            xyzi_content += struct.pack("<BBBB", x, y, z, ci)
        xyzi_chunk = self._pack_chunk(b"XYZI", xyzi_content)

        # RGBA chunk (调色板)
        rgba_content = b""
        for i in range(256):
            if i < len(self.palette):
                r, g, b, a = self.palette[i]
                rgba_content += struct.pack("<BBBB", r, g, b, a)
            else:
                rgba_content += struct.pack("<BBBB", 0, 0, 0, 255)
        rgba_chunk = self._pack_chunk(b"RGBA", rgba_content)

        # MAIN chunk
        children = size_chunk + xyzi_chunk + rgba_chunk
        main_chunk = self._pack_chunk(b"MAIN", b"", children)

        # 写文件
        with open(filepath, "wb") as f:
            f.write(b"VOX ")                        # magic
            f.write(struct.pack("<I", 150))          # version
            f.write(main_chunk)


# ============================================================
# 图像处理
# ============================================================

def load_and_resize(image_path, width, height, threshold=128):
    """
    加载图片并缩放到指定尺寸, 返回:
    - mask: 2D bool 列表, True 表示实体
    - colors: 2D (r,g,b) 列表
    """
    img = Image.open(image_path).convert("RGBA")
    img = img.resize((width, height), Image.NEAREST)

    mask = []
    colors = []
    for y in range(height):
        mask_row = []
        color_row = []
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            mask_row.append(a >= threshold)
            color_row.append((r, g, b))
        mask.append(mask_row)
        colors.append(color_row)

    return mask, colors


def build_voxels(front_mask, right_mask, top_mask, size_x, size_y, size_z):
    """
    三视图投影取交集, 生成体素位置列表

    坐标约定 (MagicaVoxel):
        X: 右, Y: 前(深度), Z: 上

    视图映射:
        正视图 (front): 看向Y轴负方向, 图像 u->X, v->Z (v从上到下对应Z从高到低)
        右视图 (right): 看向X轴正方向, 图像 u->Y, v->Z
        顶视图 (top):   看向Z轴负方向, 图像 u->X, v->Y
    """
    voxel_positions = []

    for z in range(size_z):
        for y in range(size_y):
            for x in range(size_x):
                # 正视图: u=x, v=从上到下 -> v = size_z - 1 - z
                fv = size_z - 1 - z
                in_front = front_mask[fv][x] if fv < len(front_mask) and x < len(front_mask[0]) else False

                # 右视图: u=y, v=从上到下 -> v = size_z - 1 - z
                rv = size_z - 1 - z
                in_right = right_mask[rv][y] if rv < len(right_mask) and y < len(right_mask[0]) else False

                # 顶视图: u=x, v=y
                in_top = top_mask[y][x] if y < len(top_mask) and x < len(top_mask[0]) else False

                if in_front and in_right and in_top:
                    voxel_positions.append((x, y, z))

    return voxel_positions


def quantize_colors(color_list, max_colors=255):
    """
    简单的颜色量化: 将颜色列表映射到最多 max_colors 种颜色
    返回: (palette, index_map)
        palette: [(r,g,b), ...]
        index_map: {(r,g,b): palette_index}
    """
    # 先用简单的去重 + 截断方式
    # 对颜色做 4bit 量化以减少颜色数
    quantized_map = {}  # quantized_color -> [original_colors]

    for r, g, b in color_list:
        qr = (r >> 4) << 4
        qg = (g >> 4) << 4
        qb = (b >> 4) << 4
        key = (qr, qg, qb)
        if key not in quantized_map:
            quantized_map[key] = []
        quantized_map[key].append((r, g, b))

    # 取每组的平均色作为调色板颜色
    palette = []
    index_map = {}

    for qcolor, originals in quantized_map.items():
        if len(palette) >= max_colors:
            break
        avg_r = sum(c[0] for c in originals) // len(originals)
        avg_g = sum(c[1] for c in originals) // len(originals)
        avg_b = sum(c[2] for c in originals) // len(originals)
        avg_color = (avg_r, avg_g, avg_b)
        idx = len(palette)
        palette.append(avg_color)
        for c in originals:
            index_map[c] = idx

    return palette, index_map


def get_voxel_color(x, y, z, color_source, front_colors, right_colors, top_colors, size_z):
    """根据指定的颜色来源视图获取体素颜色"""
    if color_source == "front":
        fv = size_z - 1 - z
        if fv < len(front_colors) and x < len(front_colors[0]):
            return front_colors[fv][x]
    elif color_source == "right":
        rv = size_z - 1 - z
        if rv < len(right_colors) and y < len(right_colors[0]):
            return right_colors[rv][y]
    elif color_source == "top":
        if y < len(top_colors) and x < len(top_colors[0]):
            return top_colors[y][x]
    return (128, 128, 128)  # 默认灰色


# ============================================================
# 主流程
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="三视图转 MagicaVoxel .vox 文件",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python triview_to_vox.py --front front.png --right right.png --top top.png -o model.vox
  python triview_to_vox.py --front f.png --right r.png --top t.png -o out.vox --size 64 --color-source right
        """
    )
    parser.add_argument("--front", required=True, help="正视图图片路径")
    parser.add_argument("--right", required=True, help="右视图图片路径")
    parser.add_argument("--top", required=True, help="顶视图图片路径")
    parser.add_argument("-o", "--output", default="model.vox", help="输出 .vox 文件路径 (默认: model.vox)")
    parser.add_argument("--size", type=int, default=32, help="体素模型最大尺寸 (默认: 32, 最大: 256)")
    parser.add_argument("--threshold", type=int, default=128, help="透明度阈值 (默认: 128)")
    parser.add_argument("--color-source", choices=["front", "right", "top"], default="front",
                        help="上色参考视图 (默认: front)")

    args = parser.parse_args()

    # 校验
    size = min(args.size, 256)
    if size < 1:
        print("错误: size 必须大于 0")
        sys.exit(1)

    for path_str, name in [(args.front, "正视图"), (args.right, "右视图"), (args.top, "顶视图")]:
        if not Path(path_str).exists():
            print(f"错误: {name}文件不存在 -> {path_str}")
            sys.exit(1)

    print(f"配置: 体素尺寸={size}, 阈值={args.threshold}, 上色来源={args.color_source}")

    # 加载三视图
    # 正视图: 宽=X, 高=Z
    # 右视图: 宽=Y, 高=Z
    # 顶视图: 宽=X, 高=Y
    # 这里统一用 size x size, 实际可以根据图片比例分别计算
    print("加载正视图...")
    front_img = Image.open(args.front).convert("RGBA")
    print("加载右视图...")
    right_img = Image.open(args.right).convert("RGBA")
    print("加载顶视图...")
    top_img = Image.open(args.top).convert("RGBA")

    # 根据图片宽高比计算各轴尺寸
    # 正视图给出 X:Z 比例, 右视图给出 Y:Z 比例, 顶视图给出 X:Y 比例
    # 以正视图为基准
    fw, fh = front_img.size  # X, Z
    rw, rh = right_img.size  # Y, Z
    tw, th = top_img.size    # X, Y

    # 用最大尺寸归一化
    max_dim = max(fw, fh, rw, rh, tw, th)
    scale = size / max_dim

    size_x = max(1, round(fw * scale))
    size_z = max(1, round(fh * scale))
    size_y = max(1, round(rw * scale))

    # 确保不超过256
    size_x = min(size_x, 256)
    size_y = min(size_y, 256)
    size_z = min(size_z, 256)

    print(f"体素空间: X={size_x}, Y={size_y}, Z={size_z}")

    # 缩放并提取 mask 和颜色
    print("处理正视图...")
    front_mask, front_colors = load_and_resize(args.front, size_x, size_z, args.threshold)
    print("处理右视图...")
    right_mask, right_colors = load_and_resize(args.right, size_y, size_z, args.threshold)
    print("处理顶视图...")
    top_mask, top_colors = load_and_resize(args.top, size_x, size_y, args.threshold)

    # 投影交集
    print("计算投影交集...")
    voxel_positions = build_voxels(front_mask, right_mask, top_mask, size_x, size_y, size_z)
    print(f"生成体素数量: {len(voxel_positions)}")

    if len(voxel_positions) == 0:
        print("警告: 没有生成任何体素! 请检查:")
        print("  1. 图片是否有透明通道 (alpha)")
        print("  2. 如果是纯白/纯黑背景无透明度, 请用图片编辑器将背景设为透明")
        print("  3. 尝试降低 --threshold 值")
        sys.exit(1)

    # 提取颜色
    print("提取颜色信息...")
    all_colors = []
    for x, y, z in voxel_positions:
        c = get_voxel_color(x, y, z, args.color_source, front_colors, right_colors, top_colors, size_z)
        all_colors.append(c)

    # 量化颜色
    palette, index_map = quantize_colors(all_colors, max_colors=255)
    print(f"调色板颜色数: {len(palette)}")

    # 构建 .vox
    print("写入 .vox 文件...")
    writer = VoxWriter()
    writer.set_size(size_x, size_y, size_z)

    # 设置调色板 (RGBA)
    vox_palette = [(r, g, b, 255) for r, g, b in palette]
    writer.set_palette(vox_palette)

    # 添加体素
    for i, (x, y, z) in enumerate(voxel_positions):
        color = all_colors[i]
        ci = index_map.get(color, 0) + 1  # .vox 调色板索引从1开始
        if ci > 255:
            ci = 255
        writer.add_voxel(x, y, z, ci)

    writer.write(args.output)
    print(f"完成! 输出文件: {args.output}")
    print(f"请用 MagicaVoxel 打开查看, 然后手动微调细节。")


if __name__ == "__main__":
    main()
