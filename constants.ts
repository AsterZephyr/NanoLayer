// Model identifiers as per @google/genai guidelines
export const MODEL_IMAGE_GENERATION = 'gemini-2.5-flash-image'; // "Nano Banana"

// Prompts for layer separation
export const PROMPT_SPLIT_SUBJECT = `
Identify the main subject of this image (the product, person, or object being advertised). 
Regenerate the image keeping ONLY the subject. 
Make the entire background solid white or transparent if possible. 
Focus strictly on edge precision for the subject.
`;

export const PROMPT_SPLIT_BACKGROUND = `
Identify the background of this image.
Remove the main foreground subject entirely.
Inpaint (fill) the area where the subject was to create a clean, empty background scene suitable for overlaying text or other elements.
`;

export const WELCOME_MESSAGE = `
Hello! I am NanoLayer. 
I can generate creative ad assets and then "split" them into editable layers (Subject vs. Background) using the Gemini Nano Banana model.

Try something like: "Generate a futuristic sneaker advertisement on a neon street."
`;