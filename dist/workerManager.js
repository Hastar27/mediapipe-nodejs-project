"use strict";
// // // src/workerManager.ts
// // import { chromium, Browser, Page } from 'playwright';
// //
// // export class WorkerManager {
// //     private browser: Browser | null = null;
// //     private page: Page | null = null;
// //     private serverUrl: string;
// //
// //     constructor(serverUrl = 'http://localhost:3000') {
// //         this.serverUrl = serverUrl;
// //     }
// //
// //     async start() {
// //         if (this.browser) return;
// //         this.browser = await chromium.launch({ headless: true /* set false to debug */ });
// //         const context = await this.browser.newContext({ bypassCSP: true });
// //         this.page = await context.newPage();
// //         // Navigate to the worker page (served by Express static)
// //         await this.page.goto(`${this.serverUrl}/worker.html`, { waitUntil: 'load', timeout: 60000 });
// //         // Wait until the model prints ready (optional); but we'll attempt to call detect which will ensure model loads
// //         console.log('Playwright worker page loaded');
// //     }
// //
// //     async detect(imageBuffer: Buffer) {
// //         if (!this.page) throw new Error('Worker not started');
// //         // convert buffer to data URL
// //         const base64 = imageBuffer.toString('base64');
// //         // Try to guess MIME from file header (very simple)
// //         const header = imageBuffer.slice(0, 4).toString('hex');
// //         let mime = 'image/jpeg';
// //         if (header.startsWith('89504e47')) mime = 'image/png';
// //         const dataUrl = `data:${mime};base64,${base64}`;
// //
// //         // call the page function
// //         try {
// //             const result = await this.page.evaluate(async (dUrl) => {
// //                 // @ts-ignore
// //                 return await window.detectPoseFromDataUrl(dUrl);
// //             }, dataUrl);
// //             return result;
// //         } catch (err) {
// //             throw new Error('Worker detect error: ' + String(err));
// //         }
// //     }
// //
// //     async stop() {
// //         if (this.browser) {
// //             await this.browser.close();
// //             this.browser = null;
// //             this.page = null;
// //         }
// //     }
// // }
//
// // test.ts
//
// import {detectFace} from "./index";
//
// (async () => {
//     const imagePath = '/Users/nightfury/Desktop/Profile.jpeg'; // 👈 change path
//     const hasFace = await detectFace(imagePath);
//     console.log(`Face detected: ${hasFace}`);
// })();
