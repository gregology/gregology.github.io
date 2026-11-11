#!/usr/bin/env python3
"""Build the Office Assistant agents served from /agents/<Name>/.

Source data comes from the clippyjs project (https://github.com/pi0/clippyjs),
directory src/agents/<name>/ containing agent.ts, map.png and sounds-mp3.ts
(the checked-in agents were built from commit 748f199f0187f6f94ce395cdd55081f513476156).
Those files are parsed as data (never executed) and re-emitted as:

  agents/<Name>/agent.js       clippy.ready("<Name>", {...})        animation data
  agents/<Name>/map-core.webp  frames for Show/Hide/Wave/Greeting and short idles
  agents/<Name>/map-extra.webp every other frame, fetched lazily
  agents/<Name>/sounds-mp3.js  clippy.soundsReady("<Name>", {...})  base64 mp3s

Splitting the sprite lets the assistant appear after downloading a small core
sheet instead of the whole map. Frame images become [x, y, sheetIndex]. Sheets
are lossless WebP, which beat both Pillow's PNG and oxipng on these sprites.

Usage (requires Pillow):
  python3 _tools/clippy/build_agents.py <clippyjs>/src/agents agents
"""

import json
import math
import os
import re
import sys

from PIL import Image

AGENTS = {
    # output folder: source folder
    "Clippy": "clippy",
    "F1": "f1",
    "Genius": "genius",
    "Links": "links",
    "Rocky": "rocky",
}

CORE_ANIMATIONS = ["Show", "Hide", "RestPose", "Wave", "Greeting"]
MAX_CORE_IDLE_FRAMES = 50
SHEETS = ["map-core.webp", "map-extra.webp"]


class LiteralParser:
    """Parses the JSON-like subset of JavaScript used by the agent files:
    objects (identifier, number or string keys), arrays, double-quoted strings,
    numbers, true/false/null and trailing commas."""

    TOKEN = re.compile(
        r'\s*(?:(?P<punct>[{}\[\],:])|(?P<string>"(?:[^"\\]|\\.)*")'
        r"|(?P<number>-?\d+(?:\.\d+)?)|(?P<ident>[A-Za-z_$][A-Za-z0-9_$]*))"
    )

    def __init__(self, text):
        self.text = text
        self.pos = 0

    def parse(self):
        value = self._value()
        if self.text[self.pos:].strip() not in ("", ";"):
            raise ValueError("unexpected trailing content at %d" % self.pos)
        return value

    def _next(self):
        match = self.TOKEN.match(self.text, self.pos)
        if not match:
            raise ValueError("unexpected input at %d: %r" % (self.pos, self.text[self.pos:self.pos + 20]))
        self.pos = match.end()
        kind = match.lastgroup
        return kind, match.group(kind)

    def _peek(self):
        saved = self.pos
        token = self._next()
        self.pos = saved
        return token

    def _value(self):
        kind, tok = self._next()
        if kind == "punct" and tok == "{":
            return self._object()
        if kind == "punct" and tok == "[":
            return self._array()
        if kind == "string":
            return json.loads(tok)
        if kind == "number":
            return float(tok) if "." in tok else int(tok)
        if kind == "ident" and tok in ("true", "false", "null"):
            return {"true": True, "false": False, "null": None}[tok]
        raise ValueError("unexpected token %r" % tok)

    def _object(self):
        result = {}
        while True:
            kind, tok = self._next()
            if kind == "punct" and tok == "}":
                return result
            if kind == "string":
                key = json.loads(tok)
            elif kind in ("ident", "number"):
                key = tok
            else:
                raise ValueError("bad object key %r" % tok)
            if self._next() != ("punct", ":"):
                raise ValueError("expected ':' after %r" % key)
            result[key] = self._value()
            kind, tok = self._next()
            if tok == "}":
                return result
            if tok != ",":
                raise ValueError("expected ',' or '}' got %r" % tok)

    def _array(self):
        result = []
        while True:
            if self._peek() == ("punct", "]"):
                self._next()
                return result
            result.append(self._value())
            kind, tok = self._next()
            if tok == "]":
                return result
            if tok != ",":
                raise ValueError("expected ',' or ']' got %r" % tok)


def read_default_export(path):
    text = open(path, encoding="utf-8").read().strip()
    prefix = "export default"
    if not text.startswith(prefix):
        raise ValueError("%s does not start with %r" % (path, prefix))
    return LiteralParser(text[len(prefix):]).parse()


def core_animation_names(animations):
    names = [n for n in CORE_ANIMATIONS if n in animations]
    idles = sorted(
        (n for n in animations if n.startswith("Idle")),
        key=lambda n: len(animations[n]["frames"]),
    )
    short = [n for n in idles if len(animations[n]["frames"]) <= MAX_CORE_IDLE_FRAMES]
    return names + (short or idles[:1])


def cells_of(animation):
    for frame in animation["frames"]:
        for image in frame.get("images", []):
            yield tuple(image)


def build_sheet(source, cells, framesize):
    w, h = framesize
    cols = max(1, math.ceil(math.sqrt(len(cells) * h / w)))
    rows = math.ceil(len(cells) / cols)
    sheet = Image.new(source.mode, (cols * w, rows * h))
    if source.mode == "P":
        sheet.putpalette(source.getpalette())
        if "transparency" in source.info:
            # keep the transparent palette entry, or it turns into a solid colour in RGBA
            sheet.info["transparency"] = source.info["transparency"]
            sheet.paste(source.info["transparency"], (0, 0, sheet.width, sheet.height))
    positions = {}
    for i, (x, y) in enumerate(cells):
        dest = ((i % cols) * w, (i // cols) * h)
        sheet.paste(source.crop((x, y, x + w, y + h)), dest)
        positions[(x, y)] = dest
    return sheet, positions


def save_webp(image, path):
    image.convert("RGBA").save(path, lossless=True, quality=100, method=6)


def build_agent(name, src_dir, out_dir):
    data = read_default_export(os.path.join(src_dir, "agent.ts"))
    sounds = read_default_export(os.path.join(src_dir, "sounds-mp3.ts"))
    animations = data["animations"]
    framesize = data["framesize"]
    source = Image.open(os.path.join(src_dir, "map.png"))
    source.load()

    core_names = core_animation_names(animations)
    core_cells = sorted({c for n in core_names for c in cells_of(animations[n])})
    all_cells = sorted({c for a in animations.values() for c in cells_of(a)})
    core_set = set(core_cells)
    extra_cells = [c for c in all_cells if c not in core_set]

    os.makedirs(out_dir, exist_ok=True)
    lookup = {}
    for index, cells in enumerate((core_cells, extra_cells)):
        sheet, positions = build_sheet(source, cells, framesize)
        save_webp(sheet, os.path.join(out_dir, SHEETS[index]))
        for cell, (x, y) in positions.items():
            lookup[cell] = [x, y, index]

    for animation in animations.values():
        for frame in animation["frames"]:
            if "images" in frame:
                frame["images"] = [lookup[tuple(image)] for image in frame["images"]]

    output = {
        "overlayCount": data["overlayCount"],
        "framesize": framesize,
        "sheets": SHEETS,
        "sounds": data["sounds"],
        "animations": animations,
    }
    with open(os.path.join(out_dir, "agent.js"), "w", encoding="utf-8") as f:
        f.write("clippy.ready(%s, %s);\n" % (json.dumps(name), json.dumps(output, separators=(",", ":"))))

    for key, uri in sounds.items():
        if not re.fullmatch(r"data:audio/mpeg;base64,[A-Za-z0-9+/=]+", uri):
            raise ValueError("%s sound %s is not a base64 mp3 data URI" % (name, key))
    with open(os.path.join(out_dir, "sounds-mp3.js"), "w", encoding="utf-8") as f:
        f.write("clippy.soundsReady(%s, %s);\n" % (json.dumps(name), json.dumps(sounds, separators=(",", ":"))))

    sizes = {f: os.path.getsize(os.path.join(out_dir, f)) for f in SHEETS}
    print("%-7s core %3d cells %8d B | extra %3d cells %8d B | core anims: %s" % (
        name, len(core_cells), sizes[SHEETS[0]], len(extra_cells), sizes[SHEETS[1]], ", ".join(core_names)))


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src_root, out_root = sys.argv[1], sys.argv[2]
    for name, folder in AGENTS.items():
        build_agent(name, os.path.join(src_root, folder), os.path.join(out_root, name))


if __name__ == "__main__":
    main()
