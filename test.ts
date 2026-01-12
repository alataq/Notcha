import { App } from "./src/app";

console.log("=== Notcha Multi-Window Test ===\n");

// Create an app instance
console.log("1. Creating app...");
const app = new App();

// Start the app (initializes display)
console.log("2. Starting app (initializing X11 display)...");
app.start();

// Create multiple windows
console.log("3. Creating windows...\n");

const window1 = app.createWindow("Window 1 - Graphics Demo", 800, 600);
const window2 = app.createWindow("Window 2 - Text Demo", 600, 400);
const window3 = app.createWindow("Window 3 - Color Test", 500, 300);

// Set up close callbacks
window1.onClose(() => {
    console.log("→ Window 1 close callback triggered!");
    console.log(`  Remaining windows: ${app.windows.filter(w => w.isOpen()).length}`);
});

window2.onClose(() => {
    console.log("→ Window 2 close callback triggered!");
    console.log(`  Remaining windows: ${app.windows.filter(w => w.isOpen()).length}`);
});

window3.onClose(() => {
    console.log("→ Window 3 close callback triggered!");
    console.log(`  Remaining windows: ${app.windows.filter(w => w.isOpen()).length}`);
});

window1.open();
window2.open();
window3.open();

const BLACK = 0x000000;
const WHITE = 0xFFFFFF;
const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;
const YELLOW = 0xFFFF00;
const MAGENTA = 0xFF00FF;
const CYAN = 0x00FFFF;
const GRAY = 0x808080;
const LIGHT_BLUE = 0xADD8E6;
const LIGHT_GREEN = 0x90EE90;

// ===== WINDOW 1: Graphics Demo =====
function drawWindow1(w: number, h: number) {
    window1.setBackground(0xF0F0F0); // Light gray background
    
    // Draw centered cross
    const centerX = Math.floor(w / 2);
    const centerY = Math.floor(h / 2);
    const lineThickness = 5;
    const lineLength = Math.min(w, h) * 0.6;
    
    // Horizontal line
    for (let y = centerY - lineThickness; y < centerY + lineThickness; y++) {
        for (let x = centerX - lineLength / 2; x < centerX + lineLength / 2; x++) {
            if (x >= 0 && x < w && y >= 0 && y < h) {
                window1.draw(x, y, RED);
            }
        }
    }
    
    // Vertical line
    for (let x = centerX - lineThickness; x < centerX + lineThickness; x++) {
        for (let y = centerY - lineLength / 2; y < centerY + lineLength / 2; y++) {
            if (x >= 0 && x < w && y >= 0 && y < h) {
                window1.draw(x, y, BLUE);
            }
        }
    }
    
    // Draw corner squares (fixed size)
    const squareSize = 90;
    const margin = 10;
    
    // Top-left green
    for (let x = margin; x < margin + squareSize && x < w; x++) {
        for (let y = margin; y < margin + squareSize && y < h; y++) {
            window1.draw(x, y, GREEN);
        }
    }
    
    // Top-right yellow
    if (w > margin + squareSize) {
        for (let x = w - margin - squareSize; x < w - margin; x++) {
            for (let y = margin; y < margin + squareSize && y < h; y++) {
                window1.draw(x, y, YELLOW);
            }
        }
    }
    
    window1.write(centerX - 80, 50, "Graphics Demo Window", BLACK);
    if (h > 100) {
        window1.write(centerX - 60, h - 30, "Colorful pixels!", BLUE);
    }
    window1.flush();
}

console.log("4. Window 1 - Drawing graphics...");
drawWindow1(window1.getWidth(), window1.getHeight());

window1.onNewFrame((width, height) => {
    console.log(`→ Window 1 resized/redrawn: ${width}x${height}`);
    drawWindow1(width, height);
});

// ===== WINDOW 2: Text Demo =====
function drawWindow2(w: number, h: number) {
    window2.setBackground(LIGHT_BLUE);
    
    const centerX = Math.floor(w / 2) - 100;
    let yPos = 50;
    const lineHeight = 50;
    
    window2.write(centerX, yPos, "Hello from Notcha!", BLACK);
    yPos += lineHeight;
    
    if (h > yPos) {
        window2.write(centerX, yPos, "Multiple windows work!", RED);
        yPos += lineHeight;
    }
    
    if (h > yPos) {
        window2.write(centerX, yPos, "Text rendering test", GREEN);
        yPos += lineHeight;
    }
    
    if (h > yPos) {
        window2.write(centerX, yPos, "Using X11 via Zig", BLUE);
        yPos += lineHeight;
    }
    
    if (h > yPos) {
        window2.write(centerX, yPos, "Powered by Bun + TypeScript", MAGENTA);
        yPos += lineHeight;
    }
    
    if (h > yPos + 50) {
        window2.write(centerX, yPos + 50, "Press Ctrl+C to exit", GRAY);
    }
    
    // Draw decorative line centered
    const lineY = Math.floor(h * 0.75);
    if (lineY < h - 10) {
        for (let i = 0; i < w; i += 20) {
            for (let j = 0; j < 10; j++) {
                if (i + j < w) {
                    window2.draw(i + j, lineY, CYAN);
                }
            }
        }
    }
    window2.flush();
}

console.log("\n5. Window 2 - Writing text...");
drawWindow2(window2.getWidth(), window2.getHeight());

window2.onNewFrame((width, height) => {
    console.log(`→ Window 2 resized/redrawn: ${width}x${height}`);
    drawWindow2(width, height);
});

// ===== WINDOW 3: Color Test =====
function drawWindow3(w: number, h: number) {
    window3.setBackground(WHITE);
    
    const centerX = Math.floor(w / 2);
    window3.write(centerX - 50, 30, "Color Palette", BLACK);
    
    const colors = [
        { name: "Red", color: RED },
        { name: "Green", color: GREEN },
        { name: "Blue", color: BLUE },
        { name: "Yellow", color: YELLOW },
        { name: "Cyan", color: CYAN },
        { name: "Magenta", color: MAGENTA },
    ];
    
    const barWidth = 150;
    const barHeight = 20;
    const startX = Math.max(10, centerX - 100);
    let yPos = 80;
    
    for (const { name, color } of colors) {
        if (yPos + barHeight > h) break;
        
        // Draw color bar
        for (let x = startX; x < startX + barWidth && x < w - 80; x++) {
            for (let y = yPos; y < yPos + barHeight; y++) {
                window3.draw(x, y, color);
            }
        }
        
        // Draw label
        if (startX + barWidth + 20 < w) {
            window3.write(startX + barWidth + 20, yPos + 15, name, BLACK);
        }
        yPos += 30;
    }
    window3.flush();
}

console.log("\n6. Window 3 - Color gradient...");
drawWindow3(window3.getWidth(), window3.getHeight());

window3.onNewFrame((width, height) => {
    console.log(`→ Window 3 resized/redrawn: ${width}x${height}`);
    drawWindow3(width, height);
});

console.log("\n✓ Test completed successfully!");
console.log("✓ 3 windows created with graphics and text");
console.log("✓ Try closing individual windows - callbacks will trigger");
console.log("✓ App will stop when all windows are closed");
console.log("✓ Or press Ctrl+C to exit\n");

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log("\nCleaning up...");
    app.stop();
    console.log("✓ Shutdown complete");
    process.exit(0);
});
