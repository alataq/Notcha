import type { Window } from "../src/window";

const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;
const YELLOW = 0xFFFF00;

export function createGraphicsDemo(app: any): Window {
    const window = app.createWindow("Graphics Demo", 800, 600);
    
    function draw(w: number, h: number) {
        window.setBackground(0xF0F0F0); // Light gray background
        
        // Draw centered cross
        const centerX = Math.floor(w / 2);
        const centerY = Math.floor(h / 2);
        const lineThickness = 5;
        const lineLength = Math.min(w, h) * 0.6;
        
        // Horizontal line
        for (let y = centerY - lineThickness; y < centerY + lineThickness; y++) {
            for (let x = centerX - lineLength / 2; x < centerX + lineLength / 2; x++) {
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    window.draw(x, y, RED);
                }
            }
        }
        
        // Vertical line
        for (let x = centerX - lineThickness; x < centerX + lineThickness; x++) {
            for (let y = centerY - lineLength / 2; y < centerY + lineLength / 2; y++) {
                if (x >= 0 && x < w && y >= 0 && y < h) {
                    window.draw(x, y, BLUE);
                }
            }
        }
        
        // Draw corner squares (fixed size)
        const squareSize = 90;
        const margin = 10;
        
        // Top-left green
        for (let x = margin; x < margin + squareSize && x < w; x++) {
            for (let y = margin; y < margin + squareSize && y < h; y++) {
                window.draw(x, y, GREEN);
            }
        }
        
        // Top-right yellow
        if (w > margin + squareSize) {
            for (let x = w - margin - squareSize; x < w - margin; x++) {
                for (let y = margin; y < margin + squareSize && y < h; y++) {
                    window.draw(x, y, YELLOW);
                }
            }
        }
        
        // Bottom-left blue
        if (h > margin + squareSize) {
            for (let x = margin; x < margin + squareSize && x < w; x++) {
                for (let y = h - margin - squareSize; y < h - margin; y++) {
                    window.draw(x, y, BLUE);
                }
            }
        }
        
        // Bottom-right red
        if (w > margin + squareSize && h > margin + squareSize) {
            for (let x = w - margin - squareSize; x < w - margin; x++) {
                for (let y = h - margin - squareSize; y < h - margin; y++) {
                    window.draw(x, y, RED);
                }
            }
        }
        
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
