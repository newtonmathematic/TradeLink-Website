import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BusinessService, type BusinessProfile } from "@/services/businessService";

interface NewConversationDialogProps {
  currentBusinessId: string;
  onStart: (business: BusinessProfile, firstMessage: string) => void;
}

export default function NewConversationDialog({ currentBusinessId, onStart }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<BusinessProfile | null>(null);
  const [message, setMessage] = useState("");

  const businesses = useMemo(() => {
    const all = BusinessService.getBusinesses({ excludeDemo: true });
    return all.filter((b) => b.id !== currentBusinessId);
  }, [currentBusinessId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) =>
      b.name.toLowerCase().includes(q) ||
      b.industry.toLowerCase().includes(q) ||
      (b.address.city || "").toLowerCase().includes(q)
    );
  }, [query, businesses]);

  const canSend = selected && message.trim().length > 0;

  const handleSend = () => {
    if (selected && message.trim()) {
      try {
        onStart(selected, message.trim());
        setOpen(false);
        setQuery("");
        setSelected(null);
        setMessage("");
      } catch (e: any) {
        alert(e?.message || "Failed to start conversation");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">New Conversation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input placeholder="Search businesses" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <ScrollArea className="h-56 border rounded-md">
              <div className="p-2 space-y-1">
                {filtered.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">No businesses found</div>
                ) : (
                  filtered.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className={`w-full flex items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent ${selected?.id === b.id ? "bg-accent" : ""}`}
                    >
                      <Avatar className="h-8 w-8"><AvatarFallback>{b.logo}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-medium">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.industry}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">First message</div>
              <Textarea rows={8} placeholder="Write your message" value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="flex justify-end">
                <Button onClick={handleSend} disabled={!canSend}>Send for approval</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
