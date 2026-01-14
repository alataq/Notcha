import { native } from "./native";

export enum MouseEventType {
  Press = 0,
  Release = 1,
  Move = 2,
  Scroll = 3,
}

export enum MouseButton {
  Left = 1,
  Middle = 2,
  Right = 3,
  ScrollUp = 4,
  ScrollDown = 5,
}

export interface MouseEvent {
  eventType: MouseEventType;
  button: MouseButton;
  x: number;
  y: number;
  windowHandle: number;
}

type MousePressCallback = (event: MouseEvent) => void;
type MouseReleaseCallback = (event: MouseEvent) => void;
type MouseMoveCallback = (event: MouseEvent) => void;
type MouseScrollCallback = (event: MouseEvent) => void;

export class Mouse {
  private pressCallbacks: MousePressCallback[] = [];
  private releaseCallbacks: MouseReleaseCallback[] = [];
  private moveCallbacks: MouseMoveCallback[] = [];
  private scrollCallbacks: MouseScrollCallback[] = [];

  constructor() {}

  /**
   * Register a callback for mouse button press events
   */
  onMousePress(callback: MousePressCallback): void {
    this.pressCallbacks.push(callback);
  }

  /**
   * Register a callback for mouse button release events
   */
  onMouseRelease(callback: MouseReleaseCallback): void {
    this.releaseCallbacks.push(callback);
  }

  /**
   * Register a callback for mouse move events
   */
  onMouseMove(callback: MouseMoveCallback): void {
    this.moveCallbacks.push(callback);
  }

  /**
   * Register a callback for mouse scroll events
   */
  onScroll(callback: MouseScrollCallback): void {
    this.scrollCallbacks.push(callback);
  }

  /**
   * Process all pending mouse events (called by App)
   * @internal
   */
  processEvents(
    onPress?: MousePressCallback,
    onRelease?: MouseReleaseCallback,
    onMove?: MouseMoveCallback,
    onScroll?: MouseScrollCallback
  ): void {
    // Collect all events first, then process
    const events: MouseEvent[] = [];
    
    while (native.hasMouseEvents()) {
      const eventTypePtr = new BigUint64Array(1);
      const buttonPtr = new Uint32Array(1);
      const xPtr = new Int32Array(1);
      const yPtr = new Int32Array(1);
      const windowHandlePtr = new BigUint64Array(1);

      native.getNextMouseEvent(
        eventTypePtr,
        buttonPtr,
        xPtr,
        yPtr,
        windowHandlePtr
      );

      const event: MouseEvent = {
        eventType: Number(eventTypePtr[0]) as MouseEventType,
        button: buttonPtr[0]! as MouseButton,
        x: xPtr[0]!,
        y: yPtr[0]!,
        windowHandle: Number(windowHandlePtr[0]),
      };
      
      events.push(event);
    }
    
    // Skip redundant move events - only keep the last one
    const processedEvents: MouseEvent[] = [];
    let lastMoveEvent: MouseEvent | null = null;
    
    for (const event of events) {
      if (event.eventType === MouseEventType.Move) {
        lastMoveEvent = event; // Keep updating to latest
      } else {
        // Non-move event - flush any pending move event first
        if (lastMoveEvent) {
          processedEvents.push(lastMoveEvent);
          lastMoveEvent = null;
        }
        processedEvents.push(event);
      }
    }
    
    // Don't forget the last move event
    if (lastMoveEvent) {
      processedEvents.push(lastMoveEvent);
    }
    
    // Now process the optimized event list
    for (const event of processedEvents) {
      // Call per-window callback first if provided
      if (event.eventType === MouseEventType.Press && onPress) {
        onPress(event);
      } else if (event.eventType === MouseEventType.Release && onRelease) {
        onRelease(event);
      } else if (event.eventType === MouseEventType.Move && onMove) {
        onMove(event);
      } else if (event.eventType === MouseEventType.Scroll && onScroll) {
        onScroll(event);
      }

      // Call global callbacks
      if (event.eventType === MouseEventType.Press) {
        this.pressCallbacks.forEach((cb) => cb(event));
      } else if (event.eventType === MouseEventType.Release) {
        this.releaseCallbacks.forEach((cb) => cb(event));
      } else if (event.eventType === MouseEventType.Move) {
        this.moveCallbacks.forEach((cb) => cb(event));
      } else if (event.eventType === MouseEventType.Scroll) {
        this.scrollCallbacks.forEach((cb) => cb(event));
      }
    }
  }

  /**
   * Get the current mouse position
   */
  getPosition(): { x: number; y: number } {
    const xPtr = new Int32Array(1);
    const yPtr = new Int32Array(1);
    native.getMousePosition(xPtr, yPtr);
    return { x: xPtr[0]!, y: yPtr[0]! };
  }

  /**
   * Clear all pending mouse events
   */
  clear(): void {
    native.clearMouseEvents();
  }
}
