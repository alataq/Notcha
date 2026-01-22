# Notcha

> A lightweight window management library for Linux using X11 bindings via Zig and TypeScript

[![Version](https://img.shields.io/badge/version-0.7.2-blue.svg)](https://www.npmjs.com/package/notcha)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features

✨ **Simple API** - Easy-to-use TypeScript interface for window management  
🚀 **Native Performance** - Direct X11 bindings via Zig (no Electron bloat)  
🎨 **Drawing Primitives** - Pixel drawing and text rendering with framebuffer  
🪟 **Multiple Windows** - Create and manage multiple windows simultaneously  
🎯 **Event Handling** - Window close callbacks and resize/redraw detection  
⌨️ **Keyboard Input** - Full keyboard event support with focus tracking  
🖱️ **Mouse Input** - Complete mouse support (clicks, movement, scroll)  
🔊 **Sound Support** - Audio playback with ALSA (beeps, tones, custom sounds)  
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
- Linux: X11, ALSA, and libsndfile development libraries (`sudo apt install libx11-dev libasound2-dev libsndfile1-dev`)
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

#### `window.write(x: number, y: number, text: string, color?: number, size?: number): Window`
Renders text to the framebuffer at the specified position. Default color is black (0x000000). Size can be 1 (small/12px), 2 (medium/14px, default), 3 (large/18px), or 4 (xlarge/24px). Returns `this` for chaining.

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

#### `window.isFocused(): boolean`
Returns `true` if this window currently has keyboard focus.

```typescript
if (window.isFocused()) {
    console.log("Window has focus!");
}
```

#### `app.getFocusedWindow(): Window | null`
Returns the currently focused window, or `null` if no window has focus.

```typescript
const focused = app.getFocusedWindow();
if (focused) {
    console.log("Focused window:", focused.title);
}
```

### Keyboard

Notcha supports both global keyboard events (via `app.keyboard`) and per-window keyboard events (via `window.keyboard`). Per-window events only fire when that specific window has focus, making it easy to handle keyboard input for individual windows.

### Mouse

Notcha provides full mouse support with both global mouse events (via `app.mouse`) and per-window mouse events (via `window.mouse`). Per-window events only fire when that specific window has focus, making it easy to handle mouse input for individual windows.

#### Per-Window Keyboard (Recommended)

#### `window.keyboard.onKeyPress(callback: (event: KeyEvent) => void): void`
Registers a callback for key press events on this specific window. Only fires when this window is focused.

```typescript
window.keyboard.onKeyPress((event) => {
    console.log(`Key pressed in this window: ${event.key}`);
});
```

#### `window.keyboard.onKeyRelease(callback: (event: KeyEvent) => void): void`
Registers a callback for key release events on this specific window.

```typescript
window.keyboard.onKeyRelease((event) => {
    console.log(`Key released in this window: ${event.key}`);
});
```

#### Global Keyboard Events

The `app.keyboard` property provides access to global keyboard events across all windows.

#### `app.keyboard.onKeyPress(callback: (event: KeyEvent) => void): void`
Registers a callback for key press events across all windows.

```typescript
app.keyboard.onKeyPress((event) => {
    console.log(`Key pressed: ${event.key}`);
});
```

#### `app.keyboard.onKeyRelease(callback: (event: KeyEvent) => void): void`
Registers a callback for key release events across all windows.

```typescript
app.keyboard.onKeyRelease((event) => {
    console.log(`Key released: ${event.key}`);
});
```

#### `KeyEvent` Interface

```typescript
interface KeyEvent {
    keycode: number;  // X11 keycode
    keysym: number;   // X11 keysym
    state: number;    // Modifier state
    pressed: boolean; // true for press, false for release
    key: string;      // Human-readable key name
}
```

**Key names include:**
- Letters: `"a"`, `"b"`, `"c"`, etc.
- Numbers: `"1"`, `"2"`, `"3"`, etc.
- Special keys: `"Enter"`, `"Escape"`, `"Tab"`, `"Space"`, `"Backspace"`
- Arrows: `"Up"`, `"Down"`, `"Left"`, `"Right"`
- Function keys: `"F1"` through `"F12"`
- Modifiers: `"Shift"`, `"Control"`, `"Alt"`, `"Meta"`
- Other: `"Delete"`, `"Home"`, `"End"`, `"PageUp"`, `"PageDown"`, `"Insert"`, `"CapsLock"`

#### Per-Window Mouse (Recommended)

#### `window.mouse.onMousePress(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse button press events on this specific window. Only fires when this window is focused.

```typescript
window.mouse.onMousePress((event) => {
    console.log(`Mouse pressed: ${event.button} at (${event.x}, ${event.y})`);
});
```

#### `window.mouse.onMouseRelease(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse button release events on this specific window.

```typescript
window.mouse.onMouseRelease((event) => {
    console.log(`Mouse released: ${event.button} at (${event.x}, ${event.y})`);
});
```

#### `window.mouse.onMouseMove(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse movement events on this specific window.

```typescript
window.mouse.onMouseMove((event) => {
    console.log(`Mouse moved to (${event.x}, ${event.y})`);
});
```

#### `window.mouse.onScroll(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse scroll events on this specific window.

```typescript
window.mouse.onScroll((event) => {
    const direction = event.button === 4 ? "up" : "down";
    console.log(`Mouse scrolled ${direction} at (${event.x}, ${event.y})`);
});
```

#### Global Mouse Events

The `app.mouse` property provides access to global mouse events across all windows.

#### `app.mouse.onMousePress(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse button press events across all windows.

#### `app.mouse.onMouseRelease(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse button release events across all windows.

#### `app.mouse.onMouseMove(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse movement events across all windows.

#### `app.mouse.onScroll(callback: (event: MouseEvent) => void): void`
Registers a callback for mouse scroll events across all windows.

#### `MouseEvent` Interface

```typescript
interface MouseEvent {
    eventType: MouseEventType; // Press, Release, Move, or Scroll
    button: MouseButton;       // Left, Middle, Right, ScrollUp, ScrollDown
    x: number;                 // X coordinate relative to window
    y: number;                 // Y coordinate relative to window
    windowHandle: number;      // Window that received the event
}

enum MouseButton {
    Left = 1,
    Middle = 2,
    Right = 3,
    ScrollUp = 4,
    ScrollDown = 5
}

enum MouseEventType {
    Press = 0,
    Release = 1,
    Move = 2,
    Scroll = 3
}
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

### Text Sizes

Text can be rendered in 4 different sizes:

```typescript
window.write(10, 10, "Small text", 0x000000, 1);   // Size 1: 12px
window.write(10, 30, "Medium text", 0x000000, 2);  // Size 2: 14px (default)
window.write(10, 55, "Large text", 0x000000, 3);   // Size 3: 18px
window.write(10, 85, "XLarge text", 0x000000, 4);  // Size 4: 24px
```

## Menu API

Notcha provides native menu bar support with dropdown menus. Menus are rendered directly in the window framebuffer and provide a familiar desktop application experience.

### Creating Menus

```typescript
import { type Menu } from "notcha";

const fileMenu: Menu = {
    label: "File",
    items: [
        { label: "New", action: () => console.log("New") },
        { label: "Open", action: () => console.log("Open") },
        { separator: true },
        { label: "Exit", action: () => window.close() },
    ]
};

// Add menu to window
window.addMenu(fileMenu);

// Draw menu bar in your draw function
function draw(width, height) {
    window.setBackground(0xFFFFFF);
    
    // Always draw menu bar first
    window.drawMenuBar();
    
    // Draw content below menu bar
    const menuHeight = window.getMenuBarHeight(); // Usually 30px
    window.write(20, menuHeight + 20, "Content", 0x000000);
    
    window.flush();
}
```

### Menu Structure

#### Menu Interface
```typescript
interface Menu {
    label: string;       // Menu title shown in menu bar
    items: MenuItem[];   // Dropdown items
}
```

#### MenuItem Interface
```typescript
interface MenuItem {
    label: string;              // Item text
    action?: () => void;        // Callback when clicked
    separator?: boolean;        // Draw separator line
    enabled?: boolean;          // Disabled items are grayed out
    submenu?: MenuItem[];       // Nested submenu (coming soon)
}
```

### Menu Methods

#### `window.addMenu(menu: Menu): void`
Adds a menu to the window's menu bar.

```typescript
window.addMenu({
    label: "Edit",
    items: [
        { label: "Undo", action: () => undo() },
        { label: "Redo", action: () => redo() },
    ]
});
```

#### `window.drawMenuBar(): void`
Renders the menu bar. Call this in your draw function.

```typescript
function draw(width, height) {
    window.setBackground(0xFFFFFF);
    window.drawMenuBar(); // Draw menu first
    // ... rest of your drawing
    window.flush();
}
```

#### `window.getMenuBarHeight(): number`
Returns the height of the menu bar (usually 30px) to offset your content.

```typescript
const menuHeight = window.getMenuBarHeight();
const contentStartY = menuHeight + 10;
```

### Menu Features

- **Hover Effects**: Menu items highlight on mouse hover
- **Click to Open**: Click menu title to show dropdown
- **Click to Close**: Click outside or select item to close
- **Separators**: Visual dividers between menu sections
- **Disabled Items**: Gray out items that can't be used
- **Non-Blocking**: Menus work with your event loop

### Complete Menu Example

```typescript
import { App, type Menu } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Menu Example", 600, 400);

// Define menus
const fileMenu: Menu = {
    label: "File",
    items: [
        { label: "New", action: () => console.log("New file") },
        { label: "Open", action: () => console.log("Open file") },
        { label: "Save", action: () => console.log("Save file") },
        { separator: true },
        { label: "Disabled Item", enabled: false },
        { separator: true },
        { label: "Exit", action: () => window.close() },
    ]
};

const editMenu: Menu = {
    label: "Edit",
    items: [
        { label: "Cut", action: () => console.log("Cut") },
        { label: "Copy", action: () => console.log("Copy") },
        { label: "Paste", action: () => console.log("Paste") },
    ]
};

// Add menus
window.addMenu(fileMenu);
window.addMenu(editMenu);

// Draw function
function draw(width, height) {
    window.setBackground(0xFAFAFA);
    window.drawMenuBar();
    
    const menuHeight = window.getMenuBarHeight();
    window.write(20, menuHeight + 20, "My Application", 0x000000, 3);
    
    window.flush();
}

window.onNewFrame((width, height) => draw(width, height));
window.open();
draw(window.getWidth(), window.getHeight());
```

## Sound API

Notcha provides audio playback support via ALSA (Advanced Linux Sound Architecture). The sound system generates tones programmatically using sine wave synthesis.

### Initialization

The sound system is automatically initialized when you call `app.start()`. If audio initialization fails (e.g., no sound hardware), the app will continue to run but sound playback will not be available.

```typescript
const app = new App();
app.start(); // Automatically initializes sound

// Check if sound is available
if (app.sound.isInitialized()) {
    console.log("Sound system ready!");
}
```

### Sound Methods

#### `app.sound.beep(): void`
Plays a standard beep sound (440 Hz, 200ms, medium volume).

```typescript
app.sound.beep(); // Standard beep sound
```

#### `app.sound.click(): void`
Plays a short click sound (1000 Hz, 50ms, low volume).

```typescript
app.sound.click(); // UI click feedback
```

#### `app.sound.success(): void`
Plays a success/confirmation sound (600 Hz, 150ms, medium volume).

```typescript
app.sound.success(); // Success notification
```

#### `app.sound.error(): void`
Plays an error/alert sound (200 Hz, 300ms, higher volume).

```typescript
app.sound.error(); // Error notification
```

#### `app.sound.playTone(frequency: number, duration: number, volume?: number): void`
Plays a custom tone with specified frequency and duration.

```typescript
// Play a custom tone
app.sound.playTone(880, 500, 0.5); // 880 Hz, 500ms, 50% volume

// Volume is optional (default: 0.5, range: 0.0 to 1.0)
app.sound.playTone(440, 1000); // 440 Hz, 1000ms, default volume
```

#### `app.sound.isInitialized(): boolean`
Checks if the sound system is initialized and ready.

```typescript
if (app.sound.isInitialized()) {
    app.sound.beep();
} else {
    console.log("Sound not available");
}
```

#### `app.sound.playFile(pathOrUrl: string): Promise<boolean>`
Plays an audio file from the filesystem or downloads and plays from a URL.
Supports WAV, OGG, FLAC, MP3, and other formats via libsndfile.

```typescript
// Play local file
await app.sound.playFile("/path/to/audio.wav");

// Play from URL (automatically downloads)
await app.sound.playFile("https://example.com/sound.wav");

// Handle success/failure
const success = await app.sound.playFile("https://example.com/audio.ogg");
if (success) {
    console.log("Audio played successfully");
} else {
    console.error("Failed to play audio");
}
```

### Sound Example

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Sound Demo", 400, 300);
window.open();

window.setBackground(0xFFFFFF);
window.write(50, 100, "Click to play sound!", 0x000000);
window.flush();

// Play beep on mouse click
window.mouse.onMousePress((event) => {
    if (event.button === 1) { // Left click
        app.sound.beep();
    }
});
```

### Audio Specifications

- **Sample Rate**: 44100 Hz (CD quality)
- **Format**: 16-bit signed PCM
- **Channels**: 2 (stereo)
- **Buffer Size**: 1024 frames
- **Synthesis**: Real-time sine wave generation
- **File Formats**: WAV, OGG, FLAC, MP3, and more via libsndfile

### Platform Requirements

- Linux with ALSA support (most Linux distributions)
- `libasound2-dev` and `libsndfile1-dev` packages for building from source
- Audio hardware/driver configured

## Scrollbar API

Notcha provides automatic scrollbar support for windows with content that exceeds the visible area. When enabled, a vertical scrollbar appears on the right edge of the window, allowing users to scroll through content using the mouse wheel, dragging the scrollbar thumb, or clicking on the track.

### Quick Start

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Scrolling Content", 600, 400);

// Enable scrolling BEFORE opening the window
window.enableScrolling();

function draw(width, height) {
    const scrollOffset = window.getScrollOffset();
    const visibleWidth = window.getVisibleWidth();
    const menuHeight = window.getMenuBarHeight();
    
    window.setBackground(0xFFFFFF);
    
    // Draw content with scroll offset
    let yPos = menuHeight + 20;
    for (let i = 0; i < 50; i++) {
        const itemY = yPos + (i * 40) - scrollOffset;
        
        // Only draw if visible
        if (itemY >= menuHeight && itemY < height) {
            window.write(20, itemY, `Item #${i + 1}`, 0x000000);
        }
    }
    
    // Update content height for scrollbar calculation
    const totalContentHeight = menuHeight + 20 + (50 * 40) + 20;
    window.setContentHeight(totalContentHeight);
    
    // Draw scrollbar (if content exceeds window height)
    window.drawScrollbar();
    
    // Draw menu bar last
    window.drawMenuBar();
    
    window.flush();
}

window.onNewFrame((width, height) => draw(width, height));
window.open();
draw(window.getWidth(), window.getHeight());
```

### Scrollbar Methods

#### `window.enableScrolling(): void`
Enables scrollbar support for the window. Must be called **before** `window.open()`.

```typescript
const window = app.createWindow("My Window", 600, 400);
window.enableScrolling(); // Enable before opening
window.open();
```

#### `window.setContentHeight(height: number): void`
Sets the total height of your content. Call this in your draw function after calculating the full content height. The scrollbar will automatically appear if content height exceeds the visible window height.

```typescript
const totalContentHeight = menuHeight + items.length * itemHeight + padding;
window.setContentHeight(totalContentHeight);
```

#### `window.getScrollOffset(): number`
Returns the current vertical scroll offset in pixels. Use this to offset your content drawing.

```typescript
const scrollOffset = window.getScrollOffset();
const actualY = originalY - scrollOffset; // Apply offset to Y positions
```

#### `window.getVisibleWidth(): number`
Returns the visible width of the content area (window width minus scrollbar width if scrollbar is visible). Use this instead of `window.getWidth()` when positioning content.

```typescript
const visibleWidth = window.getVisibleWidth(); // Width minus 12px if scrolling
window.write(visibleWidth - 100, y, "Right-aligned", 0x000000);
```

#### `window.drawScrollbar(): void`
Draws the scrollbar. Call this in your draw function **after** drawing your content but **before** `window.flush()`.

```typescript
function draw(width, height) {
    // ... draw content ...
    window.drawScrollbar(); // Draw scrollbar on top
    window.flush();
}
```

### Scrollbar Features

- **Automatic Appearance**: Scrollbar only appears when content height exceeds window height
- **Mouse Wheel Scrolling**: Scroll content using mouse wheel (20px per scroll event)
- **Drag Scrollbar Thumb**: Click and drag the scrollbar thumb to scroll
- **Click Track to Jump**: Click anywhere on the scrollbar track to jump to that position
- **Visual Feedback**: Thumb changes color on hover and when being dragged
- **Bounds Checking**: Automatic clamping to prevent scrolling beyond content
- **Menu Bar Integration**: Scrollbar automatically accounts for menu bar height
- **12px Width**: Scrollbar is 12 pixels wide, positioned at the right edge
- **30px Minimum Thumb**: Scrollbar thumb has a minimum height of 30 pixels

### Scrollbar Colors

```typescript
// Default colors (customizable in source)
const TRACK_COLOR = 0xE0E0E0;        // Light gray track
const THUMB_COLOR = 0xA0A0A0;        // Gray thumb (normal)
const THUMB_HOVER_COLOR = 0x808080;  // Darker gray (hover)
const THUMB_ACTIVE_COLOR = 0x606060; // Darkest gray (dragging)
```

### Complete Scrollbar Example

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Scroll Demo", 600, 400);
window.enableScrolling();

window.addMenu({
    label: "File",
    items: [
        { label: "Exit", action: () => window.close() }
    ]
});

const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

function draw(width, height) {
    const scrollOffset = window.getScrollOffset();
    const visibleWidth = window.getVisibleWidth();
    const menuHeight = window.getMenuBarHeight();
    
    window.setBackground(0xFFFFFF);
    
    // Draw items
    const itemHeight = 40;
    const padding = 20;
    let yPos = menuHeight + padding;
    
    for (let i = 0; i < items.length; i++) {
        const itemY = yPos + (i * itemHeight) - scrollOffset;
        
        // Only draw visible items
        if (itemY + itemHeight >= menuHeight && itemY < height) {
            // Background
            const bgColor = i % 2 === 0 ? 0xF0F0F0 : 0xFFFFFF;
            for (let x = 20; x < visibleWidth - 20; x++) {
                for (let y = itemY; y < itemY + itemHeight - 5 && y < height; y++) {
                    if (y >= menuHeight) {
                        window.draw(x, y, bgColor);
                    }
                }
            }
            
            // Text
            window.write(40, itemY + 12, items[i], 0x000000, 2);
        }
    }
    
    // Set content height
    const totalHeight = menuHeight + padding + (items.length * itemHeight) + padding;
    window.setContentHeight(totalHeight);
    
    // Draw scrollbar
    window.drawScrollbar();
    
    // Draw menu bar
    window.drawMenuBar();
    
    window.flush();
}

window.onNewFrame((width, height) => draw(width, height));
window.open();
draw(window.getWidth(), window.getHeight());
```

### Best Practices

1. **Call `enableScrolling()` before `open()`**: Scrollbar must be enabled before opening the window
2. **Apply scroll offset to Y positions**: Subtract `getScrollOffset()` from all Y coordinates
3. **Use `getVisibleWidth()` for layout**: Account for scrollbar width when positioning content
4. **Update content height dynamically**: Call `setContentHeight()` whenever content changes
5. **Optimize rendering**: Only draw items that are visible in the viewport
6. **Draw order**: Content → Scrollbar → Menu Bar → Flush

## System Utilities

The `System` class provides static methods for accessing system information and screen dimensions.

### Screen Information

```typescript
import { System } from "notcha";

// Get screen dimensions
const width = System.getScreenWidth();   // e.g., 1920
const height = System.getScreenHeight(); // e.g., 1080

// Or get both at once
const { width, height } = System.getScreenSize();
console.log(`Screen: ${width}x${height}`);
```

### OS and Environment Information

```typescript
// Get OS platform
const os = System.getOS(); // 'linux', 'darwin', 'win32', etc.

// Get detailed OS info
const osInfo = System.getOSInfo();
console.log(osInfo.platform);  // e.g., 'linux'
console.log(osInfo.type);      // e.g., 'Linux'
console.log(osInfo.release);   // e.g., '5.15.0-91-generic'
console.log(osInfo.arch);      // e.g., 'x64'
console.log(osInfo.hostname);  // e.g., 'my-laptop'

// Check display server
const display = System.getDisplayServer(); // 'x11', 'wayland', or 'unknown'
const isX11 = System.isX11();              // true if running under X11
const isWayland = System.isWayland();      // true if running under Wayland

// Get desktop environment (Linux only)
const de = System.getDesktopEnvironment(); // 'gnome', 'kde', 'xfce', etc.
```

### Memory and CPU Information

```typescript
// Get memory info (in bytes)
const memory = System.getMemoryInfo();
console.log(`Total: ${(memory.total / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`Free: ${(memory.free / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`Used: ${(memory.used / 1024 / 1024 / 1024).toFixed(2)} GB`);

// Get CPU information
const cpus = System.getCPUInfo();
console.log(`CPU Cores: ${cpus.length}`);
console.log(`Model: ${cpus[0].model}`);

// Get system uptime (in seconds)
const uptime = System.getUptime();
console.log(`Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`);
```

### Practical Use Cases

```typescript
// Center a window on screen
const screenSize = System.getScreenSize();
const windowWidth = 800;
const windowHeight = 600;

const x = Math.floor((screenSize.width - windowWidth) / 2);
const y = Math.floor((screenSize.height - windowHeight) / 2);

// Position window at calculated coordinates
// (Note: X11 window positioning handled by window manager)

// Display system info in about dialog
const info = System.getOSInfo();
const de = System.getDesktopEnvironment();
window.write(20, 40, `OS: ${info.type} ${info.release}`, 0x000000);
window.write(20, 65, `DE: ${de}`, 0x000000);
window.write(20, 90, `Screen: ${System.getScreenWidth()}x${System.getScreenHeight()}`, 0x000000);
```

## Examples

### Keyboard Input (Per-Window)

```typescript
import { App } from "notcha";

const app = new App();
app.start();

const window = app.createWindow("Keyboard Test", 600, 400);
window.open();

let keys: string[] = [];

// Listen to keyboard events for this specific window
window.keyboard.onKeyPress((event) => {
    keys.push(`[DOWN] ${event.key}`);
    if (keys.length > 10) keys.shift();
    
    // Redraw with new key list
    window.setBackground(0xFFFFFF);
    window.write(20, 40, "Recent Keys:", 0x000000);
    
    let y = 70;
    for (const key of keys) {
        window.write(40, y, key, 0x0000FF);
        y += 25;
    }
    
    window.flush();
});

window.keyboard.onKeyRelease((event) => {
    console.log(`Key released: ${event.key}`);
});
```

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

### v0.7.2
- Added `System` class with static utility methods for system information
- Added `System.getScreenWidth()` and `System.getScreenHeight()` for screen dimensions
- Added `System.getScreenSize()` to get width and height together
- Added `System.getOS()` and `System.getOSInfo()` for operating system details
- Added `System.getDisplayServer()` to detect X11 or Wayland
- Added `System.isX11()` and `System.isWayland()` helpers
- Added `System.getDesktopEnvironment()` to detect DE (GNOME, KDE, etc.)
- Added `System.getMemoryInfo()` for RAM statistics
- Added `System.getCPUInfo()` for processor information
- Added `System.getUptime()` for system uptime
- System info now displayed in test suite startup

### v0.7.1
- **Performance Optimizations:**
  - Added `window.fillRect()` for fast rectangle drawing using native X11 XFillRectangle
  - Optimized menu bar rendering: replaced pixel-by-pixel loops with fillRect (10-100x faster)
  - Optimized scrollbar rendering: replaced nested loops with fillRect (10-100x faster)
  - Optimized mouse event processing: coalesces consecutive mouse move events to prevent redundant redraws
  - Dramatically improved scrollbar drag responsiveness by eliminating event queue backlog
- **API Additions:**
  - Added `fillRect(x, y, width, height, color)` method to Window class for optimized rectangle drawing
- **Developer Experience:**
  - Scroll demo now renders much faster with optimized drawing
  - Menu interactions feel more responsive with reduced overdraw

### v0.7.0
- Added automatic scrollbar support for windows with overflowing content
- Added `window.enableScrolling()` to enable scrollbar before opening window
- Added `window.setContentHeight(height)` to specify total content height
- Added `window.getScrollOffset()` to get current scroll position
- Added `window.getVisibleWidth()` to get width accounting for scrollbar
- Added `window.drawScrollbar()` to render scrollbar in draw function
- Scrollbar automatically appears when content exceeds window height
- Mouse wheel scrolling support (20px per scroll event)
- Drag scrollbar thumb to scroll (visual feedback with hover/active states)
- Click scrollbar track to jump to position
- 12px wide vertical scrollbar with 30px minimum thumb height
- Scrollbar integrates with menu bar system
- Added scroll demo showcasing 50-item scrolling list

### v0.6.0
- Added menu bar and dropdown menu system
- Added `window.setMenu(menus)` API for creating application menus
- Menu bars render at top of window (30px fixed height)
- Dropdown menus open on menu title click
- Menu items support hover effects and action callbacks
- Support for disabled menu items (grayed out, non-interactive)
- Support for menu separators (horizontal divider lines)
- Custom framebuffer-based rendering (no native X11 menus)
- Mouse event routing for menu interaction
- Added menu demo showcasing File/Edit/Help menus

### v0.5.1
- Added audio file playback support with `app.sound.playFile(pathOrUrl)`
- Supports local files and HTTP/HTTPS URLs (auto-downloads)
- Supports WAV, OGG, FLAC, MP3, and more via libsndfile
- Automatic format detection and decoding
- Automatic mono-to-stereo conversion
- Updated sound demo with internet audio examples
- Requires `libsndfile1-dev` for building from source

### v0.5.0
- Added audio playback support via ALSA (Advanced Linux Sound Architecture)
- Added `app.sound` API for sound playback
- Four preset sounds: `beep()`, `click()`, `success()`, `error()`
- Custom tone generation with `playTone(frequency, duration, volume)`
- Real-time sine wave synthesis (44.1kHz, 16-bit stereo)
- Non-fatal audio initialization - app runs without sound hardware
- Requires `libasound2-dev` for building from source

### v0.4.1
- Added variable text size support with `window.write()` size parameter
- Four text sizes available: 1 (small/12px), 2 (medium/14px), 3 (large/18px), 4 (xlarge/24px)
- Size parameter is optional, defaults to 2 (medium)
- Uses X11 fixed fonts for consistent rendering
- Updated text demo to showcase all text sizes

### v0.4.0
- Added full mouse event support (Press, Release, Move, Scroll)
- Added per-window mouse handling with `window.mouse` API
- Added global mouse handling with `app.mouse` API
- Mouse events include button identification (Left, Middle, Right, ScrollUp, ScrollDown)
- Mouse events include position coordinates relative to window
- Circular event queue prevents mouse event loss during rapid movement
- Events only captured when window has focus
- Support for all standard mouse buttons and scroll wheel

### v0.3.1
- Added per-window keyboard event handling with `window.keyboard.onKeyPress()` and `window.keyboard.onKeyRelease()`
- Keyboard events now only fire for the focused window when using per-window handlers
- Global `app.keyboard` handlers still available for backward compatibility
- Improved keyboard event dispatching for multi-window applications

### v0.3.0
- Added full keyboard event support (KeyPress, KeyRelease)
- Added focus tracking with `window.isFocused()` and `app.getFocusedWindow()`
- Added `app.keyboard.onKeyPress()` and `app.keyboard.onKeyRelease()` API
- Keyboard events include human-readable key names
- Support for all common keys (letters, numbers, arrows, function keys, modifiers)
- Circular event queue prevents event loss during rapid typing
- Events only captured when window has focus

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
