
"use client";

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import html2canvas from 'html2canvas';
import { useInvitation } from '@/context/invitation-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ClassicWeddingInvitation from './templates/classic-wedding-invitation';
import ModernBirthdayInvitation from './templates/modern-birthday-invitation';
import PlayfulBabyShower from './templates/playful-baby-shower';
import type { InvitationTemplate } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

const templateComponents: { [key: string]: React.FC<{ template: InvitationTemplate }> } = {
  ClassicWeddingInvitation: ClassicWeddingInvitation,
  ModernBirthdayInvitation: ModernBirthdayInvitation,
  PlayfulBabyShower: PlayfulBabyShower,
};

export function Canvas() {
  const { selectedTemplate, customizations, canvasRef } = useInvitation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const outerCanvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const calculateScale = () => {
        if (!outerCanvasRef.current || !selectedTemplate) {
            return;
        }

        const containerWidth = outerCanvasRef.current.offsetWidth;
        const templateWidth = selectedTemplate.width;
        
        const padding = isMobile ? 32 : 64; // 2rem for mobile, 4rem for desktop

        if (containerWidth < templateWidth + padding) {
            setScale((containerWidth - padding) / templateWidth);
        } else {
            setScale(1);
        }
    };
    
    calculateScale();
    
    const handleResize = () => calculateScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [selectedTemplate, isMobile]);

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
        scale: 1, // Render at full resolution
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
    <div ref={outerCanvasRef} className="flex flex-col h-full bg-muted/40 p-4 lg:p-8 items-center w-full">
       <div 
        className="w-full flex justify-end mb-4" 
        style={{ 
          maxWidth: selectedTemplate ? selectedTemplate.width * scale : '100%',
        }}
      >
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
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out'
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
                  <div className='flex flex-col gap-2 p-4 text-center'>
                      <h3 className="text-xl font-semibold text-muted-foreground">Select a template to get started</h3>
                      <p className='text-sm text-muted-foreground'>or describe your event to generate one with AI!</p>
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
