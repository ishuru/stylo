"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { InvitationTemplate, Layer } from '@/lib/types';
import { initialTemplates } from '@/lib/templates';

interface Customizations {
  [layerId: string]: Partial<Layer>;
}

interface InvitationContextType {
  templates: InvitationTemplate[];
  selectedTemplate: InvitationTemplate | null;
  customizations: Customizations;
  setSelectedTemplate: (template: InvitationTemplate | null) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  toggleFavorite: (templateId: string) => void;
  resetCustomizations: () => void;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const InvitationProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplateState] = useState<InvitationTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});

  useEffect(() => {
    const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
    const loadedTemplates = initialTemplates.map(t => ({
      ...t,
      favorite: favoriteTemplates.includes(t.id),
    }));
    setTemplates(loadedTemplates);
    if (loadedTemplates.length > 0) {
      setSelectedTemplateState(loadedTemplates[0]);
    }
  }, []);

  const setSelectedTemplate = (template: InvitationTemplate | null) => {
    setSelectedTemplateState(template);
    setCustomizations({});
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    setCustomizations(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        ...updates,
      },
    }));
  };

  const toggleFavorite = (templateId: string) => {
    let newFavorites: string[];
    const isFavorite = templates.find(t => t.id === templateId)?.favorite;
    
    const currentFavorites = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
    if (isFavorite) {
      newFavorites = currentFavorites.filter((id: string) => id !== templateId);
    } else {
      newFavorites = [...currentFavorites, templateId];
    }
    
    localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));

    setTemplates(prev =>
      prev.map(t =>
        t.id === templateId ? { ...t, favorite: !t.favorite } : t
      )
    );
  };
  
  const resetCustomizations = () => {
    setCustomizations({});
  };

  return (
    <InvitationContext.Provider
      value={{
        templates,
        selectedTemplate,
        customizations,
        setSelectedTemplate,
        updateLayer,
        toggleFavorite,
        resetCustomizations
      }}
    >
      {children}
    </InvitationContext.Provider>
  );
};

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (context === undefined) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
};
