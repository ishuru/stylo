"use client";

import React from 'react';
import Image from 'next/image';
import type { InvitationTemplate } from '@/lib/types';
import { cn } from '@/lib/utils';

const ClassicWeddingInvitation: React.FC<{ template: InvitationTemplate }> = ({ template }) => {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: template.width, height: template.height }}
    >
      {template.layers.map((layer) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${layer.x}px`,
          top: `${layer.y}px`,
          width: `${layer.width}px`,
          height: `${layer.height}px`,
          color: layer.color,
          fontSize: `${layer.fontSize}px`,
          fontWeight: layer.fontWeight,
          textAlign: layer.textAlign,
          transform: 'translateX(-50%)',
        };

        if (layer.type === 'image' && layer.value) {
           return (
            <Image
              key={layer.id}
              src={layer.value}
              alt={layer.name}
              fill
              className="object-cover"
              data-ai-hint="wedding background"
            />
          );
        }

        if (layer.type === 'text') {
          return (
            <div
              key={layer.id}
              style={style}
              className={cn(
                "flex items-center justify-center p-2 box-border whitespace-pre-wrap",
                layer.fontFamily
              )}
            >
              {layer.value}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default ClassicWeddingInvitation;
