import type { Window } from "../src/window";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GRAY = 0x808080;
const GREEN = 0x00FF00;
const RED = 0xFF0000;

let lastKeys: string[] = [];

export function createKeyboardDemo(app: any): Window {
    const window = app.createWindow("Keyboard Test", 600, 400);
    
    function draw(w: number, h: number) {
        window.setBackground(0xFAFAFA);
        
        const centerX = Math.floor(w / 2);
        
        // Title
        window.write(centerX - 80, 40, "Keyboard Event Test", BLACK);
        
        // Instructions
        window.write(20, 80, "Type on this window to see keyboard events", GRAY);
        window.write(20, 110, "Focus: " + (window.isFocused() ? "YES" : "NO"), window.isFocused() ? GREEN : RED);
        window.write(20, 130, "(Per-window keyboard handling)", BLUE);
        
        // Display last keys
        window.write(20, 160, "Recent Keys:", BLACK);
        let yPos = 190;
        for (let i = Math.max(0, lastKeys.length - 8); i < lastKeys.length; i++) {
            if (yPos + 20 > h) break;
            window.write(40, yPos, lastKeys[i]!, BLUE);
            yPos += 25;
        }
        
        window.flush();
    }
    
    window.onNewFrame((width: number, height: number) => {
        console.log(`→ Keyboard Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    // Set up per-window keyboard event handlers
    window.keyboard.onKeyPress((event: any) => {
        console.log(`→ [Keyboard Demo] Key Press: ${event.key}`);
        lastKeys.push(`[DOWN] ${event.key}`);
        if (lastKeys.length > 12) {
            lastKeys.shift();
        }
        draw(window.getWidth(), window.getHeight());
    });
    
    window.keyboard.onKeyRelease((event: any) => {
        console.log(`→ [Keyboard Demo] Key Release: ${event.key}`);
        lastKeys.push(`[UP] ${event.key}`);
        if (lastKeys.length > 12) {
            lastKeys.shift();
        }
        draw(window.getWidth(), window.getHeight());
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
