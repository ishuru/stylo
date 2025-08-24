'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting complementary color schemes and font pairings for invitation card designs.
 *
 * - suggestDesignElements - A function that takes template and user preferences as input and returns AI-powered suggestions for color schemes and font pairings, along with reasoning.
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
});
export type SuggestDesignElementsInput = z.infer<typeof SuggestDesignElementsInputSchema>;

const SuggestDesignElementsOutputSchema = z.object({
  suggestedColors: z
    .array(z.string())
    .describe('Suggested complementary color schemes (as hex codes).'),
  suggestedFonts: z
    .array(z.string())
    .describe('Suggested font pairings (e.g., [Headline Font, Body Font]).'),
  reasoning: z.string().describe('The AI reasoning behind the color and font suggestions.'),
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
  prompt: `You are an AI-powered design assistant that suggests complementary color schemes and font pairings for invitation card designs.

  Based on the selected template, user preferences, tone and existing colors, provide suggestions for color schemes and font pairings.
  Also include reasoning for the choices, explaining why these suggestions are appropriate for the design.

  Template Name: {{{templateName}}}
  User Preferences: {{{userPreferences}}}
  Tone: {{{tone}}}
  Existing Colors: {{{existingColors}}}

  Provide the suggested colors as a list of hex codes, and the font pairings as a list of [Headline Font, Body Font].
  Explain your reasoning in a clear and concise manner.
  Make sure the suggested colors complement each other and are appropriate for the invitation's tone.
  Make sure the suggested fonts are legible and visually appealing.

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
