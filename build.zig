const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const lib = b.addSharedLibrary(.{
        .name = "notcha-window",
        .root_source_file = .{ .cwd_relative = "src/native/window.zig" },
        .target = target,
        .optimize = optimize,
    });

    lib.linkLibC();
    lib.linkSystemLibrary("X11");

    b.installArtifact(lib);

    // Print build info
    const build_info = b.addSystemCommand(&[_][]const u8{
        "echo",
        "Building Notcha with X11 backend",
    });
    b.getInstallStep().dependOn(&build_info.step);
}
