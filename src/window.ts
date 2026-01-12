import * as native from "./native";

export class Window {
    public title: string = "Notcha";
    private windowHandle: bigint | null = null;
    private width: number = 800;
    private height: number = 600;
    private closeCallback: (() => void) | null = null;
    private newFrameCallback: ((width: number, height: number) => void) | null = null;

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

    write(x: number, y: number, text: string, color: number = 0x000000): Window {
        if (this.windowHandle === null) {
            console.warn("Cannot write text: window is not open");
            return this;
        }
        
        native.drawText(this.windowHandle, x, y, text, color);
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
}