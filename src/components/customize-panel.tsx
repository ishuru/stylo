
"use client";

import React from 'react';
import { useInvitation } from '@/context/invitation-context';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ColorPicker } from './color-picker';
import { LayerImageGenerator } from './layer-image-generator';
import { Input } from '@/components/ui/input';

export function CustomizePanel() {
  const { selectedTemplate, customizations, updateLayer } = useInvitation();

  if (!selectedTemplate) {
    return <div className="p-4 text-sm text-muted-foreground">Select a template to begin customizing.</div>;
  }

  const editableLayers = selectedTemplate.layers.filter((layer) => layer.editable);

  return (
    <div className="p-4 space-y-6">
      <h3 className="font-semibold text-lg">Customize Your Invitation</h3>
      <Accordion type="single" collapsible defaultValue={editableLayers[0]?.id}>
        {editableLayers.map((layer) => {
          const customLayer = customizations[layer.id] || {};
          const currentLayer = { ...layer, ...customLayer };
          const isSingleLineText = layer.type === 'text' && layer.height < 60;

          return (
            <AccordionItem value={layer.id} key={layer.id}>
              <AccordionTrigger>{layer.name}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-1">
                  {layer.type === 'text' && (
                    <div className="space-y-2">
                      <Label htmlFor={`text-${layer.id}`}>Text</Label>
                      {isSingleLineText ? (
                        <Input
                          id={`text-${layer.id}`}
                          value={currentLayer.value}
                          onChange={(e) => updateLayer(layer.id, { value: e.target.value })}
                        />
                      ) : (
                        <Textarea
                          id={`text-${layer.id}`}
                          value={currentLayer.value}
                          onChange={(e) => updateLayer(layer.id, { value: e.target.value })}
                          rows={3}
                        />
                      )}
                    </div>
                  )}
                  {currentLayer.color !== undefined && (
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <ColorPicker
                        color={currentLayer.color!}
                        onChange={(color) => updateLayer(layer.id, { color })}
                      />
                    </div>
                  )}
                   {layer.type === 'image' && (
                    <div className="space-y-2">
                      <Label htmlFor={`image-url-${layer.id}`}>Image URL</Label>
                       <Input
                        id={`image-url-${layer.id}`}
                        value={currentLayer.value}
                        onChange={(e) => updateLayer(layer.id, { value: e.target.value })}
                        placeholder="https://placehold.co/500x700.png"
                      />
                      <LayerImageGenerator 
                        layer={currentLayer} 
                        onImageGenerated={(imageDataUri) => updateLayer(layer.id, { value: imageDataUri })}
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
