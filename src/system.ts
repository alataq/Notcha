import * as native from "./native";
import * as os from "os";

/**
 * System utilities and information
 * Provides access to screen dimensions, OS info, and desktop environment details
 */
export class System {
    /**
     * Get the screen width in pixels
     * @returns Screen width or 0 if display not initialized
     */
    static getScreenWidth(): number {
        return native.getScreenWidth();
    }

    /**
     * Get the screen height in pixels
     * @returns Screen height or 0 if display not initialized
     */
    static getScreenHeight(): number {
        return native.getScreenHeight();
    }

    /**
     * Get screen dimensions
     * @returns Object with width and height, or {width: 0, height: 0} if not initialized
     */
    static getScreenSize(): { width: number; height: number } {
        return {
            width: this.getScreenWidth(),
            height: this.getScreenHeight(),
        };
    }

    /**
     * Get the operating system type
     * @returns OS type: 'linux', 'darwin', 'win32', etc.
     */
    static getOS(): string {
        return os.platform();
    }

    /**
     * Get detailed OS information
     * @returns Object with OS details
     */
    static getOSInfo(): {
        platform: string;
        type: string;
        release: string;
        arch: string;
        hostname: string;
    } {
        return {
            platform: os.platform(),
            type: os.type(),
            release: os.release(),
            arch: os.arch(),
            hostname: os.hostname(),
        };
    }

    /**
     * Get desktop environment (Linux only)
     * @returns Desktop environment name or 'unknown'
     */
    static getDesktopEnvironment(): string {
        if (os.platform() !== "linux") {
            return "n/a";
        }

        // Check common DE environment variables
        const envVars = [
            "XDG_CURRENT_DESKTOP",
            "DESKTOP_SESSION",
            "XDG_SESSION_DESKTOP",
        ];

        for (const envVar of envVars) {
            const value = process.env[envVar];
            if (value) {
                return value.toLowerCase();
            }
        }

        // Check for specific DEs
        if (process.env.GNOME_DESKTOP_SESSION_ID) return "gnome";
        if (process.env.KDE_FULL_SESSION) return "kde";
        if (process.env.MATE_DESKTOP_SESSION_ID) return "mate";

        return "unknown";
    }

    /**
     * Check if running under X11
     * @returns true if DISPLAY is set
     */
    static isX11(): boolean {
        return !!process.env.DISPLAY;
    }

    /**
     * Check if running under Wayland
     * @returns true if WAYLAND_DISPLAY is set
     */
    static isWayland(): boolean {
        return !!process.env.WAYLAND_DISPLAY;
    }

    /**
     * Get display server type
     * @returns 'x11', 'wayland', or 'unknown'
     */
    static getDisplayServer(): string {
        if (this.isWayland()) return "wayland";
        if (this.isX11()) return "x11";
        return "unknown";
    }

    /**
     * Get system memory information
     * @returns Object with memory details in bytes
     */
    static getMemoryInfo(): {
        total: number;
        free: number;
        used: number;
    } {
        const total = os.totalmem();
        const free = os.freemem();
        return {
            total,
            free,
            used: total - free,
        };
    }

    /**
     * Get CPU information
     * @returns Array of CPU core details
     */
    static getCPUInfo() {
        return os.cpus();
    }

    /**
     * Get system uptime in seconds
     * @returns System uptime
     */
    static getUptime(): number {
        return os.uptime();
    }
}
