#!/usr/bin/env bash
# Turns any video into a homepage teaser: a short silent loop plus a poster frame.
#   scripts/encode-teaser.sh <input-video> <paper-id> [start-seconds] [duration-seconds] [width]
# Example: scripts/encode-teaser.sh ~/Downloads/herbench_demo.mp4 herbench 3 5
# Writes public/media/<paper-id>/teaser.mp4, a WebM (AV1 if available, else VP9) and poster.jpg.
# Width defaults to 640 px; lead papers on the homepage are shown larger, so use 960 for those.
set -euo pipefail

usage="usage: encode-teaser.sh <input-video> <paper-id> [start] [duration] [width]"
input="${1:?$usage}"
id="${2:?$usage}"
start="${3:-0}"
duration="${4:-5}"
width="${5:-640}"
out="public/media/${id}"
filters="scale=${width}:-2:flags=lanczos,fps=24"

command -v ffmpeg >/dev/null || { echo "ffmpeg is not installed" >&2; exit 1; }
mkdir -p "$out"
rm -f "$out"/teaser.*

# H.264 MP4: plays everywhere, and is the fallback.
ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$duration" -i "$input" \
  -vf "$filters" -an -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart \
  "$out/teaser.mp4"

# WebM: smaller, offered first to browsers that can play it.
encoders="$(ffmpeg -hide_banner -encoders 2>/dev/null)"
if grep -q libsvtav1 <<<"$encoders"; then
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$duration" -i "$input" \
    -vf "$filters" -an -c:v libsvtav1 -crf 40 -preset 6 -pix_fmt yuv420p "$out/teaser.av1.webm"
elif grep -q libaom-av1 <<<"$encoders"; then
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$duration" -i "$input" \
    -vf "$filters" -an -c:v libaom-av1 -crf 38 -b:v 0 -cpu-used 6 -row-mt 1 -pix_fmt yuv420p "$out/teaser.av1.webm"
else
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$duration" -i "$input" \
    -vf "$filters" -an -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 "$out/teaser.vp9.webm"
fi

# Poster: a frame a third of the way in, shown before playback and for reduced motion.
poster_at="$(awk -v d="$duration" 'BEGIN { printf "%.2f", d / 3 }')"
ffmpeg -hide_banner -loglevel error -y -ss "$poster_at" -i "$out/teaser.mp4" -frames:v 1 -q:v 3 "$out/poster.jpg"

ls -lh "$out"
