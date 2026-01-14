export class Scrollbar {
    private scrollOffset: number = 0;
    private contentHeight: number = 0;
    private visibleHeight: number = 0;
    private isDragging: boolean = false;
    
    // Visual constants
    private readonly SCROLLBAR_WIDTH = 12;
    private readonly MIN_THUMB_HEIGHT = 30;
    
    // Colors
    private readonly TRACK_COLOR = 0xE0E0E0;
    private readonly THUMB_COLOR = 0xA0A0A0;
    private readonly THUMB_HOVER_COLOR = 0x808080;
    private readonly THUMB_ACTIVE_COLOR = 0x606060;
    
    private hoveredThumb: boolean = false;

    constructor() {}

    /**
     * Update content and visible heights
     */
    updateDimensions(contentHeight: number, visibleHeight: number): void {
        this.contentHeight = contentHeight;
        this.visibleHeight = visibleHeight;
        
        // Clamp scroll offset to valid range
        const maxScroll = Math.max(0, this.contentHeight - this.visibleHeight);
        if (this.scrollOffset > maxScroll) {
            this.scrollOffset = maxScroll;
        }
    }

    /**
     * Check if scrolling is needed
     */
    isScrollable(): boolean {
        return this.contentHeight > this.visibleHeight;
    }

    /**
     * Get current scroll offset
     */
    getScrollOffset(): number {
        return this.scrollOffset;
    }

    /**
     * Get maximum scroll offset
     */
    getMaxScroll(): number {
        return Math.max(0, this.contentHeight - this.visibleHeight);
    }

    /**
     * Handle mouse wheel scrolling
     */
    handleScroll(delta: number): boolean {
        if (!this.isScrollable()) return false;
        
        const oldOffset = this.scrollOffset;
        
        // Scroll by 20% of visible height
        const scrollAmount = Math.max(50, this.visibleHeight * 0.2);
        this.scrollOffset += delta * scrollAmount;
        
        // Clamp to valid range
        this.scrollOffset = Math.max(0, Math.min(this.getMaxScroll(), this.scrollOffset));
        
        return oldOffset !== this.scrollOffset;
    }

    /**
     * Calculate thumb position and height
     */
    private getThumbBounds(windowWidth: number, windowHeight: number, menuHeight: number): { x: number, y: number, height: number } {
        const trackHeight = windowHeight - menuHeight;
        const visibleRatio = this.visibleHeight / this.contentHeight;
        let thumbHeight = Math.max(this.MIN_THUMB_HEIGHT, trackHeight * visibleRatio);
        
        // Prevent thumb from being larger than track
        if (thumbHeight > trackHeight) {
            thumbHeight = trackHeight;
        }
        
        // Calculate thumb position based on scroll offset
        const maxScroll = this.getMaxScroll();
        const scrollRatio = maxScroll > 0 ? this.scrollOffset / maxScroll : 0;
        const maxThumbY = trackHeight - thumbHeight;
        const thumbY = menuHeight + (maxThumbY * scrollRatio);
        
        return {
            x: windowWidth - this.SCROLLBAR_WIDTH,
            y: Math.round(thumbY),
            height: Math.round(thumbHeight)
        };
    }

    /**
     * Check if point is in scrollbar area
     */
    isInScrollbar(x: number, y: number, windowWidth: number, windowHeight: number, menuHeight: number): boolean {
        if (!this.isScrollable()) return false;
        return x >= windowWidth - this.SCROLLBAR_WIDTH && y >= menuHeight;
    }

    /**
     * Check if point is in thumb
     */
    isInThumb(x: number, y: number, windowWidth: number, windowHeight: number, menuHeight: number): boolean {
        if (!this.isScrollable()) return false;
        
        const thumb = this.getThumbBounds(windowWidth, windowHeight, menuHeight);
        return x >= thumb.x && x < windowWidth && y >= thumb.y && y < thumb.y + thumb.height;
    }

    /**
     * Handle mouse press on scrollbar
     */
    handleMousePress(x: number, y: number, windowWidth: number, windowHeight: number, menuHeight: number): boolean {
        if (!this.isScrollable()) return false;
        
        if (this.isInThumb(x, y, windowWidth, windowHeight, menuHeight)) {
            // Start dragging thumb
            this.isDragging = true;
            return true;
        } else if (this.isInScrollbar(x, y, windowWidth, windowHeight, menuHeight)) {
            // Click on track - jump to position
            const thumb = this.getThumbBounds(windowWidth, windowHeight, menuHeight);
            const trackHeight = windowHeight - menuHeight;
            const clickRatio = (y - menuHeight) / trackHeight;
            this.scrollOffset = clickRatio * this.getMaxScroll();
            this.scrollOffset = Math.max(0, Math.min(this.getMaxScroll(), this.scrollOffset));
            return true;
        }
        
        return false;
    }

    /**
     * Handle mouse release
     */
    handleMouseRelease(): void {
        this.isDragging = false;
    }

    /**
     * Handle mouse move for dragging and hover
     */
    handleMouseMove(x: number, y: number, windowWidth: number, windowHeight: number, menuHeight: number): boolean {
        const wasHovered = this.hoveredThumb;
        this.hoveredThumb = this.isInThumb(x, y, windowWidth, windowHeight, menuHeight);
        
        if (this.isDragging) {
            // Direct calculation: position thumb center at mouse Y
            const trackHeight = windowHeight - menuHeight;
            const thumb = this.getThumbBounds(windowWidth, windowHeight, menuHeight);
            const maxThumbY = trackHeight - thumb.height;
            
            // Calculate where thumb should be to center on mouse
            const targetThumbY = y - menuHeight - (thumb.height / 2);
            const clampedThumbY = Math.max(0, Math.min(maxThumbY, targetThumbY));
            
            // Convert thumb position directly to scroll offset
            if (maxThumbY > 0) {
                const thumbRatio = clampedThumbY / maxThumbY;
                this.scrollOffset = thumbRatio * this.getMaxScroll();
                this.scrollOffset = Math.max(0, Math.min(this.getMaxScroll(), this.scrollOffset));
            }
            
            return true;
        }
        
        return wasHovered !== this.hoveredThumb;
    }

    /**
     * Draw the scrollbar
     */
    draw(drawPixel: (x: number, y: number, color: number) => void, 
         windowWidth: number, 
         windowHeight: number,
         menuHeight: number): void {
        if (!this.isScrollable()) return;
        
        const trackX = windowWidth - this.SCROLLBAR_WIDTH;
        const trackY = menuHeight;
        const trackHeight = windowHeight - menuHeight;
        
        // Draw track
        for (let y = trackY; y < windowHeight; y++) {
            for (let x = trackX; x < windowWidth; x++) {
                drawPixel(x, y, this.TRACK_COLOR);
            }
        }
        
        // Draw thumb
        const thumb = this.getThumbBounds(windowWidth, windowHeight, menuHeight);
        let thumbColor = this.THUMB_COLOR;
        if (this.isDragging) {
            thumbColor = this.THUMB_ACTIVE_COLOR;
        } else if (this.hoveredThumb) {
            thumbColor = this.THUMB_HOVER_COLOR;
        }
        
        for (let y = thumb.y; y < thumb.y + thumb.height && y < windowHeight; y++) {
            for (let x = thumb.x; x < windowWidth; x++) {
                drawPixel(x, y, thumbColor);
            }
        }
    }

    /**
     * Get visible content width (accounting for scrollbar)
     */
    getVisibleWidth(windowWidth: number): number {
        return this.isScrollable() ? windowWidth - this.SCROLLBAR_WIDTH : windowWidth;
    }
}
