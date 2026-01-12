import { App } from "./src/app";
import { createMainMenu } from "./tests/main-menu";
import { createGraphicsDemo } from "./tests/graphics-demo";
import { createTextDemo } from "./tests/text-demo";
import { createColorDemo } from "./tests/color-demo";
import { createKeyboardDemo } from "./tests/keyboard-demo";
import { createMouseDemo } from "./tests/mouse-demo";

console.log("=== Notcha Test Suite ===\n");

// Create an app instance
console.log("1. Creating app...");
const app = new App();

// Start the app (initializes display)
console.log("2. Starting app (initializing X11 display)...");
app.start();

console.log("3. Creating main menu window...\n");

// Track demo windows to prevent duplicates
let graphicsWindow: any = null;
let textWindow: any = null;
let colorWindow: any = null;
let keyboardWindow: any = null;
let mouseWindow: any = null;

// Create main menu with button handlers
const mainMenu = createMainMenu(
    app,
    // Graphics Demo
    () => {
        if (!graphicsWindow || !graphicsWindow.isOpen()) {
            console.log("→ Opening Graphics Demo...");
            graphicsWindow = createGraphicsDemo(app);
        } else {
            console.log("→ Graphics Demo already open");
        }
    },
    // Text Demo
    () => {
        if (!textWindow || !textWindow.isOpen()) {
            console.log("→ Opening Text Demo...");
            textWindow = createTextDemo(app);
        } else {
            console.log("→ Text Demo already open");
        }
    },
    // Color Demo
    () => {
        if (!colorWindow || !colorWindow.isOpen()) {
            console.log("→ Opening Color Demo...");
            colorWindow = createColorDemo(app);
        } else {
            console.log("→ Color Demo already open");
        }
    },
    // Keyboard Demo
    () => {
        if (!keyboardWindow || !keyboardWindow.isOpen()) {
            console.log("→ Opening Keyboard Demo...");
            keyboardWindow = createKeyboardDemo(app);
        } else {
            console.log("→ Keyboard Demo already open");
        }
    },
    // Mouse Demo
    () => {
        if (!mouseWindow || !mouseWindow.isOpen()) {
            console.log("→ Opening Mouse Demo...");
            mouseWindow = createMouseDemo(app);
        } else {
            console.log("→ Mouse Demo already open");
        }
    }
);

console.log("\n✓ Test suite ready!");
console.log("✓ Click buttons in the main menu to open demo windows");
console.log("✓ Each demo window can be opened independently");
console.log("✓ Close the main menu to exit the test suite");
console.log("✓ Or press Ctrl+C to exit\n");

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log("\nCleaning up...");
    app.stop();
    console.log("✓ Shutdown complete");
    process.exit(0);
});
