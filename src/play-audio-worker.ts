#!/usr/bin/env bun
// Worker script to play audio files without blocking the main thread
import { native } from "./native";

const filePath = process.argv[2];
if (!filePath) {
    console.error("No file path provided");
    process.exit(1);
}

// Initialize audio
if (!native.initAudio()) {
    console.error("Failed to initialize audio");
    process.exit(1);
}

// Play the file
const result = native.playAudioFile(filePath);

// Close audio
native.closeAudio();

process.exit(result ? 0 : 1);
