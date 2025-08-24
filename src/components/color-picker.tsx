"use client";

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paintbrush } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const defaultPresets = ['#800000', '#F5F5DC', '#D4A27A', '#4a0e0e', '#1a1a1a', '#FFFFFF'];

export function ColorPicker({ color, onChange, presets = defaultPresets }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start w-full">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {presets.map((presetColor) => (
            <button
              key={presetColor}
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: presetColor }}
              onClick={() => {
                onChange(presetColor);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4" />
          <Input
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="h-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
