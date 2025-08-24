'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting text content for invitation card designs.
 *
 * - suggestText - A function that takes template and user preferences as input and returns AI-powered suggestions for the invitation text.
 * - SuggestTextInput - The input type for the suggestText function.
 * - SuggestTextOutput - The return type for the suggestText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTextInputSchema = z.object({
  templateName: z.string().describe('The name of the selected invitation template.'),
  userPreferences: z.string().describe('The user preferences for the invitation design, described in detail.'),
  tone: z.string().describe('The overall tone or theme of the invitation (e.g., formal, casual, fun).'),
  fields: z.array(z.object({ id: z.string(), name: z.string(), currentValue: z.string() })).describe('The text fields that need content generated.')
});
export type SuggestTextInput = z.infer<typeof SuggestTextInputSchema>;

const SuggestTextOutputSchema = z.object({
  suggestedText: z.array(z.object({
    id: z.string().describe("The ID of the layer to update."),
    value: z.string().describe("The suggested text for the field.")
  })).describe('An array of objects, each containing the id of the text field and the suggested text.'),
  reasoning: z.string().describe('The AI reasoning behind the text suggestions.'),
});
export type SuggestTextOutput = z.infer<typeof SuggestTextOutputSchema>;

export async function suggestText(
  input: SuggestTextInput
): Promise<SuggestTextOutput> {
  return suggestTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTextPrompt',
  input: {schema: SuggestTextInputSchema},
  output: {schema: SuggestTextOutputSchema},
  prompt: `You are an AI-powered content assistant that writes compelling text for invitation cards.

  Based on the selected template, user preferences, and tone, generate text for the specified fields.
  Also include reasoning for the choices, explaining why these suggestions are appropriate for the invitation.

  Template Name: {{{templateName}}}
  User Preferences: {{{userPreferences}}}
  Tone: {{{tone}}}
  
  Generate text for the following fields:
  {{#each fields}}
  - Field Name: {{this.name}} (ID: {{this.id}}), Current Value: "{{this.currentValue}}"
  {{/each}}
  
  Keep the existing style and format of the text, but improve upon it based on the user's request.
  Your response should contain only the JSON.
`,
});

const suggestTextFlow = ai.defineFlow(
  {
    name: 'suggestTextFlow',
    inputSchema: SuggestTextInputSchema,
    outputSchema: SuggestTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
