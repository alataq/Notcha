import * as native from "./native";
import type { KeyEvent } from "./keyboard";
import type { MouseEvent } from "./mouse";
import { MenuBar, type Menu } from "./menu";
import { Scrollbar } from "./scrollbar";

export class Window {
    public title: string = "Notcha";
    private windowHandle: bigint | null = null;
    private width: number = 800;
    private height: number = 600;
    private closeCallback: (() => void) | null = null;
    private newFrameCallback: ((width: number, height: number) => void) | null = null;
    private menuBar: MenuBar | null = null;
    private scrollbar: Scrollbar | null = null;
    private contentHeight: number = 0;
    
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

    fillRect(x: number, y: number, width: number, height: number, color: number): Window {
        if (this.windowHandle === null) {
            console.warn("Cannot fill rectangle: window is not open");
            return this;
        }
        
        native.fillRect(this.windowHandle, x, y, width, height, color);
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
     * Enable menu bar for this window
     */
    enableMenuBar(): MenuBar {
        if (!this.menuBar) {
            this.menuBar = new MenuBar();
            
            // Intercept mouse events for menu interaction
            this.mouse.onMousePress((event) => {
                if (this.menuBar) {
                    const handled = this.menuBar.handleClick(event.x, event.y);
                    if (handled && this.newFrameCallback) {
                        // Redraw to show menu changes
                        this.newFrameCallback(this.width, this.height);
                    }
                }
            });
            
            this.mouse.onMouseMove((event) => {
                if (this.menuBar) {
                    const stateChanged = this.menuBar.handleMouseMove(event.x, event.y, this.width);
                    if (stateChanged && this.menuBar.isDropdownOpen() && this.newFrameCallback) {
                        // Redraw only when hover state changes
                        this.newFrameCallback(this.width, this.height);
                    }
                }
            });
        }
        return this.menuBar;
    }

    /**
     * Add a menu to the menu bar
     */
    addMenu(menu: Menu): void {
        if (!this.menuBar) {
            this.enableMenuBar();
        }
        this.menuBar!.addMenu(menu);
    }

    /**
     * Draw the menu bar (call this in your draw function)
     */
    drawMenuBar(): void {
        if (this.menuBar && this.windowHandle !== null) {
            this.menuBar.draw(
                (x, y, color) => this.draw(x, y, color),
                (x, y, width, height, color) => this.fillRect(x, y, width, height, color),
                (x, y, text, color, size) => this.write(x, y, text, color, size),
                this.width,
                this.height
            );
        }
    }

    /**
     * Get the menu bar height (to offset your content)
     */
    getMenuBarHeight(): number {
        return this.menuBar ? this.menuBar.getMenuBarHeight() : 0;
    }

    /**
     * Enable scrolling for this window
     * Call this before opening the window
     */
    enableScrolling(): void {
        if (!this.scrollbar) {
            this.scrollbar = new Scrollbar();
            
            // Hook into mouse scroll events
            this.mouse.onScroll((event) => {
                if (this.scrollbar) {
                    // Scroll up = negative delta, scroll down = positive delta
                    const delta = event.button === 4 ? -1 : 1; // ScrollUp = -1, ScrollDown = +1
                    const changed = this.scrollbar.handleScroll(delta);
                    if (changed && this.newFrameCallback) {
                        this.newFrameCallback(this.width, this.height);
                    }
                }
            });
            
            // Hook into mouse press for scrollbar dragging
            const originalPressCallbacks = [...this.mousePressCallbacks];
            this.mousePressCallbacks = [];
            this.mouse.onMousePress((event) => {
                if (this.scrollbar) {
                    const menuHeight = this.getMenuBarHeight();
                    const handled = this.scrollbar.handleMousePress(event.x, event.y, this.width, this.height, menuHeight);
                    if (handled && this.newFrameCallback) {
                        this.newFrameCallback(this.width, this.height);
                        return;
                    }
                }
                // Trigger original callbacks
                for (const callback of originalPressCallbacks) {
                    callback(event);
                }
            });
            
            // Hook into mouse release
            const originalReleaseCallbacks = [...this.mouseReleaseCallbacks];
            this.mouseReleaseCallbacks = [];
            this.mouse.onMouseRelease((event) => {
                if (this.scrollbar) {
                    this.scrollbar.handleMouseRelease();
                }
                // Trigger original callbacks
                for (const callback of originalReleaseCallbacks) {
                    callback(event);
                }
            });
            
            // Hook into mouse move for scrollbar dragging and hover
            const originalMoveCallbacks = [...this.mouseMoveCallbacks];
            this.mouseMoveCallbacks = [];
            this.mouse.onMouseMove((event) => {
                if (this.scrollbar) {
                    const menuHeight = this.getMenuBarHeight();
                    const changed = this.scrollbar.handleMouseMove(event.x, event.y, this.width, this.height, menuHeight);
                    // Always redraw during drag for instant feedback
                    if (changed && this.newFrameCallback) {
                        this.newFrameCallback(this.width, this.height);
                    }
                }
                // Trigger original callbacks
                for (const callback of originalMoveCallbacks) {
                    callback(event);
                }
            });
        }
    }

    /**
     * Set content height for scrolling calculation
     * Call this in your draw function after you know the total content height
     */
    setContentHeight(height: number): void {
        this.contentHeight = height;
        if (this.scrollbar) {
            const menuHeight = this.getMenuBarHeight();
            const visibleHeight = this.height - menuHeight;
            this.scrollbar.updateDimensions(height, visibleHeight);
        }
    }

    /**
     * Get current scroll offset
     */
    getScrollOffset(): number {
        return this.scrollbar ? this.scrollbar.getScrollOffset() : 0;
    }

    /**
     * Get visible content width (accounting for scrollbar if present)
     */
    getVisibleWidth(): number {
        if (this.scrollbar && this.scrollbar.isScrollable()) {
            return this.scrollbar.getVisibleWidth(this.width);
        }
        return this.width;
    }

    /**
     * Draw the scrollbar (call this at the end of your draw function)
     */
    drawScrollbar(): void {
        if (this.scrollbar && this.scrollbar.isScrollable() && this.windowHandle !== null) {
            const menuHeight = this.getMenuBarHeight();
            this.scrollbar.draw(
                (x, y, color) => this.draw(x, y, color),
                (x, y, width, height, color) => this.fillRect(x, y, width, height, color),
                this.width,
                this.height,
                menuHeight
            );
        }
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
