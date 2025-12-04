import { GoogleGenAI } from "@google/genai";
import { PROMPT_SPLIT_SUBJECT, PROMPT_SPLIT_BACKGROUND, MODEL_IMAGE_GENERATION } from "../constants";

/**
 * Generates an initial image based on a text prompt using Gemini.
 */
export const generateBaseImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_GENERATION,
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

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
 * Edits an image to isolate the subject or background using Gemini.
 */
export const generateLayer = async (base64Image: string, type: 'SUBJECT' | 'BACKGROUND'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = type === 'SUBJECT' ? PROMPT_SPLIT_SUBJECT : PROMPT_SPLIT_BACKGROUND;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_GENERATION,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png'
            }
          },
          { text: prompt }
        ]
      }
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
