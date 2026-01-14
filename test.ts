import { App } from "./src/app";
import { Window } from "./src/window";
import { type Menu } from "./src/menu";
import { createMainMenu } from "./tests/main-menu";
import { createGraphicsDemo } from "./tests/graphics-demo";
import { createTextDemo } from "./tests/text-demo";
import { createColorDemo } from "./tests/color-demo";
import { createKeyboardDemo } from "./tests/keyboard-demo";
import { createMouseDemo } from "./tests/mouse-demo";
import { createSoundDemo } from "./tests/sound-demo";
import { createMenuDemo } from "./tests/menu-demo";
import { createScrollDemo } from "./tests/scroll-demo";

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
let soundWindow: any = null;
let menuWindow: any = null;
let scrollWindow: any = null;

// Helper function to add default app menu to a window
function addDefaultMenu(window: Window, app: App): void {
    const navigateMenu: Menu = {
        label: "Navigate",
        items: [
            { 
                label: "Graphics Demo", 
                action: () => { 
                    if (!graphicsWindow || !graphicsWindow.isOpen()) {
                        console.log("→ Opening Graphics Demo from menu...");
                        graphicsWindow = createGraphicsDemo(app);
                        addDefaultMenu(graphicsWindow, app);
                    }
                } 
            },
            { 
                label: "Text Demo", 
                action: () => { 
                    if (!textWindow || !textWindow.isOpen()) {
                        console.log("→ Opening Text Demo from menu...");
                        textWindow = createTextDemo(app);
                        addDefaultMenu(textWindow, app);
                    }
                } 
            },
            { 
                label: "Color Demo", 
                action: () => { 
                    if (!colorWindow || !colorWindow.isOpen()) {
                        console.log("→ Opening Color Demo from menu...");
                        colorWindow = createColorDemo(app);
                        addDefaultMenu(colorWindow, app);
                    }
                } 
            },
            { 
                label: "Keyboard Demo", 
                action: () => { 
                    if (!keyboardWindow || !keyboardWindow.isOpen()) {
                        console.log("→ Opening Keyboard Demo from menu...");
                        keyboardWindow = createKeyboardDemo(app);
                        addDefaultMenu(keyboardWindow, app);
                    }
                } 
            },
            { 
                label: "Mouse Demo", 
                action: () => { 
                    if (!mouseWindow || !mouseWindow.isOpen()) {
                        console.log("→ Opening Mouse Demo from menu...");
                        mouseWindow = createMouseDemo(app);
                        addDefaultMenu(mouseWindow, app);
                    }
                } 
            },
            { 
                label: "Sound Demo", 
                action: () => { 
                    if (!soundWindow || !soundWindow.isOpen()) {
                        console.log("→ Opening Sound Demo from menu...");
                        soundWindow = createSoundDemo(app);
                        addDefaultMenu(soundWindow, app);
                    }
                } 
            },
            { 
                label: "Scroll Demo", 
                action: () => { 
                    if (!scrollWindow || !scrollWindow.isOpen()) {
                        console.log("→ Opening Scroll Demo from menu...");
                        scrollWindow = createScrollDemo(app);
                        addDefaultMenu(scrollWindow, app);
                    }
                } 
            },
            { separator: true },
            { 
                label: "Menu Demo", 
                action: () => { 
                    if (!menuWindow || !menuWindow.isOpen()) {
                        console.log("→ Opening Menu Demo from menu...");
                        menuWindow = createMenuDemo(app);
                    }
                } 
            },
        ]
    };
    
    const fileMenu: Menu = {
        label: "File",
        items: [
            { label: "Close Window", action: () => { window.close(); } },
        ]
    };
    
    const helpMenu: Menu = {
        label: "Help",
        items: [
            { label: "About Notcha", action: () => { console.log("Notcha v0.6.0 - X11 Window Library"); app.sound.click(); } },
        ]
    };
    
    window.addMenu(navigateMenu);
    window.addMenu(fileMenu);
    window.addMenu(helpMenu);
}

// Create main menu with button handlers
const mainMenu = createMainMenu(
    app,
    // Graphics Demo
    () => {
        if (!graphicsWindow || !graphicsWindow.isOpen()) {
            console.log("→ Opening Graphics Demo...");
            graphicsWindow = createGraphicsDemo(app);
            addDefaultMenu(graphicsWindow, app);
        } else {
            console.log("→ Graphics Demo already open");
        }
    },
    // Text Demo
    () => {
        if (!textWindow || !textWindow.isOpen()) {
            console.log("→ Opening Text Demo...");
            textWindow = createTextDemo(app);
            addDefaultMenu(textWindow, app);
        } else {
            console.log("→ Text Demo already open");
        }
    },
    // Color Demo
    () => {
        if (!colorWindow || !colorWindow.isOpen()) {
            console.log("→ Opening Color Demo...");
            colorWindow = createColorDemo(app);
            addDefaultMenu(colorWindow, app);
        } else {
            console.log("→ Color Demo already open");
        }
    },
    // Keyboard Demo
    () => {
        if (!keyboardWindow || !keyboardWindow.isOpen()) {
            console.log("→ Opening Keyboard Demo...");
            keyboardWindow = createKeyboardDemo(app);
            addDefaultMenu(keyboardWindow, app);
        } else {
            console.log("→ Keyboard Demo already open");
        }
    },
    // Mouse Demo
    () => {
        if (!mouseWindow || !mouseWindow.isOpen()) {
            console.log("→ Opening Mouse Demo...");
            mouseWindow = createMouseDemo(app);
            addDefaultMenu(mouseWindow, app);
        } else {
            console.log("→ Mouse Demo already open");
        }
    },
    // Sound Demo
    () => {
        if (!soundWindow || !soundWindow.isOpen()) {
            console.log("→ Opening Sound Demo...");
            soundWindow = createSoundDemo(app);
            addDefaultMenu(soundWindow, app);
        } else {
            console.log("→ Sound Demo already open");
        }
    },
    // Menu Demo
    () => {
        if (!menuWindow || !menuWindow.isOpen()) {
            console.log("→ Opening Menu Demo...");
            menuWindow = createMenuDemo(app);
        } else {
            console.log("→ Menu Demo already open");
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
