import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GeneratedImage, PromptObject, View } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Utility to convert File to a Gemini-compatible Part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

/**
 * Step 1: Analyze the 2D drafting and generate prompts for each 3D view.
 */
async function analyzeDraftingAndGetPrompts(
  imagePart: { inlineData: { data: string; mimeType: string } },
  viewsToGenerate: View[],
  additionalPrompt: string
): Promise<PromptObject[]> {
  const userContextPrompt = additionalPrompt
    ? `Incorporate the following user-provided details into your descriptions: "${additionalPrompt}".`
    : '';

  const analysisPrompt = `
    Analyze this 2D technical drafting image. ${userContextPrompt}
    Based on the drawing and any provided details, generate a list of detailed, descriptive prompts to create photorealistic 3D renderings of the object.
    Generate one prompt for each of the following perspectives: ${viewsToGenerate.join(', ')}.
    Each prompt should describe the object's geometry, materials, lighting, and environment to produce a high-quality, professional 3D model visualization.
    The output must be a valid JSON array of objects. Each object must have a "view" key (one of ${viewsToGenerate.map(v => `"${v}"`).join(', ')}) and a "prompt" key with the detailed description.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: analysisPrompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            view: {
              type: Type.STRING,
              enum: viewsToGenerate,
            },
            prompt: {
              type: Type.STRING,
              description: 'A detailed prompt for generating a 3D rendering.',
            },
          },
          required: ["view", "prompt"],
        },
      },
    },
  });

  try {
    const jsonStr = response.text.trim();
    const prompts: PromptObject[] = JSON.parse(jsonStr);
    
    // Validate that we have prompts for the views we asked for.
    const receivedViews = new Set(prompts.map(p => p.view));
    if (viewsToGenerate.every(v => receivedViews.has(v))) {
      return prompts;
    } else {
        if (prompts.length > 0) {
            console.warn("AI did not return all requested perspectives. Proceeding with what was returned.");
            return prompts;
        }
      throw new Error("AI did not return any of the requested perspectives.");
    }
  } catch (e) {
    console.error("Failed to parse or validate prompts from Gemini:", response.text);
    throw new Error("The AI failed to generate valid instructions for 3D rendering. Please try another image.");
  }
}

/**
 * Step 2: Generate a 3D image for a single view using a descriptive prompt.
 */
async function generateSingle3DView(prompt: string, view: View): Promise<GeneratedImage> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return {
                view,
                imageUrl: `data:image/png;base64,${base64ImageBytes}`
            };
        }
    }

    throw new Error(`Image generation failed for ${view} view.`);
}

/**
 * Main orchestrator function: Takes a file, analyzes it, and generates all 3D views.
 */
export async function generate3DViews(
  file: File, 
  onViewGenerated: (image: GeneratedImage) => void,
  viewsToGenerate: View[],
  additionalPrompt: string
): Promise<void> {
  const imagePart = await fileToGenerativePart(file);

  // Step 1: Get prompts for the selected views
  const prompts = await analyzeDraftingAndGetPrompts(imagePart, viewsToGenerate, additionalPrompt);
  
  // Step 2: Generate images for each view in parallel
  const generationPromises = prompts.map(async (promptObj) => {
    try {
      const generatedImage = await generateSingle3DView(promptObj.prompt, promptObj.view);
      onViewGenerated(generatedImage);
    } catch (error) {
       console.error(`Failed to generate view for ${promptObj.view}:`, error);
       // We can decide how to handle partial failures. Here we just log and continue.
       // A placeholder error image could also be sent via onViewGenerated.
    }
  });

  await Promise.all(generationPromises);
}