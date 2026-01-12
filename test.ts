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
console.log("4. Window 1 - Drawing graphics...");
window1.setBackground(0xF0F0F0); // Light gray background

// Draw thick colored lines
console.log("   - Drawing colored cross...");
for (let y = 295; y < 305; y++) {
    for (let x = 100; x < 700; x++) {
        window1.draw(x, y, RED);
    }
}
for (let x = 395; x < 405; x++) {
    for (let y = 100; y < 500; y++) {
        window1.draw(x, y, BLUE);
    }
}

// Draw colored rectangles
console.log("   - Drawing corner squares...");
for (let x = 10; x < 100; x++) {
    for (let y = 10; y < 100; y++) {
        window1.draw(x, y, GREEN);
    }
}
for (let x = 700; x < 790; x++) {
    for (let y = 10; y < 100; y++) {
        window1.draw(x, y, YELLOW);
    }
}

window1.write(300, 50, "Graphics Demo Window", BLACK);
window1.write(320, 570, "Colorful pixels!", BLUE);

// ===== WINDOW 2: Text Demo =====
console.log("\n5. Window 2 - Writing text...");
window2.setBackground(LIGHT_BLUE);

window2.write(50, 50, "Hello from Notcha!", BLACK);
window2.write(50, 100, "Multiple windows work!", RED);
window2.write(50, 150, "Text rendering test", GREEN);
window2.write(50, 200, "Using X11 via Zig", BLUE);
window2.write(50, 250, "Powered by Bun + TypeScript", MAGENTA);
window2.write(50, 350, "Press Ctrl+C to exit", GRAY);

// Draw some decorative pixels
for (let i = 0; i < 600; i += 20) {
    for (let j = 0; j < 10; j++) {
        window2.draw(i + j, 300, CYAN);
    }
}

// ===== WINDOW 3: Color Test =====
console.log("\n6. Window 3 - Color gradient...");
window3.setBackground(WHITE);

window3.write(150, 30, "Color Palette", BLACK);

// Draw color bars
let yPos = 80;
const colors = [
    { name: "Red", color: RED },
    { name: "Green", color: GREEN },
    { name: "Blue", color: BLUE },
    { name: "Yellow", color: YELLOW },
    { name: "Cyan", color: CYAN },
    { name: "Magenta", color: MAGENTA },
];

for (const { name, color } of colors) {
    // Draw color bar
    for (let x = 50; x < 200; x++) {
        for (let y = yPos; y < yPos + 20; y++) {
            window3.draw(x, y, color);
        }
    }
    // Draw label
    window3.write(220, yPos + 15, name, BLACK);
    yPos += 30;
}

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
