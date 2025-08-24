
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import html2canvas from 'html2canvas';
import type { InvitationTemplate, Layer, SavedDesign } from '@/lib/types';
import { initialTemplates } from '@/lib/templates';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateInvitationTemplate } from '@/ai/flows/generate-invitation-template';

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
  const [templates, setTemplates] = useState<InvitationTemplate[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplateState] = useState<InvitationTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [drafts, setDrafts] = useLocalStorage<SavedDesign[]>('savedDesigns', []);
  const [favoriteTemplates, setFavoriteTemplates] = useLocalStorage<string[]>('favoriteTemplates', []);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  useEffect(() => {
    const loadedTemplates = initialTemplates.map(t => ({
      ...t,
      favorite: favoriteTemplates.includes(t.id),
    }));
    setTemplates(loadedTemplates);
  }, [favoriteTemplates]);
  
  const useTemplate = (template: InvitationTemplate) => {
    setSelectedTemplateState(template);
    setCustomizations({});
    setActiveDraftId(null);
  };
  
  const setSelectedTemplate = (template: InvitationTemplate | null) => {
    if (template?.id === selectedTemplate?.id) return;
    
    setSelectedTemplateState(template);
    setCustomizations({});
    setActiveDraftId(null);
  };
  
  const startDesigning = async (description: string) => {
    const aiGeneratedTemplate = await generateInvitationTemplate({ description });
    // Add the new AI template to the list if it's not already there
    setTemplates(prev => {
        if (prev.find(t => t.id === aiGeneratedTemplate.id)) {
            return prev;
        }
        return [...prev, aiGeneratedTemplate];
    });
    setSelectedTemplateState(aiGeneratedTemplate);
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
    const isFavorite = favoriteTemplates.includes(templateId);
    if (isFavorite) {
      setFavoriteTemplates(favoriteTemplates.filter(id => id !== templateId));
    } else {
      setFavoriteTemplates([...favoriteTemplates, templateId]);
    }
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
      // Find the template from the current list of templates
      const template = templates.find(t => t.id === draft.templateId);
      if (template) {
        setSelectedTemplateState(template);
        setCustomizations(draft.customizations);
        setActiveDraftId(draft.id);
      } else {
        // Handle case where an AI-generated template might not be in the initial list
        console.warn("Template for draft not found, it may have been generated by AI in a previous session.");
        // A more robust solution would be to save the full template data with the draft
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
