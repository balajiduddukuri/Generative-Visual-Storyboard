import { GoogleGenAI, Type, Modality } from "@google/genai";

export const generateSceneDescriptions = async (
  wikiUrl: string,
  numScenes: number,
  onProgress: (message: string) => void
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  // 1. Summarize content from URL
  onProgress('Analyzing Wikipedia page...');
  const summaryModel = 'gemini-2.5-flash';
  const summaryPrompt = `Provide a concise summary of the main narrative points from the Wikipedia page at this URL: ${wikiUrl}. The summary should be suitable for creating a visual storyboard. Focus on the key events and characters.`;
  
  const summaryResult = await ai.models.generateContent({ 
    model: summaryModel, 
    contents: summaryPrompt 
  });
  const summary = summaryResult.text;

  // 2. Generate scene descriptions from summary
  onProgress('Generating scene descriptions...');
  const sceneGenModel = 'gemini-2.5-pro';
  const scenePrompt = `Based on the following summary, break it down into exactly ${numScenes} distinct scenes for a visual storyboard. For each scene, you MUST provide a detailed, non-empty, visually rich, and evocative description that can be used as a prompt for an image generation model. It is crucial that every scene has a description; do not leave any scene descriptions blank under any circumstances.

  Summary:
  ${summary}`;

  const sceneResult = await ai.models.generateContent({
    model: sceneGenModel,
    contents: scenePrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            description: `An array of ${numScenes} storyboard scenes.`,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_description: {
                  type: Type.STRING,
                  description: 'A detailed visual description for the scene.'
                }
              },
              required: ['scene_description'],
            }
          }
        },
        required: ['scenes'],
      }
    }
  });
  
  const sceneData = JSON.parse(sceneResult.text);
  
  if (!sceneData || !Array.isArray(sceneData.scenes)) {
    throw new Error("AI response did not contain a valid 'scenes' array.");
  }

  const descriptions: string[] = sceneData.scenes.map((s: any, index: number) => {
    const description = s?.scene_description;
    if (typeof description === 'string' && description.trim()) {
      return description.trim();
    }
    onProgress(`Warning: AI returned an empty description for scene ${index + 1}. A placeholder will be used.`);
    return `[AI failed to generate a description for scene ${index + 1}. Please write one manually.]`;
  });

  if (descriptions.length === 0) {
    throw new Error("Failed to generate any valid scene descriptions.");
  }
  
  return descriptions;
};

export const generateImageForScene = async (
    description: string, 
    artStyle: string, 
    modelName: 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    try {
        if (modelName === 'imagen-4.0-generate-001') {
            const imagePrompt = `A professional, safe-for-work photograph of the following scene: ${description}. Style: ${artStyle}, highly detailed, no text, no words.`;
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/png' },
            });
            
            const image = response.generatedImages?.[0]?.image;
            if (image?.imageBytes) {
                return `data:image/png;base64,${image.imageBytes}`;
            }

            if (response.promptFeedback?.blockReason) {
                const reason = response.promptFeedback.blockReason;
                throw new Error(`Image generation was blocked by Imagen due to: ${reason}. Please revise the scene description.`);
            }

            console.error("Imagen response did not contain image data:", JSON.stringify(response, null, 2));
            throw new Error("Imagen did not return image data. The prompt might be too complex or ambiguous.");
        }

        const imagePrompt = `A safe-for-work, high-quality digital painting of: ${description}. Style: ${artStyle}, cinematic, epic, highly detailed, no text, no words.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part?.inlineData?.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }

        const blockReason = response.promptFeedback?.blockReason;
        const finishReason = candidate?.finishReason;

        if (blockReason || finishReason === 'SAFETY') {
            const reason = blockReason ?? 'Safety filters';
            throw new Error(`Image generation was blocked by Gemini due to: ${reason}. The content may have violated safety policies.`);
        }
      
        if (finishReason && finishReason !== 'STOP') {
             throw new Error(`Image generation stopped unexpectedly. Reason: ${finishReason}.`);
        }

        if (part?.text) {
            const modelFeedback = `The model responded with text instead of an image: "${part.text.trim()}"`;
            throw new Error(`Failed to generate image. ${modelFeedback}`);
        }

        console.error("Gemini response did not contain valid image data:", JSON.stringify(response, null, 2));
        throw new Error("Failed to generate image. The model did not return any image data or a specific reason.");

    } catch (err) {
        console.error(`An unexpected error occurred during the image generation API call with ${modelName}:`, err);
        if (err instanceof Error) {
            throw err; 
        }
        throw new Error("A network or unexpected error occurred while contacting the image generation service.");
    }
};