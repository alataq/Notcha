import type { Window } from "../src/window";
import type { App } from "../src/app";
import type { Menu } from "../src/menu";

const BLACK = 0x000000;
const BLUE = 0x0000FF;
const GREEN = 0x00FF00;
const RED = 0xFF0000;
const WHITE = 0xFFFFFF;
const GRAY = 0xF5F5F5;

export function createMenuDemo(app: App): Window {
    const window = app.createWindow("Menu Demo", 600, 400);
    
    let bgColor = GRAY;
    let showAbout = false;
    let counter = 0;
    
    // Define menus
    const fileMenu: Menu = {
        label: "File",
        items: [
            { label: "New", action: () => { console.log("New clicked"); app.sound.click(); } },
            { label: "Open", action: () => { console.log("Open clicked"); app.sound.click(); } },
            { label: "Save", action: () => { console.log("Save clicked"); app.sound.click(); } },
            { separator: true },
            { label: "Exit", action: () => { window.close(); } },
        ]
    };
    
    const editMenu: Menu = {
        label: "Edit",
        items: [
            { label: "Undo", action: () => { console.log("Undo clicked"); app.sound.click(); } },
            { label: "Redo", action: () => { console.log("Redo clicked"); app.sound.click(); } },
            { separator: true },
            { label: "Cut", action: () => { console.log("Cut clicked"); app.sound.click(); } },
            { label: "Copy", action: () => { console.log("Copy clicked"); app.sound.click(); } },
            { label: "Paste", action: () => { console.log("Paste clicked"); app.sound.click(); } },
        ]
    };
    
    const viewMenu: Menu = {
        label: "View",
        items: [
            { label: "White Background", action: () => { bgColor = WHITE; draw(window.getWidth(), window.getHeight()); } },
            { label: "Gray Background", action: () => { bgColor = GRAY; draw(window.getWidth(), window.getHeight()); } },
            { label: "Blue Background", action: () => { bgColor = 0xE6F2FF; draw(window.getWidth(), window.getHeight()); } },
            { separator: true },
            { label: "Increment Counter", action: () => { counter++; draw(window.getWidth(), window.getHeight()); } },
            { label: "Reset Counter", action: () => { counter = 0; draw(window.getWidth(), window.getHeight()); } },
        ]
    };
    
    const helpMenu: Menu = {
        label: "Help",
        items: [
            { label: "Documentation", action: () => { console.log("Documentation clicked"); app.sound.click(); } },
            { label: "About", action: () => { showAbout = !showAbout; draw(window.getWidth(), window.getHeight()); } },
        ]
    };
    
    // Add menus to window
    window.addMenu(fileMenu);
    window.addMenu(editMenu);
    window.addMenu(viewMenu);
    window.addMenu(helpMenu);
    
    function draw(w: number, h: number) {
        const menuHeight = window.getMenuBarHeight();
        
        // Draw background
        window.setBackground(bgColor);
        
        // Draw content below menu bar
        const contentY = menuHeight + 20;
        
        window.write(20, contentY, "Menu Bar Demo", BLACK, 3);
        window.write(20, contentY + 40, "Try the menus above!", GRAY, 2);
        window.write(20, contentY + 70, `Counter: ${counter}`, BLUE, 2);
        
        if (showAbout) {
            // Draw about box
            const boxX = 50;
            const boxY = contentY + 110;
            const boxW = w - 100;
            const boxH = 100;
            
            // Box background
            for (let x = boxX; x < boxX + boxW; x++) {
                for (let y = boxY; y < boxY + boxH; y++) {
                    window.draw(x, y, WHITE);
                }
            }
            
            // Box border
            for (let x = boxX; x < boxX + boxW; x++) {
                window.draw(x, boxY, BLACK);
                window.draw(x, boxY + boxH - 1, BLACK);
            }
            for (let y = boxY; y < boxY + boxH; y++) {
                window.draw(boxX, y, BLACK);
                window.draw(boxX + boxW - 1, y, BLACK);
            }
            
            // About text
            window.write(boxX + 20, boxY + 20, "Notcha v0.6.0", BLACK, 2);
            window.write(boxX + 20, boxY + 45, "Menu Bar Demo", GRAY, 2);
            window.write(boxX + 20, boxY + 65, "Click Help > About to close", GRAY, 1);
        }
        
        // Instructions at bottom
        window.write(20, h - 40, "Click the menu items to see actions", GRAY, 1);
        window.write(20, h - 25, "View menu can change background and counter", GRAY, 1);
        
        // Draw menu bar last so it's on top (includes dropdowns)
        window.drawMenuBar();
        
        window.flush();
    }
    
    window.onNewFrame((width, height) => {
        console.log(`→ Menu Demo resized: ${width}x${height}`);
        draw(width, height);
    });
    
    window.open();
    draw(window.getWidth(), window.getHeight());
    
    return window;
}
