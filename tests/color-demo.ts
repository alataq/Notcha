import type { Window } from "../src/window";

const BLACK = 0x000000;
const RED = 0xFF0000;
const GREEN = 0x00FF00;
const BLUE = 0x0000FF;
const YELLOW = 0xFFFF00;
const MAGENTA = 0xFF00FF;
const CYAN = 0x00FFFF;

export function createColorDemo(app: any): Window {
    const window = app.createWindow("Color Test", 500, 400);
    
    function draw(w: number, h: number) {
        const menuHeight = window.getMenuBarHeight();
        
        window.setBackground(0xFFFFFF); // White background
        
        const contentY = menuHeight + 10;
        
        // Title
        window.write(w / 2 - 50, contentY, "Color Palette", BLACK);
        
        const colors = [
            { name: "Red", color: RED },
            { name: "Green", color: GREEN },
            { name: "Blue", color: BLUE },
            { name: "Yellow", color: YELLOW },
            { name: "Magenta", color: MAGENTA },
            { name: "Cyan", color: CYAN },
        ];
        
        const startX = 50;
        let yPos = contentY + 40;
        const barWidth = w - 150;
        const barHeight = 30;
        
        for (const { name, color } of colors) {
            if (yPos + barHeight > h) break;
            
            // Draw color bar
            for (let x = startX; x < startX + barWidth && x < w - 80; x++) {
                for (let y = yPos; y < yPos + barHeight; y++) {
                    window.draw(x, y, color);
                }
            }
            
            // Draw label
            if (startX + barWidth + 20 < w) {
                window.write(startX + barWidth + 20, yPos + 10, name, BLACK);
            }
            yPos += 45;
        }
        
        // Draw menu bar last so it's on top
        window.drawMenuBar();
        
        window.flush();
    }
    
    window.onNewFrame((width: number, height: number) => {
        console.log(`→ Color Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
