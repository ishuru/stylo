"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import html2canvas from 'html2canvas';
import type { InvitationTemplate, Layer, SavedDesign } from '@/lib/types';
import { initialTemplates } from '@/lib/templates';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Customizations {
  [layerId: string]: Partial<Layer>;
}

interface InvitationContextType {
  templates: InvitationTemplate[];
  selectedTemplate: InvitationTemplate | null;
  customizations: Customizations;
  canvasRef: React.RefObject<HTMLDivElement>;
  setSelectedTemplate: (template: InvitationTemplate | null) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  toggleFavorite: (templateId: string) => void;
  resetCustomizations: () => void;
  
  // New properties for home page
  drafts: SavedDesign[];
  startDesigning: (description: string) => Promise<void>;
  useTemplate: (template: InvitationTemplate) => void;
  loadDraft: (draftId: string) => void;
  saveDraft: (name?: string) => Promise<void>;
  deleteDraft: (draftId: string) => void;
  renameDraft: (draftId: string, newName: string) => void;
}

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const InvitationProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplateState] = useState<InvitationTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [drafts, setDrafts] = useLocalStorage<SavedDesign[]>('savedDesigns', []);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  useEffect(() => {
    const favoriteTemplates = JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
    const loadedTemplates = initialTemplates.map(t => ({
      ...t,
      favorite: favoriteTemplates.includes(t.id),
    }));
    setTemplates(loadedTemplates);
  }, []);
  
  const useTemplate = (template: InvitationTemplate) => {
    setSelectedTemplateState(template);
    setCustomizations({});
    setActiveDraftId(null);
  };
  
  const setSelectedTemplate = (template: InvitationTemplate | null) => {
    setSelectedTemplateState(template);
    setCustomizations({});
    setActiveDraftId(null);
  };
  
  const startDesigning = async (description: string) => {
    // In a real app, you might use an AI to pick a template based on the description
    const blankTemplate: InvitationTemplate = {
      id: 'custom-template',
      name: 'Custom Design',
      component: 'ClassicWeddingInvitation',
      width: 500,
      height: 700,
      layers: [
        { id: 'bg', type: 'image', name: 'Background', value: 'https://placehold.co/500x700', x: 0, y: 0, width: 500, height: 700, editable: true, aiPrompt: description },
        { id: 'text-1', type: 'text', name: 'Main Text', value: 'Your Text Here', x: 250, y: 350, width: 400, height: 100, fontFamily: 'font-headline', fontSize: 40, color: '#000000', textAlign: 'center', editable: true },
      ],
    };
    setSelectedTemplateState(blankTemplate);
    setCustomizations({});
    setActiveDraftId(null);
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

  const saveDraft = async (name?: string) => {
    if (!selectedTemplate || !canvasRef.current) return;
    
    const draftName = name || (activeDraftId ? drafts.find(d => d.id === activeDraftId)?.name : null) || `Draft ${drafts.length + 1}`;
    
    const canvas = await html2canvas(canvasRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 0.2, // Generate a smaller image for the thumbnail
    });
    const thumbnail = canvas.toDataURL('image/png').split(',')[1];
    
    const newDraft: SavedDesign = {
      id: activeDraftId || Date.now().toString(),
      name: draftName,
      templateId: selectedTemplate.id,
      customizations,
      savedAt: new Date().toISOString(),
      thumbnail,
    };
    
    const newDrafts = drafts.filter(d => d.id !== newDraft.id);
    setDrafts([...newDrafts, newDraft].sort((a,b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
    setActiveDraftId(newDraft.id);
  };

  const loadDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      const template = templates.find(t => t.id === draft.templateId) || initialTemplates.find(t => t.id === draft.templateId);
      if (template) {
        setSelectedTemplateState(template);
        setCustomizations(draft.customizations);
        setActiveDraftId(draft.id);
      }
    }
  };
  
  const deleteDraft = (draftId: string) => {
    setDrafts(drafts.filter(d => d.id !== draftId));
  };
  
  const renameDraft = (draftId: string, newName: string) => {
    setDrafts(drafts.map(d => d.id === draftId ? { ...d, name: newName } : d));
  };


  return (
    <InvitationContext.Provider
      value={{
        templates,
        selectedTemplate,
        customizations,
        canvasRef,
        setSelectedTemplate,
        updateLayer,
        toggleFavorite,
        resetCustomizations,
        drafts,
        startDesigning,
        useTemplate,
        loadDraft,
        saveDraft,
        deleteDraft,
        renameDraft
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
