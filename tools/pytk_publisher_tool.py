"""Simple Tkinter UI for publishing markdown articles using existing templates.

This tool wraps ``publisher.publish_article`` to render both default and classic
HTML variants and then triggers sitemap regeneration via
``tools.generate_sitemaps``. The user selects a markdown source and confirms the
resulting HTML file name; the tool writes outputs into ``default/`` and
``classic/`` folders automatically.
"""
from __future__ import annotations

import os
import sys
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from publisher import publish_article
from tools import generate_sitemaps
TEMPLATES_DIR = REPO_ROOT / "articles" / "templates"
DEFAULT_TEMPLATE = TEMPLATES_DIR / "default.html"
CLASSIC_TEMPLATE = TEMPLATES_DIR / "classic.html"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "default"
CLASSIC_OUTPUT_DIR = REPO_ROOT / "classic"


def ensure_environment() -> None:
    """Ensure required directories and template files exist before running."""
    missing_items: list[str] = []
    if not DEFAULT_TEMPLATE.exists():
        missing_items.append(str(DEFAULT_TEMPLATE))
    if not CLASSIC_TEMPLATE.exists():
        missing_items.append(str(CLASSIC_TEMPLATE))

    if missing_items:
        raise FileNotFoundError(
            "Missing template files: " + ", ".join(missing_items)
        )

    DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CLASSIC_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class PublisherApp:
    def __init__(self, master: tk.Tk) -> None:
        self.master = master
        master.title("Article Publisher")
        master.resizable(False, False)

        self.source_var = tk.StringVar()
        self.slug_var = tk.StringVar()

        # Layout: label + entry + choose button on first row
        choose_frame = tk.Frame(master, padx=20, pady=15)
        choose_frame.pack(fill="x")

        label = tk.Label(choose_frame, text="Choose File:", font=("Segoe UI", 12))
        label.grid(row=0, column=0, sticky="w")

        entry = tk.Entry(
            choose_frame,
            textvariable=self.source_var,
            width=40,
            font=("Segoe UI", 12),
        )
        entry.grid(row=0, column=1, padx=(10, 10), pady=5, sticky="we")

        browse_btn = tk.Button(
            choose_frame,
            text="Choose File",
            command=self.select_markdown_file,
            font=("Segoe UI", 11),
            bg="#4a9ff5",
            fg="white",
            activebackground="#1f7ae0",
            activeforeground="white",
            relief="ridge",
            padx=10,
            pady=5,
        )
        browse_btn.grid(row=0, column=2, pady=5)

        choose_frame.columnconfigure(1, weight=1)

        # Optional slug display for transparency
        slug_frame = tk.Frame(master, padx=20)
        slug_frame.pack(fill="x")
        slug_label = tk.Label(slug_frame, text="Output Name:", font=("Segoe UI", 11))
        slug_label.grid(row=0, column=0, sticky="w")
        slug_entry = tk.Entry(
            slug_frame,
            textvariable=self.slug_var,
            width=40,
            font=("Segoe UI", 11),
        )
        slug_entry.grid(row=0, column=1, padx=(10, 0), pady=5, sticky="we")
        slug_entry.bind("<FocusOut>", lambda _event: self.slug_var.set(self.slug_var.get().strip()))
        slug_frame.columnconfigure(1, weight=1)

        # Convert button styled broadly like provided mockup
        convert_btn = tk.Button(
            master,
            text="Convert",
            command=self.save_article,
            font=("Segoe UI", 14, "bold"),
            bg="#1f7ae0",
            fg="white",
            activebackground="#1660ac",
            activeforeground="white",
            relief="ridge",
            padx=30,
            pady=12,
        )
        convert_btn.pack(padx=40, pady=(15, 25), fill="x")

        self.status_var = tk.StringVar()
        status_label = tk.Label(
            master,
            textvariable=self.status_var,
            font=("Segoe UI", 10),
            fg="#555555",
            padx=20,
            pady=5,
        )
        status_label.pack(fill="x")

    def select_markdown_file(self) -> None:
        file_path = filedialog.askopenfilename(
            parent=self.master,
            title="Select Markdown File",
            initialdir=REPO_ROOT,
            filetypes=(
                ("Markdown files", "*.md"),
                ("Text files", "*.txt"),
                ("All files", "*.*"),
            ),
        )
        if not file_path:
            return

        self.source_var.set(file_path)
        slug = Path(file_path).stem
        self.slug_var.set(slug)
        self.status_var.set("")

    def save_article(self) -> None:
        markdown_path = self.source_var.get().strip()
        if not markdown_path:
            messagebox.showerror("Missing file", "Please choose a markdown file first.")
            return

        slug = self.slug_var.get().strip() or Path(markdown_path).stem
        if not slug:
            messagebox.showerror("Missing name", "Unable to determine output name.")
            return

        final_name = f"{slug}.html"
        default_output = DEFAULT_OUTPUT_DIR / final_name
        classic_output = CLASSIC_OUTPUT_DIR / final_name

        try:
            self.status_var.set("Publishing...")
            self.master.update_idletasks()

            publish_article(str(DEFAULT_TEMPLATE), markdown_path, str(default_output))
            publish_article(str(CLASSIC_TEMPLATE), markdown_path, str(classic_output))

            result = generate_sitemaps.main(["generate_sitemaps.py"])
            if result != 0:
                raise RuntimeError("Sitemap generation returned a non-zero status.")
        except FileNotFoundError as exc:
            messagebox.showerror("File error", str(exc))
            self.status_var.set("")
            return
        except Exception as exc:  # noqa: BLE001 - show any unexpected issue to the user
            messagebox.showerror("Error", f"Failed to publish article: {exc}")
            self.status_var.set("")
            return

        messagebox.showinfo(
            "Success",
            "Article saved to default/ and classic/ folders, and sitemaps updated.",
        )
        self.status_var.set(f"Saved: {default_output} and {classic_output}")


def main() -> None:
    ensure_environment()
    os.chdir(REPO_ROOT)

    root = tk.Tk()
    app = PublisherApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
