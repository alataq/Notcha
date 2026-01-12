import type { Window } from "../src/window";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GRAY = 0x808080;

export function createTextDemo(app: any): Window {
    const window = app.createWindow("Text Demo", 600, 400);
    
    function draw(w: number, h: number) {
        window.setBackground(0xFFFFFF); // White background
        
        const centerX = Math.floor(w / 2);
        
        // Title
        window.write(centerX - 60, 50, "Text Rendering", BLACK);
        
        // Subtitle
        window.write(centerX - 80, 80, "Built with Notcha", GRAY);
        
        // Sample text
        const lines = [
            "This is a text demo window.",
            "It demonstrates text rendering",
            "capabilities in Notcha.",
            "",
            "Features:",
            "- Multi-line text",
            "- Color support",
            "- Framebuffer rendering",
            "- Flicker-free updates",
        ];
        
        let yPos = 120;
        for (const line of lines) {
            if (yPos > h - 30) break;
            window.write(50, yPos, line, line.startsWith("-") ? BLUE : BLACK);
            yPos += 25;
        }
        
        window.flush();
    }
    
    window.onNewFrame((width: number, height: number) => {
        console.log(`→ Text Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
