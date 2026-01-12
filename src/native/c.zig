// Shared C bindings for X11
pub const c = @cImport({
    @cInclude("X11/Xlib.h");
    @cInclude("X11/Xutil.h");
    @cInclude("X11/keysym.h");
    @cInclude("X11/XKBlib.h");
});
