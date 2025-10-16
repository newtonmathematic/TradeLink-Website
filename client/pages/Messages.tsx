import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MessageService, type Conversation } from "@/services/messageService";
import { BusinessService, type BusinessProfile } from "@/services/businessService";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";
import NewConversationDialog from "@/components/messages/NewConversationDialog";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { BlockService } from "@/services/blockService";

export default function Messages() {
  const { user } = useAuth();
  const currentBusinessId = useMemo(() => (user ? `biz_${user.id}` : ""), [user]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!currentBusinessId) return;
    const load = () => {
      let list = MessageService.listConversations(currentBusinessId);
      // Hide blocked participants
      list = list.filter((c) => {
        const other = c.participants.find((p) => p !== currentBusinessId) || "";
        return !BlockService.isBlocked(currentBusinessId, other);
      });
      setConversations(list);

      const openId = searchParams.get("open");
      const toId = searchParams.get("to");

      if (openId) {
        const openConv = list.find((c) => c.id === openId);
        setSelectedId(openConv ? openConv.id : list[0]?.id);
      } else if (toId) {
        try {
          const conv = MessageService.ensureConversation(currentBusinessId, toId);
          if (!BlockService.isBlocked(currentBusinessId, toId)) {
            setSelectedId(conv.id);
          }
          const sp = new URLSearchParams(searchParams);
          sp.delete("to");
          sp.set("open", conv.id);
          setSearchParams(sp, { replace: true });
        } catch {}
      } else if (!selectedId && list.length > 0) {
        setSelectedId(list[0].id);
      }
    };
    load();
    const unsub = MessageService.subscribe(load);
    return unsub;
  }, [currentBusinessId, selectedId, searchParams, setSearchParams]);

  const selected = useMemo(() => conversations.find((c) => c.id === selectedId), [conversations, selectedId]);

  const handleStart = (business: BusinessProfile, firstMessage: string) => {
    const conv = MessageService.startConversation(currentBusinessId, business.id, firstMessage);
    setSelectedId(conv.id);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <NewConversationDialog currentBusinessId={currentBusinessId} onStart={handleStart} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-2 md:col-span-1">
          <ConversationList
            conversations={conversations}
            currentBusinessId={currentBusinessId}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </Card>
        <div className="md:col-span-2 min-h-[60vh]">
          <ChatWindow conversation={selected} currentBusinessId={currentBusinessId} />
        </div>
      </div>
    </div>
  );
}
