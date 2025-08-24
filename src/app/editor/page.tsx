
"use client";

import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EditorSidebar } from "@/components/editor-sidebar";
import { Canvas } from "@/components/canvas";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useInvitation } from "@/context/invitation-context";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

function EditorHeader() {
  const { saveDraft } = useInvitation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSave = async () => {
    try {
      await saveDraft();
      toast({
        title: "Draft Saved!",
        description: "Your design has been saved to your drafts.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save draft. Please try again.",
      });
    }
  }

  return (
    <div className="p-2 border-b bg-card flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-xl font-bold font-headline text-primary">Invite Canvas</h1>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Save</span>
            </Button>
        </div>
    </div>
  )
}

function Editor() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar>
          <EditorSidebar />
        </Sidebar>
        <div className="flex flex-col w-full">
            <EditorHeader />
            <div className="flex-1 overflow-auto">
                <Canvas />
            </div>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}


export default function EditorPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  )
}
