// Polyfill TextEncoder and TextDecoder for Jest (Node < 20)
const { TextEncoder, TextDecoder } = require('util');

// Set up TextEncoder and TextDecoder globally
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Also set up on window object for browser-like environment
if (typeof window !== 'undefined') {
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
}
