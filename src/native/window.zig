const std = @import("std");
const clib = @import("c.zig");
const c = clib.c;

const keyboard = @import("keyboard.zig");
const mouse = @import("mouse.zig");
const sound = @import("sound.zig");

// Export these for keyboard.zig
pub var display: ?*c.Display = null;
pub var screen: c_int = 0;
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
    _ = c.XSelectInput(d, win, c.ExposureMask | c.KeyPressMask | c.KeyReleaseMask | c.FocusChangeMask | c.ButtonPressMask | c.ButtonReleaseMask | c.PointerMotionMask | c.StructureNotifyMask);

    // Configure window attributes to reduce flickering
    var attrs: c.XSetWindowAttributes = undefined;
    attrs.backing_store = c.Always;
    attrs.bit_gravity = c.NorthWestGravity;
    attrs.win_gravity = c.NorthWestGravity;
    attrs.background_pixel = white;
    _ = c.XChangeWindowAttributes(d, win, c.CWBackingStore | c.CWBitGravity | c.CWWinGravity | c.CWBackPixel, &attrs);

    // Set up window close event
    var protocols: [1]c.Atom = .{wm_delete_window};
    _ = c.XSetWMProtocols(d, win, &protocols, 1);

    _ = c.XMapWindow(d, win);
    _ = c.XFlush(d);

    // Create a pixmap (framebuffer) for this window
    const depth = @as(c_uint, @intCast(c.XDefaultDepth(d, screen)));
    const pixmap = c.XCreatePixmap(d, win, @intCast(width), @intCast(height), depth);

    // Initialize pixmap with white background
    const gc = c.XDefaultGC(d, screen);
    _ = c.XSetForeground(d, gc, white);
    _ = c.XFillRectangle(d, pixmap, gc, 0, 0, @intCast(width), @intCast(height));

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

pub export fn drawText(win: c.Window, x: c_int, y: c_int, text: [*:0]const u8, color: c_ulong, size: c_int) void {
    if (display == null) return;

    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    _ = c.XSetForeground(d, gc, color);

    // Load font based on size
    // X11 fonts: negative size means pixels, positive means points (1/10 point)
    // We'll use pixel sizes: 12 (small), 14 (medium/default), 18 (large), 24 (xlarge)
    const font_name = switch (size) {
        1 => "-*-fixed-medium-r-*-*-12-*-*-*-*-*-*-*", // small
        2 => "-*-fixed-medium-r-*-*-14-*-*-*-*-*-*-*", // medium (default)
        3 => "-*-fixed-medium-r-*-*-18-*-*-*-*-*-*-*", // large
        4 => "-*-fixed-medium-r-*-*-24-*-*-*-*-*-*-*", // xlarge
        else => "-*-fixed-medium-r-*-*-14-*-*-*-*-*-*-*", // default to medium
    };

    const font = c.XLoadQueryFont(d, font_name);
    if (font) |f| {
        _ = c.XSetFont(d, gc, f.*.fid);
        _ = c.XDrawString(d, pixmap, gc, x, y, text, @intCast(std.mem.len(text)));
        _ = c.XFreeFont(d, f);
    } else {
        // Fallback to default font if loading fails
        _ = c.XDrawString(d, pixmap, gc, x, y, text, @intCast(std.mem.len(text)));
    }
}

pub export fn fillRect(win: c.Window, x: c_int, y: c_int, width: c_int, height: c_int, color: c_ulong) void {
    if (display == null) return;

    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    _ = c.XSetForeground(d, gc, color);
    _ = c.XFillRectangle(d, pixmap, gc, x, y, @intCast(width), @intCast(height));
}

pub export fn flushWindow(win: c.Window) void {
    if (display == null) return;
    const d = display orelse return;
    const pixmap = pixmaps.get(win) orelse return;
    const gc = c.XDefaultGC(d, screen);

    // Disable GraphicsExposures to prevent flicker
    _ = c.XSetGraphicsExposures(d, gc, 0);

    // Get current window dimensions
    var attrs: c.XWindowAttributes = undefined;
    _ = c.XGetWindowAttributes(d, win, &attrs);

    // Copy pixmap to window
    _ = c.XCopyArea(d, pixmap, win, gc, 0, 0, @intCast(attrs.width), @intCast(attrs.height), 0, 0);
    _ = c.XSync(d, 0);
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

        // Handle FocusIn events
        if (event.type == c.FocusIn) {
            keyboard.handleFocusIn(event.xfocus.window);
        }

        // Handle FocusOut events
        if (event.type == c.FocusOut) {
            keyboard.handleFocusOut(event.xfocus.window);
        }

        // Handle KeyPress events
        if (event.type == c.KeyPress) {
            keyboard.handleKeyEvent(event.xkey.keycode, event.xkey.state, true);
        }

        // Handle KeyRelease events
        if (event.type == c.KeyRelease) {
            keyboard.handleKeyEvent(event.xkey.keycode, event.xkey.state, false);
        }

        // Handle ButtonPress events (mouse button press)
        if (event.type == c.ButtonPress) {
            const button = event.xbutton.button;
            const x = event.xbutton.x;
            const y = event.xbutton.y;
            const win = event.xbutton.window;

            // Check if this is a scroll event (buttons 4 and 5)
            if (button == 4 or button == 5) {
                mouse.handleMouseScroll(win, button, x, y);
            } else {
                mouse.handleMousePress(win, button, x, y);
            }
        }

        // Handle ButtonRelease events (mouse button release)
        if (event.type == c.ButtonRelease) {
            const button = event.xbutton.button;
            const x = event.xbutton.x;
            const y = event.xbutton.y;
            const win = event.xbutton.window;

            // Ignore scroll button releases
            if (button != 4 and button != 5) {
                mouse.handleMouseRelease(win, button, x, y);
            }
        }

        // Handle MotionNotify events (mouse movement)
        if (event.type == c.MotionNotify) {
            const x = event.xmotion.x;
            const y = event.xmotion.y;
            const win = event.xmotion.window;

            mouse.handleMouseMove(win, x, y);
        }

        // Handle ConfigureNotify events (window resize)
        if (event.type == c.ConfigureNotify) {
            const win = event.xconfigure.window;
            const new_width = event.xconfigure.width;
            const new_height = event.xconfigure.height;

            // Check if there are more ConfigureNotify events pending for this window
            // If so, skip this one and wait for the final size
            var next_event: c.XEvent = undefined;
            const has_more = c.XCheckTypedWindowEvent(d, win, c.ConfigureNotify, &next_event);
            if (has_more != 0) {
                // Put the next event back and skip this one
                _ = c.XPutBackEvent(d, &next_event);
                continue;
            }

            // This is the final resize event - handle it
            const gc = c.XDefaultGC(d, screen);

            // Disable GraphicsExposures
            _ = c.XSetGraphicsExposures(d, gc, 0);

            // Get old pixmap (if exists)
            const old_pixmap = pixmaps.get(win);

            // Create new pixmap with new size
            const depth = @as(c_uint, @intCast(c.XDefaultDepth(d, screen)));
            const new_pixmap = c.XCreatePixmap(d, win, @intCast(new_width), @intCast(new_height), depth);

            // Fill with white first
            const white = c.XWhitePixel(d, screen);
            _ = c.XSetForeground(d, gc, white);
            _ = c.XFillRectangle(d, new_pixmap, gc, 0, 0, @intCast(new_width), @intCast(new_height));

            // Copy old content to new pixmap if we have one
            if (old_pixmap) |old_pix| {
                // Copy as much as possible from old to new
                _ = c.XCopyArea(d, old_pix, new_pixmap, gc, 0, 0, @intCast(new_width), @intCast(new_height), 0, 0);
                // Free old pixmap after copying
                _ = c.XFreePixmap(d, old_pix);
            }

            pixmaps.put(win, new_pixmap) catch {};

            // Immediately copy new pixmap to window and sync
            _ = c.XCopyArea(d, new_pixmap, win, gc, 0, 0, @intCast(new_width), @intCast(new_height), 0, 0);
            _ = c.XSync(d, 0);

            // Mark for redraw
            redraw_needed.put(win, true) catch {};
        }

        // Handle Expose events
        if (event.type == c.Expose) {
            // Only handle if this is the last expose event in the sequence
            if (event.xexpose.count == 0) {
                redraw_needed.put(event.xexpose.window, true) catch {};
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

pub export fn getScreenWidth() c_int {
    const d = display orelse return 0;
    return c.XDisplayWidth(d, screen);
}

pub export fn getScreenHeight() c_int {
    const d = display orelse return 0;
    return c.XDisplayHeight(d, screen);
}

// Force sound module to be referenced so its exports are included
comptime {
    _ = sound.initAudio;
    _ = sound.closeAudio;
    _ = sound.playTone;
    _ = sound.playBeep;
    _ = sound.playClick;
    _ = sound.playSuccess;
    _ = sound.playError;
    _ = sound.playAudioFile;
}
