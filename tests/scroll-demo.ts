import type { Window } from "../src/window";
import type { App } from "../src/app";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GRAY = 0xC0C0C0;
const LIGHT_GRAY = 0xF0F0F0;
const RED = 0xFF0000;
const GREEN = 0x00FF00;

export function createScrollDemo(app: App): Window {
    const window = app.createWindow("Scroll Demo", 600, 400);
    
    // Enable scrolling BEFORE opening window
    window.enableScrolling();
    
    function draw(w: number, h: number) {
        const menuHeight = window.getMenuBarHeight();
        const scrollOffset = window.getScrollOffset();
        const visibleWidth = window.getVisibleWidth();
        
        window.setBackground(0xFFFFFF); // White background
        
        // Calculate content height
        const itemCount = 50;
        const itemHeight = 40;
        const padding = 20;
        const totalContentHeight = padding + (itemCount * itemHeight) + padding;
        
        // Set content height for scrollbar calculation
        window.setContentHeight(totalContentHeight);
        
        const contentY = menuHeight + padding;
        
        // Title (always visible at top)
        window.write(20, contentY - scrollOffset, "Scrolling Content Demo", BLACK, 3);
        window.write(20, contentY + 30 - scrollOffset, "This window has " + itemCount + " items. Use mouse wheel or drag scrollbar!", GRAY, 1);
        
        // Draw many items to demonstrate scrolling
        let yPos = contentY + 70;
        for (let i = 0; i < itemCount; i++) {
            const itemY = yPos + (i * itemHeight) - scrollOffset;
            
            // Only draw if visible in viewport
            if (itemY + 30 >= menuHeight && itemY < h) {
                // Draw item number
                const itemColor = i % 3 === 0 ? BLUE : i % 3 === 1 ? RED : GREEN;
                window.write(40, itemY + 12, `Item #${i + 1}`, itemColor, 2);
                window.write(visibleWidth - 180, itemY + 12, `Y: ${Math.round(itemY)}`, GRAY, 1);
                
                // Draw a simple line separator
                for (let x = 30; x < visibleWidth - 30; x++) {
                    window.draw(x, itemY + 35, 0xE0E0E0);
                }
            }
        }
        
        // Draw scroll info at bottom (fixed position)
        const infoY = h - 25;
        window.write(20, infoY, `Scroll: ${Math.round(scrollOffset)}px / ${totalContentHeight - (h - menuHeight)}px`, BLACK, 1);
        
        // Draw scrollbar LAST so it's on top
        window.drawScrollbar();
        
        // Draw menu bar LAST
        window.drawMenuBar();
        
        window.flush();
    }
    
    window.onNewFrame((width, height) => {
        console.log(`→ Scroll Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
