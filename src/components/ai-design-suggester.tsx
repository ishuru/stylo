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
  const { selectedTemplate, updateLayer, resetCustomizations } = useInvitation();
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
      const result = await suggestDesignElements({
        templateName: selectedTemplate.name,
        userPreferences: preferences,
        tone: tone,
        existingColors: selectedTemplate.layers.map(l => l.color).filter(Boolean) as string[],
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
    
    let colorIndex = 0;
    selectedTemplate.layers.forEach(layer => {
      if (layer.editable && layer.color && suggestions.suggestedColors.length > 0) {
        updateLayer(layer.id, { color: suggestions.suggestedColors[colorIndex % suggestions.suggestedColors.length] });
        colorIndex++;
      }
    });

    toast({ title: 'Success', description: 'AI suggestions have been applied.' });
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Design Assistant</CardTitle>
          <CardDescription>Get AI-powered suggestions for colors and fonts.</CardDescription>
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
              placeholder="e.g., 'I like earthy tones', 'minimalist style'"
            />
          </div>
          <Button onClick={handleSuggest} disabled={isLoading || !selectedTemplate} className="w-full">
            {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
            {isLoading ? 'Getting Suggestions...' : 'Get Suggestions'}
          </Button>
        </CardContent>
      </Card>

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Color Palette</h4>
              <div className="flex gap-2">
                {suggestions.suggestedColors.map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} title={color}/>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Font Pairing</h4>
              <p className="text-sm">{suggestions.suggestedFonts.join(' & ')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reasoning</h4>
              <p className="text-sm text-muted-foreground">{suggestions.reasoning}</p>
            </div>
            <Button onClick={applySuggestions} className="w-full" variant="outline">Apply Suggestions</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
