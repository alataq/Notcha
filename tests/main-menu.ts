import type { App } from "../src/app";
import type { Window } from "../src/window";

const BLACK = 0x000000;
const WHITE = 0xFFFFFF;
const BLUE = 0x0000FF;
const GRAY = 0x808080;
const LIGHT_BLUE = 0xADD8E6;

interface Button {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    action: () => void;
}

let buttons: Button[] = [];

export function createMainMenu(
    app: App,
    onGraphicsDemo: () => void,
    onTextDemo: () => void,
    onColorDemo: () => void,
    onKeyboardDemo: () => void,
    onMouseDemo: () => void
): Window {
    const window = app.createWindow("Notcha Test Suite", 500, 500);
    
    function draw(w: number, h: number) {
        window.setBackground(WHITE);
        
        const centerX = Math.floor(w / 2);
        
        // Title
        window.write(centerX - 80, 40, "Notcha Test Suite", BLACK);
        window.write(centerX - 100, 70, "Click a button to open demo", GRAY);
        
        // Create buttons
        buttons = [
            { x: 100, y: 120, width: 300, height: 50, label: "Graphics Demo", action: onGraphicsDemo },
            { x: 100, y: 190, width: 300, height: 50, label: "Text Demo", action: onTextDemo },
            { x: 100, y: 260, width: 300, height: 50, label: "Color Demo", action: onColorDemo },
            { x: 100, y: 330, width: 300, height: 50, label: "Keyboard Demo", action: onKeyboardDemo },
            { x: 100, y: 400, width: 300, height: 50, label: "Mouse Demo", action: onMouseDemo },
        ];
        
        // Draw buttons
        for (const button of buttons) {
            // Button background
            for (let x = button.x; x < button.x + button.width && x < w; x++) {
                for (let y = button.y; y < button.y + button.height && y < h; y++) {
                    window.draw(x, y, LIGHT_BLUE);
                }
            }
            
            // Button border (top and left)
            for (let x = button.x; x < button.x + button.width && x < w; x++) {
                window.draw(x, button.y, BLUE);
                window.draw(x, button.y + button.height - 1, BLUE);
            }
            for (let y = button.y; y < button.y + button.height && y < h; y++) {
                window.draw(button.x, y, BLUE);
                window.draw(button.x + button.width - 1, y, BLUE);
            }
            
            // Button label
            const labelX = button.x + (button.width / 2) - (button.label.length * 4);
            const labelY = button.y + (button.height / 2) - 5;
            window.write(labelX, labelY, button.label, BLACK);
        }
        
        // Instructions
        window.write(50, h - 40, "Each demo window is independent", GRAY);
        
        window.flush();
    }
    
    window.onNewFrame((width, height) => {
        console.log(`→ Main Menu resized: ${width}x${height}`);
        draw(width, height);
    });
    
    // Handle mouse clicks on buttons
    window.mouse.onMousePress((event) => {
        for (const button of buttons) {
            if (
                event.x >= button.x &&
                event.x <= button.x + button.width &&
                event.y >= button.y &&
                event.y <= button.y + button.height
            ) {
                console.log(`→ Button clicked: ${button.label}`);
                button.action();
                break;
            }
        }
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
