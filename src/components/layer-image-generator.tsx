
"use client";

import React, { useState } from 'react';
import { generateLayerImage } from '@/ai/flows/generate-layer-image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Layer } from '@/lib/types';
import { Wand2, LoaderCircle } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface LayerImageGeneratorProps {
  layer: Layer;
  onImageGenerated: (imageDataUri: string) => void;
}

export function LayerImageGenerator({ layer, onImageGenerated }: LayerImageGeneratorProps) {
  const [prompt, setPrompt] = useState(layer.aiPrompt || 'A beautiful background for an invitation');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateLayerImage({ prompt });
      if (result.imageDataUri) {
        onImageGenerated(result.imageDataUri);
        toast({ title: 'Success', description: 'New background image generated.' });
        setIsOpen(false);
      } else {
        throw new Error('Image generation failed.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate image. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          <Wand2 className="mr-2" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Layer Image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A minimalist gold leaf pattern"
              rows={4}
            />
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (
            <LoaderCircle className="animate-spin mr-2" />
          ) : (
            <Wand2 className="mr-2" />
          )}
          {isLoading ? 'Generating...' : 'Generate Image'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
