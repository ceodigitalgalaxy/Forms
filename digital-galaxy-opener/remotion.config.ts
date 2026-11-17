import { Config } from '@remotion/cli/config';

// Deterministic frame-by-frame render. Output is 3840x2160 @ 60fps (set in src/Root.tsx).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(4);
Config.setOverwriteOutput(true);

// WebGL (Three.js) in headless Chrome without a GPU: ANGLE over SwiftShader.
Config.setChromiumOpenGlRenderer('swangle');
