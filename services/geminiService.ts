import { GoogleGenAI } from "@google/genai";
import { MODEL_IMAGE_GENERATION, PROMPT_SPLIT_SUBJECT, PROMPT_SPLIT_BACKGROUND } from "../constants";

// Initialize the client. 
// NOTE: API Key must be set in Environment Variables (e.g., Vercel Project Settings)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an initial image based on a text prompt.
 */
export const generateBaseImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_GENERATION,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // Nano Banana does not support responseMimeType or responseSchema
        // We rely on standard generation
      }
    });

    // Extract image from response
    // Iterate parts to find inlineData
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Error generating base image:", error);
    throw error;
  }
};

/**
 * edits an image to isolate the subject or background.
 * Effectively "splitting" the layer.
 */
export const generateLayer = async (base64Image: string, type: 'SUBJECT' | 'BACKGROUND'): Promise<string> => {
  const prompt = type === 'SUBJECT' ? PROMPT_SPLIT_SUBJECT : PROMPT_SPLIT_BACKGROUND;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_GENERATION,
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for internal consistency
              data: base64Image
            }
          }
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error(`Failed to generate ${type} layer.`);
  } catch (error) {
    console.error(`Error generating ${type} layer:`, error);
    throw error;
  }
};