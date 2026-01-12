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
                args: [FFIType.u64, FFIType.i32, FFIType.i32, FFIType.cstring, FFIType.u64, FFIType.i32],
                returns: FFIType.void,
            },
            checkWindowClosed: {
                args: [FFIType.u64],
                returns: FFIType.bool,
            },
            getWindowWidth: {
                args: [FFIType.u64],
                returns: FFIType.i32,
            },
            getWindowHeight: {
                args: [FFIType.u64],
                returns: FFIType.i32,
            },
            checkWindowNeedsRedraw: {
                args: [FFIType.u64],
                returns: FFIType.bool,
            },
            flushWindow: {
                args: [FFIType.u64],
                returns: FFIType.void,
            },
            // Keyboard functions
            getFocusedWindow: {
                args: [],
                returns: FFIType.u64,
            },
            isWindowFocused: {
                args: [FFIType.u64],
                returns: FFIType.bool,
            },
            hasKeyEvents: {
                args: [],
                returns: FFIType.bool,
            },
            getNextKeyEvent: {
                args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr],
                returns: FFIType.bool,
            },
            clearKeyEvents: {
                args: [],
                returns: FFIType.void,
            },
            // Mouse functions
            hasMouseEvents: {
                args: [],
                returns: FFIType.bool,
            },
            getNextMouseEvent: {
                args: [FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr],
                returns: FFIType.bool,
            },
            clearMouseEvents: {
                args: [],
                returns: FFIType.void,
            },
            getMousePosition: {
                args: [FFIType.ptr, FFIType.ptr],
                returns: FFIType.void,
            },
            // Sound functions
            initAudio: {
                args: [],
                returns: FFIType.bool,
            },
            closeAudio: {
                args: [],
                returns: FFIType.void,
            },
            playTone: {
                args: [FFIType.i32, FFIType.i32, FFIType.f32],
                returns: FFIType.bool,
            },
            playBeep: {
                args: [],
                returns: FFIType.bool,
            },
            playClick: {
                args: [],
                returns: FFIType.bool,
            },
            playSuccess: {
                args: [],
                returns: FFIType.bool,
            },
            playError: {
                args: [],
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

export function drawText(win: bigint, x: number, y: number, text: string, color: number, size: number = 2): void {
    const l = ensureLib();
    l.symbols.drawText(win, x, y, Buffer.from(text + "\0", "utf-8"), BigInt(color), size);
}

export function checkWindowClosed(win: bigint): boolean {
    const l = ensureLib();
    return l.symbols.checkWindowClosed(win);
}

export function getWindowWidth(win: bigint): number {
    const l = ensureLib();
    return l.symbols.getWindowWidth(win);
}

export function getWindowHeight(win: bigint): number {
    const l = ensureLib();
    return l.symbols.getWindowHeight(win);
}

export function checkWindowNeedsRedraw(win: bigint): boolean {
    const l = ensureLib();
    return l.symbols.checkWindowNeedsRedraw(win);
}

export function flushWindow(win: bigint): void {
    const l = ensureLib();
    l.symbols.flushWindow(win);
}

export function getFocusedWindow(): bigint {
    const l = ensureLib();
    return l.symbols.getFocusedWindow();
}

export function isWindowFocused(win: bigint): boolean {
    const l = ensureLib();
    return l.symbols.isWindowFocused(win);
}

export function hasKeyEvents(): boolean {
    const l = ensureLib();
    return l.symbols.hasKeyEvents();
}

export function getNextKeyEvent(
    keycode: Uint32Array,
    keysym: Uint32Array,
    state: Uint32Array,
    pressed: Uint8Array,
    keyName: Uint8Array,
    keyNameLen: Uint32Array
): boolean {
    const l = ensureLib();
    return l.symbols.getNextKeyEvent(
        keycode,
        keysym,
        state,
        pressed,
        keyName,
        keyNameLen
    );
}

export function clearKeyEvents(): void {
    const l = ensureLib();
    l.symbols.clearKeyEvents();
}

export function hasMouseEvents(): boolean {
    const l = ensureLib();
    return l.symbols.hasMouseEvents();
}

export function getNextMouseEvent(
    eventType: BigUint64Array,
    button: Uint32Array,
    x: Int32Array,
    y: Int32Array,
    windowHandle: BigUint64Array
): boolean {
    const l = ensureLib();
    return l.symbols.getNextMouseEvent(
        eventType,
        button,
        x,
        y,
        windowHandle
    );
}

export function clearMouseEvents(): void {
    const l = ensureLib();
    l.symbols.clearMouseEvents();
}

export function getMousePosition(x: Int32Array, y: Int32Array): void {
    const l = ensureLib();
    l.symbols.getMousePosition(x, y);
}

export function initAudio(): boolean {
    const l = ensureLib();
    return l.symbols.initAudio();
}

export function closeAudio(): void {
    const l = ensureLib();
    l.symbols.closeAudio();
}

export function playTone(frequency: number, duration: number, volume: number): boolean {
    const l = ensureLib();
    return l.symbols.playTone(frequency, duration, volume);
}

export function playBeep(): boolean {
    const l = ensureLib();
    return l.symbols.playBeep();
}

export function playClick(): boolean {
    const l = ensureLib();
    return l.symbols.playClick();
}

export function playSuccess(): boolean {
    const l = ensureLib();
    return l.symbols.playSuccess();
}

export function playError(): boolean {
    const l = ensureLib();
    return l.symbols.playError();
}

export const native = {
    initDisplay,
    closeDisplay,
    createWindow,
    drawPixel,
    processEvents,
    destroyWindow,
    setBackground,
    drawText,
    checkWindowClosed,
    getWindowWidth,
    getWindowHeight,
    checkWindowNeedsRedraw,
    flushWindow,
    getFocusedWindow,
    isWindowFocused,
    hasKeyEvents,
    getNextKeyEvent,
    clearKeyEvents,
    hasMouseEvents,
    getNextMouseEvent,
    clearMouseEvents,
    getMousePosition,
    initAudio,
    closeAudio,
    playTone,
    playBeep,
    playClick,
    playSuccess,
    playError,
};
