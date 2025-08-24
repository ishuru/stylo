"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateSelector } from "./template-selector";
import { CustomizePanel } from "./customize-panel";
import { AiDesignSuggester } from "./ai-design-suggester";
import { BookMarked, Palette, Wand2 } from "lucide-react";

export function EditorSidebar() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold font-headline text-primary">Invite Canvas</h2>
      </div>
      <Tabs defaultValue="templates" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="m-4">
          <TabsTrigger value="templates" className="w-full">
            <BookMarked className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="customize" className="w-full">
            <Palette className="mr-2 h-4 w-4" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="w-full">
            <Wand2 className="mr-2 h-4 w-4" />
            AI Tools
          </TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="templates">
            <TemplateSelector />
          </TabsContent>
          <TabsContent value="customize">
            <CustomizePanel />
          </TabsContent>
          <TabsContent value="ai-tools">
            <AiDesignSuggester />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
