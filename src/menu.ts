export interface MenuItem {
    label?: string;
    action?: () => void;
    separator?: boolean;
    submenu?: MenuItem[];
    enabled?: boolean;
}

export interface Menu {
    label: string;
    items: MenuItem[];
}

export class MenuBar {
    private menus: Menu[] = [];
    private activeMenuIndex: number = -1;
    private hoveredItemIndex: number = -1;
    
    // Visual constants
    private readonly MENU_BAR_HEIGHT = 30;
    private readonly MENU_ITEM_HEIGHT = 25;
    private readonly MENU_PADDING = 10;
    private readonly DROPDOWN_WIDTH = 200;
    
    // Colors
    private readonly BG_COLOR = 0xF0F0F0;
    private readonly HOVER_COLOR = 0xD0D0FF;
    private readonly ACTIVE_COLOR = 0xB0B0FF;
    private readonly TEXT_COLOR = 0x000000;
    private readonly BORDER_COLOR = 0x808080;
    private readonly SEPARATOR_COLOR = 0xC0C0C0;

    constructor() {}

    addMenu(menu: Menu): void {
        this.menus.push(menu);
    }

    getMenuBarHeight(): number {
        return this.MENU_BAR_HEIGHT;
    }

    // Check if click is in menu bar area
    isInMenuBar(x: number, y: number): boolean {
        return y >= 0 && y < this.MENU_BAR_HEIGHT;
    }

    // Handle click in menu bar
    handleClick(x: number, y: number): boolean {
        if (y < this.MENU_BAR_HEIGHT) {
            // Click in menu bar
            let currentX = 0;
            for (let i = 0; i < this.menus.length; i++) {
                const menu = this.menus[i];
                if (!menu) continue;
                const menuWidth = menu.label.length * 8 + this.MENU_PADDING * 2;
                if (x >= currentX && x < currentX + menuWidth) {
                    if (this.activeMenuIndex === i) {
                        this.activeMenuIndex = -1; // Close if already open
                    } else {
                        this.activeMenuIndex = i; // Open this menu
                        this.hoveredItemIndex = -1;
                    }
                    return true;
                }
                currentX += menuWidth;
            }
            // Click outside any menu
            this.activeMenuIndex = -1;
            return true;
        } else if (this.activeMenuIndex >= 0) {
            // Click in dropdown area
            const menu = this.menus[this.activeMenuIndex];
            if (!menu) return false;
            
            const menuX = this.getMenuX(this.activeMenuIndex);
            
            if (x >= menuX && x < menuX + this.DROPDOWN_WIDTH) {
                let itemY = this.MENU_BAR_HEIGHT;
                for (let i = 0; i < menu.items.length; i++) {
                    const item = menu.items[i];
                    if (!item) continue;
                    
                    const itemHeight = item.separator ? 5 : this.MENU_ITEM_HEIGHT;
                    
                    if (y >= itemY && y < itemY + itemHeight) {
                        if (!item.separator && item.enabled !== false && item.action) {
                            item.action();
                            this.activeMenuIndex = -1;
                            return true;
                        }
                    }
                    itemY += itemHeight;
                }
            }
            // Click outside dropdown - close it
            this.activeMenuIndex = -1;
            return true;
        }
        
        return false;
    }

    // Handle mouse movement for hover effects
    // Returns true if hover state changed and needs redraw
    handleMouseMove(x: number, y: number, windowWidth: number): boolean {
        const oldHoveredItemIndex = this.hoveredItemIndex;
        
        if (this.activeMenuIndex >= 0 && y >= this.MENU_BAR_HEIGHT) {
            const menu = this.menus[this.activeMenuIndex];
            if (!menu) {
                this.hoveredItemIndex = -1;
                return oldHoveredItemIndex !== this.hoveredItemIndex;
            }
            
            const menuX = this.getAdjustedMenuX(this.activeMenuIndex, windowWidth);
            
            if (x >= menuX && x < menuX + this.DROPDOWN_WIDTH) {
                let itemY = this.MENU_BAR_HEIGHT;
                for (let i = 0; i < menu.items.length; i++) {
                    const item = menu.items[i];
                    if (!item) continue;
                    
                    const itemHeight = item.separator ? 5 : this.MENU_ITEM_HEIGHT;
                    
                    if (y >= itemY && y < itemY + itemHeight && !item.separator) {
                        this.hoveredItemIndex = i;
                        return oldHoveredItemIndex !== this.hoveredItemIndex;
                    }
                    itemY += itemHeight;
                }
            }
        }
        this.hoveredItemIndex = -1;
        return oldHoveredItemIndex !== this.hoveredItemIndex;
    }

    private getMenuX(menuIndex: number): number {
        let x = 0;
        for (let i = 0; i < menuIndex; i++) {
            const menu = this.menus[i];
            if (!menu) continue;
            x += menu.label.length * 8 + this.MENU_PADDING * 2;
        }
        return x;
    }
    
    private getAdjustedMenuX(menuIndex: number, windowWidth: number): number {
        let x = this.getMenuX(menuIndex);
        // Constrain to window bounds
        if (x + this.DROPDOWN_WIDTH > windowWidth) {
            x = windowWidth - this.DROPDOWN_WIDTH;
        }
        if (x < 0) {
            x = 0;
        }
        return x;
    }

    // Draw the menu bar and active dropdown
    draw(drawPixel: (x: number, y: number, color: number) => void,
         drawText: (x: number, y: number, text: string, color: number, size?: number) => void,
         windowWidth: number,
         windowHeight: number): void {
        
        // Draw menu bar background
        for (let y = 0; y < this.MENU_BAR_HEIGHT; y++) {
            for (let x = 0; x < windowWidth; x++) {
                drawPixel(x, y, this.BG_COLOR);
            }
        }

        // Draw menu bar bottom border
        for (let x = 0; x < windowWidth; x++) {
            drawPixel(x, this.MENU_BAR_HEIGHT - 1, this.BORDER_COLOR);
        }

        // Draw menu labels
        let currentX = 0;
        for (let i = 0; i < this.menus.length; i++) {
            const menu = this.menus[i];
            if (!menu) continue;
            const menuWidth = menu.label.length * 8 + this.MENU_PADDING * 2;
            
            // Highlight active menu
            if (i === this.activeMenuIndex) {
                for (let y = 0; y < this.MENU_BAR_HEIGHT - 1; y++) {
                    for (let x = currentX; x < currentX + menuWidth; x++) {
                        drawPixel(x, y, this.ACTIVE_COLOR);
                    }
                }
            }
            
            // Draw menu label (centered vertically)
            drawText(currentX + this.MENU_PADDING, 17, menu.label, this.TEXT_COLOR, 2);
            
            currentX += menuWidth;
        }

        // Draw active dropdown
        if (this.activeMenuIndex >= 0) {
            const menu = this.menus[this.activeMenuIndex];
            if (!menu) return;
            
            // Get adjusted menu X position to stay within window bounds
            const adjustedMenuX = this.getAdjustedMenuX(this.activeMenuIndex, windowWidth);
            
            // Calculate dropdown height
            let dropdownHeight = 0;
            for (const item of menu.items) {
                if (!item) continue;
                dropdownHeight += item.separator ? 5 : this.MENU_ITEM_HEIGHT;
            }
            
            // Constrain dropdown to window bounds
            const maxHeight = windowHeight - this.MENU_BAR_HEIGHT;
            if (dropdownHeight > maxHeight) {
                dropdownHeight = maxHeight;
            }
            
            // Draw dropdown background and border
            for (let y = this.MENU_BAR_HEIGHT; y < this.MENU_BAR_HEIGHT + dropdownHeight && y < windowHeight; y++) {
                for (let x = adjustedMenuX; x < adjustedMenuX + this.DROPDOWN_WIDTH && x < windowWidth; x++) {
                    if (x === adjustedMenuX || x === adjustedMenuX + this.DROPDOWN_WIDTH - 1 ||
                        y === this.MENU_BAR_HEIGHT || y === this.MENU_BAR_HEIGHT + dropdownHeight - 1) {
                        drawPixel(x, y, this.BORDER_COLOR);
                    } else {
                        drawPixel(x, y, this.BG_COLOR);
                    }
                }
            }
            
            // Draw menu items
            let itemY = this.MENU_BAR_HEIGHT;
            for (let i = 0; i < menu.items.length; i++) {
                const item = menu.items[i];
                if (!item) continue;
                
                // Stop drawing if we've exceeded window bounds
                if (itemY >= windowHeight) break;
                
                if (item.separator) {
                    // Draw separator line
                    const sepY = itemY + 2;
                    if (sepY < windowHeight) {
                        for (let x = adjustedMenuX + 5; x < adjustedMenuX + this.DROPDOWN_WIDTH - 5 && x < windowWidth; x++) {
                            drawPixel(x, sepY, this.SEPARATOR_COLOR);
                        }
                    }
                    itemY += 5;
                } else {
                    // Highlight hovered item
                    if (i === this.hoveredItemIndex && item.enabled !== false && itemY + this.MENU_ITEM_HEIGHT <= windowHeight) {
                        for (let y = itemY + 1; y < itemY + this.MENU_ITEM_HEIGHT - 1 && y < windowHeight; y++) {
                            for (let x = adjustedMenuX + 1; x < adjustedMenuX + this.DROPDOWN_WIDTH - 1 && x < windowWidth; x++) {
                                drawPixel(x, y, this.HOVER_COLOR);
                            }
                        }
                    }
                    
                    // Draw item text (centered vertically)
                    if (itemY + 15 < windowHeight) {
                        const textColor = item.enabled === false ? 0x808080 : this.TEXT_COLOR;
                        const itemLabel = item.label || '';
                        drawText(adjustedMenuX + 10, itemY + 15, itemLabel, textColor, 2);
                    }
                    
                    itemY += this.MENU_ITEM_HEIGHT;
                }
            }
        }
    }

    isDropdownOpen(): boolean {
        return this.activeMenuIndex >= 0;
    }

    closeDropdown(): void {
        this.activeMenuIndex = -1;
        this.hoveredItemIndex = -1;
    }
}
