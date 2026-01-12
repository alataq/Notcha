# Notcha

> A lightweight window management library for Linux using X11 bindings via Zig and TypeScript

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://www.npmjs.com/package/notcha)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

✨ **Simple API** - Easy-to-use TypeScript interface for window management  
🚀 **Native Performance** - Direct X11 bindings via Zig (no Electron bloat)  
🎨 **Drawing Primitives** - Pixel drawing and text rendering  
🪟 **Multiple Windows** - Create and manage multiple windows simultaneously  
🎯 **Event Handling** - Window close callbacks and event processing  
📦 **Zero Dependencies** - Pre-built native binary included, ready to use

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

// Set background color
window.setBackground(0xF0F0F0); // Light gray

// Draw pixels (x, y, color)
for (let x = 100; x < 200; x++) {
    for (let y = 100; y < 200; y++) {
        window.draw(x, y, 0xFF0000); // Red square
    }
}

// Write text (x, y, text, color)
window.write(100, 250, "Hello World!", 0x000000);

// Handle window close
window.onClose(() => {
    console.log("Window closed!");
});

// Cleanup on exit
process.on('SIGINT', () => {
    app.stop();
    process.exit(0);
});
```

## API Reference

### App

#### `new App()`
Creates a new application instance.

#### `app.start()`
Initializes the display and starts the event loop.

#### `app.stop()`
Stops the event loop and closes all windows.

#### `app.createWindow(title?, width?, height?): Window`
Creates a new window with optional title and dimensions.

### Window

#### `window.open()`
Opens and displays the window.

#### `window.close()`
Closes the window.

#### `window.isOpen(): boolean`
Returns `true` if the window is currently open.

#### `window.setBackground(color: number): Window`
Sets the window background color. Returns `this` for chaining.

#### `window.draw(x: number, y: number, color: number): Window`
Draws a pixel at the specified coordinates with the given color. Returns `this` for chaining.

#### `window.write(x: number, y: number, text: string, color?: number): Window`
Renders text at the specified position. Default color is black (0x000000). Returns `this` for chaining.

#### `window.onClose(callback: () => void): Window`
Registers a callback function to be called when the window is closed. Returns `this` for chaining.

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

win1.open().setBackground(0xFFEEEE);
win2.open().setBackground(0xEEFFEE);

win1.onClose(() => console.log("Window 1 closed"));
win2.onClose(() => console.log("Window 2 closed"));
```

### Drawing Graphics

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Graphics", 800, 600);
window.open().setBackground(0xFFFFFF);

// Draw a red rectangle
for (let x = 100; x < 300; x++) {
    for (let y = 100; y < 200; y++) {
        window.draw(x, y, 0xFF0000);
    }
}

// Draw a blue circle (approximate)
}
```

## Why Notcha?

**Lightweight** - No Electron bloat, just native performance  
**Simple** - Intuitive API, get started in minutes  
**Fast** - Direct system calls via Zig, minimal overhead  
**Cross-Platform** - Write once, run on Linux and Windows  

Perfect for:
- Creating simple GUI applications
- Building custom tools and utilities
- Game development prototypes
- Learning about native graphics programming
- Projects that need native performance without complexity

## Project Structure

```
notcha/
├── src/
│   ├── index.ts            # Main exports
│   ├── app.ts              # App class
│   ├── window.ts           # Window management class  
│   ├── native.ts           # TypeScript FFI bindings
│   └── native/
│       └── window.zig      # Native X11 implementation
├── build.zig               # Zig build configuration
├── build.sh                # Build script
├── test.ts                 # Example/test file
└── package.json
```

## Roadmap

### v0.1 (Current)
- ✅ X11 native support
- ✅ XWayland compatibility
- ✅ Basic window creation and management
- ✅ Pixel drawing
- ✅ Text rendering (8x8 bitmap font)
- ✅ Multiple window support
- ✅ Window close events

### v0.2 (Planned)
- 🚧 Window resize support

### v0.3 (Planned)
- 🚧 Mouse and keyboard event handling

## Development

To build from source:

```bash
# Install dependencies
sudo apt install libx11-dev

# Build the native library
./build.sh

# Run tests
bun run test
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- Native bindings via [Zig](https://ziglang.org) - General-purpose programming language
- X11/Xlib for native windowing on Linux

---

**Note:** This is an experimental project in early development. APIs may change before v1.0.
