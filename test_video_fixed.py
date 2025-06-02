#!/usr/bin/env python3
"""create_test_video.py — генерирует тестовый MP4-файл с помощью ffmpeg."""

import shutil
import subprocess
import sys
import os
from pathlib import Path

# ВАЖНО: используем output_dir вместо текущей директории
if 'output_dir' in globals():
    output_directory = Path(output_dir)
    print(f"📁 Используем output_dir: {output_directory}")
else:
    print("⚠️ output_dir не доступен, Output File Processing не включен")
    output_directory = Path(".")

# Создаем файл в output_dir
OUT_FILE = output_directory / "test_video.mp4"  # ИСПРАВЛЕНО: файл в output_dir
DURATION = 5                          # секунды
SIZE     = "1280x720"                 # разрешение
FPS      = 30                         # кадры/с

print(f"📂 Создаем файл: {OUT_FILE.absolute()}")

# ── проверяем, что ffmpeg есть ──────────────────────────────────────────────
ffmpeg = shutil.which("ffmpeg")
if not ffmpeg:
    sys.exit("❌ ffmpeg не найден в PATH")

# ── команда ffmpeg: video testsrc + audio sine ──────────────────────────────
cmd = [
    ffmpeg,
    "-y",                               # перезаписывать файл, если существует
    "-f", "lavfi", "-i", f"testsrc=size={SIZE}:rate={FPS}",
    "-f", "lavfi", "-i", "sine=frequency=1000:sample_rate=44100",
    "-t", str(DURATION),
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-shortest",                        # остановить вывод, когда один из потоков кончится
    str(OUT_FILE)
]

print("Запускаю ffmpeg …")
try:
    subprocess.run(cmd, check=True)
    print(f"✅ Готово! Файл создан: {OUT_FILE.resolve()}")
    
    # Проверяем, что файл действительно создан
    if OUT_FILE.exists():
        file_size = OUT_FILE.stat().st_size
        print(f"📊 Размер файла: {file_size} байт ({file_size/1024:.1f} KB)")
    else:
        print("❌ Файл не был создан!")
        
except subprocess.CalledProcessError as e:
    print(f"❌ Ошибка выполнения ffmpeg: {e}")
    sys.exit(1) 