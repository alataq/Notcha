const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Build the main library (window.zig will import keyboard functions)
    const lib = b.addSharedLibrary(.{
        .name = "notcha-window",
        .root_source_file = .{ .cwd_relative = "src/native/window.zig" },
        .target = target,
        .optimize = optimize,
    });

    lib.linkLibC();
    lib.linkSystemLibrary("X11");
    lib.linkSystemLibrary("asound");

    b.installArtifact(lib);

    // Print build info
    const build_info = b.addSystemCommand(&[_][]const u8{
        "echo",
        "Building Notcha with X11 backend, keyboard, mouse, and sound support",
    });
    b.getInstallStep().dependOn(&build_info.step);
}
