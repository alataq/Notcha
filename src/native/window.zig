const std = @import("std");
const c = @cImport({
    @cInclude("X11/Xlib.h");
    @cInclude("X11/Xutil.h");
});

var display: ?*c.Display = null;
var screen: c_int = 0;
var wm_delete_window: c.Atom = 0;
var wm_protocols: c.Atom = 0;

// Track closed windows
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
var closed_windows: std.AutoHashMap(c.Window, bool) = undefined;
var windows_init = false;

pub export fn initDisplay() bool {
    display = c.XOpenDisplay(null);
    if (display == null) {
        return false;
    }
    screen = c.XDefaultScreen(display);

    const d = display orelse return false;
    wm_delete_window = c.XInternAtom(d, "WM_DELETE_WINDOW", 0);
    wm_protocols = c.XInternAtom(d, "WM_PROTOCOLS", 0);

    if (!windows_init) {
        closed_windows = std.AutoHashMap(c.Window, bool).init(gpa.allocator());
        windows_init = true;
    }

    return true;
}

pub export fn closeDisplay() void {
    if (display) |d| {
        _ = c.XCloseDisplay(d);
        display = null;
    }
    if (windows_init) {
        closed_windows.deinit();
        windows_init = false;
    }
}

pub export fn createWindow(title: [*:0]const u8, width: c_int, height: c_int) c.Window {
    if (display == null) {
        _ = initDisplay();
    }

    const d = display orelse return 0;
    const root = c.XDefaultRootWindow(d);
    const black = c.XBlackPixel(d, screen);
    const white = c.XWhitePixel(d, screen);

    const win = c.XCreateSimpleWindow(d, root, 0, 0, @intCast(width), @intCast(height), 1, black, white);

    _ = c.XStoreName(d, win, title);
    _ = c.XSelectInput(d, win, c.ExposureMask | c.KeyPressMask | c.ButtonPressMask | c.StructureNotifyMask);

    // Set up window close event
    var protocols: [1]c.Atom = .{wm_delete_window};
    _ = c.XSetWMProtocols(d, win, &protocols, 1);

    _ = c.XMapWindow(d, win);
    _ = c.XFlush(d);

    return win;
}

pub export fn drawPixel(win: c.Window, x: c_int, y: c_int, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    const gc = c.XDefaultGC(d, screen);

    _ = c.XSetForeground(d, gc, color);
    _ = c.XDrawPoint(d, win, gc, x, y);
    _ = c.XFlush(d);
}

pub export fn setBackground(win: c.Window, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    _ = c.XSetWindowBackground(d, win, color);
    _ = c.XClearWindow(d, win);
    _ = c.XFlush(d);
}

pub export fn drawText(win: c.Window, x: c_int, y: c_int, text: [*:0]const u8, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    const gc = c.XDefaultGC(d, screen);

    _ = c.XSetForeground(d, gc, color);
    _ = c.XDrawString(d, win, gc, x, y, text, @intCast(std.mem.len(text)));
    _ = c.XFlush(d);
}

pub export fn processEvents() bool {
    if (display == null) return false;

    const d = display orelse return false;

    var event: c.XEvent = undefined;
    while (c.XPending(d) > 0) {
        _ = c.XNextEvent(d, &event);

        // Handle ClientMessage events (including WM_DELETE_WINDOW)
        if (event.type == c.ClientMessage) {
            if (event.xclient.message_type == wm_protocols) {
                if (event.xclient.data.l[0] == @as(c_long, @intCast(wm_delete_window))) {
                    // Mark this window as closed
                    closed_windows.put(event.xclient.window, true) catch {};
                }
            }
        }
    }

    return true;
}

pub export fn checkWindowClosed(win: c.Window) bool {
    if (!windows_init) return false;
    return closed_windows.get(win) orelse false;
}

pub export fn destroyWindow(win: c.Window) void {
    if (display) |d| {
        _ = c.XDestroyWindow(d, win);
        _ = c.XFlush(d);
    }
    // Remove from closed windows map
    if (windows_init) {
        _ = closed_windows.remove(win);
    }
}
