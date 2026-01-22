import { native } from "./native";

export interface KeyEvent {
  keycode: number;
  keysym: number;
  state: number;
  pressed: boolean;
  key: string;
}

export type KeyPressCallback = (event: KeyEvent) => void;
export type KeyReleaseCallback = (event: KeyEvent) => void;

export class Keyboard {
  public keyPressCallbacks: KeyPressCallback[] = [];
  public keyReleaseCallbacks: KeyReleaseCallback[] = [];

  /**
   * Register a callback for key press events
   * @param callback Function to call when a key is pressed
   */
  onKeyPress(callback: KeyPressCallback): void {
    this.keyPressCallbacks.push(callback);
  }

  /**
   * Register a callback for key release events
   * @param callback Function to call when a key is released
   */
  onKeyRelease(callback: KeyReleaseCallback): void {
    this.keyReleaseCallbacks.push(callback);
  }

  /**
   * Process pending keyboard events (called internally by App)
   * @internal
   */
  processEvents(): void {
    // Poll for keyboard events
    while (native.hasKeyEvents()) {
      const keycode = new Uint32Array(1);
      const keysym = new Uint32Array(1);
      const state = new Uint32Array(1);
      const pressed = new Uint8Array(1);
      const keyNameBuffer = new Uint8Array(32);
      const keyNameLen = new Uint32Array(1);

      const hasEvent = native.getNextKeyEvent(
        keycode,
        keysym,
        state,
        pressed,
        keyNameBuffer,
        keyNameLen
      );

      if (!hasEvent) break;

      // Convert key name buffer to string
      const decoder = new TextDecoder();
      const keyName = decoder.decode(keyNameBuffer.slice(0, keyNameLen[0]));

      const event: KeyEvent = {
        keycode: keycode[0]!,
        keysym: keysym[0]!,
        state: state[0]!,
        pressed: pressed[0]! !== 0,
        key: keyName,
      };

      // Trigger appropriate callbacks
      if (event.pressed) {
        for (const callback of this.keyPressCallbacks) {
          callback(event);
        }
      } else {
        for (const callback of this.keyReleaseCallbacks) {
          callback(event);
        }
      }
    }
  }

  /**
   * Clear all keyboard event callbacks
   */
  clearCallbacks(): void {
    this.keyPressCallbacks = [];
    this.keyReleaseCallbacks = [];
  }
}
