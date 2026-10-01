#!/usr/bin/env python3
"""Build offline Sage pages using only Python's standard library."""
from pathlib import Path
import base64
import re
import json
import colorsys

ROOT = Path(__file__).resolve().parent
BLOCKS = {
    "{{WORLD_PILOT_STYLES}}": "src/styles.css",
    "{{WORLD_PILOT_BUSINESS_DATA}}": "src/data/business.json",
    "{{WORLD_PILOT_ENGLISH_DATA}}": "src/data/en.json",
    "{{WORLD_PILOT_APP}}": "src/app.js",
}
ASSETS = {
    "dsh-reference.jpg": "image/jpeg",
    "earth-texture.png": "image/png",
}
PAGES = {
    "pricing": ("价格", "pricing"),
    "enterprise": ("企业服务", "info"),
    "docs": ("文档", "info"),
    "download": ("下载", "info"),
    "trial": ("免费体验", "flow"),
    "auth": ("登录与注册", "flow"),
    "profile": ("个人信息 · 演示", "flow"),
}

FOOTER = '''<footer class="sage-footer" data-i18n-skip><span>Sage · AI Native Business Operations</span><nav aria-label="页脚导航"><a href="docs.html" data-zh="文档" data-en="Docs">文档</a><a href="enterprise.html" data-zh="企业服务" data-en="Enterprise">企业服务</a><a href="index.html#trust" data-zh="安全与信任" data-en="Trust">安全与信任</a></nav></footer>'''

def read_text(relative_path):
    return (ROOT / relative_path).read_bytes().decode("utf-8")

def build():
    html = read_text("src/index.template.html")
    shared_header = read_text("src/header.html")
    html = html.replace("{{SAGE_HEADER}}", shared_header)
    html = html.replace("{{SAGE_SHOWCASE}}", read_text("src/showcase.html"))
    html = html.replace("{{SAGE_FOOTER}}", FOOTER)
    shared_styles = read_text("src/design-system.css")
    html = html.replace("{{SAGE_STYLES}}", read_text("src/site.css") + "\n" + read_text("src/showcase.css") + "\n" + shared_styles)
    html = html.replace("{{SAGE_SCRIPT}}", read_text("src/site.js") + "\n" + read_text("src/showcase.js"))
    for token, relative_path in BLOCKS.items():
        if html.count(token) != 1:
            raise ValueError(f"Expected exactly one {token} in the template")
        html = html.replace(token, read_text(relative_path))
    for filename, mime_type in ASSETS.items():
        token = "{{WORLD_PILOT_ASSET:" + filename + "}}"
        if html.count(token) != 1:
            raise ValueError(f"Expected exactly one asset reference: {filename}")
        encoded = base64.b64encode((ROOT / "assets" / filename).read_bytes()).decode("ascii")
        html = html.replace(token, f"data:{mime_type};base64,{encoded}")
    if "{{WORLD_PILOT_" in html or "{{SAGE_" in html:
        raise ValueError("An unresolved build placeholder remains")
    destination = ROOT / "index.html"
    destination.write_bytes(html.encode("utf-8"))
    print(f"Built {destination.name} ({destination.stat().st_size:,} bytes)")
    # Isolated, light-only palette proof. Keep the real homepage and Earth code unchanged.
    green = html.replace('</head>', '<style>' + read_text("src/green-preview.css") + '</style></head>')
    green = green.replace('class="v1" data-theme="light"', 'class="v1 green-preview" data-theme="light"', 1)
    green = green.replace("worldpilot-v1-appearance", "sage-green-preview-appearance")
    green = green.replace("mode = mode === 'light' ? 'light' : 'dark';", "mode = 'light';")
    green = green.replace('</main>', '<aside class="green-review-note" data-i18n-skip><span class="green-swatch" aria-hidden="true"></span><span>截图取色 <strong>#13A339</strong> · 白底配色预览</span><a href="index.html">对比原版 ↗</a><small>仅本页换色；地球与文案保留，其他页面仍为现有版本。</small></aside></main>', 1)
    (ROOT / "green-preview.html").write_text(green, encoding="utf-8")
    print("Built green-preview.html (isolated screenshot-green palette proof)")
    (ROOT / "design-review.html").write_text(read_text("src/design-review.template.html"), encoding="utf-8")
    print("Built design-review.html (five white-background palette candidates)")
    (ROOT / "visual-directions.html").write_text(read_text("src/visual-directions.template.html"), encoding="utf-8")
    print("Built visual-directions.html (three unapproved high-fidelity concepts)")
    header = re.sub(r'href="#(positioning|product-demo|workforce)"', r'href="index.html#\1"', shared_header)
    for page, (title, bundle) in PAGES.items():
        page_header = header.replace(f'href="{page}.html"', f'href="{page}.html" aria-current="page"')
        styles = read_text("src/site.css") + "\n" + read_text(f"src/{bundle}.css") + "\n" + shared_styles
        script = read_text("src/site.js")
        if bundle != "info":
            script += "\n" + read_text(f"src/{bundle}.js")
        page_html = f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sage · {title}</title><link rel="icon" type="image/png" href="assets/sage-spatial-logo.png"><style>{styles}</style></head><body class="sage-page v1 page-{page}" data-theme="light">{page_header}{read_text(f"src/pages/{page}.html")}{FOOTER}<script>{script}</script></body></html>'''
        output = ROOT / f"{page}.html"
        output.write_text(page_html, encoding="utf-8")
        print(f"Built {output.name} ({output.stat().st_size:,} bytes)")
    build_redesign()

def build_redesign():
    """Build only the current ten-page preview without rewriting historical sites."""
    destination = ROOT / "redesign"
    destination.mkdir(exist_ok=True)
    index = read_text("src/redesign/index.html")
    (destination / "index.html").write_text(index, encoding="utf-8")
    # A homepage-only color comparison derived from the same source and layout.
    blue_index = index.replace('href="redesign.css"', 'href="redesign-blue.css"').replace('<title>Sage ·', '<title>Sage 蓝色对比 ·')
    (destination / "index-blue.html").write_text(blue_index, encoding="utf-8")
    def blue_color(match):
        value = match.group(0)[1:]
        reference_colors = {"7254ce": "479afb", "6244bd": "2582ee", "e4d9fa": "96ccfb", "523a83": "173e69"}
        if value.lower() in reference_colors:
            return '#' + reference_colors[value.lower()]
        rgb = value[:6] if len(value) >= 6 else ''.join(c * 2 for c in value)
        h, l, s = colorsys.rgb_to_hls(*(int(rgb[i:i+2], 16) / 255 for i in (0, 2, 4)))
        if not (235 <= h * 360 <= 310 and s > .1):
            return match.group(0)
        channels = colorsys.hls_to_rgb(212 / 360, l, s)
        return '#' + ''.join(f'{round(c * 255):02x}' for c in channels) + (value[6:] if len(value) == 8 else '')
    blue_css = re.sub(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b', blue_color, read_text("src/redesign/redesign.css"))
    (destination / "redesign-blue.css").write_text(blue_css, encoding="utf-8")
    header = re.search(r'<a class="skip-link".*?</header>.*?</p>', index, re.S).group()
    footer = re.search(r'<footer class="r-footer".*?</dialog>', index, re.S).group()
    pages = {
        "product": ("产品方案", "catalog"),
        "team": ("AI 团队", "team-page"),
        "pricing": ("价格与权益", "info-pages"),
        "enterprise": ("企业服务", "info-pages"),
        "docs": ("文档", "info-pages"),
        "download": ("下载", "info-pages"),
        "trial": ("免费体验", "experience"),
        "auth": ("登录与注册", "experience"),
        "profile": ("个人账户", "experience"),
    }
    for page, (title, bundle) in pages.items():
        source = read_text(f"src/redesign/{page}.html")
        match = re.search(r'<main\b.*?</main>', source, re.S)
        if not match:
            raise ValueError(f"Missing main element in {page}")
        main = match.group()
        if bundle == "experience":
            public_header = header
        else:
            public_header = header.replace(f'href="{page}.html"', f'href="{page}.html" aria-current="page"')
        scripts = '<script src="site-shell.js"></script>'
        if bundle in ("catalog", "team-page"):
            scripts += '<script src="catalog-data.js"></script>'
        scripts += f'<script src="{bundle}.js"></script>'
        # Experience dialogs are deliberately outside main in the authored template.
        dialogs = "".join(re.findall(r'<dialog\b.*?</dialog>', source, re.S))
        if dialogs and dialogs in main:
            dialogs = ""
        content = f'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sage · {title}</title><link rel="icon" href="sage-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="redesign.css"><link rel="stylesheet" href="{bundle}.css"></head><body class="sage-redesign page-{page}">{public_header}{main}{dialogs}{footer}{scripts}</body></html>'
        (destination / f"{page}.html").write_text(content, encoding="utf-8")
    for name in ["redesign.css", "redesign.js", "globe-hero.css", "globe-hero.js", "site-shell.js", "sage-mark.svg",
                 "catalog.css", "catalog.js", "catalog-data.js", "info-pages.css",
                 "info-pages.js", "experience.css", "experience.js", "team-page.css", "team-page.js"]:
        (destination / name).write_text(read_text(f"src/redesign/{name}"), encoding="utf-8")
    print("Built redesign/ — 10 pages, shared shell, nine scenarios and full team.")

if __name__ == "__main__":
    import sys
    build_redesign() if "--redesign-only" in sys.argv else build()
