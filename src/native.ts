import { dlopen, FFIType, suffix } from "bun:ffi";
import * as path from "path";
import { existsSync } from "fs";

function getPlatformLibPath(): string {
    const baseDir = path.join(import.meta.dir, "../zig-out/lib");
    const libPath = path.join(baseDir, `libnotcha-window.${suffix}`);
    
    if (!existsSync(libPath)) {
        throw new Error(`Library not found at ${libPath}. Run './build.sh' first.`);
    }
    
    return libPath;
}

const libPath = getPlatformLibPath();

let lib: any = null;

function ensureLib() {
    if (lib) return lib;
    
    try {
        lib = dlopen(libPath, {
            initDisplay: {
                args: [],
                returns: FFIType.bool,
            },
            closeDisplay: {
                args: [],
                returns: FFIType.void,
            },
            createWindow: {
                args: [FFIType.cstring, FFIType.i32, FFIType.i32],
                returns: FFIType.u64,
            },
            drawPixel: {
                args: [FFIType.u64, FFIType.i32, FFIType.i32, FFIType.u64],
                returns: FFIType.void,
            },
            processEvents: {
                args: [],
                returns: FFIType.bool,
            },
            destroyWindow: {
                args: [FFIType.u64],
                returns: FFIType.void,
            },
            setBackground: {
                args: [FFIType.u64, FFIType.u64],
                returns: FFIType.void,
            },
            drawText: {
                args: [FFIType.u64, FFIType.i32, FFIType.i32, FFIType.cstring, FFIType.u64],
                returns: FFIType.void,
            },
            checkWindowClosed: {
                args: [FFIType.u64],
                returns: FFIType.bool,
            },
        });
    } catch (e) {
        console.error("Failed to load native library:", e);
        console.error("Make sure to build the Zig library first: zig build");
        throw e;
    }
    
    return lib;
}

export function initDisplay(): boolean {
    const l = ensureLib();
    return l.symbols.initDisplay();
}

export function closeDisplay(): void {
    if (lib) {
        lib.symbols.closeDisplay();
    }
}

export function createWindow(title: string, width: number = 800, height: number = 600): bigint {
    const l = ensureLib();
    return l.symbols.createWindow(Buffer.from(title + "\0", "utf-8"), width, height);
}

export function drawPixel(win: bigint, x: number, y: number, color: number): void {
    const l = ensureLib();
    l.symbols.drawPixel(win, x, y, BigInt(color));
}

export function processEvents(): boolean {
    const l = ensureLib();
    return l.symbols.processEvents();
}

export function destroyWindow(win: bigint): void {
    const l = ensureLib();
    l.symbols.destroyWindow(win);
}

export function setBackground(win: bigint, color: number): void {
    const l = ensureLib();
    l.symbols.setBackground(win, BigInt(color));
}

export function drawText(win: bigint, x: number, y: number, text: string, color: number): void {
    const l = ensureLib();
    l.symbols.drawText(win, x, y, Buffer.from(text + "\0", "utf-8"), BigInt(color));
}

export function checkWindowClosed(win: bigint): boolean {
    const l = ensureLib();
    return l.symbols.checkWindowClosed(win);
}
