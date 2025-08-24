
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useInvitation } from '@/context/invitation-context';
import type { SavedDesign, InvitationTemplate } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Loader2, Wand2, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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
            <p className="text-muted-foreground mb-6">{"Let's start by getting the details. What kind of invitation are you creating today?"}</p>
            <form onSubmit={handleSubmit}>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., A traditional South Indian baby shower, a modern minimalist wedding, a fun 5th birthday party..."
                    rows={4}
                    className="w-full p-3 border border-input rounded-md bg-background focus:ring-ring focus:border-ring shadow-sm text-base"
                    aria-label="Event Description"
                    disabled={isLoading}
                />
                 <Button 
                    type="submit" 
                    disabled={isLoading || !description.trim()} 
                    className="w-full mt-6 py-3 px-4 font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Creating Your Canvas...
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-5 w-5 mr-2" />
                            Start Designing
                        </>
                    )}
                </Button>
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
                    <div className="aspect-[5/7] bg-muted/50 relative">
                        <Image
                            src={`https://placehold.co/${template.width}x${template.height}.png?text=${encodeURIComponent(template.name)}`}
                            alt={template.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                        <h4 className="text-lg font-bold text-primary">{template.name}</h4>
                        <p className="text-sm text-secondary-foreground flex-grow mt-1 mb-4">{template.description || 'A beautiful invitation template.'}</p>
                        <Button 
                            onClick={() => onUseTemplate(template)}
                            className="w-full mt-auto"
                            variant="secondary"
                        >
                            Use Template
                        </Button>
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
    const [renameTarget, setRenameTarget] = useState<SavedDesign | null>(null);
    const [newName, setNewName] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<SavedDesign | null>(null);

    const handleRenameClick = (draft: SavedDesign) => {
        setRenameTarget(draft);
        setNewName(draft.name);
    }

    const handleRenameSave = () => {
        if (renameTarget && newName.trim()) {
            onRenameDraft(renameTarget.id, newName.trim());
            setRenameTarget(null);
        }
    }
    
    const handleDeleteConfirm = () => {
        if (deleteTarget) {
            onDeleteDraft(deleteTarget.id);
            setDeleteTarget(null);
        }
    }

    return (
     <>
        <div className="sm:text-center">
            <h3 className="text-2xl font-headline text-secondary-foreground mb-2">My Drafts</h3>
            <p className="text-muted-foreground mb-6">Continue working on your saved projects.</p>
        </div>
        {drafts.length > 0 ? (
            <div className="space-y-4">
                {drafts.map(draft => (
                    <div key={draft.id} className="border rounded-lg p-3 flex flex-col sm:flex-row items-center gap-4 bg-card">
                        <div className="flex-shrink-0 w-24 h-36 sm:w-16 sm:h-24 bg-muted/50 rounded-md overflow-hidden relative">
                            {draft.thumbnail ? (
                                <Image
                                    src={draft.thumbnail}
                                    alt={draft.name || 'Draft preview'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                            <p className="font-semibold text-primary">{draft.name || 'Untitled Draft'}</p>
                            <p className="text-xs text-muted-foreground">
                                Saved: {new Date(draft.savedAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2 mt-4 sm:mt-0">
                             <Button
                                size="sm"
                                onClick={() => onLoadDraft(draft.id)}
                                className="w-20"
                            >
                                Load
                            </Button>
                             <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenameClick(draft)}
                                title="Rename Draft"
                                className="w-20"
                            >
                                <Edit className="h-4 w-4 mr-1 sm:mr-0" />
                                <span className="sm:hidden">Rename</span>
                            </Button>
                             <Button
                                size="sm"
                                variant="destructive"
                                title="Delete Draft"
                                className="w-20"
                                onClick={() => setDeleteTarget(draft)}
                            >
                               <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
                               <span className="sm:hidden">Delete</span>
                            </Button>
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
        <Dialog open={!!renameTarget} onOpenChange={(isOpen) => !isOpen && setRenameTarget(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Draft</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleRenameSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <AlertDialog open={!!deleteTarget} onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the draft &quot;{deleteTarget?.name}&quot;.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
     </>
    );
};

type ActiveTab = 'start' | 'templates' | 'drafts';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('start');
    const { 
      templates, 
      drafts, 
      startDesigning,
      selectTemplate,
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

    const handleSelectTemplate = (template: InvitationTemplate) => {
        selectTemplate(template);
        router.push('/editor');
    };

    const handleLoadDraft = (draftId: string) => {
        loadDraft(draftId);
        router.push('/editor');
    };
    
    return (
        <main className="container mx-auto p-4 md:p-8" style={{ minHeight: 'calc(100vh - 110px)' }}>
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
                        onUseTemplate={handleSelectTemplate}
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
