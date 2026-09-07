from io import StringIO
from pathlib import Path
from typing import Final

import pytest

from publishers.classic import ClassicThemePublisher
from publishers.default import DefaultThemePublisher


PROJECT_ROOT: Final = Path(__file__).resolve().parents[2]


@pytest.mark.parametrize("publisher_type", [DefaultThemePublisher, ClassicThemePublisher])
@pytest.mark.parametrize("portable", [False, True])
def test_mobile_gaming_article_keeps_all_figures_and_image_dependencies(
    publisher_type: type[DefaultThemePublisher] | type[ClassicThemePublisher],
    portable: bool,
    tmp_path: Path,
) -> None:
    source = (PROJECT_ROOT / "articles" / "mobile-gaming-in-2026.md").read_text(
        encoding="utf-8",
    )
    captions = [
        line.removeprefix("- [ ] ") for line in source.splitlines()
        if line.startswith("- [ ] Figure ")
    ]
    image_paths = [
        line.rsplit("](images/", 1)[1].removesuffix(")")
        for line in source.splitlines() if line.startswith("- [ ] [![]")
    ]
    with StringIO("{{Content}}") as template, StringIO(source) as markdown:
        publisher = publisher_type(template, markdown, "mobile-gaming-in-2026")
        if portable:
            _, html, images = publisher.render_portable_article()
        else:
            output = tmp_path / "article.html"
            publisher.publish(str(output))
            html = output.read_text(encoding="utf-8")
            images = tuple(publisher.images)

    assert len(captions) == 8
    assert html.count("<figure>") == len(captions)
    assert images == tuple(f"articles/images/{path}" for path in image_paths)
    for caption, image_path in zip(captions, image_paths, strict=True):
        assert f"<figcaption>{caption}</figcaption>" in html
        assert f'src="images/{image_path}"' in html
        assert f'href="images/{image_path}"' in html
    assert [html.index(caption) for caption in captions] == sorted(
        html.index(caption) for caption in captions
    )
