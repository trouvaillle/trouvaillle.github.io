#!/bin/sh
set -e
command -v pacman >/dev/null 2>&1 && {
  pacman -S --noconfirm \
    mingw-w64-ucrt-x86_64-gcc \
    mingw-w64-ucrt-x86_64-openssl \
    mingw-w64-ucrt-x86_64-pkg-config \
    make
}
bundle lock --add-platform x64-mingw-ucrt 2>/dev/null || true
export PATH="/c/msys64/ucrt64/bin:/c/msys64/usr/bin:$PATH"
bundle install
bundle exec jekyll build
