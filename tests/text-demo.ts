import type { Window } from "../src/window";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GRAY = 0x808080;

export function createTextDemo(app: any): Window {
    const window = app.createWindow("Text Demo", 600, 400);
    
    function draw(w: number, h: number) {
        const menuHeight = window.getMenuBarHeight();
        
        window.setBackground(0xFFFFFF); // White background
        
        const centerX = Math.floor(w / 2);
        const contentY = menuHeight + 20;
        
        // Title
        window.write(centerX - 60, contentY + 10, "Text Rendering", BLACK, 3); // large
        
        // Subtitle
        window.write(centerX - 80, contentY + 40, "Built with Notcha", GRAY, 2); // medium
        
        // Sample text with different sizes
        const lines = [
            { text: "Text Size Demo", size: 4 }, // xlarge
            { text: "This demonstrates variable text sizes", size: 2 }, // medium
            { text: "", size: 2 },
            { text: "Size 1 (Small) - 12px", size: 1 },
            { text: "Size 2 (Medium) - 14px", size: 2 },
            { text: "Size 3 (Large) - 18px", size: 3 },
            { text: "Size 4 (XLarge) - 24px", size: 4 },
            { text: "", size: 2 },
            { text: "Features:", size: 2 },
            { text: "- Multi-line text", size: 1 },
            { text: "- Color support", size: 1 },
            { text: "- Variable text sizes", size: 1 },
            { text: "- Framebuffer rendering", size: 1 },
        ];
        
        let yPos = contentY + 80;
        for (const line of lines) {
            if (yPos > h - 30) break;
            const color = line.text.startsWith("-") ? BLUE : BLACK;
            window.write(50, yPos, line.text, color, line.size);
            // Adjust spacing based on text size
            const spacing = line.size === 4 ? 35 : line.size === 3 ? 28 : line.size === 1 ? 18 : 22;
            yPos += spacing;
        }
        
        // Draw menu bar last so it's on top
        window.drawMenuBar();
        
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
