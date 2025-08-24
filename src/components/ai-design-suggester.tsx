
"use client";

import React, { useState } from 'react';
import { suggestDesignElements } from '@/ai/flows/suggest-design-elements';
import { useInvitation } from '@/context/invitation-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2, LoaderCircle } from 'lucide-react';
import type { SuggestDesignElementsOutput } from '@/ai/flows/suggest-design-elements';

export function AiDesignSuggester() {
  const { selectedTemplate, updateLayer, resetCustomizations, customizations } = useInvitation();
  const [tone, setTone] = useState('formal');
  const [preferences, setPreferences] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestDesignElementsOutput | null>(null);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!selectedTemplate) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a template first.' });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      const textLayers = selectedTemplate.layers.filter(l => l.editable && l.type === 'text');
      const fields = textLayers.map(l => ({
        id: l.id,
        name: l.name,
        currentValue: customizations[l.id]?.value || l.value
      }));

      const result = await suggestDesignElements({
        templateName: selectedTemplate.name,
        userPreferences: preferences,
        tone: tone,
        existingColors: selectedTemplate.layers.map(l => l.color).filter(Boolean) as string[],
        fields: fields,
      });
      setSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestions = () => {
    if (!suggestions || !selectedTemplate) return;

    resetCustomizations();

    // Apply colors and fonts
    let colorIndex = 0;
    selectedTemplate.layers.forEach(layer => {
      if (layer.editable && layer.color && suggestions.suggestedColors.length > 0) {
        updateLayer(layer.id, { color: suggestions.suggestedColors[colorIndex % suggestions.suggestedColors.length] });
        colorIndex++;
      }
      if (layer.editable && layer.type === 'text' && suggestions.suggestedFonts.length > 0) {
        const fontFamily = layer.fontFamily === 'font-headline' ? 'font-headline' : 'font-body';
        const suggestedFont = fontFamily === 'font-headline' ? suggestions.suggestedFonts[0] : suggestions.suggestedFonts[1]
        
        if (suggestedFont) {
          if (suggestedFont.toLowerCase().includes('playfair')) {
             updateLayer(layer.id, { fontFamily: 'font-headline' });
          } else if (suggestedFont.toLowerCase().includes('sans')) {
             updateLayer(layer.id, { fontFamily: 'font-body' });
          }
        }
      }
    });

    // Apply text
    suggestions.suggestedText.forEach(suggestion => {
      updateLayer(suggestion.id, { value: suggestion.value });
    });

    toast({ title: 'Success', description: 'AI suggestions have been applied.' });
  };
  
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Design Assistant</CardTitle>
          <CardDescription>Get unified suggestions for colors, fonts, and text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Invitation Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="fun">Fun</SelectItem>
                <SelectItem value="elegant">Elegant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences</Label>
            <Input
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., 'A fairytale wedding', 'minimalist style'"
            />
          </div>
          <Button onClick={handleSuggest} disabled={isLoading || !selectedTemplate} className="w-full">
              {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
              {isLoading ? 'Getting Suggestions...' : 'Suggest with AI'}
          </Button>
        </CardContent>
      </Card>

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Reasoning</h4>
              <p className="text-sm text-muted-foreground">{suggestions.reasoning}</p>
            </div>
            <div className='space-y-4 pt-4 border-t'>
              <h4 className="font-semibold">Suggested Design</h4>
              <div className="flex gap-2">
                {suggestions.suggestedColors.map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} title={color}/>
                ))}
              </div>
              <p className="text-sm"><span className='font-medium'>Fonts:</span> {suggestions.suggestedFonts.join(' & ')}</p>
            </div>
             <div className='space-y-2 pt-4 border-t'>
              <h4 className="font-semibold">Suggested Text</h4>
               <div className="space-y-2 text-sm text-muted-foreground max-h-40 overflow-auto">
                {suggestions.suggestedText.map(t => (
                  <p key={t.id}><strong>{selectedTemplate?.layers.find(l=>l.id === t.id)?.name}:</strong> {t.value}</p>
                ))}
               </div>
            </div>
            <Button onClick={applySuggestions} className="w-full" variant="outline">Apply Suggestions</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
