const std = @import("std");
const c = @cImport({
    @cInclude("X11/Xlib.h");
    @cInclude("X11/Xutil.h");
});

var display: ?*c.Display = null;
var screen: c_int = 0;
var wm_delete_window: c.Atom = 0;
var wm_protocols: c.Atom = 0;

// Track closed windows, redraw flags, and pixmaps (framebuffers)
var gpa = std.heap.GeneralPurposeAllocator(.{}){};
var closed_windows: std.AutoHashMap(c.Window, bool) = undefined;
var redraw_needed: std.AutoHashMap(c.Window, bool) = undefined;
var pixmaps: std.AutoHashMap(c.Window, c.Pixmap) = undefined;
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
        redraw_needed = std.AutoHashMap(c.Window, bool).init(gpa.allocator());
        pixmaps = std.AutoHashMap(c.Window, c.Pixmap).init(gpa.allocator());
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
        redraw_needed.deinit();
        pixmaps.deinit();
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

    // Create a pixmap (framebuffer) for this window
    const depth = @as(c_uint, @intCast(c.XDefaultDepth(d, screen)));
    const pixmap = c.XCreatePixmap(d, win, @intCast(width), @intCast(height), depth);
    pixmaps.put(win, pixmap) catch {};

    return win;
}

pub export fn drawPixel(win: c.Window, x: c_int, y: c_int, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    _ = c.XSetForeground(d, gc, color);
    _ = c.XDrawPoint(d, pixmap, gc, x, y);
}

pub export fn setBackground(win: c.Window, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    // Get window attributes to fill entire pixmap
    var attrs: c.XWindowAttributes = undefined;
    _ = c.XGetWindowAttributes(d, win, &attrs);

    _ = c.XSetForeground(d, gc, color);
    _ = c.XFillRectangle(d, pixmap, gc, 0, 0, @intCast(attrs.width), @intCast(attrs.height));
}

pub export fn drawText(win: c.Window, x: c_int, y: c_int, text: [*:0]const u8, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    _ = c.XSetForeground(d, gc, color);
    _ = c.XDrawString(d, pixmap, gc, x, y, text, @intCast(std.mem.len(text)));
}

pub export fn flushWindow(win: c.Window) void {
    if (display == null) return;
    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    // Get current window dimensions
    var attrs: c.XWindowAttributes = undefined;
    _ = c.XGetWindowAttributes(d, win, &attrs);

    // Copy pixmap to window
    _ = c.XCopyArea(d, pixmap, win, gc, 0, 0, @intCast(attrs.width), @intCast(attrs.height), 0, 0);
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

        // Handle Expose and ConfigureNotify events
        if (event.type == c.Expose or event.type == c.ConfigureNotify) {
            redraw_needed.put(event.xexpose.window, true) catch {};

            // If ConfigureNotify (resize), recreate pixmap with new size
            if (event.type == c.ConfigureNotify) {
                const win = event.xconfigure.window;
                const new_width = event.xconfigure.width;
                const new_height = event.xconfigure.height;

                // Free old pixmap
                if (pixmaps.get(win)) |old_pixmap| {
                    _ = c.XFreePixmap(d, old_pixmap);
                }

                // Create new pixmap with new size
                const depth = @as(c_uint, @intCast(c.XDefaultDepth(d, screen)));
                const new_pixmap = c.XCreatePixmap(d, win, @intCast(new_width), @intCast(new_height), depth);
                pixmaps.put(win, new_pixmap) catch {};
            }
        }
    }

    return true;
}

pub export fn checkWindowClosed(win: c.Window) bool {
    if (!windows_init) return false;
    return closed_windows.get(win) orelse false;
}

pub export fn getWindowWidth(win: c.Window) c_int {
    if (display == null) return 0;

    const d = display orelse return 0;
    var attrs: c.XWindowAttributes = undefined;
    _ = c.XGetWindowAttributes(d, win, &attrs);
    return attrs.width;
}

pub export fn getWindowHeight(win: c.Window) c_int {
    if (display == null) return 0;

    const d = display orelse return 0;
    var attrs: c.XWindowAttributes = undefined;
    _ = c.XGetWindowAttributes(d, win, &attrs);
    return attrs.height;
}

pub export fn checkWindowNeedsRedraw(win: c.Window) bool {
    if (!windows_init) return false;

    const needs_redraw = redraw_needed.get(win) orelse false;
    if (needs_redraw) {
        // Clear the flag after checking
        _ = redraw_needed.remove(win);
    }
    return needs_redraw;
}

pub export fn destroyWindow(win: c.Window) void {
    if (display) |d| {
        // Free pixmap first
        if (windows_init) {
            if (pixmaps.get(win)) |pixmap| {
                _ = c.XFreePixmap(d, pixmap);
            }
        }
        _ = c.XDestroyWindow(d, win);
        _ = c.XFlush(d);
    }
    // Remove from maps
    if (windows_init) {
        _ = closed_windows.remove(win);
        _ = redraw_needed.remove(win);
        _ = pixmaps.remove(win);
    }
}
