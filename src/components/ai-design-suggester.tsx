"use client";

import React, { useState } from 'react';
import { suggestDesignElements } from '@/ai/flows/suggest-design-elements';
import { suggestText } from '@/ai/flows/suggest-text';
import { useInvitation } from '@/context/invitation-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Wand2, LoaderCircle, Sparkles } from 'lucide-react';
import type { SuggestDesignElementsOutput } from '@/ai/flows/suggest-design-elements';
import type { SuggestTextOutput } from '@/ai/flows/suggest-text';

export function AiDesignSuggester() {
  const { selectedTemplate, updateLayer, resetCustomizations, customizations } = useInvitation();
  const [tone, setTone] = useState('formal');
  const [preferences, setPreferences] = useState('');
  const [isColorLoading, setIsColorLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [colorSuggestions, setColorSuggestions] = useState<SuggestDesignElementsOutput | null>(null);
  const [textSuggestions, setTextSuggestions] = useState<SuggestTextOutput | null>(null);
  const { toast } = useToast();

  const handleSuggestColors = async () => {
    if (!selectedTemplate) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a template first.' });
      return;
    }
    setIsColorLoading(true);
    setColorSuggestions(null);
    try {
      const result = await suggestDesignElements({
        templateName: selectedTemplate.name,
        userPreferences: preferences,
        tone: tone,
        existingColors: selectedTemplate.layers.map(l => l.color).filter(Boolean) as string[],
      });
      setColorSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get color suggestions. Please try again.',
      });
    } finally {
      setIsColorLoading(false);
    }
  };

  const handleSuggestText = async () => {
    if (!selectedTemplate) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a template first.' });
      return;
    }
    setIsTextLoading(true);
    setTextSuggestions(null);
    try {
      const textLayers = selectedTemplate.layers.filter(l => l.editable && l.type === 'text');
      const fields = textLayers.map(l => ({
        id: l.id,
        name: l.name,
        currentValue: customizations[l.id]?.value || l.value
      }));

      const result = await suggestText({
        templateName: selectedTemplate.name,
        userPreferences: preferences,
        tone: tone,
        fields: fields
      });
      setTextSuggestions(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get text suggestions. Please try again.',
      });
    } finally {
      setIsTextLoading(false);
    }
  };

  const applyColorSuggestions = () => {
    if (!colorSuggestions || !selectedTemplate) return;
    
    resetCustomizations();
    
    let colorIndex = 0;
    selectedTemplate.layers.forEach(layer => {
      if (layer.editable && layer.color && colorSuggestions.suggestedColors.length > 0) {
        updateLayer(layer.id, { color: colorSuggestions.suggestedColors[colorIndex % colorSuggestions.suggestedColors.length] });
        colorIndex++;
      }
    });

    toast({ title: 'Success', description: 'AI color suggestions have been applied.' });
  };
  
  const applyTextSuggestions = () => {
    if (!textSuggestions) return;
    textSuggestions.suggestedText.forEach(suggestion => {
      updateLayer(suggestion.id, { value: suggestion.value });
    });
    toast({ title: 'Success', description: 'AI text suggestions have been applied.' });
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Design Assistant</CardTitle>
          <CardDescription>Get AI-powered suggestions for colors and text.</CardDescription>
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
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleSuggestColors} disabled={isColorLoading || !selectedTemplate}>
              {isColorLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
              {isColorLoading ? 'Getting...' : 'Suggest Colors'}
            </Button>
            <Button onClick={handleSuggestText} disabled={isTextLoading || !selectedTemplate}>
              {isTextLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
              {isTextLoading ? 'Getting...' : 'Suggest Text'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {colorSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Color Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Color Palette</h4>
              <div className="flex gap-2">
                {colorSuggestions.suggestedColors.map((color, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border" style={{ backgroundColor: color }} title={color}/>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Font Pairing</h4>
              <p className="text-sm">{colorSuggestions.suggestedFonts.join(' & ')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reasoning</h4>
              <p className="text-sm text-muted-foreground">{colorSuggestions.reasoning}</p>
            </div>
            <Button onClick={applyColorSuggestions} className="w-full" variant="outline">Apply Color Palette</Button>
          </CardContent>
        </Card>
      )}

      {textSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Text Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <h4 className="font-semibold mb-2">Generated Text</h4>
               <div className="space-y-2 text-sm text-muted-foreground max-h-48 overflow-auto">
                {textSuggestions.suggestedText.map(t => (
                  <p key={t.id}><strong>{selectedTemplate?.layers.find(l=>l.id === t.id)?.name}:</strong> {t.value}</p>
                ))}
               </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reasoning</h4>
              <p className="text-sm text-muted-foreground">{textSuggestions.reasoning}</p>
            </div>
            <Button onClick={applyTextSuggestions} className="w-full" variant="outline">Apply Text</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
