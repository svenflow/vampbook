#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "pdf2image"]
# ///
"""
Prototype 4: Test WebP vs PNG quality for music notation
Uses the Jazz Fake Book at /tmp/jazz_fake_book.pdf
"""

import os
import sys
from pathlib import Path

from PIL import Image
from pdf2image import convert_from_path

PDF_PATH = Path("/tmp/jazz_fake_book.pdf")
OUTPUT_DIR = Path(__file__).parent / "output"

# Test pages with music notation (after intro pages)
TEST_PAGES = [35, 40, 50, 60, 80]
WEBP_QUALITIES = [80, 85, 90, 95]

def main():
    print("=" * 60)
    print("PROTOTYPE 4: WebP vs PNG Quality Test")
    print("=" * 60)

    if not PDF_PATH.exists():
        print(f"\nERROR: PDF not found at {PDF_PATH}")
        return 1

    print(f"PDF: {PDF_PATH} ({PDF_PATH.stat().st_size / 1024 / 1024:.1f}MB)")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Output: {OUTPUT_DIR}\n")

    results = []

    for page_num in TEST_PAGES:
        print(f"\n--- Page {page_num} ---")

        try:
            # Convert single page
            images = convert_from_path(
                PDF_PATH,
                first_page=page_num,
                last_page=page_num,
                dpi=150  # Good balance
            )

            if not images:
                print(f"  Failed to convert page {page_num}")
                continue

            img = images[0]
            page_result = {"page": page_num, "formats": {}}

            # Save as PNG (baseline)
            png_path = OUTPUT_DIR / f"page_{page_num}.png"
            img.save(png_path, "PNG")
            png_size = png_path.stat().st_size
            page_result["formats"]["png"] = {"size": png_size, "path": str(png_path)}
            print(f"  PNG: {png_size:,} bytes ({png_size/1024:.1f} KB)")

            # Save as WebP at various qualities
            for quality in WEBP_QUALITIES:
                webp_path = OUTPUT_DIR / f"page_{page_num}_q{quality}.webp"
                img.save(webp_path, "WEBP", quality=quality)
                webp_size = webp_path.stat().st_size
                ratio = webp_size / png_size * 100
                page_result["formats"][f"webp_q{quality}"] = {
                    "size": webp_size,
                    "ratio": ratio,
                    "path": str(webp_path)
                }
                status = "✓" if ratio <= 70 else ""
                print(f"  WebP q{quality}: {webp_size:,} bytes ({webp_size/1024:.1f} KB) = {ratio:.1f}% of PNG {status}")

            results.append(page_result)

        except Exception as e:
            print(f"  Error: {e}")

    if not results:
        print("\nNo pages were successfully converted.")
        return 1

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    # Calculate averages
    avg_ratios = {q: [] for q in WEBP_QUALITIES}
    total_png = 0
    total_webp = {q: 0 for q in WEBP_QUALITIES}

    for r in results:
        total_png += r["formats"]["png"]["size"]
        for q in WEBP_QUALITIES:
            key = f"webp_q{q}"
            if key in r["formats"]:
                avg_ratios[q].append(r["formats"][key]["ratio"])
                total_webp[q] += r["formats"][key]["size"]

    print("\nAverage WebP/PNG ratio by quality:")
    best_quality = None
    for q in WEBP_QUALITIES:
        if avg_ratios[q]:
            avg = sum(avg_ratios[q]) / len(avg_ratios[q])
            status = "✓ PASS" if avg <= 70 else "close" if avg <= 80 else ""
            print(f"  q{q}: {avg:.1f}% {status}")
            if avg <= 70 and best_quality is None:
                best_quality = q

    print(f"\nTotal file sizes for {len(results)} pages:")
    print(f"  PNG: {total_png/1024:.1f} KB")
    for q in WEBP_QUALITIES:
        savings = (total_png - total_webp[q]) / 1024
        print(f"  WebP q{q}: {total_webp[q]/1024:.1f} KB (saves {savings:.1f} KB)")

    print("\n" + "-" * 40)
    print("PASS CRITERIA:")
    print(f"  [{'✓' if best_quality else '✗'}] WebP < 70% of PNG size")
    print("  [?] No visible quality loss (manual inspection needed)")
    print("  [?] Renders in React Native (needs app test)")

    if best_quality:
        print(f"\nRECOMMENDED: WebP quality {best_quality}")
        print(f"\nOVERALL: PASS ✓")
    else:
        # Check if any quality is close
        for q in WEBP_QUALITIES:
            if avg_ratios[q] and sum(avg_ratios[q]) / len(avg_ratios[q]) <= 75:
                print(f"\nWebP q{q} is close at ~{sum(avg_ratios[q]) / len(avg_ratios[q]):.0f}% - may be acceptable")
                break
        print("\nOVERALL: MARGINAL (WebP ~70-75% of PNG)")

    print(f"\nOutput files saved to: {OUTPUT_DIR}")
    print("Manually inspect the WebP files for notation quality!")

    # List output files
    print("\nGenerated files:")
    for f in sorted(OUTPUT_DIR.glob("*")):
        print(f"  {f.name} ({f.stat().st_size/1024:.1f} KB)")

    return 0

if __name__ == "__main__":
    sys.exit(main())
