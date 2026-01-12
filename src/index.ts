import { App } from "./app";

// Create an app instance
const app = new App();

// Start the app (initializes display)
app.start();

// Create a window
const window1 = app.createWindow("Hello Notcha!", 800, 600);
window1.open();

// Draw some pixels (example: white pixels forming a simple pattern)
const WHITE = 0xFFFFFF;
const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;

// Draw a simple cross pattern
for (let i = 0; i < 100; i++) {
    window1.draw(400, 300 + i, RED);
    window1.draw(400 + i, 300, BLUE);
}

// Draw some random pixels
for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * 800);
    const y = Math.floor(Math.random() * 600);
    window1.draw(x, y, GREEN);
}

console.log("Window created and pixels drawn!");
console.log("The window will stay open. Press Ctrl+C to exit.");

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log("\nShutting down...");
    app.stop();
    process.exit(0);
});
