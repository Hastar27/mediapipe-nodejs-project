# MediaPipe Face Detector (Node.js + TypeScript)

Detect faces in images using **MediaPipe Tasks Vision** running inside **headless Chromium (Playwright)**.  
The project spins up a lightweight browser instance where **@mediapipe/tasks-vision** loads as a web module, executes the **FaceDetector** model on the input image, and returns a boolean indicating if a face is present.  
This approach ensures full compatibility with the official MediaPipe Web API while running from Node.js.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install
npx playwright install --with-deps

# Run in development
npm run dev

# Or build and run
npm run build
npm start
