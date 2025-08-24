"use client";

import React from 'react';
import type { InvitationTemplate } from '@/lib/types';
import { cn } from '@/lib/utils';

const ModernBirthdayInvitation: React.FC<{ template: InvitationTemplate }> = ({ template }) => {
  const backgroundLayer = template.layers.find(l => l.id === 'bg-color');

  return (
    <div
      className="relative overflow-hidden p-10 box-border"
      style={{
        width: template.width,
        height: template.height,
        backgroundColor: backgroundLayer?.color,
      }}
    >
      {template.layers.map((layer) => {
        if (layer.id === 'bg-color') return null;

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
        };

        if (layer.type === 'text') {
          return (
            <div
              key={layer.id}
              style={style}
              className={cn(
                "flex items-center p-2 box-border whitespace-pre-wrap",
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

export default ModernBirthdayInvitation;
