"use client";

import React from 'react';
import Image from 'next/image';
import { useInvitation } from '@/context/invitation-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { InvitationTemplate } from '@/lib/types';

export function TemplateSelector() {
  const { templates, selectedTemplate, setSelectedTemplate, toggleFavorite } = useInvitation();

  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return 0;
  });

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-lg">Choose a Template</h3>
      <div className="grid grid-cols-1 gap-4">
        {sortedTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedTemplate?.id === template.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">{template.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
                className="w-8 h-8"
                aria-label={template.favorite ? "Unmark as favorite" : "Mark as favorite"}
              >
                <Star
                  className={cn(
                    "w-5 h-5 transition-colors",
                    template.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )}
                />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="aspect-[5/7] w-full bg-muted rounded-md overflow-hidden">
                 <Image
                    src={`https://placehold.co/${template.width}x${template.height}/F5F5DC/800000.png?text=${encodeURIComponent(template.name)}`}
                    alt={`Preview of ${template.name}`}
                    width={template.width}
                    height={template.height}
                    className="w-full h-full object-cover"
                    data-ai-hint="invitation card"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
