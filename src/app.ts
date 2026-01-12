import { Window } from "./window";
import { Keyboard, type KeyEvent } from "./keyboard";
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
        
        // Process keyboard events with per-window dispatching
        this.processKeyboardEvents();
        
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

    private processKeyboardEvents() {
        // Get focused window
        const focusedWindow = this.getFocusedWindow();
        
        // Process keyboard events
        while (native.hasKeyEvents()) {
            const keycode = new Uint32Array(1);
            const keysym = new Uint32Array(1);
            const state = new Uint32Array(1);
            const pressed = new Uint8Array(1);
            const keyNameBuffer = new Uint8Array(32);
            const keyNameLen = new Uint32Array(1);

            const hasEvent = native.getNextKeyEvent(
                keycode,
                keysym,
                state,
                pressed,
                keyNameBuffer,
                keyNameLen
            );

            if (!hasEvent) break;

            // Convert key name buffer to string
            const decoder = new TextDecoder();
            const keyName = decoder.decode(keyNameBuffer.slice(0, keyNameLen[0]));

            const event: KeyEvent = {
                keycode: keycode[0]!,
                keysym: keysym[0]!,
                state: state[0]!,
                pressed: pressed[0]! !== 0,
                key: keyName,
            };

            // Dispatch to focused window first (if it has handlers)
            if (focusedWindow) {
                if (event.pressed) {
                    focusedWindow._triggerKeyPress(event);
                } else {
                    focusedWindow._triggerKeyRelease(event);
                }
            }
            
            // Then dispatch to global app.keyboard handlers (for backward compatibility)
            if (event.pressed) {
                this.keyboard.keyPressCallbacks.forEach(cb => cb(event));
            } else {
                this.keyboard.keyReleaseCallbacks.forEach(cb => cb(event));
            }
        }
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