import { Window } from "./window";
import { Keyboard } from "./keyboard";
import * as native from "./native";

export class App {
    public windows: Window[] = [];
    public keyboard: Keyboard;
    private running: boolean = false;

    constructor() {
        this.keyboard = new Keyboard();
    }

    start() {
        if (this.running) {
            console.warn("App is already running");
            return;
        }

        // Initialize the display
        const success = native.initDisplay();
        if (!success) {
            console.error("Failed to initialize display");
            return;
        }

        this.running = true;
        console.log("App started");

        // Event loop
        this.eventLoop();
    }

    private eventLoop() {
        if (!this.running) return;

        // Process events
        native.processEvents();
        
        // Process keyboard events
        this.keyboard.processEvents();
        
        // Check if any windows were closed and check for new frames
        for (const win of this.windows) {
            if (win.isOpen()) {
                win.checkClosed();
                win.checkNewFrame();
            }
        }
        
        // Check if all windows are closed
        const allClosed = this.windows.every(win => !win.isOpen());
        if (allClosed && this.windows.length > 0) {
            console.log("All windows closed, stopping app...");
            this.stop();
            return;
        }

        // Continue event loop
        setTimeout(() => this.eventLoop(), 16); // ~60 FPS
    }

    stop() {
        this.running = false;
        
        // Close all windows
        for (const win of this.windows) {
            if (win.isOpen()) {
                win.close();
            }
        }

        // Close display
        native.closeDisplay();
        console.log("App stopped");
    }

    createWindow(title?: string, width?: number, height?: number) {
        const win = new Window(title, width, height);
        this.windows.push(win);
        return win;
    }

    getFocusedWindow(): Window | null {
        const focusedHandle = native.getFocusedWindow();
        if (focusedHandle === BigInt(0)) {
            return null;
        }
        
        // Find the window with this handle
        for (const win of this.windows) {
            if (win.isOpen() && win.isFocused()) {
                return win;
            }
        }
        
        return null;
    }
}