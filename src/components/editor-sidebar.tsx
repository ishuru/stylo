
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
        <TabsList className="grid w-full grid-cols-3 gap-1 rounded-none border-b p-1 h-auto">
          <TabsTrigger value="templates" className="rounded-sm flex-col h-auto p-2 gap-1">
            <BookMarked className="h-5 w-5" />
            <span className="text-xs">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="customize" className="rounded-sm flex-col h-auto p-2 gap-1">
            <Palette className="h-5 w-5" />
            <span className="text-xs">Customize</span>
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="rounded-sm flex-col h-auto p-2 gap-1">
            <Wand2 className="h-5 w-5" />
            <span className="text-xs">AI Tools</span>
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
