"use client";

import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { InvitationProvider } from "@/context/invitation-context";
import { EditorSidebar } from "@/components/editor-sidebar";
import { Canvas } from "@/components/canvas";

export default function Home() {
  return (
    <InvitationProvider>
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
    </InvitationProvider>
  );
}
