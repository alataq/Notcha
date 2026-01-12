const std = @import("std");
const clib = @import("c.zig");
const c = clib.c;

const window = @import("window.zig");

// Track focused window
var focused_window: c.Window = 0;

// Keyboard event queue
const KeyEvent = struct {
    keycode: c_uint,
    keysym: c.ulong,
    state: c_uint,
    pressed: bool,
    key_name: [32]u8,
    key_name_len: usize,
};

const MAX_KEY_EVENTS = 64;
var key_event_queue: [MAX_KEY_EVENTS]KeyEvent = undefined;
var key_event_start: usize = 0;
var key_event_end: usize = 0;
var key_event_count: usize = 0;

pub export fn handleFocusIn(win: c.Window) void {
    focused_window = win;
}

pub export fn handleFocusOut(_: c.Window) void {
    focused_window = 0;
}

pub export fn getFocusedWindow() c.Window {
    return focused_window;
}

pub export fn isWindowFocused(win: c.Window) bool {
    return focused_window == win;
}

fn keysymToString(keysym: c.ulong, buffer: []u8) usize {
    // Common key mappings
    const key_str = switch (keysym) {
        c.XK_Return => "Enter",
        c.XK_Escape => "Escape",
        c.XK_BackSpace => "Backspace",
        c.XK_Tab => "Tab",
        c.XK_space => "Space",
        c.XK_Up => "ArrowUp",
        c.XK_Down => "ArrowDown",
        c.XK_Left => "ArrowLeft",
        c.XK_Right => "ArrowRight",
        c.XK_Shift_L, c.XK_Shift_R => "Shift",
        c.XK_Control_L, c.XK_Control_R => "Control",
        c.XK_Alt_L, c.XK_Alt_R => "Alt",
        c.XK_Super_L, c.XK_Super_R => "Meta",
        c.XK_Caps_Lock => "CapsLock",
        c.XK_Delete => "Delete",
        c.XK_Home => "Home",
        c.XK_End => "End",
        c.XK_Page_Up => "PageUp",
        c.XK_Page_Down => "PageDown",
        c.XK_Insert => "Insert",
        c.XK_F1 => "F1",
        c.XK_F2 => "F2",
        c.XK_F3 => "F3",
        c.XK_F4 => "F4",
        c.XK_F5 => "F5",
        c.XK_F6 => "F6",
        c.XK_F7 => "F7",
        c.XK_F8 => "F8",
        c.XK_F9 => "F9",
        c.XK_F10 => "F10",
        c.XK_F11 => "F11",
        c.XK_F12 => "F12",
        else => null,
    };

    if (key_str) |str| {
        const len = str.len;
        @memcpy(buffer[0..len], str);
        return len;
    }

    // For regular keys, use X11's conversion
    if (window.display) |_| {
        const key_str_ptr = c.XKeysymToString(keysym);
        if (key_str_ptr != null) {
            const c_str_len = std.mem.len(key_str_ptr);
            const copy_len = @min(c_str_len, buffer.len - 1);
            @memcpy(buffer[0..copy_len], key_str_ptr[0..copy_len]);
            return copy_len;
        }
    }

    // Fallback
    const fallback = "Unknown";
    @memcpy(buffer[0..fallback.len], fallback);
    return fallback.len;
}

pub export fn handleKeyEvent(keycode: c_uint, state: c_uint, pressed: bool) void {
    if (window.display == null) return;
    if (focused_window == 0) return;
    if (key_event_count >= MAX_KEY_EVENTS) return;

    // Get keysym from keycode
    const keysym = c.XkbKeycodeToKeysym(window.display, @intCast(keycode), 0, 0);

    var event: KeyEvent = undefined;
    event.keycode = keycode;
    event.keysym = keysym;
    event.state = state;
    event.pressed = pressed;

    // Convert keysym to string
    event.key_name_len = keysymToString(keysym, &event.key_name);

    // Add to queue
    key_event_queue[key_event_end] = event;
    key_event_end = (key_event_end + 1) % MAX_KEY_EVENTS;
    key_event_count += 1;
}

pub export fn hasKeyEvents() bool {
    return key_event_count > 0;
}

pub export fn getNextKeyEvent(
    keycode: *c_uint,
    keysym: *c_ulong,
    state: *c_uint,
    pressed: *bool,
    key_name_buffer: [*]u8,
    key_name_len: *c_uint,
) bool {
    if (key_event_count == 0) return false;

    const event = key_event_queue[key_event_start];
    key_event_start = (key_event_start + 1) % MAX_KEY_EVENTS;
    key_event_count -= 1;

    keycode.* = event.keycode;
    keysym.* = event.keysym;
    state.* = event.state;
    pressed.* = event.pressed;

    const copy_len = @min(event.key_name_len, 31); // Max 31 chars + null terminator
    @memcpy(key_name_buffer[0..copy_len], event.key_name[0..copy_len]);
    key_name_buffer[copy_len] = 0; // Null terminate
    key_name_len.* = @intCast(copy_len);

    return true;
}

pub export fn clearKeyEvents() void {
    key_event_start = 0;
    key_event_end = 0;
    key_event_count = 0;
}
