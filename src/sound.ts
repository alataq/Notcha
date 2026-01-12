import { native } from "./native";

export class Sound {
    private initialized: boolean = false;
    private audioProcesses: any[] = [];

    constructor() {}

    /**
     * Initialize the audio system
     * Must be called before playing any sounds
     */
    init(): boolean {
        if (this.initialized) return true;
        this.initialized = native.initAudio();
        return this.initialized;
    }

    /**
     * Close the audio system and free resources
     */
    close(): void {
        // Kill all running audio processes
        for (const proc of this.audioProcesses) {
            try {
                proc.kill();
            } catch (e) {
                // Ignore errors
            }
        }
        this.audioProcesses = [];
        
        if (this.initialized) {
            native.closeAudio();
            this.initialized = false;
        }
    }

    /**
     * Play a tone at the specified frequency
     * @param frequency Frequency in Hz (e.g., 440 for A4)
     * @param duration Duration in milliseconds
     * @param volume Volume level (0.0 to 1.0)
     */
    playTone(frequency: number, duration: number, volume: number = 0.5): boolean {
        if (!this.initialized) {
            console.warn("Audio system not initialized. Call sound.init() first.");
            return false;
        }
        return native.playTone(frequency, duration, volume);
    }

    /**
     * Play a beep sound (440 Hz for 200ms)
     */
    beep(): boolean {
        if (!this.initialized) {
            console.warn("Audio system not initialized. Call sound.init() first.");
            return false;
        }
        return native.playBeep();
    }

    /**
     * Play a click sound (1000 Hz for 50ms)
     */
    click(): boolean {
        if (!this.initialized) {
            console.warn("Audio system not initialized. Call sound.init() first.");
            return false;
        }
        return native.playClick();
    }

    /**
     * Play a success sound (600 Hz for 150ms)
     */
    success(): boolean {
        if (!this.initialized) {
            console.warn("Audio system not initialized. Call sound.init() first.");
            return false;
        }
        return native.playSuccess();
    }

    /**
     * Play an error sound (200 Hz for 300ms)
     */
    error(): boolean {
        if (!this.initialized) {
            console.warn("Audio system not initialized. Call sound.init() first.");
            return false;
        }
        return native.playError();
    }

    /**
     * Play an audio file from the filesystem or URL
     * Supports WAV, OGG, FLAC, and other formats
     * @param pathOrUrl Local file path or HTTP/HTTPS URL
     */
    async playFile(pathOrUrl: string): Promise<boolean> {
        if (!this.initialized) {
            console.warn("Audio system not initialized. Call sound.init() first.");
            return false;
        }

        // Check if it's a URL
        if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
            // Download to temporary file
            try {
                const response = await fetch(pathOrUrl);
                if (!response.ok) {
                    console.error(`Failed to fetch audio file: ${response.statusText}`);
                    return false;
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // Extract extension from URL or default to .wav
                let ext = '.wav';
                const urlPath = new URL(pathOrUrl).pathname;
                const match = urlPath.match(/\.(wav|ogg|flac|mp3|aiff)$/i);
                if (match) {
                    ext = match[0];
                }
                
                // Create a temporary file with proper extension
                const tmpFile = `/tmp/notcha_audio_${Date.now()}${ext}`;
                await Bun.write(tmpFile, buffer);
                
                console.log(`Downloaded audio to: ${tmpFile} (${buffer.length} bytes)`);
                
                // Play the file in a separate process to avoid blocking
                const workerPath = `${process.cwd()}/src/play-audio-worker.ts`;
                const proc = Bun.spawn(["bun", workerPath, tmpFile], {
                    stdout: "inherit",
                    stderr: "inherit",
                    onExit: () => {
                        // Remove from tracking
                        const index = this.audioProcesses.indexOf(proc);
                        if (index > -1) {
                            this.audioProcesses.splice(index, 1);
                        }
                        // Clean up after playback completes
                        try {
                            require('fs').unlinkSync(tmpFile);
                        } catch (e) {
                            // Ignore cleanup errors
                        }
                    }
                });
                
                // Track the process so we can kill it on close
                this.audioProcesses.push(proc);
                
                return true;
            } catch (error) {
                console.error(`Error downloading audio file: ${error}`);
                return false;
            }
        } else {
            // Local file - play in separate process
            const workerPath = `${process.cwd()}/src/play-audio-worker.ts`;
            const proc = Bun.spawn(["bun", workerPath, pathOrUrl], {
                stdout: "inherit",
                stderr: "inherit",
                onExit: () => {
                    // Remove from tracking
                    const index = this.audioProcesses.indexOf(proc);
                    if (index > -1) {
                        this.audioProcesses.splice(index, 1);
                    }
                }
            });
            
            // Track the process so we can kill it on close
            this.audioProcesses.push(proc);
            
            return true;
        }
    }

    /**
     * Check if audio is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}
