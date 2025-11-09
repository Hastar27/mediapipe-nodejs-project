// // src/detectFace.ts
// import '@tensorflow/tfjs-node'; // registers native backend
// import * as fs from 'fs';
// import * as path from 'path';
// import * as tf from '@tensorflow/tfjs-node';
// import * as blazeface from '@tensorflow-models/blazeface';
//
// /**
//  * Detects whether an image contains at least one face.
//  * @returns Promise<boolean> true if face detected, else false
//  */
// export async function detectFaceFromFile(imagePathInput?: string): Promise<boolean> {
//     const rawPath = imagePathInput || '/Users/nightfury/Desktop/Profile6.jpeg';
//     const imagePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
//
//     if (!fs.existsSync(imagePath)) {
//         console.error(`❌ Input image not found at: ${imagePath}`);
//         return false;
//     }
//
//     try {
//         // Load & decode image
//         const buffer = fs.readFileSync(imagePath);
//         const decoded = tf.node.decodeImage(buffer, 3) as tf.Tensor3D;
//         const imageTensor = decoded.toFloat();
//
//         // Load BlazeFace model
//         const model = await blazeface.load();
//
//         // Run prediction
//         const predictions = await model.estimateFaces(imageTensor, false);
//
//         // Cleanup
//         imageTensor.dispose();
//         if ((model as any).dispose) (model as any).dispose();
//
//         const hasFace = Array.isArray(predictions) && predictions.length > 0;
//         console.log(hasFace ? '✅ Face detected' : '🚫 No face detected');
//         return hasFace;
//     } catch (err) {
//         console.error('Error during face detection:', err);
//         return false;
//     }
// }
//
// // If run directly via `npm start` or `ts-node src/detectFace.ts`
// if (require.main === module) {
//     (async () => {
//         const result = await detectFaceFromFile();
//         console.log('Result:', result);
//     })();
// }


// src/detectFaceWithMediapipe.ts
import fs from "fs";
import path from "path";
import { chromium } from "playwright";

/**
 * Uses Playwright + headless Chromium to run @mediapipe/tasks-vision in a browser context.
 * Returns true if the image contains at least one detected face.
 *
 * NOTE: This loads MediaPipe Tasks from the CDN inside the browser page and uses
 * FilesetResolver.forVisionTasks(...) to load wasm artifacts.
 *
 * @param imagePath optional absolute or relative path to an image. If omitted uses default below.
 */
export async function detectFaceFromFile(imagePath?: string): Promise<boolean> {
    // <-- EDIT default path if you want -->
    const defaultPath = "/Users/nightfury/Desktop/Profile6.jpeg";
    const raw = imagePath ?? defaultPath;
    const resolved = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);

    if (!fs.existsSync(resolved)) {
        console.error("Input image not found at:", resolved);
        return false;
    }

    // Read file as base64 data URL (browser-friendly)
    const buffer = fs.readFileSync(resolved);
    const ext = path.extname(resolved).toLowerCase().replace(".", "");
    const mime =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

    // Launch headless Chromium
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        // important so wasm/cdn fetches are allowed
        javaScriptEnabled: true
    });
    const page = await context.newPage();

    try {
        // Evaluate in page: load mediapipe tasks via CDN, create face detector, and run detect.
        // We use dynamic import from CDN to get the module in a module-capable environment.
        const hasFace: boolean = await page.evaluate(
            async (imageDataUrl: string) => {
                // NOTE: the exact CDN URL version can be adjusted. Using package root resolves module.
                // Use FilesetResolver.forVisionTasks with the wasm folder on jsdelivr.
                const pkgBase = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

                // dynamic import of the module (exports FaceDetector, FilesetResolver)
                // We import the module entry — the CDN serves an ES module.
                const mp = await import(pkgBase as string);

                const { FilesetResolver, FaceDetector } = mp as any;

                // Tell the FilesetResolver where to fetch wasm/required files
                const vision = await FilesetResolver.forVisionTasks(
                    `${pkgBase}/wasm`
                );

                // Create a FaceDetector instance.
                // For modelAssetPath we use a MediaPipe-hosted trained model for face detection.
                // This example uses the blaze_face short-range float16 model — adjust if you need long-range.
                const modelUrl =
                    "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

                const faceDetector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: modelUrl,
                        // delegate: "GPU" // optional if you want GPU and supported environment
                    },
                    runningMode: "IMAGE"
                });

                // Create image element and wait for load
                const img = new Image();
                img.src = imageDataUrl;
                await new Promise((resolve, reject) => {
                    img.onload = () => resolve(true);
                    img.onerror = (e) => reject(new Error("Image load failed"));
                });

                // Run detection on the image element
                // faceDetector.detect(img) returns a DetectionResult-like object with detections array
                const result = faceDetector.detect(img);
                const detections = result?.detections ?? [];

                // Dispose model if available
                if ((faceDetector as any).close) {
                    try {
                        (faceDetector as any).close();
                    } catch (e) {
                        // ignore
                    }
                }

                return Array.isArray(detections) && detections.length > 0;
            },
            dataUrl
        );

        return hasFace;
    } finally {
        await page.close();
        await context.close();
        await browser.close();
    }
}

// If run directly (dev)
import { fileURLToPath } from "url";

const currentFile = fileURLToPath(import.meta.url);
const currentScript = process.argv[1] || "";

if (currentFile === currentScript) {
    (async () => {
        const result = await detectFaceFromFile();
        console.log("Face present?:", result);
        process.exit(result ? 0 : 1);
    })();
}