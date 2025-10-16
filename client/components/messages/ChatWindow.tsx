import React, { useMemo, useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Conversation } from "@/services/messageService";
import { MessageService } from "@/services/messageService";
import { BusinessService } from "@/services/businessService";
import { BlockService } from "@/services/blockService";

interface ChatWindowProps {
  conversation: Conversation | undefined;
  currentBusinessId: string;
}

export default function ChatWindow({ conversation, currentBusinessId }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [conversation?.messages.length]);

  const partner = useMemo(() => {
    if (!conversation) return null;
    const otherId = conversation.participants.find((p) => p !== currentBusinessId) || "";
    return BusinessService.getBusinessById(otherId);
  }, [conversation, currentBusinessId]);

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center text-muted-foreground">
          Select a conversation to view messages
        </CardContent>
      </Card>
    );
  }

  const isRecipientPending = conversation.status === "pending" && conversation.pendingApprovalFor === currentBusinessId;
  const isSenderPending = conversation.status === "pending" && conversation.createdBy === currentBusinessId;

  const handleApprove = () => MessageService.approveConversation(conversation.id, currentBusinessId);
  const handleDecline = () => MessageService.declineConversation(conversation.id, currentBusinessId);
  const handleSend = () => {
    if (!input.trim()) return;
    MessageService.sendMessage(conversation.id, currentBusinessId, input.trim());
    setInput("");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{partner?.logo || (partner?.name?.slice(0,2).toUpperCase()) || "??"}</AvatarFallback></Avatar>
          <div>
            <CardTitle className="text-base">
              {partner ? (
                <Link to={`/business/${partner.id}`} className="hover:underline">
                  {partner.name}
                </Link>
              ) : (
                "Conversation"
              )}
            </CardTitle>
            <div className="text-xs text-muted-foreground">{partner?.industry || ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation.status !== "active" && (
            <Badge variant="outline" className={conversation.status === "pending" ? "text-amber-600 border-amber-200 bg-amber-50" : "text-gray-600 border-gray-200 bg-gray-50"}>
              {conversation.status === "pending" ? "Pending approval" : "Declined"}
            </Badge>
          )}
          {partner && (
            <button
              onClick={() => {
                const otherId = partner.id;
                const me = currentBusinessId;
                const blocked = BlockService.isBlocked(me, otherId);
                if (blocked) BlockService.unblock(me, otherId); else BlockService.block(me, otherId);
              }}
              className="text-xs px-2 py-1 border rounded hover:bg-accent"
            >
              {BlockService.isBlocked(currentBusinessId, partner.id) ? "Unblock" : "Block"}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-rows-[1fr_auto] gap-4 h-[calc(100vh-280px)] p-0">
        <ScrollArea className="px-6">
          <div ref={viewportRef} className="space-y-3 py-4">
            {conversation.messages.map((m) => {
              const mine = m.senderBusinessId === currentBusinessId;
              const hidden = conversation.status === "pending" && isRecipientPending && m !== conversation.messages[0];
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-md px-3 py-2 text-sm ${mine ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
                    {hidden ? (
                      <span className="text-muted-foreground">Hidden until you accept</span>
                    ) : (
                      m.content
                    )}
                    <div className="mt-1 text-[10px] opacity-70">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {isRecipientPending && (
          <div className="border-t px-6 py-3 flex items-center gap-2 bg-amber-50">
            <div className="text-sm">Approve this conversation to reply.</div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={handleDecline}>Decline</Button>
              <Button onClick={handleApprove}>Accept</Button>
            </div>
          </div>
        )}

        {isSenderPending && (
          <div className="border-t px-6 py-3 text-sm text-muted-foreground bg-gray-50">Waiting for recipient to approve this conversation.</div>
        )}

        {conversation.status === "declined" && (
          <div className="border-t px-6 py-3 text-sm text-muted-foreground bg-gray-50">This conversation was declined.</div>
        )}

        {conversation.status === "active" && (
          <div className="border-t px-6 py-3 grid grid-cols-[1fr_auto] gap-3 items-center bg-white">
            <Textarea
              placeholder="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
            />
            <Button onClick={handleSend} disabled={!input.trim()}>Send</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
