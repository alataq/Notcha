const std = @import("std");
const clib = @import("c.zig");
const c = clib.c;

const window = @import("window.zig");

// Mouse event types
pub const MouseEventType = enum(c_int) {
    Press = 0,
    Release = 1,
    Move = 2,
    Scroll = 3,
};

// Mouse buttons
pub const MouseButton = enum(c_int) {
    Left = 1,
    Middle = 2,
    Right = 3,
    ScrollUp = 4,
    ScrollDown = 5,
};

// Mouse event structure
pub const MouseEvent = extern struct {
    event_type: c_int, // MouseEventType
    button: c_int, // MouseButton (0 for move events)
    x: c_int,
    y: c_int,
    window_handle: c.Window,
};

// Mouse event queue (circular buffer)
const MAX_MOUSE_EVENTS = 128;
var mouse_event_queue: [MAX_MOUSE_EVENTS]MouseEvent = undefined;
var mouse_event_start: usize = 0;
var mouse_event_end: usize = 0;
var mouse_event_count: usize = 0;

// Track current mouse position per window
var last_mouse_x: c_int = 0;
var last_mouse_y: c_int = 0;

pub export fn handleMousePress(win: c.Window, button: c_uint, x: c_int, y: c_int) void {
    if (mouse_event_count >= MAX_MOUSE_EVENTS) return;

    var event: MouseEvent = undefined;
    event.event_type = @intFromEnum(MouseEventType.Press);
    event.button = @intCast(button);
    event.x = x;
    event.y = y;
    event.window_handle = win;

    mouse_event_queue[mouse_event_end] = event;
    mouse_event_end = (mouse_event_end + 1) % MAX_MOUSE_EVENTS;
    mouse_event_count += 1;

    last_mouse_x = x;
    last_mouse_y = y;
}

pub export fn handleMouseRelease(win: c.Window, button: c_uint, x: c_int, y: c_int) void {
    if (mouse_event_count >= MAX_MOUSE_EVENTS) return;

    var event: MouseEvent = undefined;
    event.event_type = @intFromEnum(MouseEventType.Release);
    event.button = @intCast(button);
    event.x = x;
    event.y = y;
    event.window_handle = win;

    mouse_event_queue[mouse_event_end] = event;
    mouse_event_end = (mouse_event_end + 1) % MAX_MOUSE_EVENTS;
    mouse_event_count += 1;

    last_mouse_x = x;
    last_mouse_y = y;
}

pub export fn handleMouseMove(win: c.Window, x: c_int, y: c_int) void {
    if (mouse_event_count >= MAX_MOUSE_EVENTS) return;

    var event: MouseEvent = undefined;
    event.event_type = @intFromEnum(MouseEventType.Move);
    event.button = 0; // No button for move events
    event.x = x;
    event.y = y;
    event.window_handle = win;

    mouse_event_queue[mouse_event_end] = event;
    mouse_event_end = (mouse_event_end + 1) % MAX_MOUSE_EVENTS;
    mouse_event_count += 1;

    last_mouse_x = x;
    last_mouse_y = y;
}

pub export fn handleMouseScroll(win: c.Window, button: c_uint, x: c_int, y: c_int) void {
    if (mouse_event_count >= MAX_MOUSE_EVENTS) return;

    var event: MouseEvent = undefined;
    event.event_type = @intFromEnum(MouseEventType.Scroll);
    event.button = @intCast(button); // 4 = up, 5 = down
    event.x = x;
    event.y = y;
    event.window_handle = win;

    mouse_event_queue[mouse_event_end] = event;
    mouse_event_end = (mouse_event_end + 1) % MAX_MOUSE_EVENTS;
    mouse_event_count += 1;
}

pub export fn hasMouseEvents() bool {
    return mouse_event_count > 0;
}

pub export fn getNextMouseEvent(
    event_type: *c_int,
    button: *c_int,
    x: *c_int,
    y: *c_int,
    window_handle: *c_ulong,
) bool {
    if (mouse_event_count == 0) return false;

    const event = mouse_event_queue[mouse_event_start];
    mouse_event_start = (mouse_event_start + 1) % MAX_MOUSE_EVENTS;
    mouse_event_count -= 1;

    event_type.* = event.event_type;
    button.* = event.button;
    x.* = event.x;
    y.* = event.y;
    window_handle.* = event.window_handle;

    return true;
}

pub export fn clearMouseEvents() void {
    mouse_event_start = 0;
    mouse_event_end = 0;
    mouse_event_count = 0;
}

pub export fn getMousePosition(x: *c_int, y: *c_int) void {
    x.* = last_mouse_x;
    y.* = last_mouse_y;
}
