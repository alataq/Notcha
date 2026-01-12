import * as native from "./native";
import type { KeyEvent } from "./keyboard";
import type { MouseEvent } from "./mouse";

export class Window {
    public title: string = "Notcha";
    private windowHandle: bigint | null = null;
    private width: number = 800;
    private height: number = 600;
    private closeCallback: (() => void) | null = null;
    private newFrameCallback: ((width: number, height: number) => void) | null = null;
    
    // Per-window keyboard callbacks
    private keyPressCallbacks: Array<(event: KeyEvent) => void> = [];
    private keyReleaseCallbacks: Array<(event: KeyEvent) => void> = [];

    // Per-window mouse callbacks
    private mousePressCallbacks: Array<(event: MouseEvent) => void> = [];
    private mouseReleaseCallbacks: Array<(event: MouseEvent) => void> = [];
    private mouseMoveCallbacks: Array<(event: MouseEvent) => void> = [];
    private mouseScrollCallbacks: Array<(event: MouseEvent) => void> = [];

    public keyboard = {
        onKeyPress: (callback: (event: KeyEvent) => void) => {
            this.keyPressCallbacks.push(callback);
        },
        onKeyRelease: (callback: (event: KeyEvent) => void) => {
            this.keyReleaseCallbacks.push(callback);
        }
    };

    public mouse = {
        onMousePress: (callback: (event: MouseEvent) => void) => {
            this.mousePressCallbacks.push(callback);
        },
        onMouseRelease: (callback: (event: MouseEvent) => void) => {
            this.mouseReleaseCallbacks.push(callback);
        },
        onMouseMove: (callback: (event: MouseEvent) => void) => {
            this.mouseMoveCallbacks.push(callback);
        },
        onScroll: (callback: (event: MouseEvent) => void) => {
            this.mouseScrollCallbacks.push(callback);
        }
    };

    constructor(title?: string, width: number = 800, height: number = 600) {
        if (title) {
            this.title = title;
        }
        this.width = width;
        this.height = height;
    }

    open() {
        if (this.windowHandle !== null) {
            console.warn("Window is already open");
            return;
        }
        
        this.windowHandle = native.createWindow(this.title, this.width, this.height);
        console.log(`Window "${this.title}" opened with handle: ${this.windowHandle}`);
    }

    draw(x: number, y: number, color: number): Window {
        if (this.windowHandle === null) {
            console.warn("Cannot draw: window is not open");
            return this;
        }
        
        native.drawPixel(this.windowHandle, x, y, color);
        return this;
    }

    setBackground(color: number): Window {
        if (this.windowHandle === null) {
            console.warn("Cannot set background: window is not open");
            return this;
        }
        
        native.setBackground(this.windowHandle, color);
        return this;
    }

    write(x: number, y: number, text: string, color: number = 0x000000, size: number = 2): Window {
        if (this.windowHandle === null) {
            console.warn("Cannot write text: window is not open");
            return this;
        }
        
        native.drawText(this.windowHandle, x, y, text, color, size);
        return this;
    }

    close() {
        if (this.windowHandle !== null) {
            native.destroyWindow(this.windowHandle);
            this.windowHandle = null;
            console.log(`Window "${this.title}" closed`);
            
            // Trigger close callback if set
            if (this.closeCallback) {
                this.closeCallback();
            }
        }
    }

    isOpen(): boolean {
        return this.windowHandle !== null;
    }

    onClose(callback: () => void): Window {
        this.closeCallback = callback;
        return this;
    }

    onNewFrame(callback: (width: number, height: number) => void): Window {
        this.newFrameCallback = callback;
        return this;
    }

    checkClosed(): boolean {
        if (this.windowHandle === null) {
            return true;
        }
        
        const closed = native.checkWindowClosed(this.windowHandle);
        if (closed) {
            native.destroyWindow(this.windowHandle);
            this.windowHandle = null;
            console.log(`Window "${this.title}" was closed by user`);
            
            // Trigger close callback if set
            if (this.closeCallback) {
                this.closeCallback();
            }
        }
        return closed;
    }

    checkNewFrame(): boolean {
        if (this.windowHandle === null) {
            return false;
        }

        const needsRedraw = native.checkWindowNeedsRedraw(this.windowHandle);
        if (needsRedraw && this.newFrameCallback) {
            // Get current dimensions
            const newWidth = native.getWindowWidth(this.windowHandle);
            const newHeight = native.getWindowHeight(this.windowHandle);
            
            // Update stored dimensions
            this.width = newWidth;
            this.height = newHeight;
            
            // Trigger callback
            this.newFrameCallback(newWidth, newHeight);
        }
        return needsRedraw;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.height;
    }

    flush(): void {
        if (this.windowHandle === null) {
            console.warn("Cannot flush: window is not open");
            return;
        }
        native.flushWindow(this.windowHandle);
    }

    isFocused(): boolean {
        if (this.windowHandle === null) {
            return false;
        }
        return native.isWindowFocused(this.windowHandle);
    }

    /**
     * @internal
     * Trigger per-window keyboard callbacks (called by App)
     */
    _triggerKeyPress(event: KeyEvent): void {
        for (const callback of this.keyPressCallbacks) {
            callback(event);
        }
    }

    /**
     * @internal
     * Trigger per-window keyboard callbacks (called by App)
     */
    _triggerKeyRelease(event: KeyEvent): void {
        for (const callback of this.keyReleaseCallbacks) {
            callback(event);
        }
    }

    /**
     * @internal
     * Trigger per-window mouse callbacks (called by App)
     */
    _triggerMousePress(event: MouseEvent): void {
        for (const callback of this.mousePressCallbacks) {
            callback(event);
        }
    }

    /**
     * @internal
     * Trigger per-window mouse callbacks (called by App)
     */
    _triggerMouseRelease(event: MouseEvent): void {
        for (const callback of this.mouseReleaseCallbacks) {
            callback(event);
        }
    }

    /**
     * @internal
     * Trigger per-window mouse callbacks (called by App)
     */
    _triggerMouseMove(event: MouseEvent): void {
        for (const callback of this.mouseMoveCallbacks) {
            callback(event);
        }
    }

    /**
     * @internal
     * Trigger per-window mouse callbacks (called by App)
     */
    _triggerMouseScroll(event: MouseEvent): void {
        for (const callback of this.mouseScrollCallbacks) {
            callback(event);
        }
    }
}
