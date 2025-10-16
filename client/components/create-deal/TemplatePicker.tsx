import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealTemplate, ProposalService } from "@/services/proposalService";
import { Star } from "lucide-react";

interface TemplatePickerProps {
  selected?: DealTemplate | null;
  onSelect: (template: DealTemplate) => void;
}

export default function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  const enterprise = [
    ...ProposalService.getTemplatesByCategory("formal_enterprise"),
    ...ProposalService.getTemplatesByCategory("employee_benefits"),
  ];
  const local = [
    ...ProposalService.getTemplatesByCategory("informal_local"),
    ...ProposalService.getTemplatesByCategory("service_exchange"),
  ];

  const renderList = (list: DealTemplate[]) => (
    <div className="space-y-3">
      {list.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all hover:shadow-md ${selected?.id === template.id ? "ring-2 ring-blue-500 border-blue-200" : "hover:border-gray-300"}`}
          onClick={() => onSelect(template)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h6 className="font-medium text-gray-900 flex items-center gap-2">
                  {template.name}
                  {template.isPopular && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                      <Star className="h-3 w-3 mr-1" /> Popular
                    </Badge>
                  )}
                </h6>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="enterprise" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="enterprise">Formal / Enterprise</TabsTrigger>
        <TabsTrigger value="local">Local / Small Business</TabsTrigger>
      </TabsList>
      <TabsContent value="enterprise" className="mt-4">
        {renderList(enterprise)}
      </TabsContent>
      <TabsContent value="local" className="mt-4">
        {renderList(local)}
      </TabsContent>
    </Tabs>
  );
}
