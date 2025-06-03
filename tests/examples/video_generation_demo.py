#!/usr/bin/env python3
"""create_test_video.py — generates test MP4 file using ffmpeg."""

import shutil
import subprocess
import sys
import os
from pathlib import Path

# IMPORTANT: use output_dir instead of current directory
if 'output_dir' in globals():
    output_directory = Path(output_dir)
    print(f"📁 Using output_dir: {output_directory}")
else:
    print("⚠️ output_dir not available, Output File Processing not enabled")
    output_directory = Path(".")

# Create file in output_dir
OUT_FILE = output_directory / "test_video.mp4"  # FIXED: file in output_dir
DURATION = 5                          # seconds
SIZE     = "1280x720"                 # resolution
FPS      = 30                         # frames/s

print(f"📂 Creating file: {OUT_FILE.absolute()}")

# ── check that ffmpeg is available ──────────────────────────────────────────
ffmpeg = shutil.which("ffmpeg")
if not ffmpeg:
    sys.exit("❌ ffmpeg not found in PATH")

# ── ffmpeg command: video testsrc + audio sine ─────────────────────────────
cmd = [
    ffmpeg,
    "-y",                               # overwrite file if exists
    "-f", "lavfi", "-i", f"testsrc=size={SIZE}:rate={FPS}",
    "-f", "lavfi", "-i", "sine=frequency=1000:sample_rate=44100",
    "-t", str(DURATION),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest",                        # stop output when one stream ends
    str(OUT_FILE)
]

print("Running ffmpeg …")
try:
    subprocess.run(cmd, check=True)
    print(f"✅ Done! File created: {OUT_FILE.resolve()}")
    
    # Check that file was actually created
    if OUT_FILE.exists():
        file_size = OUT_FILE.stat().st_size
        print(f"📊 File size: {file_size} bytes ({file_size/1024:.1f} KB)")
    else:
        print("❌ File was not created!")
        
except subprocess.CalledProcessError as e:
    print(f"❌ Error executing ffmpeg: {e}")
    sys.exit(1) 