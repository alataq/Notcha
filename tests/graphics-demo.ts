import type { Window } from "../src/window";

const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;
const YELLOW = 0xFFFF00;

export function createGraphicsDemo(app: any): Window {
    const window = app.createWindow("Graphics Demo", 800, 600);
    
    function draw(w: number, h: number) {
        const menuHeight = window.getMenuBarHeight();
        
        window.setBackground(0xF0F0F0); // Light gray background
        
        // Adjust content area to be below menu
        const contentY = menuHeight;
        const contentHeight = h - menuHeight;
        
        // Draw centered cross
        const centerX = Math.floor(w / 2);
        const centerY = Math.floor(contentY + contentHeight / 2);
        const lineThickness = 5;
        const lineLength = Math.min(w, contentHeight) * 0.6;
        
        // Horizontal line
        for (let y = centerY - lineThickness; y < centerY + lineThickness; y++) {
            for (let x = centerX - lineLength / 2; x < centerX + lineLength / 2; x++) {
                if (x >= 0 && x < w && y >= contentY && y < h) {
                    window.draw(x, y, RED);
                }
            }
        }
        
        // Vertical line
        for (let x = centerX - lineThickness; x < centerX + lineThickness; x++) {
            for (let y = centerY - lineLength / 2; y < centerY + lineLength / 2; y++) {
                if (x >= 0 && x < w && y >= contentY && y < h) {
                    window.draw(x, y, BLUE);
                }
            }
        }
        
        // Draw corner squares (fixed size)
        const squareSize = 90;
        const margin = 10;
        
        // Top-left green (adjusted for menu)
        for (let x = margin; x < margin + squareSize && x < w; x++) {
            for (let y = contentY + margin; y < contentY + margin + squareSize && y < h; y++) {
                window.draw(x, y, GREEN);
            }
        }
        
        // Top-right yellow
        if (w > margin + squareSize) {
            for (let x = w - margin - squareSize; x < w - margin; x++) {
                for (let y = contentY + margin; y < contentY + margin + squareSize && y < h; y++) {
                    window.draw(x, y, YELLOW);
                }
            }
        }
        
        // Bottom-left blue
        if (h > contentY + margin + squareSize) {
            for (let x = margin; x < margin + squareSize && x < w; x++) {
                for (let y = h - margin - squareSize; y < h - margin; y++) {
                    window.draw(x, y, BLUE);
                }
            }
        }
        
        // Bottom-right red
        if (w > margin + squareSize && h > contentY + margin + squareSize) {
            for (let x = w - margin - squareSize; x < w - margin; x++) {
                for (let y = h - margin - squareSize; y < h - margin; y++) {
                    window.draw(x, y, RED);
                }
            }
        }
        
        // Draw menu bar last so it's on top
        window.drawMenuBar();
        
        window.flush();
    }
    
    window.onNewFrame((width: number, height: number) => {
        console.log(`→ Graphics Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
