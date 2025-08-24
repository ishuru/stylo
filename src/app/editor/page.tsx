"use client";

import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { EditorSidebar } from "@/components/editor-sidebar";
import { Canvas } from "@/components/canvas";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useInvitation } from "@/context/invitation-context";
import { useToast } from "@/hooks/use-toast";

function EditorHeader() {
  const { saveDraft } = useInvitation();
  const { toast } = useToast();

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
    <div className="p-4 border-b bg-card flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline text-primary">Invite Canvas</h2>
        <Button onClick={handleSave}>
            <Save className="mr-2"/>
            Save Draft
        </Button>
    </div>
  )
}

function Editor() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <EditorSidebar />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col">
          <EditorHeader />
          <div className="flex-1">
            <Canvas />
          </div>
        </SidebarInset>
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
