#!/usr/bin/env python3
"""
Hourly Website Screenshot & 10:00 AM PDF Compiler
Captures a screenshot of https://spike271.github.io/Garden-Timer/app.html every hour
and compiles all collected screenshots into a timestamped multi-page PDF at 10:00 AM.
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

# Configuration via environment variables with sensible defaults
TARGET_URL = os.environ.get(
    "TARGET_URL", "https://spike271.github.io/Garden-Timer/app.html"
)
TIMEZONE = os.environ.get("TIMEZONE", "Asia/Kolkata")
COMPILE_HOUR = int(os.environ.get("COMPILE_HOUR", "10"))
FORCE_COMPILE = os.environ.get("FORCE_COMPILE", "false").lower() == "true"
CLEAR_AFTER_COMPILE = os.environ.get("CLEAR_AFTER_COMPILE", "true").lower() == "true"

SCREENSHOT_DIR = Path(os.environ.get("SCREENSHOT_DIR", "screenshots"))
PDF_DIR = Path(os.environ.get("PDF_DIR", "compiled_pdfs"))


def capture_screenshot(url: str, output_path: Path) -> None:
    """Launch headless Chromium, load the target URL, and save a screenshot."""
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = context.new_page()
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="networkidle", timeout=60000)
        # Allow client-side timers and UI rendering to settle
        page.wait_for_timeout(2000)
        page.screenshot(path=str(output_path), full_page=True)
        browser.close()

    print(f"Saved screenshot to {output_path}")


def add_header_banner(img: Image.Image, label_text: str) -> Image.Image:
    """Add a clean timestamp header bar above a screenshot image for the PDF page."""
    img_rgb = img.convert("RGB")
    width, height = img_rgb.size
    banner_height = max(60, int(height * 0.045))

    canvas = Image.new("RGB", (width, height + banner_height), color=(30, 41, 59))
    canvas.paste(img_rgb, (0, banner_height))

    draw = ImageDraw.Draw(canvas)
    font_size = max(20, int(banner_height * 0.45))
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    text_y = (banner_height - font_size) // 2
    draw.text((24, text_y), label_text, fill=(248, 250, 252), font=font)
    return canvas


def compile_screenshots_to_pdf(
    screenshot_dir: Path, pdf_dir: Path, now_local: datetime
) -> Path | None:
    """Compile all PNG screenshots in screenshot_dir into a single multi-page PDF."""
    png_files = sorted(screenshot_dir.glob("*.png"))
    if not png_files:
        print("No screenshots found to compile.")
        return None

    pdf_dir.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"garden_timer_compilation_{now_local.strftime('%Y-%m-%d_%H%M')}.pdf"
    pdf_path = pdf_dir / pdf_filename

    pages: list[Image.Image] = []
    for png_path in png_files:
        # Derive readable timestamp from filename (YYYY-MM-DD_HH-MM-SS_TZ.png)
        stem = png_path.stem.replace("_", " ")
        header_text = f"Garden Timer Snapshot  |  {stem}  |  {TARGET_URL}"
        with Image.open(png_path) as raw_img:
            annotated_page = add_header_banner(raw_img, header_text)
            pages.append(annotated_page)

    first_page, remaining_pages = pages[0], pages[1:]
    first_page.save(
        str(pdf_path),
        "PDF",
        resolution=150.0,
        save_all=True,
        append_images=remaining_pages,
    )
    print(f"Compiled {len(pages)} screenshot(s) into {pdf_path}")

    if CLEAR_AFTER_COMPILE:
        for png_path in png_files:
            png_path.unlink()
        print(f"Cleared {len(png_files)} compiled screenshot(s) from {screenshot_dir}/")

    return pdf_path


def write_github_output(key: str, value: str) -> None:
    """Export key=value to GITHUB_OUTPUT when running inside GitHub Actions."""
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as f:
            f.write(f"{key}={value}\n")


def main() -> int:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    tz = ZoneInfo(TIMEZONE)
    now_local = datetime.now(tz)
    timestamp_str = now_local.strftime("%Y-%m-%d_%H-%M-%S_%Z")

    screenshot_path = SCREENSHOT_DIR / f"{timestamp_str}.png"
    capture_screenshot(TARGET_URL, screenshot_path)
    write_github_output("screenshot_path", str(screenshot_path))

    should_compile = FORCE_COMPILE or (now_local.hour == COMPILE_HOUR)
    if should_compile:
        print(
            f"Current local hour is {now_local.hour:02d}:00 ({TIMEZONE}) "
            f"(or FORCE_COMPILE={FORCE_COMPILE}). Compiling PDF..."
        )
        pdf_path = compile_screenshots_to_pdf(SCREENSHOT_DIR, PDF_DIR, now_local)
        if pdf_path:
            write_github_output("pdf_compiled", "true")
            write_github_output("pdf_path", str(pdf_path))
        else:
            write_github_output("pdf_compiled", "false")
    else:
        print(
            f"Current local time is {now_local.strftime('%Y-%m-%d %H:%M %Z')}. "
            f"PDF compilation is scheduled for {COMPILE_HOUR:02d}:00 {TIMEZONE}."
        )
        write_github_output("pdf_compiled", "false")

    return 0


if __name__ == "__main__":
    sys.exit(main())