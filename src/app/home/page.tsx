
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvitation } from '@/context/invitation-context';
import type { SavedDesign, InvitationTemplate } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';

type ActiveTab = 'start' | 'templates' | 'drafts';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            active
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-primary hover:bg-primary/10'
        }`}
    >
        {children}
    </button>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="mt-4 text-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{message}</p>
    </div>
);

const StartFromScratch: React.FC<{ 
    onStartDesigning: (description: string) => void;
    isLoading: boolean;
    error: string | null;
}> = ({ onStartDesigning, isLoading, error }) => {
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onStartDesigning(description.trim());
        }
    };
    
    return (
        <div className="text-center">
            <h3 className="text-2xl font-headline text-secondary-foreground mb-2">Describe Your Event</h3>
            <p className="text-muted-foreground mb-6">Let's start by getting the details. What kind of invitation are you creating today?</p>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., A traditional South Indian baby shower, a modern minimalist wedding, a fun 5th birthday party..."
                    rows={4}
                    className="w-full p-3 border border-input rounded-md bg-background focus:ring-ring focus:border-ring shadow-sm text-base"
                    aria-label="Event Description"
                    disabled={isLoading}
                />
                 <button 
                    type="submit" 
                    disabled={isLoading || !description.trim()} 
                    className="w-full mt-6 py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Your Canvas...
                        </>
                    ) : (
                        <span className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V12a1 1 0 102 0V9.414l.293.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
                            </svg>
                            Start Designing
                        </span>
                    )}
                </button>
            </form>
            {error && <ErrorDisplay message={error} />}
        </div>
    )
};

const TemplateGallery: React.FC<{
    templates: InvitationTemplate[];
    onUseTemplate: (template: InvitationTemplate) => void;
}> = ({ templates, onUseTemplate }) => (
    <div>
        <h3 className="text-2xl font-headline text-secondary-foreground mb-2 text-center">Browse Templates</h3>
        <p className="text-muted-foreground mb-6 text-center">Get started quickly with one of our pre-designed templates.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
                <div key={template.id} className="border rounded-lg flex flex-col bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-lg">
                    <div className="aspect-[5/7] bg-muted/50">
                         <img src={`https://placehold.co/${template.width}x${template.height}.png?text=${encodeURIComponent(template.name)}`} alt={template.name} className="w-full h-full object-cover"/>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h4 className="text-lg font-bold text-primary">{template.name}</h4>
                        <p className="text-sm text-secondary-foreground flex-grow mt-1 mb-4">{template.description || 'A beautiful invitation template.'}</p>
                        <button 
                            onClick={() => onUseTemplate(template)}
                            className="w-full mt-auto py-2 px-4 bg-accent text-accent-foreground font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                        >
                            Use Template
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DraftsManager: React.FC<{
    drafts: SavedDesign[];
    onLoadDraft: (draftId: string) => void;
    onDeleteDraft: (draftId: string) => void;
    onRenameDraft: (draftId: string, newName: string) => void;
}> = ({ drafts, onLoadDraft, onDeleteDraft, onRenameDraft }) => {
    return (
     <div>
        <h3 className="text-2xl font-headline text-secondary-foreground mb-2 text-center">My Drafts</h3>
        <p className="text-muted-foreground mb-6 text-center">Continue working on your saved projects.</p>
        {drafts.length > 0 ? (
            <div className="space-y-4">
                {drafts.map(draft => (
                    <div key={draft.id} className="border rounded-lg p-3 flex items-center gap-4 bg-card">
                        <div className="flex-shrink-0 w-16 h-24 bg-muted/50 rounded-md overflow-hidden">
                            {draft.thumbnail ? (
                                 <img src={`data:image/png;base64,${draft.thumbnail}`} alt={draft.name || 'Draft preview'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-primary">{draft.name || 'Untitled Draft'}</p>
                            <p className="text-xs text-muted-foreground">
                                Saved: {new Date(draft.savedAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                             <button 
                                onClick={() => onLoadDraft(draft.id)}
                                className="py-2 px-3 bg-accent text-accent-foreground font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity text-sm"
                            >
                                Load
                            </button>
                             <button 
                                onClick={() => {
                                    const newName = prompt('Enter new name:', draft.name);
                                    if (newName) {
                                      onRenameDraft(draft.id, newName);
                                    }
                                }}
                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                title="Rename Draft"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                            </button>
                             <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this draft?')) {
                                    onDeleteDraft(draft.id);
                                  }
                                }}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete Draft"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 px-4 border-2 border-dashed border-border rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2z" />
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
                </svg>
                <p className="mt-4 font-semibold text-secondary-foreground">No saved drafts found.</p>
                <p className="text-sm text-muted-foreground">Your saved invitations will appear here.</p>
            </div>
        )}
    </div>
    );
};


export default function HomePage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('start');
    const { 
      templates, 
      drafts, 
      startDesigning, 
      useTemplate, 
      loadDraft, 
      deleteDraft, 
      renameDraft 
    } = useInvitation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const isMobile = useIsMobile();

    const handleStartDesigning = async (description: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await startDesigning(description);
            router.push('/editor');
        } catch (err) {
            setError('Failed to start designing. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTemplate = (template: InvitationTemplate) => {
        useTemplate(template);
        router.push('/editor');
    };

    const handleLoadDraft = (draftId: string) => {
        loadDraft(draftId);
        router.push('/editor');
    };
    
    return (
        <main className="container mx-auto p-4" style={{ minHeight: 'calc(100vh - 110px)' }}>
            <div className="max-w-4xl w-full mx-auto bg-card p-4 sm:p-8 rounded-xl shadow-lg">
                <div className={`flex items-center gap-2 sm:gap-4 mb-8 border-b border-border pb-4 ${isMobile ? 'justify-around' : 'justify-center'}`}>
                    <TabButton active={activeTab === 'start'} onClick={() => setActiveTab('start')}>
                        Start
                    </TabButton>
                    <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>
                        Templates
                    </TabButton>
                    <TabButton active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')}>
                        Drafts ({drafts.length})
                    </TabButton>
                </div>

                <div>
                    {activeTab === 'start' && <StartFromScratch 
                        onStartDesigning={handleStartDesigning}
                        isLoading={isLoading}
                        error={error}
                    />}
                    {activeTab === 'templates' && <TemplateGallery 
                        templates={templates} 
                        onUseTemplate={handleUseTemplate} 
                    />}
                    {activeTab === 'drafts' && <DraftsManager 
                        drafts={drafts}
                        onLoadDraft={handleLoadDraft}
                        onDeleteDraft={deleteDraft}
                        onRenameDraft={renameDraft}
                    />}
                </div>
            </div>
        </main>
    );
};
