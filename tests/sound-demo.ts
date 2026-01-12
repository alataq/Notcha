import type { Window } from "../src/window";
import type { App } from "../src/app";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GRAY = 0x808080;
const GREEN = 0x00FF00;
const MAGENTA = 0xFF00FF;
const LIGHT_BLUE = 0xADD8E6;

interface SoundButton {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    action: () => boolean;
}

let buttons: SoundButton[] = [];

export function createSoundDemo(app: App): Window {
    const window = app.createWindow("Sound Test", 600, 500);
    
    function draw(w: number, h: number) {
        window.setBackground(0xFAFAFA);
        
        const centerX = Math.floor(w / 2);
        
        // Title
        window.write(centerX - 50, 40, "Sound Test", BLACK, 3);
        
        // Status
        const audioStatus = app.sound.isInitialized() ? "Initialized" : "Not Initialized";
        const statusColor = app.sound.isInitialized() ? GREEN : GRAY;
        window.write(20, 80, `Audio Status: ${audioStatus}`, statusColor, 2);
        
        // Instructions
        window.write(20, 110, "Click buttons to play sounds", GRAY, 2);
        
        // Button dimensions
        const buttonWidth = Math.min(250, w - 100);
        const buttonHeight = 50;
        const buttonX = Math.floor((w - buttonWidth) / 2);
        const spacing = 65;
        const startY = 150;
        
        // Create sound buttons
        buttons = [
            { x: buttonX, y: startY, width: buttonWidth, height: buttonHeight, label: "Play Beep (440 Hz)", action: () => app.sound.beep() },
            { x: buttonX, y: startY + spacing, width: buttonWidth, height: buttonHeight, label: "Play Click (1000 Hz)", action: () => app.sound.click() },
            { x: buttonX, y: startY + spacing * 2, width: buttonWidth, height: buttonHeight, label: "Play Success (600 Hz)", action: () => app.sound.success() },
            { x: buttonX, y: startY + spacing * 3, width: buttonWidth, height: buttonHeight, label: "Play Error (200 Hz)", action: () => app.sound.error() },
            { x: buttonX, y: startY + spacing * 4, width: buttonWidth, height: buttonHeight, label: "Custom Tone (880 Hz)", action: () => app.sound.playTone(880, 300, 0.4) },
        ];
        
        // Draw buttons
        for (const button of buttons) {
            // Button background
            for (let x = button.x; x < button.x + button.width && x < w; x++) {
                for (let y = button.y; y < button.y + button.height && y < h; y++) {
                    window.draw(x, y, LIGHT_BLUE);
                }
            }
            
            // Button border
            for (let x = button.x; x < button.x + button.width && x < w; x++) {
                window.draw(x, button.y, BLUE);
                window.draw(x, button.y + button.height - 1, BLUE);
            }
            for (let y = button.y; y < button.y + button.height && y < h; y++) {
                window.draw(button.x, y, BLUE);
                window.draw(button.x + button.width - 1, y, BLUE);
            }
            
            // Button label - centered
            const labelX = button.x + Math.floor((button.width - button.label.length * 8) / 2);
            const labelY = button.y + Math.floor((button.height - 10) / 2);
            window.write(labelX, labelY, button.label, BLACK, 2);
        }
        
        // Info text at bottom
        window.write(20, h - 60, "Frequencies:", BLACK, 2);
        window.write(20, h - 35, "Beep: 440Hz | Click: 1000Hz | Success: 600Hz", GRAY, 1);
        window.write(20, h - 20, "Error: 200Hz | Custom: 880Hz", GRAY, 1);
        
        window.flush();
    }
    
    window.onNewFrame((width: number, height: number) => {
        console.log(`→ Sound Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    // Handle mouse clicks on buttons
    window.mouse.onMousePress((event: any) => {
        for (const button of buttons) {
            if (
                event.x >= button.x &&
                event.x <= button.x + button.width &&
                event.y >= button.y &&
                event.y <= button.y + button.height
            ) {
                console.log(`→ Sound button clicked: ${button.label}`);
                const success = button.action();
                if (success) {
                    console.log(`→ Sound played successfully`);
                } else {
                    console.log(`→ Failed to play sound`);
                }
                break;
            }
        }
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
