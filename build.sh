#!/bin/bash

set -e  # Exit on error

echo "========================================"
echo "  Building Notcha (X11 only)"
echo "========================================"
echo ""

# Create output directory
mkdir -p zig-out/lib

# Build native X11
echo "📦 Building native X11 library..."
if zig build -Doptimize=ReleaseSafe; then
    echo "✓ Build successful"
else
    echo "✗ Build failed"
    exit 1
fi

echo ""
echo "========================================"
echo "✓ Build complete!"
echo "========================================"
echo ""
echo "Platform support:"
echo "  • Linux: Native X11 (works on Wayland via XWayland)"
echo "  • Windows: Use WSLg or X server (VcXsrv, Xming)"
echo "  • macOS: Use XQuartz"
echo ""
echo "Built library:"
ls -lh zig-out/lib/*.so 2>/dev/null || echo "  (check zig-out/lib/)"
echo ""
