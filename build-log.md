# NanoLayer Build Log

## Overview
**NanoLayer** is a proof-of-concept application demonstrating the capability of Large Language Models (specifically Google's Gemini Nano Banana / `gemini-2.5-flash-image`) to function as a multi-step creative tool.

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
- **AI Engine**: Google GenAI SDK (`@google/genai`).
- **Models**: 
    - Generation: `gemini-2.5-flash-image`
    - Editing/Splitting: `gemini-2.5-flash-image` (using text prompts to guide image-to-image transformation).

### 3. The "Split" Logic
Since the model doesn't output `.psd` files or explicit layers, we simulate layering using **Prompt Engineering**:

*   **Subject Extraction**: We pass the original image back to the model with the prompt: *"Identify the main subject... Regenerate the image keeping ONLY the subject. Make the entire background solid white or transparent."*
*   **Background Inpainting**: We pass the original image back with: *"Remove the main foreground subject entirely. Inpaint (fill) the area where the subject was..."*

### 4. Implementation Details
- **State Management**: A simple `layers` array in `App.tsx` tracks relationships via `parentId`. This allows us to group an Original image with its derived layers visually.
- **API Security**: The app relies on `process.env.API_KEY`.
    - **Note for Deployment**: When deploying to Vercel, you **MUST** add `API_KEY` to the Environment Variables in your project settings. The app will fail without it.

### 5. Future Improvements
- **Masking**: Use a model capable of returning alpha masks for true transparency (currently relies on the model making the background 'white/solid' which is an approximation).
- **Canvas Editing**: Add a fabric.js canvas to manually move the split layers around.

## How to Run
1. Install dependencies: `npm install`
2. Set Environment Variable: `export API_KEY=your_gemini_key`
3. Run dev: `npm run dev`
