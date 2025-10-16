import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, FileText, Building2 } from "lucide-react";

export type CreationMode = "ai" | "template";

interface StartModeSelectorProps {
  mode: CreationMode | null;
  onSelect: (mode: CreationMode) => void;
}

export default function StartModeSelector({ mode, onSelect }: StartModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${mode === "ai" ? "ring-2 ring-blue-500 border-blue-200" : ""}`}
        onClick={() => onSelect("ai")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" /> AI Proposal Generator
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-400 text-xs border px-1 rounded">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Describe your intended arrangement and let AI draft a complete, editable proposal.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          Automatically drafts sections like Services & Benefits, Financial Terms, Duration, Deliverables, and Optional Clauses.
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${mode === "template" ? "ring-2 ring-blue-500 border-blue-200" : ""}`}
        onClick={() => onSelect("template")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" /> Use a Template
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-400 text-xs border px-1 rounded">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p>Choose from formal/enterprise or local/small business templates.</p>
                    <p>All templates are fully editable.</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          Formal/enterprise: corporate discounts, service agreements, revenue-sharing. Local/small business: simple collaborations, discounts, barter.
        </CardContent>
      </Card>
    </div>
  );
}
