'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a complete invitation template from a user description.
 *
 * - generateInvitationTemplate - A function that takes a user description and returns a structured InvitationTemplate object.
 * - GenerateInvitationTemplateInput - The input type for the generateInvitationTemplate function.
 * - GenerateInvitationTemplateOutput - The return type for the generateInvitationTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { InvitationTemplate, Layer } from '@/lib/types';

const LayerSchema = z.object({
  id: z.string().describe("A unique identifier for the layer (e.g., 'title', 'bg-image')."),
  type: z.enum(['text', 'image']).describe("The type of the layer."),
  name: z.string().describe("A user-friendly name for the layer (e.g., 'Main Title', 'Background Image')."),
  value: z.string().describe("The content of the layer. For text, this is the text itself. For an image, this is a placeholder URL from placehold.co (e.g., 'https://placehold.co/500x700.png')."),
  x: z.number().describe("The x-coordinate of the layer's center, in pixels."),
  y: z.number().describe("The y-coordinate of the layer's top edge, in pixels."),
  width: z.number().describe("The width of the layer, in pixels."),
  height: z.number().describe("The height of the layer, in pixels."),
  color: z.string().optional().describe("The color of the text layer as a hex code (e.g., '#FFFFFF')."),
  fontFamily: z.enum(['font-headline', 'font-body']).optional().describe("The font family for the text layer."),
  fontSize: z.number().optional().describe("The font size for the text layer, in pixels."),
  fontWeight: z.enum(['normal', 'bold']).optional().describe("The font weight for the text layer."),
  textAlign: z.enum(['left', 'center', 'right']).optional().describe("The text alignment for the text layer."),
  editable: z.boolean().describe("Whether the layer is editable by the user."),
  aiPrompt: z.string().optional().describe("A descriptive prompt for AI image generation, if the layer is an image."),
});

const GenerateInvitationTemplateInputSchema = z.object({
  description: z.string().describe('A detailed description of the event for which the invitation is being created.'),
});
export type GenerateInvitationTemplateInput = z.infer<typeof GenerateInvitationTemplateInputSchema>;


const GenerateInvitationTemplateOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  component: z.string(),
  width: z.number(),
  height: z.number(),
  layers: z.array(LayerSchema),
  favorite: z.boolean().optional(),
});

export type GenerateInvitationTemplateOutput = z.infer<typeof GenerateInvitationTemplateOutputSchema>;


export async function generateInvitationTemplate(
  input: GenerateInvitationTemplateInput
): Promise<GenerateInvitationTemplateOutput> {
  return generateInvitationTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInvitationTemplatePrompt',
  input: {schema: GenerateInvitationTemplateInputSchema},
  output: {schema: GenerateInvitationTemplateOutputSchema},
  prompt: `You are an expert creative director who specializes in designing beautiful invitation templates.
  
  Your task is to generate a complete, structured invitation template based on the user's event description.
  The template should be 500px wide and 700px high.

  Based on the user's description, you must choose the most appropriate component to use from the following list:
  - 'ClassicWeddingInvitation': For weddings, formal events.
  - 'ModernBirthdayInvitation': For birthdays, parties, modern events.
  - 'PlayfulBabyShower': For baby showers, kid's events, playful themes.
  
  Set the 'component' field in your output to the name of the component you choose.

  Based on the description and your chosen component, create a set of layers for the invitation. This should include:
  - A main background image layer (or a background color layer for 'ModernBirthdayInvitation'). Use a placeholder from https://placehold.co and ensure the URL ends in .png. The aiPrompt for this layer should be a creative interpretation of the user's description.
  - Multiple text layers for all the typical elements of an invitation (e.g., title, names, date, time, location, RSVP).
  - Use logical positioning (x, y, width, height) for each layer. For centered text, x should be 250.
  - Choose appropriate fonts ('font-headline' for important text, 'font-body' for details), font sizes, and colors that match the theme.
  - The generated name for the template should be creative and reflect the user's description.

  User Event Description: {{{description}}}

  Return ONLY the generated JSON object that conforms to the output schema.
  `,
});


const generateInvitationTemplateFlow = ai.defineFlow(
  {
    name: 'generateInvitationTemplateFlow',
    inputSchema: GenerateInvitationTemplateInputSchema,
    outputSchema: GenerateInvitationTemplateOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate invitation template.');
    }
    // Set a unique ID for the generated template
    return { ...output, id: `ai-${output.component}-${Date.now()}` };
  }
);
