"use client";

import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { EditorSidebar } from "@/components/editor-sidebar";
import { Canvas } from "@/components/canvas";
import { Suspense } from "react";

function Editor() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <EditorSidebar />
        </Sidebar>
        <SidebarInset className="flex-1">
          <Canvas />
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
