#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""
Prototype 2: Test Claude subprocess enrichment
- Spawns claude -p with timeout
- Tests stdout streaming to avoid buffer overflow
- Measures success rate and timing
"""

import subprocess
import json
import time
import sys

# Test songs - well-known jazz standards
TEST_SONGS = [
    ("Take Five", "Paul Desmond"),
    ("Autumn Leaves", "Joseph Kosma"),
    ("All The Things You Are", "Jerome Kern"),
    ("Blue Bossa", "Kenny Dorham"),
    ("Summertime", "George Gershwin"),
    ("So What", "Miles Davis"),
    ("My Funny Valentine", "Richard Rodgers"),
    ("Stella By Starlight", "Victor Young"),
    ("Giant Steps", "John Coltrane"),
    ("Round Midnight", "Thelonious Monk"),
]

PROMPT_TEMPLATE = """Research the jazz standard "{title}" by {composer}. Return ONLY a JSON object with this exact structure, no other text:

{{
  "description": "2-3 sentence summary of the song's history and significance",
  "related_songs": ["2-3 related jazz standards"],
  "tags": ["genre tags like 'bebop', 'ballad', '1950s', 'modal jazz'"]
}}"""

TIMEOUT_SECONDS = 30

def test_enrichment(title: str, composer: str) -> dict:
    """Test enriching a single song with Claude."""
    prompt = PROMPT_TEMPLATE.format(title=title, composer=composer)

    start = time.time()
    try:
        # Use subprocess with timeout and stdout streaming
        result = subprocess.run(
            ["claude", "-p", "--dangerously-skip-permissions", prompt],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
        elapsed = time.time() - start

        if result.returncode != 0:
            return {
                "success": False,
                "error": f"Exit code {result.returncode}: {result.stderr[:200]}",
                "elapsed": elapsed,
                "stdout_size": len(result.stdout),
            }

        # Try to parse JSON from output
        output = result.stdout.strip()
        # Find JSON in output (claude may add extra text)
        json_start = output.find('{')
        json_end = output.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = output[json_start:json_end]
            data = json.loads(json_str)
            return {
                "success": True,
                "data": data,
                "elapsed": elapsed,
                "stdout_size": len(result.stdout),
            }
        else:
            return {
                "success": False,
                "error": "No JSON found in output",
                "elapsed": elapsed,
                "stdout_size": len(result.stdout),
                "output_preview": output[:200],
            }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": f"Timeout after {TIMEOUT_SECONDS}s",
            "elapsed": TIMEOUT_SECONDS,
            "stdout_size": 0,
        }
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"JSON parse error: {e}",
            "elapsed": time.time() - start,
            "stdout_size": len(result.stdout) if 'result' in dir() else 0,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "elapsed": time.time() - start,
            "stdout_size": 0,
        }

def main():
    print("=" * 60)
    print("PROTOTYPE 2: Claude Subprocess Enrichment Test")
    print("=" * 60)
    print(f"Testing {len(TEST_SONGS)} songs with {TIMEOUT_SECONDS}s timeout each\n")

    results = []
    for i, (title, composer) in enumerate(TEST_SONGS, 1):
        print(f"[{i}/{len(TEST_SONGS)}] {title} by {composer}...", end=" ", flush=True)
        result = test_enrichment(title, composer)
        results.append({"song": f"{title} - {composer}", **result})

        if result["success"]:
            print(f"✓ {result['elapsed']:.1f}s ({result['stdout_size']} bytes)")
        else:
            print(f"✗ {result['error'][:50]}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    successes = [r for r in results if r["success"]]
    failures = [r for r in results if not r["success"]]

    success_rate = len(successes) / len(results) * 100
    avg_time = sum(r["elapsed"] for r in successes) / len(successes) if successes else 0
    max_stdout = max(r["stdout_size"] for r in results)

    print(f"Success rate: {len(successes)}/{len(results)} ({success_rate:.0f}%)")
    print(f"Average time (success): {avg_time:.1f}s")
    print(f"Max stdout size: {max_stdout} bytes")

    print("\n" + "-" * 40)
    print("PASS CRITERIA:")
    print(f"  [{'✓' if success_rate >= 90 else '✗'}] Success rate >= 90% (got {success_rate:.0f}%)")
    print(f"  [{'✓' if avg_time <= 30 else '✗'}] Avg time <= 30s (got {avg_time:.1f}s)")
    print(f"  [{'✓' if not any('Timeout' in r.get('error', '') or 'buffer' in r.get('error', '').lower() for r in failures) else '✗'}] No hangs/buffer overflows")

    overall_pass = success_rate >= 90 and avg_time <= 30
    print(f"\nOVERALL: {'PASS ✓' if overall_pass else 'FAIL ✗'}")

    if failures:
        print("\nFailures:")
        for f in failures:
            print(f"  - {f['song']}: {f['error'][:60]}")

    # Output full results as JSON
    with open("results.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nFull results saved to results.json")

    return 0 if overall_pass else 1

if __name__ == "__main__":
    sys.exit(main())
