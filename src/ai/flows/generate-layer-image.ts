'use server';

/**
 * @fileOverview A flow for generating layer images using AI.
 *
 * - generateLayerImage - A function that generates a layer image based on a text prompt.
 * - GenerateLayerImageInput - The input type for the generateLayerImage function.
 * - GenerateLayerImageOutput - The return type for the generateLayerImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLayerImageInputSchema = z.object({
  prompt: z.string().describe('The prompt to use to generate the image.'),
});
export type GenerateLayerImageInput = z.infer<typeof GenerateLayerImageInputSchema>;

const GenerateLayerImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateLayerImageOutput = z.infer<typeof GenerateLayerImageOutputSchema>;

export async function generateLayerImage(input: GenerateLayerImageInput): Promise<GenerateLayerImageOutput> {
  return generateLayerImageFlow(input);
}

const generateLayerImagePrompt = ai.definePrompt({
  name: 'generateLayerImagePrompt',
  input: {schema: GenerateLayerImageInputSchema},
  output: {schema: GenerateLayerImageOutputSchema},
  prompt: `Generate an image based on the following prompt: {{{prompt}}}. Return the image as a data URI.

      Ensure that the data URI includes the MIME type and uses Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.`,
});

const generateLayerImageFlow = ai.defineFlow(
  {
    name: 'generateLayerImageFlow',
    inputSchema: GenerateLayerImageInputSchema,
    outputSchema: GenerateLayerImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No image was generated.');
    }

    return {imageDataUri: media.url};
  }
);
