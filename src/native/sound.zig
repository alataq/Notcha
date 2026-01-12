const c = @import("c.zig").c;
const std = @import("std");

// Sound initialization state
var audio_initialized: bool = false;
var pcm_handle: ?*c.snd_pcm_t = null;

// Audio parameters
const SAMPLE_RATE = 44100;
const CHANNELS = 2;
const BUFFER_FRAMES = 1024;

/// Initialize the audio system (ALSA)
pub export fn initAudio() bool {
    if (audio_initialized) return true;

    var pcm: ?*c.snd_pcm_t = null;
    var err = c.snd_pcm_open(&pcm, "default", c.SND_PCM_STREAM_PLAYBACK, 0);
    if (err < 0) {
        std.debug.print("Failed to open PCM device: {s}\n", .{c.snd_strerror(err)});
        return false;
    }

    pcm_handle = pcm;

    // Set hardware parameters
    var params: ?*c.snd_pcm_hw_params_t = null;
    _ = c.snd_pcm_hw_params_malloc(&params);
    _ = c.snd_pcm_hw_params_any(pcm, params);

    // Set interleaved mode
    _ = c.snd_pcm_hw_params_set_access(pcm, params, c.SND_PCM_ACCESS_RW_INTERLEAVED);

    // Set format (16-bit signed)
    _ = c.snd_pcm_hw_params_set_format(pcm, params, c.SND_PCM_FORMAT_S16_LE);

    // Set channels
    _ = c.snd_pcm_hw_params_set_channels(pcm, params, CHANNELS);

    // Set sample rate
    var rate: c_uint = SAMPLE_RATE;
    _ = c.snd_pcm_hw_params_set_rate_near(pcm, params, &rate, null);

    // Set buffer size
    _ = c.snd_pcm_hw_params_set_buffer_size(pcm, params, BUFFER_FRAMES * 4);

    // Apply parameters
    err = c.snd_pcm_hw_params(pcm, params);
    if (err < 0) {
        std.debug.print("Failed to set hardware parameters: {s}\n", .{c.snd_strerror(err)});
        c.snd_pcm_hw_params_free(params);
        _ = c.snd_pcm_close(pcm);
        return false;
    }

    c.snd_pcm_hw_params_free(params);

    // Prepare the PCM for use
    err = c.snd_pcm_prepare(pcm);
    if (err < 0) {
        std.debug.print("Failed to prepare PCM: {s}\n", .{c.snd_strerror(err)});
        _ = c.snd_pcm_close(pcm);
        return false;
    }

    audio_initialized = true;
    return true;
}

/// Close the audio system
pub export fn closeAudio() void {
    if (pcm_handle) |pcm| {
        _ = c.snd_pcm_drain(pcm);
        _ = c.snd_pcm_close(pcm);
        pcm_handle = null;
    }
    audio_initialized = false;
}

/// Play a tone at the specified frequency for duration milliseconds
pub export fn playTone(frequency: c_int, duration_ms: c_int, volume: f32) bool {
    if (!audio_initialized or pcm_handle == null) return false;

    const pcm = pcm_handle orelse return false;

    const samples = @as(usize, @intCast(@divTrunc(SAMPLE_RATE * duration_ms, 1000)));
    const buffer_size = samples * CHANNELS;

    // Allocate buffer for audio samples
    var buffer = std.heap.page_allocator.alloc(i16, buffer_size) catch return false;
    defer std.heap.page_allocator.free(buffer);

    // Generate sine wave
    var i: usize = 0;
    while (i < samples) : (i += 1) {
        const t = @as(f32, @floatFromInt(i)) / @as(f32, @floatFromInt(SAMPLE_RATE));
        const angle = 2.0 * std.math.pi * @as(f32, @floatFromInt(frequency)) * t;
        const sample_f = @sin(angle) * volume * 32767.0;
        const sample = @as(i16, @intFromFloat(sample_f));

        // Stereo: same sample for both channels
        buffer[i * 2] = sample;
        buffer[i * 2 + 1] = sample;
    }

    // Write to PCM device
    const frames_to_write = @as(c.snd_pcm_uframes_t, @intCast(samples));
    const written = c.snd_pcm_writei(pcm, buffer.ptr, frames_to_write);

    if (written < 0) {
        // Try to recover from error
        _ = c.snd_pcm_recover(pcm, @intCast(written), 0);
        return false;
    }

    return true;
}

/// Play a beep sound (440 Hz for 200ms)
pub export fn playBeep() bool {
    return playTone(440, 200, 0.3);
}

/// Play a click sound (1000 Hz for 50ms)
pub export fn playClick() bool {
    return playTone(1000, 50, 0.2);
}

/// Play a success sound (600 Hz for 150ms)
pub export fn playSuccess() bool {
    return playTone(600, 150, 0.3);
}

/// Play an error sound (200 Hz for 300ms)
pub export fn playError() bool {
    return playTone(200, 300, 0.4);
}

/// Play an audio file from the filesystem
/// The file path should be a null-terminated C string
/// Supports WAV, OGG, FLAC, and other formats via libsndfile
pub export fn playAudioFile(file_path: [*:0]const u8) bool {
    if (!audio_initialized or pcm_handle == null) return false;

    const pcm = pcm_handle orelse return false;

    // Open the audio file
    var sf_info: c.SF_INFO = undefined;
    sf_info.format = 0;

    const file = c.sf_open(file_path, c.SFM_READ, &sf_info);
    if (file == null) {
        std.debug.print("Failed to open audio file: {s}\n", .{file_path});
        return false;
    }
    defer _ = c.sf_close(file);

    // Read and play the audio in chunks
    const chunk_size = BUFFER_FRAMES * @as(usize, @intCast(sf_info.channels));
    const buffer = std.heap.page_allocator.alloc(i16, chunk_size) catch return false;
    defer std.heap.page_allocator.free(buffer);

    // If the file is not stereo or sample rate doesn't match, we'll need to handle it
    // For simplicity, we'll play mono as stereo by duplicating channels
    // and accept any sample rate (ALSA will handle resampling if configured)

    var frames_read: c.sf_count_t = 0;
    while (true) {
        frames_read = c.sf_readf_short(file, buffer.ptr, BUFFER_FRAMES);
        if (frames_read <= 0) break;

        const frames_to_write = @as(c.snd_pcm_uframes_t, @intCast(frames_read));

        // If mono, convert to stereo
        if (sf_info.channels == 1) {
            var stereo_buffer = std.heap.page_allocator.alloc(i16, @as(usize, @intCast(frames_read)) * 2) catch return false;
            defer std.heap.page_allocator.free(stereo_buffer);

            var i: usize = 0;
            while (i < frames_read) : (i += 1) {
                stereo_buffer[i * 2] = buffer[i];
                stereo_buffer[i * 2 + 1] = buffer[i];
            }

            const result = c.snd_pcm_writei(pcm, stereo_buffer.ptr, frames_to_write);
            if (result < 0) {
                _ = c.snd_pcm_recover(pcm, @intCast(result), 0);
                return false;
            }
        } else {
            // Already stereo or multi-channel, play as-is
            const result = c.snd_pcm_writei(pcm, buffer.ptr, frames_to_write);
            if (result < 0) {
                _ = c.snd_pcm_recover(pcm, @intCast(result), 0);
                return false;
            }
        }
    }

    // Wait for playback to complete
    _ = c.snd_pcm_drain(pcm);

    // Re-prepare for next playback
    _ = c.snd_pcm_prepare(pcm);

    return true;
}
