import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export interface Section {
  id: string;
  title: string;
  content: string;
}

interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

export default function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const update = (index: number, patch: Partial<Section>) => {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const add = () => {
    onChange([
      ...sections,
      { id: `sec_${Date.now()}`, title: "New Clause", content: "" },
    ]);
  };

  const remove = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {sections.map((sec, i) => (
        <Card key={sec.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                <Input value={sec.title} onChange={(e) => update(i, { title: e.target.value })} />
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea rows={4} value={sec.content} onChange={(e) => update(i, { content: e.target.value })} />
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4 mr-2" /> Add Clause</Button>
    </div>
  );
}
