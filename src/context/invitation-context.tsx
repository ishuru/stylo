
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import type { InvitationTemplate, Layer, SavedDesign } from '@/lib/types';
import { initialTemplates } from '@/lib/templates';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { generateInvitationTemplate } from '@/ai/flows/generate-invitation-template';
import { useToast } from '@/hooks/use-toast';


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
  const [templates, setTemplates] = useLocalStorage<InvitationTemplate[]>('allTemplates', initialTemplates);
  const [selectedTemplate, setSelectedTemplateState] = useState<InvitationTemplate | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [drafts, setDrafts] = useState<SavedDesign[]>([]);
  const [favoriteTemplates, setFavoriteTemplates] = useLocalStorage<string[]>('favoriteTemplates', []);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadedTemplates = templates.map(t => ({
      ...t,
      favorite: favoriteTemplates.includes(t.id),
    }));
    // This comparison prevents an infinite loop
    if (JSON.stringify(templates) !== JSON.stringify(loadedTemplates)) {
        setTemplates(loadedTemplates);
    }
  }, [favoriteTemplates, templates, setTemplates]);
  
  const fetchDrafts = useCallback(async () => {
    try {
        const draftsCollection = collection(db, "designs");
        const q = query(draftsCollection, orderBy("savedAt", "desc"));
        const draftSnapshot = await getDocs(q);
        const draftsList = draftSnapshot.docs.map(doc => doc.data() as SavedDesign);
        setDrafts(draftsList);
    } catch (error) {
        console.error("Error fetching drafts: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your saved drafts. Please check your connection and try again.",
        });
    }
  }, [toast]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  
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
    setFavoriteTemplates(prev => {
        const newFavorites = prev.includes(templateId)
            ? prev.filter(id => id !== templateId)
            : [...prev, templateId];
        
        setTemplates(currentTemplates => currentTemplates.map(t => ({
            ...t,
            favorite: newFavorites.includes(t.id)
        })));
        
        return newFavorites;
    });
  };
  
  const resetCustomizations = () => {
    setCustomizations({});
  };

  const saveDraft = async (name?: string) => {
    if (!selectedTemplate || !canvasRef.current) return;
    
    const draftId = activeDraftId || `draft-${Date.now()}`;
    const draftName = name || (activeDraftId ? drafts.find(d => d.id === activeDraftId)?.name : null) || `Draft ${drafts.length + 1}`;
    
    const canvas = await html2canvas(canvasRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 0.2,
    });
    const thumbnail = canvas.toDataURL('image/png');
    
    const newDraft: SavedDesign = {
      id: draftId,
      name: draftName,
      template: selectedTemplate,
      customizations,
      savedAt: new Date().toISOString(),
      thumbnail,
    };
    
    try {
        await setDoc(doc(db, "designs", draftId), newDraft);
        setActiveDraftId(newDraft.id);
        await fetchDrafts(); // Refresh drafts from Firestore
    } catch(error) {
        console.error("Error saving draft: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save draft to the cloud.",
        });
        throw error; // re-throw to be caught by the UI
    }
  };

  const loadDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      const template = draft.template;
      setTemplates(prev => {
        if (prev.find(t => t.id === template.id)) {
            return prev;
        }
        return [...prev, template];
      });
      setSelectedTemplateState(template);
      setCustomizations(draft.customizations);
      setActiveDraftId(draft.id);
    }
  };
  
  const deleteDraft = async (draftId: string) => {
    try {
        await deleteDoc(doc(db, "designs", draftId));
        await fetchDrafts();
    } catch(error) {
        console.error("Error deleting draft: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete draft from the cloud.",
        });
    }
  };
  
  const renameDraft = async (draftId: string, newName: string) => {
    try {
        const draftRef = doc(db, "designs", draftId);
        await updateDoc(draftRef, { name: newName });
        await fetchDrafts();
    } catch(error) {
        console.error("Error renaming draft: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not rename draft in the cloud.",
        });
    }
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
