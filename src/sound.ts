import { native } from "./native";

export class Sound {
    private initialized: boolean = false;

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
     * Check if audio is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}
