import { App, System } from "../src/index";
import { Window } from "../src/window";

export function createSystemInfoDemo(app: App): Window {
    const window = app.createWindow("System Information", 700, 650);
    
    // Enable scrolling for system info
    window.enableScrolling();
    
    function draw() {
        window.setBackground(0xF5F5F5);
        
        const scrollOffset = window.getScrollOffset();
        const leftCol = 20;
        const rightCol = 250;
        let contentY = 20; // Actual content Y position (not affected by scroll)
        const lineHeight = 25;
        
        // Helper function to get display Y and advance content Y
        const drawY = () => contentY - scrollOffset;
        const advance = (amount: number) => { contentY += amount; };
        
        // Title
        window.write(leftCol, drawY(), "System Information", 0x000000, 4);
        advance(40);
        
        // Screen Information
        window.write(leftCol, drawY(), "Display", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        const screenSize = System.getScreenSize();
        window.write(leftCol, drawY(), "Screen Width:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${screenSize.width}px`, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Screen Height:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${screenSize.height}px`, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Resolution:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${screenSize.width}x${screenSize.height}`, 0x000000);
        advance(lineHeight);
        
        const aspectRatio = (screenSize.width / screenSize.height).toFixed(2);
        window.write(leftCol, drawY(), "Aspect Ratio:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, aspectRatio, 0x000000);
        advance(lineHeight + 15);
        
        // Display Server
        window.write(leftCol, drawY(), "Display Server", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        window.write(leftCol, drawY(), "Type:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, System.getDisplayServer(), 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "X11 Active:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, System.isX11() ? "Yes" : "No", System.isX11() ? 0x16A34A : 0xDC2626);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Wayland Active:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, System.isWayland() ? "Yes" : "No", System.isWayland() ? 0x16A34A : 0xDC2626);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Desktop Environment:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, System.getDesktopEnvironment(), 0x000000);
        advance(lineHeight + 15);
        
        // Operating System
        window.write(leftCol, drawY(), "Operating System", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        const osInfo = System.getOSInfo();
        window.write(leftCol, drawY(), "Platform:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, osInfo.platform, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Type:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, osInfo.type, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Release:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, osInfo.release, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Architecture:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, osInfo.arch, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Hostname:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, osInfo.hostname, 0x000000);
        advance(lineHeight + 15);
        
        // Memory Information
        window.write(leftCol, drawY(), "Memory", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        const memory = System.getMemoryInfo();
        const totalGB = (memory.total / 1024 / 1024 / 1024).toFixed(2);
        const freeGB = (memory.free / 1024 / 1024 / 1024).toFixed(2);
        const usedGB = (memory.used / 1024 / 1024 / 1024).toFixed(2);
        const usedPercentNum = (memory.used / memory.total) * 100;
        const usedPercent = usedPercentNum.toFixed(1);
        
        window.write(leftCol, drawY(), "Total RAM:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${totalGB} GB`, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Used RAM:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${usedGB} GB (${usedPercent}%)`, 0x000000);
        advance(lineHeight);
        
        window.write(leftCol, drawY(), "Free RAM:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${freeGB} GB`, 0x000000);
        advance(lineHeight);
        
        // Memory bar visualization
        const barWidth = 400;
        const barHeight = 20;
        const barX = leftCol;
        const barY = drawY() + 5;
        const usedWidth = Math.floor(barWidth * (memory.used / memory.total));
        
        // Draw memory bar background
        window.fillRect(barX, barY, barWidth, barHeight, 0xE5E7EB);
        // Draw used portion
        const memColor = usedPercentNum > 90 ? 0xDC2626 : usedPercentNum > 75 ? 0xF59E0B : 0x16A34A;
        window.fillRect(barX, barY, usedWidth, barHeight, memColor);
        
        advance(lineHeight + 25);
        
        // CPU Information
        window.write(leftCol, drawY(), "Processor", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        const cpus = System.getCPUInfo();
        window.write(leftCol, drawY(), "CPU Cores:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${cpus.length}`, 0x000000);
        advance(lineHeight);
        
        if (cpus.length > 0 && cpus[0]) {
            window.write(leftCol, drawY(), "Model:", 0x666666);
            const cpuModel = cpus[0].model.substring(0, 40); // Truncate if too long
            window.write(rightCol, contentY - scrollOffset, cpuModel, 0x000000);
            advance(lineHeight);
            
            window.write(leftCol, drawY(), "Speed:", 0x666666);
            window.write(rightCol, contentY - scrollOffset, `${cpus[0].speed} MHz`, 0x000000);
            advance(lineHeight);
        }
        advance(lineHeight + 15);
        
        // System Uptime
        window.write(leftCol, drawY(), "System", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        const uptime = System.getUptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        let uptimeStr = "";
        if (days > 0) uptimeStr += `${days}d `;
        if (hours > 0 || days > 0) uptimeStr += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) uptimeStr += `${minutes}m `;
        uptimeStr += `${seconds}s`;
        
        window.write(leftCol, drawY(), "Uptime:", 0x666666);
        window.write(rightCol, contentY - scrollOffset, uptimeStr, 0x000000);
        advance(lineHeight);
        
        const uptimeSeconds = Math.floor(uptime);
        window.write(leftCol, drawY(), "Uptime (seconds):", 0x666666);
        window.write(rightCol, contentY - scrollOffset, `${uptimeSeconds}`, 0x000000);
        advance(lineHeight + 15);
        
        // Environment Variables (selected important ones)
        window.write(leftCol, drawY(), "Environment", 0x2563EB, 3);
        advance(lineHeight + 5);
        
        const envVars = [
            { label: "DISPLAY", value: process.env.DISPLAY || "not set" },
            { label: "WAYLAND_DISPLAY", value: process.env.WAYLAND_DISPLAY || "not set" },
            { label: "XDG_SESSION_TYPE", value: process.env.XDG_SESSION_TYPE || "not set" },
            { label: "XDG_CURRENT_DESKTOP", value: process.env.XDG_CURRENT_DESKTOP || "not set" },
            { label: "HOME", value: process.env.HOME || "not set" },
            { label: "USER", value: process.env.USER || "not set" },
            { label: "SHELL", value: process.env.SHELL || "not set" },
        ];
        
        for (const envVar of envVars) {
            window.write(leftCol, drawY(), `${envVar.label}:`, 0x666666);
            const valueColor = envVar.value === "not set" ? 0x999999 : 0x000000;
            window.write(rightCol, contentY - scrollOffset, envVar.value, valueColor);
            advance(lineHeight);
        }
        
        advance(15);
        
        // Footer
        window.write(leftCol, drawY(), "Notcha v0.7.2 - System Information", 0x999999, 1);
        advance(20);
        
        // Set content height for scrolling - use contentY (the actual height)
        window.setContentHeight(contentY);
        
        // Draw scrollbar if needed
        window.drawScrollbar();
        
        window.flush();
    }
    
    window.onNewFrame(() => {
        draw();
    });
    
    window.onClose(() => {
        console.log("System Info window closed");
    });
    
    window.open();
    draw();
    
    return window;
}
