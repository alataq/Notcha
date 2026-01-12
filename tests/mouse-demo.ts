import type { Window } from "../src/window";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GRAY = 0x808080;
const GREEN = 0x00FF00;
const RED = 0xFF0000;
const MAGENTA = 0xFF00FF;

let mouseEvents: string[] = [];
let lastMousePos = { x: 0, y: 0 };

export function createMouseDemo(app: any): Window {
    const window = app.createWindow("Mouse Test", 600, 500);
    
    function draw(w: number, h: number) {
        window.setBackground(0xFAFAFA);
        
        const centerX = Math.floor(w / 2);
        
        // Title
        window.write(centerX - 70, 40, "Mouse Event Test", BLACK);
        
        // Instructions
        window.write(20, 80, "Use your mouse in this window", GRAY);
        window.write(20, 110, "Focus: " + (window.isFocused() ? "YES" : "NO"), window.isFocused() ? GREEN : RED);
        window.write(20, 130, "(Per-window mouse handling)", BLUE);
        
        // Display mouse position
        window.write(20, 160, `Mouse Position: (${lastMousePos.x}, ${lastMousePos.y})`, MAGENTA);
        
        // Display last events
        window.write(20, 190, "Recent Events:", BLACK);
        let yPos = 220;
        for (let i = Math.max(0, mouseEvents.length - 8); i < mouseEvents.length; i++) {
            if (yPos + 20 > h) break;
            window.write(40, yPos, mouseEvents[i]!, BLUE);
            yPos += 25;
        }
        
        window.flush();
    }
    
    window.onNewFrame((width: number, height: number) => {
        console.log(`→ Mouse Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    // Set up per-window mouse event handlers
    window.mouse.onMousePress((event: any) => {
        const buttonName = event.button === 1 ? "Left" : event.button === 2 ? "Middle" : event.button === 3 ? "Right" : `Button ${event.button}`;
        console.log(`→ [Mouse Demo] Mouse Press: ${buttonName} at (${event.x}, ${event.y})`);
        mouseEvents.push(`[PRESS] ${buttonName} (${event.x}, ${event.y})`);
        if (mouseEvents.length > 12) {
            mouseEvents.shift();
        }
        lastMousePos = { x: event.x, y: event.y };
        draw(window.getWidth(), window.getHeight());
    });
    
    window.mouse.onMouseRelease((event: any) => {
        const buttonName = event.button === 1 ? "Left" : event.button === 2 ? "Middle" : event.button === 3 ? "Right" : `Button ${event.button}`;
        console.log(`→ [Mouse Demo] Mouse Release: ${buttonName} at (${event.x}, ${event.y})`);
        mouseEvents.push(`[RELEASE] ${buttonName} (${event.x}, ${event.y})`);
        if (mouseEvents.length > 12) {
            mouseEvents.shift();
        }
        lastMousePos = { x: event.x, y: event.y };
        draw(window.getWidth(), window.getHeight());
    });
    
    window.mouse.onMouseMove((event: any) => {
        lastMousePos = { x: event.x, y: event.y };
        // Redraw less frequently for move events to avoid excessive redraws
        if (Math.random() < 0.1) { // Only redraw ~10% of moves
            draw(window.getWidth(), window.getHeight());
        }
    });
    
    window.mouse.onScroll((event: any) => {
        const direction = event.button === 4 ? "Up" : event.button === 5 ? "Down" : `Button ${event.button}`;
        console.log(`→ [Mouse Demo] Mouse Scroll: ${direction} at (${event.x}, ${event.y})`);
        mouseEvents.push(`[SCROLL] ${direction} (${event.x}, ${event.y})`);
        if (mouseEvents.length > 12) {
            mouseEvents.shift();
        }
        lastMousePos = { x: event.x, y: event.y };
        draw(window.getWidth(), window.getHeight());
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
