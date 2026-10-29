# Generates site/src/themes.css: original, slightly pixel-style biome patterns (one per PC box).
from urllib.parse import quote
import sys
U = 4  # pixel size
def R(x, y, w, h, c): return f"<rect x='{x*U}' y='{y*U}' width='{w*U}' height='{h*U}' fill='{c}'/>"
def svg(bg, body, size=24):
    s = f"<svg xmlns='http://www.w3.org/2000/svg' width='{size*U}' height='{size*U}' viewBox='0 0 {size*U} {size*U}' shape-rendering='crispEdges'><rect width='100%' height='100%' fill='{bg}'/>{body}</svg>"
    return "url(\"data:image/svg+xml," + quote(s, safe="/:=' ") + "\")"
def stairs(cx, top, rows, c, step=1):  # stepped triangle centred on cx
    return "".join(R(cx - (i*step), top + i, 2*i*step + 1, 1, c) for i in range(rows))

def forest(p):   # pines, a round tree, grass
    b = stairs(5, 1, 6, p[0]) + R(4, 7, 2, 2, p[2]) + stairs(17, 11, 5, p[0]) + R(16, 16, 2, 2, p[2])
    b += R(12, 3, 4, 3, p[1]) + R(11, 4, 6, 1, p[1]) + R(13, 6, 2, 2, p[2])
    b += R(2, 19, 1, 2, p[1]) + R(3, 20, 1, 1, p[1]) + R(8, 21, 1, 2, p[1]) + R(21, 4, 1, 2, p[1]) + R(10, 14, 1, 1, p[3]) + R(22, 21, 1, 1, p[3])
    return b
def city(p):     # buildings with windows
    b = R(1, 10, 5, 14, p[0]) + R(7, 6, 4, 18, p[1]) + R(12, 13, 6, 11, p[0]) + R(19, 8, 4, 16, p[1])
    for (x0, y0, w, h) in [(1, 10, 5, 14), (7, 6, 4, 18), (12, 13, 6, 11), (19, 8, 4, 16)]:
        for yy in range(y0 + 1, y0 + h - 1, 3):
            for xx in range(x0 + 1, x0 + w - 1, 2): b += R(xx, yy, 1, 1, p[3])
    b += R(3, 2, 1, 1, p[2]) + R(15, 4, 1, 1, p[2]) + R(22, 3, 1, 1, p[2])
    return b
def desert(p):   # dunes, cactus, sun specks
    b = R(0, 18, 24, 6, p[0]) + R(3, 16, 9, 2, p[0]) + R(5, 15, 5, 1, p[0]) + R(14, 17, 8, 1, p[0])
    b += R(17, 7, 2, 10, p[1]) + R(15, 9, 1, 3, p[1]) + R(15, 11, 2, 1, p[1]) + R(20, 8, 1, 3, p[1]) + R(19, 10, 2, 1, p[1])
    b += R(4, 4, 3, 3, p[2]) + R(10, 9, 1, 1, p[3]) + R(1, 12, 1, 1, p[3]) + R(22, 2, 1, 1, p[3])
    return b
def savanna(p):  # flat-top trees, tall grass
    b = R(3, 5, 9, 2, p[0]) + R(5, 4, 5, 1, p[0]) + R(7, 7, 1, 6, p[2]) + R(14, 14, 7, 2, p[0]) + R(16, 13, 3, 1, p[0]) + R(17, 16, 1, 5, p[2])
    for x in (1, 3, 10, 12, 21, 23): b += R(x, 21, 1, 3, p[1])
    b += R(20, 3, 1, 1, p[3]) + R(2, 15, 1, 1, p[3])
    return b
def volcano(p):  # stepped mountain with lava, embers
    b = stairs(12, 8, 13, p[0]) + R(10, 8, 5, 2, p[1]) + R(11, 10, 1, 3, p[1]) + R(13, 11, 1, 4, p[1])
    b += R(3, 3, 1, 1, p[2]) + R(19, 2, 1, 1, p[2]) + R(6, 6, 1, 1, p[3]) + R(17, 5, 1, 1, p[3]) + R(22, 9, 1, 1, p[2])
    return b
def snow(p):     # snowflakes (plus signs), drifts
    b = ""
    for (x, y) in [(3, 3), (14, 6), (20, 13), (7, 14), (16, 1)]:
        b += R(x, y - 1, 1, 3, p[1]) + R(x - 1, y, 3, 1, p[1])
    b += R(0, 21, 24, 3, p[0]) + R(2, 20, 7, 1, p[0]) + R(13, 19, 8, 2, p[0]) + R(11, 9, 1, 1, p[3]) + R(22, 4, 1, 1, p[3])
    return b
def cave(p):     # rocks, crystals, drips
    b = R(1, 19, 7, 5, p[0]) + R(2, 17, 5, 2, p[0]) + R(14, 20, 9, 4, p[0]) + R(16, 18, 5, 2, p[0])
    b += R(10, 6, 2, 5, p[1]) + R(9, 8, 1, 3, p[1]) + R(12, 9, 1, 2, p[1]) + R(19, 4, 1, 3, p[1]) + R(20, 5, 1, 2, p[1])
    b += R(4, 0, 1, 3, p[2]) + R(15, 0, 1, 2, p[2]) + R(6, 9, 1, 1, p[3]) + R(22, 13, 1, 1, p[3])
    return b
def seafloor(p): # seaweed, rocks, bubbles
    b = R(0, 22, 24, 2, p[0]) + R(3, 20, 5, 2, p[0]) + R(16, 21, 6, 1, p[0])
    for (x, h) in [(10, 9), (12, 6), (20, 8)]:
        for i in range(h): b += R(x + (i % 2), 21 - i, 1, 1, p[1])
    b += R(5, 6, 1, 1, p[2]) + R(6, 3, 2, 2, p[2]) + R(17, 10, 1, 1, p[2]) + R(18, 7, 2, 2, p[2]) + R(2, 13, 1, 1, p[3])
    return b
def sky(p):      # pixel clouds, birds
    b = R(2, 4, 8, 2, p[0]) + R(4, 3, 4, 1, p[0]) + R(13, 14, 9, 2, p[0]) + R(15, 13, 4, 1, p[0]) + R(1, 20, 6, 1, p[0])
    b += R(16, 4, 1, 1, p[1]) + R(17, 5, 1, 1, p[1]) + R(18, 4, 1, 1, p[1]) + R(7, 11, 1, 1, p[1]) + R(8, 12, 1, 1, p[1]) + R(9, 11, 1, 1, p[1])
    b += R(22, 22, 1, 1, p[3]) + R(11, 22, 1, 1, p[3])
    return b

# name: (draw, light: bg, shapes[4], head, edge), (dark: ...)
B = {
 "forest":   (forest,   ("#d7eccb", ["#b5daa1", "#a5cf92", "#c2ac86", "#eef6d6"], "#6fb357", "#4f8f3c"), ("#17281c", ["#25472d", "#2b5233", "#3b3326", "#3a5d3a"], "#2e5a30", "#3d6b3a")),
 "city":     (city,     ("#dfe4ee", ["#c7cfdf", "#bcc5d8", "#ffffff", "#f3e7a8"], "#6f86b8", "#4f6699"), ("#1a1e2b", ["#262c3f", "#2c3349", "#3a4260", "#59522a"], "#33406a", "#46558a")),
 "desert":   (desert,   ("#f4e3bd", ["#ecd3a0", "#9cc07a", "#fff1c9", "#e2c48a"], "#d39a4c", "#b07a33"), ("#2a2216", ["#3a2f1d", "#334a2a", "#4a3d22", "#4a3a20"], "#7a5527", "#8f6630")),
 "savanna":  (savanna,  ("#f1e6b2", ["#c9cf7f", "#dcc779", "#9b7d4f", "#fff6cf"], "#b9a23d", "#93802a"), ("#24220f", ["#383a1d", "#3b3519", "#4a3c25", "#4b4524"], "#5f5520", "#7a6c27")),
 "volcano":  (volcano,  ("#f3d6c8", ["#d9a99a", "#f08a4b", "#e8604a", "#ffd27a"], "#c4553d", "#9c3b28"), ("#2a1714", ["#3f2420", "#7a3420", "#8a2e22", "#6a4a1c"], "#6e2a1e", "#8f3a28")),
 "snow":     (snow,     ("#e6f1f8", ["#ffffff", "#c9dff0", "#ffffff", "#b6d3ea"], "#7fb0d6", "#5a8fbb"), ("#162330", ["#22374a", "#2c4660", "#22374a", "#34536f"], "#2f5272", "#406a90")),
 "cave":     (cave,     ("#e3ddd6", ["#cbc2b8", "#b9a4d8", "#a99c8f", "#f2e9a6"], "#8c7a6b", "#6b5b4e"), ("#1e1b1a", ["#2e2a28", "#3e3354", "#3a3431", "#4d4626"], "#4a4038", "#5e5248")),
 "seafloor": (seafloor, ("#cfe7f1", ["#b9d6c4", "#7fbf9a", "#eaf6fb", "#a9cfe0"], "#3f8fb5", "#2c7096"), ("#10212c", ["#1d3a36", "#245344", "#24485a", "#1d3846"], "#1f4f68", "#2b6585")),
 "sky":      (sky,      ("#dcecfb", ["#ffffff", "#9fb7cf", "#ffffff", "#bcd6f0"], "#6aa6dc", "#4a86bd"), ("#141f2d", ["#24344a", "#3b4f68", "#24344a", "#2a3d55"], "#2c4e75", "#3c6491")),
}
def mix(a, b, t):  # a toward b by t
    pa = [int(a[i:i+2], 16) for i in (1, 3, 5)]; pb = [int(b[i:i+2], 16) for i in (1, 3, 5)]
    return "#%02x%02x%02x" % tuple(round(x + (y - x) * t) for x, y in zip(pa, pb))
SOFT = 0.45  # shapes pulled toward the background: the page wallpaper stays subtle

def theme(name, draw, pal):
    bg, sh, head, edge = pal
    soft = [mix(c, bg, SOFT) for c in sh]
    return (f':root[data-theme="{name}"] {{ --page-color: {bg}; --page-pattern: {svg(bg, draw(soft))}; '
            f'--theme-head: {head}; --theme-edge: {edge}; }}\n')

out = ["/* Site themes (generated by site/scripts/biomes.py: edit there, then run python3 scripts/biomes.py src/themes.css).\n"
       "   A theme is a subtle wallpaper behind the whole page (original, slightly pixel-style patterns drawn for this site)\n"
       "   plus a colour for the header band and the result boxes. \"plain\" has none. */\n"]
for name, (draw, light, dark) in B.items():
    out.append(theme(name, draw, light))
out.append("@media (prefers-color-scheme: dark) {\n")
for name, (draw, light, dark) in B.items():
    out.append("  " + theme(name, draw, dark))
out.append("}\n")
out.append("""body { background-color: var(--page-color, var(--bg)); background-image: var(--page-pattern, none); }
header { border-top: 6px solid var(--theme-edge, transparent); }
/* result boxes: a light touch of the theme colour and a pixel-font title */
.gen { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; margin: 0 0 12px; }
.gen > summary { padding: 7px 12px; border-bottom: 1px solid var(--line); }
.gen > .row { padding: 0 12px; }
.gen > .row:last-child > summary { border-bottom: 0; }
.gen > summary .gen-title { font-family: "Pixelify Sans", ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: 0.04em; }
:root[data-theme]:not([data-theme="plain"]) .gen { border-color: color-mix(in srgb, var(--theme-edge) 40%, var(--line)); }
:root[data-theme]:not([data-theme="plain"]) .gen > summary { background: color-mix(in srgb, var(--theme-head) 13%, var(--card)); border-bottom-color: color-mix(in srgb, var(--theme-edge) 30%, var(--line)); }
.theme-pick { margin-left: auto; display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 0.85rem; padding: 0 4px; white-space: nowrap; }
.theme-pick select { width: auto; padding: 4px 8px; font-size: 0.85rem; }
@media (max-width: 600px) { nav { flex-wrap: wrap; } .theme-pick { order: -1; width: 100%; justify-content: flex-end; padding: 0 0 6px; } }
""")
open(sys.argv[1], "w").write("".join(out))
