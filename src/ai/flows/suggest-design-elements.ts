
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting complementary color schemes, font pairings, and text content for invitation card designs.
 *
 * - suggestDesignElements - A function that takes template and user preferences as input and returns AI-powered suggestions.
 * - SuggestDesignElementsInput - The input type for the suggestDesignElements function.
 * - SuggestDesignElementsOutput - The return type for the suggestDesignElements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDesignElementsInputSchema = z.object({
  templateName: z.string().describe('The name of the selected invitation template.'),
  userPreferences: z.string().describe('The user preferences for the invitation design, described in detail.'),
  tone: z.string().describe('The overall tone or theme of the invitation (e.g., formal, casual, fun).'),
  existingColors: z
    .array(z.string())
    .describe('The existing colors used in the template, as hex codes.'),
  fields: z.array(z.object({ id: z.string(), name: z.string(), currentValue: z.string() })).describe('The text fields that need content generated.')
});
export type SuggestDesignElementsInput = z.infer<typeof SuggestDesignElementsInputSchema>;

const SuggestDesignElementsOutputSchema = z.object({
  suggestedColors: z
    .array(z.string())
    .describe('Suggested complementary color schemes (as hex codes).'),
  suggestedFonts: z
    .array(z.string())
    .describe('Suggested font pairings (e.g., [Headline Font, Body Font]).'),
  suggestedText: z.array(z.object({
    id: z.string().describe("The ID of the layer to update."),
    value: z.string().describe("The suggested text for the field.")
  })).describe('An array of objects, each containing the id of the text field and the suggested text.'),
  reasoning: z.string().describe('The AI reasoning behind all the suggestions.'),
});
export type SuggestDesignElementsOutput = z.infer<typeof SuggestDesignElementsOutputSchema>;

export async function suggestDesignElements(
  input: SuggestDesignElementsInput
): Promise<SuggestDesignElementsOutput> {
  return suggestDesignElementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDesignElementsPrompt',
  input: {schema: SuggestDesignElementsInputSchema},
  output: {schema: SuggestDesignElementsOutputSchema},
  prompt: `You are an AI-powered design assistant that helps create beautiful invitation cards.

  Based on the selected template, user preferences, and tone, provide a comprehensive set of suggestions including:
  1. A complementary color scheme.
  2. An appropriate font pairing.
  3. Improved text content for the provided fields.

  Also include a single, unified reasoning for all your choices, explaining why these suggestions work well together to fit the user's request.

  Template Name: {{{templateName}}}
  User Preferences: {{{userPreferences}}}
  Tone: {{{tone}}}
  Existing Colors: {{{existingColors}}}

  Generate text for the following fields:
  {{#each fields}}
  - Field Name: {{this.name}} (ID: {{this.id}}), Current Value: "{{this.currentValue}}"
  {{/each}}

  Provide the suggested colors as a list of hex codes, and the font pairings as a list of [Headline Font, Body Font].
  For the text, keep the existing style and format but improve upon it based on the user's request.
  
  Your response should contain only the JSON.
`,
});

const suggestDesignElementsFlow = ai.defineFlow(
  {
    name: 'suggestDesignElementsFlow',
    inputSchema: SuggestDesignElementsInputSchema,
    outputSchema: SuggestDesignElementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
