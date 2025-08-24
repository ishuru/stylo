"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateSelector } from "./template-selector";
import { CustomizePanel } from "./customize-panel";
import { AiDesignSuggester } from "./ai-design-suggester";
import { BookMarked, Palette, Wand2 } from "lucide-react";

export function EditorSidebar() {
  return (
    <div className="h-full flex flex-col bg-card border-r">
      <Tabs defaultValue="customize" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 gap-1 rounded-none border-b p-1">
          <TabsTrigger value="templates" className="rounded-sm">
            <BookMarked className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="customize" className="rounded-sm">
            <Palette className="mr-2 h-4 w-4" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="rounded-sm">
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
