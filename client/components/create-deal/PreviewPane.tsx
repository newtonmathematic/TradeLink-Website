import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PreviewPaneProps {
  title: string;
  partnerName?: string;
  sections: { title: string; content: string }[];
}

export default function PreviewPane({ title, partnerName, sections }: PreviewPaneProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {partnerName && (
            <p className="text-sm text-gray-600">Prepared for {partnerName}</p>
          )}
        </div>
        {sections.map((s, idx) => (
          <div key={idx}>
            <h4 className="font-medium text-gray-900">{s.title}</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{s.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
