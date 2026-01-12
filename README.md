# Notcha

> A lightweight window management library for Linux using X11 bindings via Zig and TypeScript

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://www.npmjs.com/package/notcha)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

✨ **Simple API** - Easy-to-use TypeScript interface for window management  
🚀 **Native Performance** - Direct X11 bindings via Zig (no Electron bloat)  
🎨 **Drawing Primitives** - Pixel drawing and text rendering with framebuffer  
🪟 **Multiple Windows** - Create and manage multiple windows simultaneously  
🎯 **Event Handling** - Window close callbacks and resize/redraw detection  
📦 **Zero Dependencies** - Pre-built native binary included, ready to use  
⚡ **Double Buffering** - Smooth, flicker-free rendering with automatic framebuffer

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| Linux (X11) | ✅ **Native** | Direct X11/Xlib bindings |
| Linux (Wayland) | ✅ **Via XWayland** | Automatic compatibility layer |
| Windows | 🔧 **Via WSLg/X Server** | Use VcXsrv, Xming, or WSLg |
| macOS | 🔧 **Via XQuartz** | Install XQuartz X11 server |

*This library provides native X11 support. Other platforms work via X11 compatibility layers.*

## Installation

```bash
bun add notcha
```

**Requirements:**
- Linux: X11 development libraries (`sudo apt install libx11-dev`)
- Other platforms: X11 server (XWayland, WSLg, XQuartz, etc.)

## Quick Start

```typescript
import { App } from "notcha";

// Create and start the app
const app = new App();
app.start();

// Create a window
const window = app.createWindow("Hello Notcha!", 800, 600);
window.open();

// Set background color (renders to framebuffer)
window.setBackground(0xF0F0F0); // Light gray

// Draw pixels (x, y, color) - renders to framebuffer
for (let x = 100; x < 200; x++) {
    for (let y = 100; y < 200; y++) {
        window.draw(x, y, 0xFF0000); // Red square
    }
}

// Write text (x, y, text, color) - renders to framebuffer
window.write(100, 250, "Hello World!", 0x000000);

// Flush framebuffer to screen (required!)
window.flush();

// Handle window close
window.onClose(() => {
    console.log("Window closed!");
});

// Handle window resize/redraw
window.onNewFrame((width, height) => {
    console.log(`Window resized to ${width}x${height}`);
    // Redraw your content here
    window.setBackground(0xF0F0F0);
    window.write(10, 30, `Size: ${width}x${height}`, 0x000000);
    window.flush(); // Don't forget to flush!
});

// Cleanup on exit
process.on('SIGINT', () => {
    app.stop();
    process.exit(0);
});
```

## Framebuffer Rendering

Notcha uses **double buffering** for smooth, flicker-free rendering. All drawing operations (`draw`, `write`, `setBackground`) render to an off-screen framebuffer (pixmap). You must call `window.flush()` to copy the framebuffer to the screen.

```typescript
// ❌ Wrong - nothing appears on screen
window.setBackground(0xFFFFFF);
window.draw(100, 100, 0xFF0000);

// ✅ Correct - renders to screen
window.setBackground(0xFFFFFF);
window.draw(100, 100, 0xFF0000);
window.flush(); // Required!
```

**Benefits:**
- No flickering during complex rendering
- Smooth animations and updates
- Atomic screen updates
- Eliminates tearing during window resize

## API Reference

### App

#### `new App()`
Creates a new application instance.

#### `app.start()`
Initializes the display and starts the event loop (~60 FPS).

#### `app.stop()`
Stops the event loop and closes all windows.

#### `app.createWindow(title?, width?, height?): Window`
Creates a new window with optional title and dimensions.

**Default values:** title = "Notcha", width = 800, height = 600

### Window

#### `window.open()`
Opens and displays the window. Automatically creates the framebuffer.

#### `window.close()`
Closes the window and frees the framebuffer.

#### `window.isOpen(): boolean`
Returns `true` if the window is currently open.

#### `window.setBackground(color: number): Window`
Clears the framebuffer with the specified color. Returns `this` for chaining.

**Note:** Does not update the screen until `flush()` is called.

#### `window.draw(x: number, y: number, color: number): Window`
Draws a pixel to the framebuffer at the specified coordinates. Returns `this` for chaining.

**Note:** Does not update the screen until `flush()` is called.

#### `window.write(x: number, y: number, text: string, color?: number): Window`
Renders text to the framebuffer at the specified position. Default color is black (0x000000). Returns `this` for chaining.

**Note:** Does not update the screen until `flush()` is called.

#### `window.flush(): void`
**Required!** Copies the framebuffer to the screen. Call this after all drawing operations to make them visible.

#### `window.getWidth(): number`
Returns the current window width in pixels.

#### `window.getHeight(): number`
Returns the current window height in pixels.

#### `window.onClose(callback: () => void): Window`
Registers a callback function to be called when the window is closed by the user. Returns `this` for chaining.

#### `window.onNewFrame(callback: (width: number, height: number) => void): Window`
Registers a callback function to be called when the window needs redrawing (resize, expose events). The callback receives the new window dimensions. Returns `this` for chaining.

**Important:** You must redraw your content and call `flush()` inside this callback.

```typescript
window.onNewFrame((width, height) => {
    // Redraw everything
    window.setBackground(0xFFFFFF);
    drawMyContent(width, height);
    window.flush(); // Required!
});
```

### Color Format

Colors are specified as hexadecimal RGB values:

```typescript
const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;
const WHITE = 0xFFFFFF;
const BLACK = 0x000000;
```

## Examples

### Multiple Windows

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const win1 = app.createWindow("Window 1", 400, 300);
const win2 = app.createWindow("Window 2", 400, 300);

win1.open();
win1.setBackground(0xFFEEEE);
win1.write(50, 50, "First Window", 0x000000);
win1.flush();

win2.open();
win2.setBackground(0xEEFFEE);
win2.write(50, 50, "Second Window", 0x000000);
win2.flush();

win1.onClose(() => console.log("Window 1 closed"));
win2.onClose(() => console.log("Window 2 closed"));
```

### Responsive Window with Resize Handling

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Resize Me!", 800, 600);
window.open();

// Initial draw
function drawContent(width: number, height: number) {
    window.setBackground(0xF0F0F0);
    
    // Draw centered text
    const centerX = Math.floor(width / 2) - 40;
    const centerY = Math.floor(height / 2);
    window.write(centerX, centerY, `${width}x${height}`, 0x000000);
    
    // Draw border
    for (let x = 0; x < width; x++) {
        window.draw(x, 0, 0xFF0000);
        window.draw(x, height - 1, 0xFF0000);
    }
    for (let y = 0; y < height; y++) {
        window.draw(0, y, 0xFF0000);
        window.draw(width - 1, y, 0xFF0000);
    }
    
    window.flush();
}

// Draw initial content
drawContent(window.getWidth(), window.getHeight());

// Redraw on resize
window.onNewFrame((width, height) => {
    console.log(`Resized to ${width}x${height}`);
    drawContent(width, height);
});
```

### Animation Loop

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Animation", 800, 600);
window.open();

let x = 0;
const speed = 5;

function animate() {
    if (!window.isOpen()) return;
    
    // Clear and draw
    window.setBackground(0xFFFFFF);
    
    // Draw moving circle (square approximation)
    for (let dx = -10; dx <= 10; dx++) {
        for (let dy = -10; dy <= 10; dy++) {
            if (dx * dx + dy * dy <= 100) {
                window.draw(x + dx, 300 + dy, 0xFF0000);
            }
        }
    }
    
    window.flush();
    
    // Update position
    x = (x + speed) % 800;
    
    setTimeout(animate, 16); // ~60 FPS
}

animate();
```

## Why Notcha?

**Lightweight** - No Electron bloat, just native performance  
**Simple** - Intuitive API, get started in minutes  
**Fast** - Direct system calls via Zig, minimal overhead  
**Smooth** - Double buffering eliminates flicker  
**Responsive** - Built-in resize handling with onNewFrame  
**Cross-Platform** - Works on Linux, Windows (WSLg), macOS (XQuartz)

Perfect for:
- Creating simple GUI applications
- Building custom tools and utilities
- Game development prototypes
- Data visualization
- Real-time graphics applications
- Learning about native graphics programming
- Projects that need native performance without complexity

## Technical Details

### Architecture

```
TypeScript (Bun) → FFI → Zig → X11/Xlib → GPU
```

- **TypeScript/Bun**: High-level API and application logic
- **FFI (dlopen)**: Foreign Function Interface for native calls
- **Zig**: Native X11 bindings and window management
- **X11/Xlib**: Direct system window management
- **Pixmap Framebuffer**: Off-screen rendering for smooth updates

### Performance

- Direct X11 calls with minimal overhead
- Native code compilation via Zig
- Hardware-accelerated rendering via X11
- Automatic pixmap resizing on window dimension changes
- Efficient event processing at ~60 FPS

## Project Structure

```
notcha/
├── src/
│   ├── index.ts            # Main exports
│   ├── app.ts              # App class with event loop
│   ├── window.ts           # Window management class  
│   ├── native.ts           # TypeScript FFI bindings
│   └── native/
│       └── window.zig      # Native X11 + framebuffer implementation
├── zig-out/
│   └── lib/
│       └── libnotcha-window.so  # Compiled native library
├── build.zig               # Zig build configuration
├── build.sh                # Build script
├── test.ts                 # Example/test file
└── package.json
```

## Building from Source

```bash
# Install Zig 0.13+
curl -L https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz | tar -xJ
export PATH=$PATH:$PWD/zig-linux-x86_64-0.13.0

# Build
./build.sh
```

## Contributing

Contributions are welcome! This is a learning project focused on providing a simple, native window management solution.

## License

MIT License - See LICENSE file for details

## Author

Created by [alataq](https://github.com/alataq)

## Changelog

### v0.2.0
- Added framebuffer (double buffering) for flicker-free rendering
- Added `window.flush()` method to update screen
- Added `window.onNewFrame()` callback for resize/redraw handling
- Added `window.getWidth()` and `window.getHeight()` methods
- Improved rendering performance
- Automatic pixmap resize on window dimension changes
- Fixed glitchy rendering during window resize

### v0.1.0
- Initial release
- X11 window creation and management
- Basic drawing primitives (pixels, text)
- Multiple window support
- Window close event handling
- Event loop processing
