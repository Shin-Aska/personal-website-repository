"""Tkinter UI for local, FTP, social-network, and WordPress publishing.

This tool wraps ``publisher.publish_article`` to render both default and classic
HTML variants and then triggers sitemap regeneration via
``tools.generate_sitemaps``. The user selects a markdown source and confirms the
resulting HTML file name; the tool writes outputs into ``default/`` and
``classic/`` folders automatically. An optional two-pass workflow uploads a
preview over FTP, creates Mastodon and Bluesky posts, regenerates the article
with those comment sources, and uploads the final document. All remote secrets
are session-only inputs.
"""
from __future__ import annotations

import os
import posixpath
import re
import sys
import tkinter as tk
import uuid
from dataclasses import dataclass
from pathlib import Path
from tkinter import filedialog, messagebox

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from publisher import publish_article, render_portable_article
from tools import generate_sitemaps
from tools.ftp_publisher import (
    FTPPublisher,
    join_remote_path,
    verify_public_preview,
)
from tools.social_publisher import (
    SOCIAL_POST_LIMIT,
    BlueskyClient,
    MastodonClient,
    build_public_urls,
    build_social_post,
    extract_article_description,
    inject_social_metadata,
    select_social_image,
)
from tools.wordpress_publisher import WordPressClient
TEMPLATES_DIR = REPO_ROOT / "articles" / "templates"
DEFAULT_TEMPLATE = TEMPLATES_DIR / "default.html"
CLASSIC_TEMPLATE = TEMPLATES_DIR / "classic.html"
DEFAULT_OUTPUT_DIR = REPO_ROOT / "default"
CLASSIC_OUTPUT_DIR = REPO_ROOT / "classic"
DEFAULT_WORDPRESS_SITE_URL = "https://wordpress.richardorilla.website"
DEFAULT_PUBLIC_ARTICLE_BASE_URL = "https://www.richardorilla.website/"
DEFAULT_MASTODON_INSTANCE = "mastodon.social"
DEFAULT_MASTODON_HANDLE = "@richardorilla"
DEFAULT_BLUESKY_SERVICE_URL = "https://bsky.social"
DEFAULT_BLUESKY_HANDLE = "www.richardorilla.website"

_PHP_STRING = r"""(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')"""
_MASTODON_BUNDLE_PATTERN = re.compile(
    rf"""mastodon_comment_bundle\s*\(\s*
        (?P<post_id>{_PHP_STRING})\s*,\s*
        (?P<instance>{_PHP_STRING})\s*,\s*
        (?P<user_handle>{_PHP_STRING})\s*
        \)""",
    re.VERBOSE,
)
_BLUESKY_BUNDLE_PATTERN = re.compile(
    rf"""bluesky_comment_bundle\s*\(\s*
        (?P<post_url>{_PHP_STRING})\s*
        \)""",
    re.VERBOSE,
)


@dataclass(frozen=True)
class SocialPostParameters:
    """Social-comment parameters recovered from a previously published page."""

    mastodon_post_id: str = ""
    mastodon_instance: str = ""
    mastodon_user_handle: str = ""
    bluesky_post_url: str = ""

    def has_values(self) -> bool:
        return any(
            (
                self.mastodon_post_id,
                self.mastodon_instance,
                self.mastodon_user_handle,
                self.bluesky_post_url,
            )
        )

    def with_missing_from(
        self, fallback: "SocialPostParameters"
    ) -> "SocialPostParameters":
        """Fill any missing fields from another published page."""
        return SocialPostParameters(
            mastodon_post_id=self.mastodon_post_id or fallback.mastodon_post_id,
            mastodon_instance=self.mastodon_instance or fallback.mastodon_instance,
            mastodon_user_handle=(
                self.mastodon_user_handle or fallback.mastodon_user_handle
            ),
            bluesky_post_url=self.bluesky_post_url or fallback.bluesky_post_url,
        )


def _unquote_php_string(value: str) -> str:
    """Decode the simple quoted PHP strings emitted by the publishers."""
    quote = value[0]
    inner = value[1:-1]
    return inner.replace(f"\\{quote}", quote).replace("\\\\", "\\")


def extract_social_parameters(html: str) -> SocialPostParameters:
    """Extract social-comment settings from generated article HTML."""
    # Use the last call because an article about the integration itself may
    # include an earlier bundle call as a displayed code example.
    mastodon_match = next(
        reversed(tuple(_MASTODON_BUNDLE_PATTERN.finditer(html))), None
    )
    bluesky_match = next(
        reversed(tuple(_BLUESKY_BUNDLE_PATTERN.finditer(html))), None
    )

    return SocialPostParameters(
        mastodon_post_id=(
            _unquote_php_string(mastodon_match.group("post_id"))
            if mastodon_match
            else ""
        ),
        mastodon_instance=(
            _unquote_php_string(mastodon_match.group("instance"))
            if mastodon_match
            else ""
        ),
        mastodon_user_handle=(
            _unquote_php_string(mastodon_match.group("user_handle"))
            if mastodon_match
            else ""
        ),
        bluesky_post_url=(
            _unquote_php_string(bluesky_match.group("post_url"))
            if bluesky_match
            else ""
        ),
    )


def load_published_social_parameters(
    slug: str,
    output_dirs: tuple[Path, ...] | None = None,
) -> tuple[SocialPostParameters, tuple[Path, ...]]:
    """Load settings from matching generated pages, preferring default output."""
    directories = output_dirs or (DEFAULT_OUTPUT_DIR, CLASSIC_OUTPUT_DIR)
    parameters = SocialPostParameters()
    sources: list[Path] = []

    for output_dir in directories:
        published_path = output_dir / f"{slug}.html"
        if not published_path.is_file():
            continue

        recovered = extract_social_parameters(
            published_path.read_text(encoding="utf-8")
        )
        if recovered.has_values():
            parameters = parameters.with_missing_from(recovered)
            sources.append(published_path)

    return parameters, tuple(sources)


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
        self.mastodon_post_id_var = tk.StringVar()
        self.mastodon_instance_var = tk.StringVar(
            value=DEFAULT_MASTODON_INSTANCE
        )
        self.mastodon_user_handle_var = tk.StringVar(
            value=DEFAULT_MASTODON_HANDLE
        )
        self.bluesky_post_url_var = tk.StringVar()
        self.social_automation_enabled_var = tk.BooleanVar(value=False)
        self.ftp_host_var = tk.StringVar()
        self.ftp_username_var = tk.StringVar()
        self.ftp_password_var = tk.StringVar()
        self.ftp_default_publishing_path_var = tk.StringVar()
        self.ftp_classic_publishing_path_var = tk.StringVar()
        self.public_article_base_url_var = tk.StringVar(
            value=DEFAULT_PUBLIC_ARTICLE_BASE_URL
        )
        self.mastodon_access_token_var = tk.StringVar()
        self.bluesky_service_url_var = tk.StringVar(
            value=DEFAULT_BLUESKY_SERVICE_URL
        )
        self.bluesky_handle_var = tk.StringVar(value=DEFAULT_BLUESKY_HANDLE)
        self.bluesky_password_var = tk.StringVar()
        self.social_message_var = tk.StringVar()
        self.social_character_count_var = tk.StringVar()
        self.wordpress_enabled_var = tk.BooleanVar(value=False)
        self.wordpress_site_url_var = tk.StringVar(
            value=DEFAULT_WORDPRESS_SITE_URL
        )
        self.wordpress_username_var = tk.StringVar()
        self.wordpress_password_var = tk.StringVar()
        self.wordpress_status_var = tk.StringVar(value="draft")
        self._publishing = False

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

        comments_frame = tk.Frame(master, padx=20)
        comments_frame.pack(fill="x", pady=(10, 0))

        comments_label = tk.Label(comments_frame, text="Mastodon Comments (Optional)", font=("Segoe UI", 11, "bold"))
        comments_label.grid(row=0, column=0, columnspan=2, sticky="w", pady=(0, 5))

        post_id_label = tk.Label(comments_frame, text="Post ID:", font=("Segoe UI", 10))
        post_id_label.grid(row=1, column=0, sticky="w")
        post_id_entry = tk.Entry(
            comments_frame,
            textvariable=self.mastodon_post_id_var,
            width=40,
            font=("Segoe UI", 10),
        )
        post_id_entry.grid(row=1, column=1, padx=(10, 0), pady=3, sticky="we")
        post_id_entry.bind(
            "<FocusOut>",
            lambda _event: self.mastodon_post_id_var.set(self.mastodon_post_id_var.get().strip()),
        )

        instance_label = tk.Label(comments_frame, text="Instance:", font=("Segoe UI", 10))
        instance_label.grid(row=2, column=0, sticky="w")
        instance_entry = tk.Entry(
            comments_frame,
            textvariable=self.mastodon_instance_var,
            width=40,
            font=("Segoe UI", 10),
        )
        instance_entry.grid(row=2, column=1, padx=(10, 0), pady=3, sticky="we")
        instance_entry.bind(
            "<FocusOut>",
            lambda _event: self.mastodon_instance_var.set(self.mastodon_instance_var.get().strip()),
        )

        handle_label = tk.Label(comments_frame, text="User Handle:", font=("Segoe UI", 10))
        handle_label.grid(row=3, column=0, sticky="w")
        handle_entry = tk.Entry(
            comments_frame,
            textvariable=self.mastodon_user_handle_var,
            width=40,
            font=("Segoe UI", 10),
        )
        handle_entry.grid(row=3, column=1, padx=(10, 0), pady=3, sticky="we")
        handle_entry.bind(
            "<FocusOut>",
            lambda _event: self.mastodon_user_handle_var.set(self.mastodon_user_handle_var.get().strip()),
        )

        bluesky_label = tk.Label(comments_frame, text="Bluesky Post URL:", font=("Segoe UI", 10))
        bluesky_label.grid(row=4, column=0, sticky="w")
        bluesky_entry = tk.Entry(
            comments_frame,
            textvariable=self.bluesky_post_url_var,
            width=40,
            font=("Segoe UI", 10),
        )
        bluesky_entry.grid(row=4, column=1, padx=(10, 0), pady=3, sticky="we")
        bluesky_entry.bind(
            "<FocusOut>",
            lambda _event: self.bluesky_post_url_var.set(self.bluesky_post_url_var.get().strip()),
        )

        comments_frame.columnconfigure(1, weight=1)

        social_frame = tk.LabelFrame(
            master,
            text="Automated FTP + Social Publishing (Optional)",
            font=("Segoe UI", 11, "bold"),
            padx=12,
            pady=8,
        )
        social_frame.pack(fill="x", padx=20, pady=(12, 0))

        social_checkbox = tk.Checkbutton(
            social_frame,
            text="Automate preview upload, social posts, and final upload",
            variable=self.social_automation_enabled_var,
            font=("Segoe UI", 10),
        )
        social_checkbox.grid(row=0, column=0, sticky="w")

        social_configure_button = tk.Button(
            social_frame,
            text="Configure FTP and Social Accounts",
            command=self.open_social_settings,
            font=("Segoe UI", 10),
        )
        social_configure_button.grid(
            row=0,
            column=1,
            sticky="e",
            padx=(15, 0),
        )
        social_frame.columnconfigure(1, weight=1)

        wordpress_frame = tk.LabelFrame(
            master,
            text="WordPress Publishing (Optional)",
            font=("Segoe UI", 11, "bold"),
            padx=12,
            pady=8,
        )
        wordpress_frame.pack(fill="x", padx=20, pady=(12, 0))

        wordpress_checkbox = tk.Checkbutton(
            wordpress_frame,
            text="Publish this article to WordPress",
            variable=self.wordpress_enabled_var,
            command=self._update_wordpress_controls,
            font=("Segoe UI", 10),
        )
        wordpress_checkbox.grid(
            row=0,
            column=0,
            columnspan=2,
            sticky="w",
            pady=(0, 5),
        )

        wordpress_site_label = tk.Label(
            wordpress_frame,
            text="Site URL:",
            font=("Segoe UI", 10),
        )
        wordpress_site_label.grid(row=1, column=0, sticky="w")
        wordpress_site_entry = tk.Entry(
            wordpress_frame,
            textvariable=self.wordpress_site_url_var,
            width=40,
            font=("Segoe UI", 10),
        )
        wordpress_site_entry.grid(
            row=1,
            column=1,
            padx=(10, 0),
            pady=3,
            sticky="we",
        )

        wordpress_username_label = tk.Label(
            wordpress_frame,
            text="Username:",
            font=("Segoe UI", 10),
        )
        wordpress_username_label.grid(row=2, column=0, sticky="w")
        wordpress_username_entry = tk.Entry(
            wordpress_frame,
            textvariable=self.wordpress_username_var,
            width=40,
            font=("Segoe UI", 10),
        )
        wordpress_username_entry.grid(
            row=2,
            column=1,
            padx=(10, 0),
            pady=3,
            sticky="we",
        )

        wordpress_password_label = tk.Label(
            wordpress_frame,
            text="Application Password:",
            font=("Segoe UI", 10),
        )
        wordpress_password_label.grid(row=3, column=0, sticky="w")
        wordpress_password_entry = tk.Entry(
            wordpress_frame,
            textvariable=self.wordpress_password_var,
            width=40,
            show="*",
            font=("Segoe UI", 10),
        )
        wordpress_password_entry.grid(
            row=3,
            column=1,
            padx=(10, 0),
            pady=3,
            sticky="we",
        )

        wordpress_status_label = tk.Label(
            wordpress_frame,
            text="Post Status:",
            font=("Segoe UI", 10),
        )
        wordpress_status_label.grid(row=4, column=0, sticky="w")
        wordpress_status_menu = tk.OptionMenu(
            wordpress_frame,
            self.wordpress_status_var,
            "draft",
            "publish",
        )
        wordpress_status_menu.config(font=("Segoe UI", 10), width=12)
        wordpress_status_menu.grid(
            row=4,
            column=1,
            padx=(10, 0),
            pady=3,
            sticky="w",
        )

        wordpress_frame.columnconfigure(1, weight=1)
        self.wordpress_controls = (
            wordpress_site_entry,
            wordpress_username_entry,
            wordpress_password_entry,
            wordpress_status_menu,
        )
        self._update_wordpress_controls()
        self.slug_var.trace_add("write", self._update_social_character_count)
        self.public_article_base_url_var.trace_add(
            "write", self._update_social_character_count
        )
        self.social_message_var.trace_add(
            "write", self._update_social_character_count
        )
        self._update_social_character_count()

        # Convert button styled broadly like provided mockup
        convert_btn = tk.Button(
            master,
            text="Publish Article",
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
        self.publish_button = convert_btn

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

    def _update_wordpress_controls(self) -> None:
        """Enable WordPress credentials only when remote publishing is selected."""
        state = "normal" if self.wordpress_enabled_var.get() else "disabled"
        for control in self.wordpress_controls:
            control.configure(state=state)

    def _current_article_url(self) -> str:
        slug = self.slug_var.get().strip()
        if not slug:
            source = self.source_var.get().strip()
            slug = Path(source).stem if source else "article"
        try:
            article_url, _image_url = build_public_urls(
                self.public_article_base_url_var.get(),
                slug,
                None,
            )
            return article_url
        except ValueError:
            return (
                self.public_article_base_url_var.get().strip().rstrip("/")
                + f"/{slug}.html"
            )

    def _update_social_character_count(self, *_args: object) -> None:
        article_url = self._current_article_url()
        message = self.social_message_var.get().strip()
        total = len(f"{message}\n\n{article_url}" if message else article_url)
        self.social_character_count_var.set(
            f"Social post: {total}/{SOCIAL_POST_LIMIT} characters"
        )

    @staticmethod
    def _dialog_entry(
        parent: tk.Widget,
        row: int,
        label: str,
        variable: tk.StringVar,
        *,
        masked: bool = False,
    ) -> tk.Entry:
        tk.Label(parent, text=label, font=("Segoe UI", 10)).grid(
            row=row,
            column=0,
            sticky="w",
            pady=3,
        )
        entry = tk.Entry(
            parent,
            textvariable=variable,
            width=48,
            show="*" if masked else "",
            font=("Segoe UI", 10),
        )
        entry.grid(row=row, column=1, sticky="we", padx=(12, 0), pady=3)
        return entry

    def open_social_settings(self) -> None:
        """Open session-only FTP and social-network settings."""
        dialog = tk.Toplevel(self.master)
        dialog.title("FTP and Social Publishing")
        dialog.resizable(False, False)
        dialog.transient(self.master)

        container = tk.Frame(dialog, padx=18, pady=14)
        container.pack(fill="both", expand=True)

        tk.Label(
            container,
            text="Plain FTP sends the username and password without encryption.",
            font=("Segoe UI", 10, "bold"),
            fg="#a00000",
        ).grid(row=0, column=0, columnspan=2, sticky="w", pady=(0, 8))

        self._dialog_entry(
            container, 1, "FTP Host:", self.ftp_host_var
        )
        self._dialog_entry(
            container, 2, "FTP Username:", self.ftp_username_var
        )
        self._dialog_entry(
            container,
            3,
            "FTP Password:",
            self.ftp_password_var,
            masked=True,
        )
        self._dialog_entry(
            container,
            4,
            "Default Path (blank = FTP root):",
            self.ftp_default_publishing_path_var,
        )
        tk.Button(
            container,
            text="Browse...",
            command=lambda: self.open_ftp_explorer(
                dialog,
                self.ftp_default_publishing_path_var,
                "Select Default Publishing Folder",
            ),
            font=("Segoe UI", 9),
        ).grid(row=4, column=2, padx=(8, 0))

        self._dialog_entry(
            container,
            5,
            "Classic Path (blank = FTP root):",
            self.ftp_classic_publishing_path_var,
        )
        tk.Button(
            container,
            text="Browse...",
            command=lambda: self.open_ftp_explorer(
                dialog,
                self.ftp_classic_publishing_path_var,
                "Select Classic Publishing Folder",
            ),
            font=("Segoe UI", 9),
        ).grid(row=5, column=2, padx=(8, 0))

        self._dialog_entry(
            container,
            6,
            "Public Article Base URL:",
            self.public_article_base_url_var,
        )

        tk.Label(
            container,
            text="Mastodon",
            font=("Segoe UI", 10, "bold"),
        ).grid(row=7, column=0, columnspan=2, sticky="w", pady=(10, 3))
        self._dialog_entry(
            container, 8, "Instance:", self.mastodon_instance_var
        )
        self._dialog_entry(
            container,
            9,
            "Access Token:",
            self.mastodon_access_token_var,
            masked=True,
        )

        tk.Label(
            container,
            text="Bluesky",
            font=("Segoe UI", 10, "bold"),
        ).grid(row=10, column=0, columnspan=2, sticky="w", pady=(10, 3))
        self._dialog_entry(
            container,
            11,
            "Service URL:",
            self.bluesky_service_url_var,
        )
        self._dialog_entry(
            container, 12, "Handle:", self.bluesky_handle_var
        )
        self._dialog_entry(
            container,
            13,
            "Application Password:",
            self.bluesky_password_var,
            masked=True,
        )

        tk.Label(
            container,
            text="Post text (the article URL is appended automatically):",
            font=("Segoe UI", 10),
        ).grid(row=14, column=0, columnspan=3, sticky="w", pady=(10, 3))
        message_text = tk.Text(
            container,
            width=64,
            height=5,
            wrap="word",
            font=("Segoe UI", 10),
        )
        message_text.grid(row=15, column=0, columnspan=3, sticky="we")
        message_text.insert("1.0", self.social_message_var.get())

        count_label = tk.Label(
            container,
            textvariable=self.social_character_count_var,
            font=("Segoe UI", 9),
            fg="#555555",
        )
        count_label.grid(row=16, column=0, sticky="w", pady=(3, 0))

        def store_message(_event: object | None = None) -> None:
            self.social_message_var.set(
                message_text.get("1.0", "end-1c").strip()
            )

        message_text.bind("<KeyRelease>", store_message)
        message_text.bind("<FocusOut>", store_message)

        close_button = tk.Button(
            container,
            text="Done",
            command=lambda: (store_message(), dialog.destroy()),
            font=("Segoe UI", 10, "bold"),
            padx=20,
        )
        close_button.grid(
            row=16,
            column=1,
            columnspan=2,
            sticky="e",
            pady=(8, 0),
        )
        container.columnconfigure(1, weight=1)
        dialog.protocol(
            "WM_DELETE_WINDOW",
            lambda: (store_message(), dialog.destroy()),
        )
        dialog.grab_set()
        message_text.focus_set()

    def open_ftp_explorer(
        self,
        parent: tk.Toplevel,
        target_variable: tk.StringVar,
        title: str,
    ) -> None:
        """Browse remote FTP folders using the credentials in the dialog."""
        try:
            publisher = FTPPublisher(
                self.ftp_host_var.get(),
                self.ftp_username_var.get(),
                self.ftp_password_var.get(),
            )
        except ValueError as exc:
            messagebox.showerror("FTP configuration", str(exc), parent=parent)
            return

        explorer = tk.Toplevel(parent)
        explorer.title(title)
        explorer.geometry("560x420")
        explorer.transient(parent)

        current_path_var = tk.StringVar()
        status_var = tk.StringVar(value="Connecting...")
        frame = tk.Frame(explorer, padx=12, pady=12)
        frame.pack(fill="both", expand=True)

        tk.Label(
            frame,
            textvariable=current_path_var,
            anchor="w",
            font=("Segoe UI", 10, "bold"),
        ).pack(fill="x", pady=(0, 6))

        list_frame = tk.Frame(frame)
        list_frame.pack(fill="both", expand=True)
        directory_list = tk.Listbox(
            list_frame,
            font=("Segoe UI", 10),
            activestyle="dotbox",
        )
        directory_list.pack(side="left", fill="both", expand=True)
        scrollbar = tk.Scrollbar(
            list_frame,
            orient="vertical",
            command=directory_list.yview,
        )
        scrollbar.pack(side="right", fill="y")
        directory_list.configure(yscrollcommand=scrollbar.set)

        tk.Label(
            frame,
            textvariable=status_var,
            anchor="w",
            fg="#555555",
            font=("Segoe UI", 9),
        ).pack(fill="x", pady=(5, 0))

        def refresh(path: str) -> None:
            status_var.set("Loading FTP folders...")
            explorer.update_idletasks()
            try:
                listing = publisher.list_directories(path)
            except Exception as exc:  # noqa: BLE001 - FTP UI boundary
                status_var.set("Could not load this folder.")
                messagebox.showerror(
                    "FTP Explorer",
                    str(exc),
                    parent=explorer,
                )
                return

            current_path_var.set(listing.current_path)
            directory_list.delete(0, "end")
            for directory in listing.directories:
                directory_list.insert("end", directory)
            status_var.set(
                f"{len(listing.directories)} subfolder(s); files are hidden."
            )

        def open_selected(_event: object | None = None) -> None:
            selection = directory_list.curselection()
            if not selection:
                return
            name = str(directory_list.get(selection[0]))
            refresh(posixpath.join(current_path_var.get(), name))

        def go_up() -> None:
            current_path = current_path_var.get() or "/"
            parent_path = posixpath.dirname(current_path.rstrip("/")) or "/"
            refresh(parent_path)

        def close_explorer() -> None:
            explorer.grab_release()
            explorer.destroy()
            if parent.winfo_exists():
                parent.grab_set()

        def select_current() -> None:
            target_variable.set(current_path_var.get())
            close_explorer()

        directory_list.bind("<Double-Button-1>", open_selected)
        directory_list.bind("<Return>", open_selected)

        buttons = tk.Frame(frame)
        buttons.pack(fill="x", pady=(8, 0))
        tk.Button(buttons, text="Up", command=go_up, width=9).pack(
            side="left"
        )
        tk.Button(
            buttons,
            text="Refresh",
            command=lambda: refresh(current_path_var.get()),
            width=9,
        ).pack(side="left", padx=(6, 0))
        tk.Button(
            buttons,
            text="Cancel",
            command=close_explorer,
            width=9,
        ).pack(side="right")
        tk.Button(
            buttons,
            text="Select This Folder",
            command=select_current,
            width=18,
        ).pack(side="right", padx=(0, 6))

        explorer.protocol("WM_DELETE_WINDOW", close_explorer)
        explorer.grab_set()
        refresh(target_variable.get())

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
        self.load_existing_social_parameters(slug)

    def load_existing_social_parameters(self, slug: str) -> None:
        """Populate social fields from the article's existing published output."""
        try:
            parameters, sources = load_published_social_parameters(slug)
        except OSError as exc:
            parameters = SocialPostParameters()
            sources = ()
            self.status_var.set(f"Could not read existing published page: {exc}")
        else:
            if sources:
                locations = ", ".join(
                    str(source.relative_to(REPO_ROOT)) for source in sources
                )
                self.status_var.set(f"Loaded social details from {locations}")
            else:
                self.status_var.set("No existing social details found for this article.")

        # Always replace the fields so values from a previously selected article
        # cannot accidentally be published with the newly selected one.
        self.mastodon_post_id_var.set(parameters.mastodon_post_id)
        self.mastodon_instance_var.set(
            parameters.mastodon_instance or DEFAULT_MASTODON_INSTANCE
        )
        self.mastodon_user_handle_var.set(
            parameters.mastodon_user_handle or DEFAULT_MASTODON_HANDLE
        )
        self.bluesky_post_url_var.set(parameters.bluesky_post_url)

    def _set_status(self, message: str) -> None:
        self.status_var.set(message)
        self.master.update_idletasks()

    @staticmethod
    def _publish_local_versions(
        markdown_path: str,
        default_output: Path,
        classic_output: Path,
        parameters: SocialPostParameters,
    ) -> None:
        common_arguments = {
            "mastodon_post_id": parameters.mastodon_post_id or None,
            "mastodon_instance": parameters.mastodon_instance or None,
            "mastodon_user_handle": parameters.mastodon_user_handle or None,
            "bluesky_post_url": parameters.bluesky_post_url or None,
        }
        publish_article(
            str(DEFAULT_TEMPLATE),
            markdown_path,
            str(default_output),
            **common_arguments,
        )
        publish_article(
            str(CLASSIC_TEMPLATE),
            markdown_path,
            str(classic_output),
            **common_arguments,
        )

    @staticmethod
    def _inject_article_metadata(
        output_path: Path,
        *,
        title: str,
        description: str,
        article_url: str,
        image_url: str | None,
    ) -> None:
        inject_social_metadata(
            output_path,
            title=title,
            description=description,
            article_url=article_url,
            image_url=image_url,
        )

    @staticmethod
    def _ftp_upload_manifest(
        *,
        rendered_images: tuple[str, ...],
        default_output: Path,
        classic_output: Path,
        default_publishing_path: str,
        classic_publishing_path: str,
        include_sitemap: bool,
        include_blog_index: bool = True,
        slug: str = "",
    ) -> tuple[tuple[Path, str], ...]:
        manifest: list[tuple[Path, str]] = []
        seen_destinations: set[str] = set()
        resolved_repository_root = REPO_ROOT.resolve()

        default_article_remote_path = join_remote_path(
            default_publishing_path,
            default_output.name,
        )
        classic_article_remote_path = join_remote_path(
            classic_publishing_path,
            classic_output.name,
        )
        if default_article_remote_path == classic_article_remote_path:
            raise ValueError(
                "Default and Classic publishing paths resolve to the same "
                "FTP destination. Select two different document roots."
            )

        local_images: list[tuple[Path, str]] = []
        for image_path in rendered_images:
            local_path = (resolved_repository_root / image_path).resolve()
            try:
                local_path.relative_to(resolved_repository_root)
            except ValueError as exc:
                raise ValueError(
                    f"Article image is outside the repository: {image_path}"
                ) from exc
            relative_web_path = image_path.removeprefix("articles/").replace(
                "\\", "/"
            )
            local_images.append((local_path, relative_web_path))

        for publishing_path in (
            default_publishing_path,
            classic_publishing_path,
        ):
            for local_path, relative_web_path in local_images:
                remote_path = join_remote_path(
                    publishing_path,
                    relative_web_path,
                )
                if remote_path in seen_destinations:
                    continue
                manifest.append((local_path, remote_path))
                seen_destinations.add(remote_path)

        manifest.append((default_output, default_article_remote_path))
        manifest.append((classic_output, classic_article_remote_path))

        if include_sitemap:
            manifest.append(
                (
                    DEFAULT_OUTPUT_DIR / "sitemap.xml",
                    join_remote_path(
                        default_publishing_path,
                        "sitemap.xml",
                    ),
                )
            )
            manifest.append(
                (
                    CLASSIC_OUTPUT_DIR / "sitemap.xml",
                    join_remote_path(
                        classic_publishing_path,
                        "sitemap.xml",
                    ),
                )
            )

        if include_blog_index:
            manifest.append(
                (
                    DEFAULT_OUTPUT_DIR / "blog.html",
                    join_remote_path(
                        default_publishing_path,
                        "blog.html",
                    ),
                )
            )
            manifest.append(
                (
                    CLASSIC_OUTPUT_DIR / "blog.html",
                    join_remote_path(
                        classic_publishing_path,
                        "blog.html",
                    ),
                )
            )

        if slug:
            blog_thumbnail = DEFAULT_OUTPUT_DIR / "images" / "blogs" / f"{slug}.png"
            if blog_thumbnail.is_file():
                manifest.append(
                    (
                        blog_thumbnail,
                        join_remote_path(
                            default_publishing_path,
                            f"images/blogs/{slug}.png",
                        ),
                    )
                )

        return tuple(manifest)

    def _checkpoint_social_parameters(
        self,
        *,
        markdown_path: str,
        default_output: Path,
        classic_output: Path,
        parameters: SocialPostParameters,
        title: str,
        description: str,
        article_url: str,
        image_url: str | None,
    ) -> None:
        """Persist returned post IDs locally and update both output variants."""
        self._publish_local_versions(
            markdown_path,
            default_output,
            classic_output,
            parameters,
        )
        self._inject_article_metadata(
            default_output,
            title=title,
            description=description,
            article_url=article_url,
            image_url=image_url,
        )
        self._inject_article_metadata(
            classic_output,
            title=title,
            description=description,
            article_url=article_url,
            image_url=image_url,
        )

    def _clear_session_secrets(self) -> None:
        self.ftp_password_var.set("")
        self.mastodon_access_token_var.set("")
        self.bluesky_password_var.set("")
        self.wordpress_password_var.set("")

    def save_article(self) -> None:
        if self._publishing:
            self.status_var.set("Publishing is already in progress.")
            return

        self._publishing = True
        self.publish_button.configure(state="disabled")
        try:
            self._save_article()
        finally:
            # All remote credentials are input-only and deliberately never
            # survive a publishing attempt.
            self._clear_session_secrets()
            self._publishing = False
            self.publish_button.configure(state="normal")

    def _save_article(self) -> None:
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

        parameters = SocialPostParameters(
            mastodon_post_id=self.mastodon_post_id_var.get().strip(),
            mastodon_instance=(
                self.mastodon_instance_var.get().strip()
                or DEFAULT_MASTODON_INSTANCE
            ),
            mastodon_user_handle=(
                self.mastodon_user_handle_var.get().strip()
                or DEFAULT_MASTODON_HANDLE
            ),
            bluesky_post_url=self.bluesky_post_url_var.get().strip(),
        )
        social_automation_enabled = self.social_automation_enabled_var.get()
        wordpress_enabled = self.wordpress_enabled_var.get()
        wordpress_site_url = self.wordpress_site_url_var.get().strip()
        wordpress_username = self.wordpress_username_var.get().strip()
        wordpress_password = self.wordpress_password_var.get().strip()
        wordpress_status = self.wordpress_status_var.get().strip()

        if social_automation_enabled:
            try:
                existing_parameters, _sources = (
                    load_published_social_parameters(slug)
                )
            except OSError as exc:
                messagebox.showerror(
                    "Duplicate-post safety check failed",
                    "Could not inspect the existing generated article, so "
                    "social publishing was stopped to avoid a duplicate."
                    f"\n\n{exc}",
                )
                return

            # Generated output is authoritative. Re-read it at the last
            # possible moment so stale or manually populated form state cannot
            # cause an existing social post to be submitted again.
            parameters = existing_parameters.with_missing_from(parameters)
            self.mastodon_post_id_var.set(parameters.mastodon_post_id)
            self.mastodon_instance_var.set(parameters.mastodon_instance)
            self.mastodon_user_handle_var.set(
                parameters.mastodon_user_handle
            )
            self.bluesky_post_url_var.set(parameters.bluesky_post_url)

        if wordpress_enabled and not (
            wordpress_site_url and wordpress_username and wordpress_password
        ):
            messagebox.showerror(
                "Missing WordPress credentials",
                "Site URL, username, and Application Password are required.",
            )
            return

        try:
            self._set_status("Preparing article...")
            rendered_article = render_portable_article(
                str(DEFAULT_TEMPLATE),
                markdown_path,
            )
            description = extract_article_description(rendered_article.content)
            social_image = select_social_image(rendered_article.images)
            article_url, image_url = build_public_urls(
                self.public_article_base_url_var.get(),
                slug,
                social_image,
            )
            thumbnail_path = None
            if social_image:
                thumbnail_path = (REPO_ROOT.resolve() / social_image).resolve()
                try:
                    thumbnail_path.relative_to(REPO_ROOT.resolve())
                except ValueError as exc:
                    raise ValueError(
                        "The selected social image is outside the repository."
                    ) from exc
        except (FileNotFoundError, OSError, ValueError) as exc:
            messagebox.showerror("Article preparation failed", str(exc))
            self.status_var.set("")
            return

        has_mastodon_credentials = bool(
            self.mastodon_access_token_var.get().strip()
        )
        has_bluesky_credentials = bool(
            self.bluesky_handle_var.get().strip()
            and self.bluesky_password_var.get().strip()
        )
        needs_mastodon_post = (
            social_automation_enabled
            and not parameters.mastodon_post_id
            and has_mastodon_credentials
        )
        needs_bluesky_post = (
            social_automation_enabled
            and not parameters.bluesky_post_url
            and has_bluesky_credentials
        )
        needs_social_posts = needs_mastodon_post or needs_bluesky_post

        ftp_publisher = None
        social_post_text = ""
        if social_automation_enabled:
            try:
                ftp_publisher = FTPPublisher(
                    self.ftp_host_var.get(),
                    self.ftp_username_var.get(),
                    self.ftp_password_var.get(),
                )
                # Validate both document roots before generating or uploading
                # the article.
                self._ftp_upload_manifest(
                    rendered_images=rendered_article.images,
                    default_output=default_output,
                    classic_output=classic_output,
                    default_publishing_path=(
                        self.ftp_default_publishing_path_var.get()
                    ),
                    classic_publishing_path=(
                        self.ftp_classic_publishing_path_var.get()
                    ),
                    include_sitemap=False,
                    include_blog_index=False,
                )
                message = (
                    self.social_message_var.get().strip()
                    or rendered_article.title
                )
                if not self.social_message_var.get().strip():
                    self.social_message_var.set(message)
                social_post_text = build_social_post(message, article_url)
            except ValueError as exc:
                messagebox.showerror("Social publishing configuration", str(exc))
                self.status_var.set("")
                return

            if needs_social_posts:
                destinations = []
                if needs_mastodon_post:
                    destinations.append("Mastodon")
                if needs_bluesky_post:
                    destinations.append("Bluesky")
                confirmed = messagebox.askyesno(
                    "Confirm social publishing",
                    "The following public post will be sent to "
                    f"{' and '.join(destinations)}:\n\n"
                    f"{social_post_text}\n\n"
                    "Continue with the temporary FTP upload and social posts?",
                )
                if not confirmed:
                    self.status_var.set("Publishing cancelled.")
                    return

        # First pass: publish a complete public article without social-comment
        # references so both platforms have a stable URL and thumbnail.
        if needs_social_posts:
            try:
                self._set_status("Generating temporary article without comments...")
                empty_parameters = SocialPostParameters(
                    mastodon_instance=parameters.mastodon_instance,
                    mastodon_user_handle=parameters.mastodon_user_handle,
                )
                self._publish_local_versions(
                    markdown_path,
                    default_output,
                    classic_output,
                    empty_parameters,
                )
                self._inject_article_metadata(
                    default_output,
                    title=rendered_article.title,
                    description=description,
                    article_url=article_url,
                    image_url=image_url,
                )
                self._inject_article_metadata(
                    classic_output,
                    title=rendered_article.title,
                    description=description,
                    article_url=article_url,
                    image_url=image_url,
                )
                if ftp_publisher is None:
                    raise RuntimeError("FTP publisher was not configured.")
                ftp_publisher.upload(
                    self._ftp_upload_manifest(
                        rendered_images=rendered_article.images,
                        default_output=default_output,
                        classic_output=classic_output,
                        default_publishing_path=(
                            self.ftp_default_publishing_path_var.get()
                        ),
                        classic_publishing_path=(
                            self.ftp_classic_publishing_path_var.get()
                        ),
                        include_sitemap=False,
                        include_blog_index=True,
                        slug=slug,
                    ),
                    progress=self._set_status,
                )
                self._set_status("Verifying public article and thumbnail...")
                verify_public_preview(
                    article_url,
                    expected_title=rendered_article.title,
                    image_url=image_url,
                )
            except Exception as exc:  # noqa: BLE001 - FTP/network UI boundary
                # Restore whatever comment references existed before staging.
                try:
                    self._checkpoint_social_parameters(
                        markdown_path=markdown_path,
                        default_output=default_output,
                        classic_output=classic_output,
                        parameters=parameters,
                        title=rendered_article.title,
                        description=description,
                        article_url=article_url,
                        image_url=image_url,
                    )
                except Exception:
                    pass
                messagebox.showerror(
                    "Temporary publishing failed",
                    "No social posts were created.\n\n"
                    f"The temporary FTP/public-preview step failed: {exc}",
                )
                self.status_var.set("Temporary publishing failed.")
                return

        social_errors: list[str] = []
        if needs_mastodon_post:
            try:
                self._set_status("Posting article to Mastodon...")
                mastodon_client = MastodonClient(
                    parameters.mastodon_instance,
                    self.mastodon_access_token_var.get(),
                )
                mastodon_result = mastodon_client.create_post(
                    social_post_text,
                    idempotency_key=str(
                        uuid.uuid5(
                            uuid.NAMESPACE_URL,
                            f"{article_url}#mastodon",
                        )
                    ),
                )
                parameters = SocialPostParameters(
                    mastodon_post_id=mastodon_result.post_id,
                    mastodon_instance=mastodon_client.instance,
                    mastodon_user_handle=(
                        mastodon_result.account_handle
                        or parameters.mastodon_user_handle
                    ),
                    bluesky_post_url=parameters.bluesky_post_url,
                )
                self.mastodon_post_id_var.set(parameters.mastodon_post_id)
                self.mastodon_instance_var.set(parameters.mastodon_instance)
                self.mastodon_user_handle_var.set(
                    parameters.mastodon_user_handle
                )
                self._checkpoint_social_parameters(
                    markdown_path=markdown_path,
                    default_output=default_output,
                    classic_output=classic_output,
                    parameters=parameters,
                    title=rendered_article.title,
                    description=description,
                    article_url=article_url,
                    image_url=image_url,
                )
            except Exception as exc:  # noqa: BLE001 - continue to Bluesky
                social_errors.append(f"Mastodon: {exc}")

        if needs_bluesky_post:
            try:
                self._set_status("Posting article to Bluesky...")
                bluesky_client = BlueskyClient(
                    self.bluesky_service_url_var.get(),
                    self.bluesky_handle_var.get(),
                    self.bluesky_password_var.get(),
                )
                bluesky_result = bluesky_client.create_post(
                    social_post_text,
                    article_url=article_url,
                    title=rendered_article.title,
                    description=description,
                    thumbnail_path=thumbnail_path,
                )
                parameters = SocialPostParameters(
                    mastodon_post_id=parameters.mastodon_post_id,
                    mastodon_instance=parameters.mastodon_instance,
                    mastodon_user_handle=parameters.mastodon_user_handle,
                    bluesky_post_url=bluesky_result.url,
                )
                self.bluesky_post_url_var.set(parameters.bluesky_post_url)
                self._checkpoint_social_parameters(
                    markdown_path=markdown_path,
                    default_output=default_output,
                    classic_output=classic_output,
                    parameters=parameters,
                    title=rendered_article.title,
                    description=description,
                    article_url=article_url,
                    image_url=image_url,
                )
            except Exception as exc:  # noqa: BLE001 - finalize other success
                social_errors.append(f"Bluesky: {exc}")

        final_ftp_uploaded = False
        # Second pass: embed whichever social post references are available,
        # regenerate sitemaps, then replace the staged article over FTP.
        try:
            self._set_status("Generating final article with social comments...")
            self._publish_local_versions(
                markdown_path,
                default_output,
                classic_output,
                parameters,
            )
            self._inject_article_metadata(
                default_output,
                title=rendered_article.title,
                description=description,
                article_url=article_url,
                image_url=image_url,
            )
            self._inject_article_metadata(
                classic_output,
                title=rendered_article.title,
                description=description,
                article_url=article_url,
                image_url=image_url,
            )
            sitemap_result = generate_sitemaps.main(["generate_sitemaps.py"])
            if sitemap_result != 0:
                raise RuntimeError(
                    "Sitemap generation returned a non-zero status."
                )

            if social_automation_enabled:
                self._set_status("Uploading final article...")
                if ftp_publisher is None:
                    raise RuntimeError("FTP publisher was not configured.")
                ftp_publisher.upload(
                    self._ftp_upload_manifest(
                        rendered_images=rendered_article.images,
                        default_output=default_output,
                        classic_output=classic_output,
                        default_publishing_path=(
                            self.ftp_default_publishing_path_var.get()
                        ),
                        classic_publishing_path=(
                            self.ftp_classic_publishing_path_var.get()
                        ),
                        include_sitemap=True,
                        include_blog_index=True,
                        slug=slug,
                    ),
                    progress=self._set_status,
                )
                final_ftp_uploaded = True
        except Exception as exc:  # noqa: BLE001 - filesystem/FTP UI boundary
            messagebox.showerror(
                "Final article publishing failed",
                "Social post IDs already returned are preserved in the local "
                "HTML and visible fields, so retrying will skip those posts."
                f"\n\n{exc}",
            )
            self.status_var.set("Final article publishing failed.")
            return

        wordpress_result = None
        if wordpress_enabled:
            try:
                self._set_status("Publishing final article to WordPress...")
                wordpress_client = WordPressClient(
                    wordpress_site_url,
                    wordpress_username,
                    wordpress_password,
                )

                def update_wordpress_progress(message: str) -> None:
                    self.status_var.set(message)
                    self.master.update_idletasks()

                wordpress_result = wordpress_client.publish_article(
                    title=rendered_article.title,
                    content=rendered_article.content,
                    slug=slug,
                    status=wordpress_status,
                    image_paths=rendered_article.images,
                    repository_root=REPO_ROOT,
                    progress=update_wordpress_progress,
                )
            except Exception as exc:  # noqa: BLE001 - display REST/API failures
                messagebox.showwarning(
                    "WordPress publishing failed",
                    "The local article and sitemaps were saved successfully, "
                    f"but WordPress publishing failed:\n\n{exc}",
                )
                self.status_var.set(
                    "Saved locally, but WordPress publishing failed."
                )
                return

        success_message = (
            "Article saved to default/ and classic/ folders, and sitemaps updated."
        )
        if final_ftp_uploaded:
            success_message += (
                f"\n\nFinal article uploaded by FTP:\n{article_url}"
            )
        if parameters.mastodon_post_id:
            success_message += (
                f"\n\nMastodon post ID: {parameters.mastodon_post_id}"
            )
        if parameters.bluesky_post_url:
            success_message += (
                f"\nBluesky post: {parameters.bluesky_post_url}"
            )
        if wordpress_result is not None:
            action = "created" if wordpress_result.created else "updated"
            success_message += (
                f"\n\nWordPress post {action} as "
                f"{wordpress_result.status} (ID {wordpress_result.post_id})."
            )
            if wordpress_result.link:
                success_message += f"\n{wordpress_result.link}"

        if social_errors:
            success_message += (
                "\n\nSome social publishing steps failed:\n- "
                + "\n- ".join(social_errors)
            )
            messagebox.showwarning("Publishing partially completed", success_message)
        else:
            messagebox.showinfo("Success", success_message)
        final_status = f"Saved: {default_output} and {classic_output}"
        if final_ftp_uploaded:
            final_status += "; FTP upload complete"
        if wordpress_result is not None:
            final_status += f"; WordPress post ID {wordpress_result.post_id}"
        self.status_var.set(final_status)


def main() -> None:
    ensure_environment()
    os.chdir(REPO_ROOT)

    root = tk.Tk()
    app = PublisherApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
