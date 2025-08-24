"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { useInvitation } from '@/context/invitation-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClassicWeddingInvitation from './templates/classic-wedding-invitation';
import ModernBirthdayInvitation from './templates/modern-birthday-invitation';
import type { InvitationTemplate } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

const templateComponents: { [key: string]: React.FC<{ template: InvitationTemplate }> } = {
  ClassicWeddingInvitation: ClassicWeddingInvitation,
  ModernBirthdayInvitation: ModernBirthdayInvitation,
};

export function Canvas() {
  const { selectedTemplate, customizations } = useInvitation();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find canvas to export.',
      });
      return;
    }

    try {
      const canvas = await html2canvas(canvasRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${selectedTemplate?.name?.toLowerCase().replace(/ /g, '-') || 'invitation'}.png`;
      link.click();
      toast({
        title: 'Success!',
        description: 'Your invitation has been downloaded.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not export invitation. Please try again.',
      });
    }
  };
  
  const getAppliedLayers = () => {
    if (!selectedTemplate) return [];
    return selectedTemplate.layers.map(layer => {
      const customLayer = customizations[layer.id] || {};
      return { ...layer, ...customLayer };
    });
  };

  const customizedTemplate: InvitationTemplate | null = selectedTemplate ? {
    ...selectedTemplate,
    layers: getAppliedLayers(),
  } : null;

  const SelectedComponent = customizedTemplate ? templateComponents[customizedTemplate.component] : null;

  return (
    <div className="flex flex-col h-full bg-muted/40 p-4 lg:p-8 items-center">
      <div className="w-full flex justify-end mb-4">
        <Button onClick={handleExport} disabled={!selectedTemplate}>
          <Download className="mr-2" />
          Export
        </Button>
      </div>
      <div className="flex-grow flex items-center justify-center w-full">
        <div
          ref={canvasRef}
          style={{
            width: selectedTemplate?.width,
            height: selectedTemplate?.height,
          }}
        >
          <Card
            className="overflow-hidden shadow-2xl h-full w-full"
          >
            <CardContent className="p-0 h-full w-full">
              {customizedTemplate && SelectedComponent ? (
                <SelectedComponent template={customizedTemplate} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-background">
                  <div className='flex flex-col gap-2 p-4'>
                      <Skeleton className="h-10 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-52" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
