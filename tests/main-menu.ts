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
    onMouseDemo: () => void,
    onSoundDemo: () => void,
    onMenuDemo: () => void,
    onSystemInfoDemo: () => void
): Window {
    const window = app.createWindow("Notcha Test Suite", 500, 740);
    
    function draw(w: number, h: number) {
        window.setBackground(WHITE);
        
        const centerX = Math.floor(w / 2);
        
        // Title
        window.write(centerX - 80, 40, "Notcha Test Suite", BLACK);
        window.write(centerX - 100, 70, "Click a button to open demo", GRAY);
        
        // Button dimensions
        const buttonWidth = Math.min(300, w - 100);
        const buttonHeight = 50;
        const buttonX = Math.floor((w - buttonWidth) / 2);
        const spacing = 70;
        const startY = 120;
        
        // Create buttons centered based on window size
        buttons = [
            { x: buttonX, y: startY, width: buttonWidth, height: buttonHeight, label: "Graphics Demo", action: onGraphicsDemo },
            { x: buttonX, y: startY + spacing, width: buttonWidth, height: buttonHeight, label: "Text Demo", action: onTextDemo },
            { x: buttonX, y: startY + spacing * 2, width: buttonWidth, height: buttonHeight, label: "Color Demo", action: onColorDemo },
            { x: buttonX, y: startY + spacing * 3, width: buttonWidth, height: buttonHeight, label: "Keyboard Demo", action: onKeyboardDemo },
            { x: buttonX, y: startY + spacing * 4, width: buttonWidth, height: buttonHeight, label: "Mouse Demo", action: onMouseDemo },
            { x: buttonX, y: startY + spacing * 5, width: buttonWidth, height: buttonHeight, label: "Sound Demo", action: onSoundDemo },
            { x: buttonX, y: startY + spacing * 6, width: buttonWidth, height: buttonHeight, label: "Menu Demo", action: onMenuDemo },
            { x: buttonX, y: startY + spacing * 7, width: buttonWidth, height: buttonHeight, label: "System Info", action: onSystemInfoDemo },
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
            
            // Button label - centered in button
            const labelX = button.x + Math.floor((button.width - button.label.length * 8) / 2);
            const labelY = button.y + Math.floor((button.height - 10) / 2);
            window.write(labelX, labelY, button.label, BLACK);
        }
        
        // Instructions - centered at bottom
        const instructionText = "Each demo window is independent";
        const instructionX = Math.floor((w - instructionText.length * 8) / 2);
        window.write(instructionX, h - 40, instructionText, GRAY);
        
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
