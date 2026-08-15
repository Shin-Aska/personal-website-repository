import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def test_dark_mode_keeps_png_pen_visible() -> None:
    # Given: the stylesheet used after sky.js replaces the SVG pen with a PNG.
    stylesheet = (PROJECT_ROOT / "default" / "css" / "site.css").read_text(
        encoding="utf-8",
    )

    # When: the browser evaluates the dark color-scheme rules.
    dark_pen_rule = re.search(
        r"@media \(prefers-color-scheme: dark\).*?"
        r"\.themepicture(?:\s*,[^{}]*)?\s*\{\s*"
        r"filter:\s*invert\(100%\);\s*\}",
        stylesheet,
        flags=re.DOTALL,
    )

    # Then: the black PNG is inverted so it remains visible on the dark header.
    assert dark_pen_rule is not None
