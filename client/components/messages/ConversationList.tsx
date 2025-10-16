import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/services/messageService";
import { BusinessService } from "@/services/businessService";

interface ConversationListProps {
  conversations: Conversation[];
  currentBusinessId: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({ conversations, currentBusinessId, selectedId, onSelect }: ConversationListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-1 p-2">
        {conversations.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4">No conversations yet.</div>
        ) : (
          conversations.map((c) => {
            const otherId = c.participants.find((p) => p !== currentBusinessId) || "";
            const other = BusinessService.getBusinessById(otherId);
            const last = c.messages[c.messages.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent",
                  selectedId === c.id && "bg-accent"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{(other?.logo || (other?.name?.slice(0,2).toUpperCase()) || "??")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{other?.name || "Unknown Business"}</div>
                    {c.status !== "active" && (
                      <Badge variant="outline" className={cn(
                        c.status === "pending" ? "text-amber-600 border-amber-200 bg-amber-50" : "text-gray-600 border-gray-200 bg-gray-50"
                      )}>
                        {c.status === "pending" ? "Pending" : "Declined"}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {last?.content || "No messages"}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
