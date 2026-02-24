#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "pdf2image"]
# ///
"""
Prototype 4: Test WebP vs PNG quality for music notation
- Renders pages from a fake book PDF
- Compares file sizes and visual quality
- Tests different WebP quality levels
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
    from pdf2image import convert_from_path
except ImportError:
    print("Installing dependencies...")
    os.system("uv pip install pillow pdf2image")
    from PIL import Image
    from pdf2image import convert_from_path

# Test pages (first few music pages, skipping intro)
TEST_PAGES = [15, 20, 25, 30, 35]  # Adjust based on actual book
WEBP_QUALITIES = [80, 85, 90, 95]

def find_fakebook_pdf():
    """Find a fake book PDF to test with."""
    # Common locations
    candidates = [
        Path.home() / "Downloads" / "The Jazz Fake Book.pdf",
        Path.home() / "Downloads" / "RealBook.pdf",
        Path.home() / "Documents" / "Music" / "FakeBook.pdf",
        Path("/tmp/fakebook.pdf"),
    ]

    # Also check current directory
    for pdf in Path.cwd().glob("*.pdf"):
        candidates.insert(0, pdf)

    for path in candidates:
        if path.exists():
            return path

    return None

def test_image_formats(pdf_path: Path, output_dir: Path):
    """Test PNG vs WebP at various qualities."""
    print(f"Converting pages from: {pdf_path}")
    print(f"Output directory: {output_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)

    results = []

    for page_num in TEST_PAGES:
        print(f"\n--- Page {page_num} ---")

        try:
            # Convert single page to image
            images = convert_from_path(
                pdf_path,
                first_page=page_num,
                last_page=page_num,
                dpi=150  # Good balance of quality and size
            )

            if not images:
                print(f"  Failed to convert page {page_num}")
                continue

            img = images[0]
            page_result = {"page": page_num, "formats": {}}

            # Save as PNG (baseline)
            png_path = output_dir / f"page_{page_num}.png"
            img.save(png_path, "PNG")
            png_size = png_path.stat().st_size
            page_result["formats"]["png"] = {"size": png_size, "path": str(png_path)}
            print(f"  PNG: {png_size:,} bytes ({png_size/1024:.1f} KB)")

            # Save as WebP at various qualities
            for quality in WEBP_QUALITIES:
                webp_path = output_dir / f"page_{page_num}_q{quality}.webp"
                img.save(webp_path, "WEBP", quality=quality)
                webp_size = webp_path.stat().st_size
                ratio = webp_size / png_size * 100
                page_result["formats"][f"webp_q{quality}"] = {
                    "size": webp_size,
                    "ratio": ratio,
                    "path": str(webp_path)
                }
                print(f"  WebP q{quality}: {webp_size:,} bytes ({webp_size/1024:.1f} KB) = {ratio:.1f}% of PNG")

            results.append(page_result)

        except Exception as e:
            print(f"  Error: {e}")

    return results

def main():
    print("=" * 60)
    print("PROTOTYPE 4: WebP vs PNG Quality Test")
    print("=" * 60)

    # Find a fake book PDF
    pdf_path = find_fakebook_pdf()

    if not pdf_path:
        print("\nNo fake book PDF found!")
        print("Please place a fake book PDF in one of these locations:")
        print("  - ~/Downloads/The Jazz Fake Book.pdf")
        print("  - ~/Downloads/RealBook.pdf")
        print("  - Current directory (any .pdf)")
        print("  - /tmp/fakebook.pdf")
        print("\nOr run: cp /path/to/your/fakebook.pdf /tmp/fakebook.pdf")
        return 1

    output_dir = Path(__file__).parent / "output"
    results = test_image_formats(pdf_path, output_dir)

    if not results:
        print("\nNo pages were successfully converted.")
        return 1

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    # Calculate averages
    avg_ratios = {q: [] for q in WEBP_QUALITIES}
    for r in results:
        for q in WEBP_QUALITIES:
            key = f"webp_q{q}"
            if key in r["formats"]:
                avg_ratios[q].append(r["formats"][key]["ratio"])

    print("\nAverage WebP/PNG ratio by quality:")
    best_quality = None
    for q in WEBP_QUALITIES:
        if avg_ratios[q]:
            avg = sum(avg_ratios[q]) / len(avg_ratios[q])
            status = "✓ PASS" if avg <= 70 else "close" if avg <= 80 else "✗"
            print(f"  q{q}: {avg:.1f}% {status}")
            if avg <= 70 and best_quality is None:
                best_quality = q

    print("\n" + "-" * 40)
    print("PASS CRITERIA:")
    print(f"  [{'✓' if best_quality else '✗'}] WebP < 70% of PNG size")
    print("  [?] No visible quality loss (manual inspection needed)")
    print("  [?] Renders in React Native (needs app test)")

    if best_quality:
        print(f"\nRECOMMENDED: WebP quality {best_quality}")
    else:
        print("\nWebP doesn't hit 70% target - may need to accept ~75-80% or stick with PNG")

    print(f"\nOutput files saved to: {output_dir}")
    print("Manually inspect the WebP files for notation quality!")

    return 0

if __name__ == "__main__":
    sys.exit(main())
