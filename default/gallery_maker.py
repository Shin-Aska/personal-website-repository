import json
import re
from pathlib import Path

from PIL import Image, ImageOps


GALLERY_ROOT = Path("gallery")
THUMBNAIL_ROOT = GALLERY_ROOT / "_thumbs"
THUMBNAIL_SIZE = (320, 200)
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def natural_sort_key(s):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", s)]

def web_path(path):
    return path.as_posix()


def create_thumbnail(source, album):
    destination = THUMBNAIL_ROOT / album / f"{source.stem}.webp"
    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.exists() and destination.stat().st_mtime >= source.stat().st_mtime:
        return destination

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=78, method=6)

    return destination


def image_record(source, album):
    with Image.open(source) as image:
        width, height = image.size

    thumbnail = create_thumbnail(source, album)
    return {
        "name": source.name,
        "path": web_path(source),
        "thumbnail": web_path(thumbnail),
        "width": width,
        "height": height,
        "bytes": source.stat().st_size,
    }

if __name__ == "__main__":
    result = {}
    folders = sorted(
        (folder for folder in GALLERY_ROOT.iterdir() if folder.is_dir() and folder.name != "_thumbs"),
        key=lambda folder: natural_sort_key(folder.name),
    )

    for folder in folders:
        files = sorted(
            (
                file for file in folder.iterdir()
                if file.is_file() and file.suffix.lower() in SUPPORTED_EXTENSIONS
            ),
            key=lambda file: natural_sort_key(file.name),
        )
        result[folder.name] = {
            "path": web_path(folder),
            "files": [image_record(file, folder.name) for file in files],
        }

    Path("gallery.js").write_text(
        "var pictures = " + json.dumps(result, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
