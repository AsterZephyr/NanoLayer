# NanoLayer Build Log

## Overview
**NanoLayer** is a proof-of-concept application demonstrating the capability of Large Language Models to function as a multi-step creative tool.

The core idea is to treat "Image Splitting" not as a computer vision task (like Mask R-CNN), but as a Generative AI instruction task.

## Process & Architecture

### 1. Conceptualization
The requirement was to build a tool that can:
- Generate an advertisement asset from text.
- Deconstruct that asset into "Subject" and "Background" layers.
- Deploy cleanly to Vercel.

### 2. Tool Selection
- **Framework**: React + TypeScript (Vite-style SPA).
- **Styling**: Tailwind CSS for rapid, dark-mode UI.
- **AI Engine**: **Tuzi API** (OpenAI-compatible interface) proxying to `gemini-2.5-flash-image`.
  - We use standard REST Fetch instead of SDKs to reduce bundle size and avoid Node.js dependency issues in the browser.

### 3. The "Split" Logic
Since the model doesn't output `.psd` files or explicit layers, we simulate layering using **Prompt Engineering**:

*   **Subject Extraction**: We pass the original image back to the model with the prompt: *"Identify the main subject... Regenerate the image keeping ONLY the subject. Make the entire background solid white or transparent."*
*   **Background Inpainting**: We pass the original image back with: *"Remove the main foreground subject entirely. Inpaint (fill) the area where the subject was..."*

### 4. Implementation Details
- **State Management**: A simple `layers` array in `App.tsx` tracks relationships via `parentId`.
- **Environment & Deployment**:
    - The app is designed to run in a browser environment (Vite/CRA) which does not have `process.env` by default.
    - We implemented a safe `getApiKey()` helper to check both `import.meta.env.VITE_TUZI_API_KEY` (Vite standard) and `process.env.NEXT_PUBLIC_TUZI_API_KEY` (Next.js standard).

### 5. Deployment Instructions (Vercel)
To deploy this successfully:

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  **Crucial**: In Vercel Project Settings > Environment Variables, add:
    *   Key: `VITE_TUZI_API_KEY` (or `NEXT_PUBLIC_TUZI_API_KEY`)
    *   Value: `your-tuzi-api-key-here`
4.  Deploy.

## Changelog
- **Fix**: Resolved "Black Screen" issue caused by direct access to `process.env` in client-side code.
- **Update**: Switched from `@google/genai` SDK to direct `fetch` calls against Tuzi API (`/v1/images/generations` & `/v1/images/edits`).
