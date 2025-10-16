import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, MessageSquare, Slash, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";
import { useToast } from "@/hooks/use-toast";
import {
  ProposalService,
  type ProposalAction,
} from "@/services/proposalService";
import type {
  ProposalDetail as ProposalDetailType,
  ProposalParticipantRole,
  ProposalMessage,
} from "@shared/proposals";
import { formatDistanceToNow } from "date-fns";

function statusBadge(
  proposal: ProposalDetailType,
  role: ProposalParticipantRole,
): { label: string; tone: string } {
  switch (proposal.status) {
    case "awaiting_recipient":
      return {
        label: role === "proposer" ? "Awaiting approval" : "Needs review",
        tone: "bg-amber-100 text-amber-700 border border-amber-200",
      };
    case "under_negotiation":
      return {
        label:
          proposal.awaitingParty === role
            ? "Your response required"
            : "Awaiting partner",
        tone: "bg-orange-100 text-orange-700 border border-orange-200",
      };
    case "accepted":
      return {
        label: "Accepted",
        tone: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      };
    case "declined":
      return {
        label: "Declined",
        tone: "bg-red-100 text-red-600 border border-red-200",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        tone: "bg-gray-100 text-gray-600 border border-gray-200",
      };
    default:
      return {
        label: "Pending",
        tone: "bg-gray-100 text-gray-600 border border-gray-200",
      };
  }
}

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useCreateProposalModal();
  const { toast } = useToast();

  const [proposal, setProposal] = useState<ProposalDetailType | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: ProposalAction | null;
    note: string;
  }>({ open: false, action: null, note: "" });
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const userId = user?.id ?? null;
  const businessName =
    user?.businessName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;

  useEffect(() => {
    const fetch = async () => {
      if (!userId || !id) return;
      setLoading(true);
      try {
        const detail = await ProposalService.get(userId, id);
        setProposal(detail);
      } catch (error) {
        console.error("Failed to load proposal", error);
        toast({
          variant: "destructive",
          title: "Unable to load proposal",
          description: "Please return to the proposals page and try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, [id, toast, userId]);

  const role: ProposalParticipantRole = useMemo(() => {
    if (!proposal || !userId) return "proposer";
    return proposal.proposerId === userId ? "proposer" : "recipient";
  }, [proposal, userId]);

  const label = proposal ? statusBadge(proposal, role) : null;

  const handleAction = async (action: ProposalAction, note?: string) => {
    if (!proposal || !userId) return;
    try {
      await ProposalService.act(
        userId,
        proposal.id,
        businessName,
        action,
        note,
      );
      const updated = await ProposalService.get(userId, proposal.id);
      setProposal(updated);
      toast({
        title:
          action === "accept"
            ? "Proposal accepted"
            : action === "decline"
              ? "Proposal declined"
              : "Proposal cancelled",
      });
    } catch (error) {
      console.error("Failed to update proposal", error);
      toast({
        variant: "destructive",
        title: "Unable to update proposal",
        description: "Please try again.",
      });
    } finally {
      setActionDialog({ open: false, action: null, note: "" });
    }
  };

  const handleSendMessage = async () => {
    if (!proposal || !userId || !messageDraft.trim()) return;
    setIsMessageSending(true);
    try {
      await ProposalService.sendMessage(userId, proposal.id, {
        senderName: businessName,
        content: messageDraft.trim(),
      });
      const updated = await ProposalService.get(userId, proposal.id);
      setProposal(updated);
      setMessageDraft("");
    } catch (error) {
      console.error("Failed to send message", error);
      toast({
        variant: "destructive",
        title: "Message not sent",
        description: "Please try again shortly.",
      });
    } finally {
      setIsMessageSending(false);
    }
  };

  const handleBlock = async () => {
    if (!proposal || !userId) return;
    try {
      await ProposalService.block(userId, proposal.id);
      toast({
        title: "Business blocked",
        description: "They will no longer be able to contact you.",
      });
      navigate("/proposals");
    } catch (error) {
      console.error("Failed to block business", error);
      toast({
        variant: "destructive",
        title: "Unable to block",
        description: "Please try again.",
      });
    } finally {
      setIsBlockDialogOpen(false);
    }
  };

  const openNegotiation = () => {
    if (!proposal) return;
    openModal({ mode: "negotiate", proposal, startStep: 0 });
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">
            Please sign in to view proposals.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">
            Loading proposal...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate("/proposals")}>
          Back to proposals
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Proposal not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            The proposal you are looking for does not exist or may have been
            removed.
          </CardContent>
        </Card>
      </div>
    );
  }

  const awaitingMessage = label?.label ?? "";

  return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" onClick={() => navigate("/proposals")}>
        Back to proposals
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-3">
            <span>{proposal.title}</span>
            <Badge className={label?.tone}>{awaitingMessage}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            {proposal.content.outline.summary}
          </div>

          <ScrollArea className="max-h-[420px] rounded-lg border border-gray-200 p-4">
            <div className="space-y-4 text-sm text-gray-700">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Contributions
                </h3>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      {proposal.proposerName}
                    </p>
                    <p className="mt-1">
                      {proposal.content.contributions.proposerContribution}
                    </p>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      {proposal.recipientName}
                    </p>
                    <p className="mt-1">
                      {proposal.content.contributions.recipientContribution}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Objectives
                </h3>
                <div className="mt-2 space-y-2">
                  {proposal.content.objectives.rows.map((row) => (
                    <div
                      key={row.id}
                      className="rounded border border-gray-200 bg-white p-3"
                    >
                      <p className="font-medium text-gray-900">
                        {proposal.proposerName}
                      </p>
                      <p className="text-sm">{row.proposerOutcome}</p>
                      <div className="my-2 h-px bg-gray-100" />
                      <p className="font-medium text-gray-900">
                        {proposal.recipientName}
                      </p>
                      <p className="text-sm">{row.recipientOutcome}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Terms
                </h3>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Start date
                    </p>
                    <p className="text-sm">
                      {proposal.content.terms.startDate}
                    </p>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Review frequency
                    </p>
                    <p className="text-sm">
                      {proposal.content.terms.reviewFrequencyValue}{" "}
                      {proposal.content.terms.reviewFrequencyUnit}
                    </p>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Duration
                    </p>
                    <p className="text-sm">
                      {proposal.content.terms.ongoing
                        ? "Ongoing"
                        : `${proposal.content.terms.durationValue} ${proposal.content.terms.durationUnit}`}
                    </p>
                  </div>
                  <div className="rounded border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Termination
                    </p>
                    <p className="text-sm capitalize">
                      {proposal.content.terms.terminationOptions.join(", ")}
                    </p>
                  </div>
                </div>
                {proposal.content.terms.additionalTerms && (
                  <p className="mt-2 text-sm text-gray-700">
                    {proposal.content.terms.additionalTerms}
                  </p>
                )}
              </section>

              {proposal.content.tracking.kpis.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    KPIs
                  </h3>
                  <div className="mt-2 space-y-2">
                    {proposal.content.tracking.kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="rounded border border-gray-200 bg-white p-3"
                      >
                        <p className="font-medium text-gray-900">{kpi.name}</p>
                        <p className="text-sm text-gray-600">
                          Target: {kpi.targetValue}
                          {kpi.currency ? ` ${kpi.currency}` : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          Report every {kpi.reportFrequencyValue}{" "}
                          {kpi.reportFrequencyUnit}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {proposal.content.additionalNotes.trim() && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Additional notes
                  </h3>
                  <p className="mt-2 text-sm text-gray-700">
                    {proposal.content.additionalNotes}
                  </p>
                </section>
              )}
            </div>
          </ScrollArea>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {role === "recipient" &&
                (proposal.status === "awaiting_recipient" ||
                  proposal.status === "under_negotiation") && (
                  <>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() =>
                        setActionDialog({
                          open: true,
                          action: "accept",
                          note: "",
                        })
                      }
                    >
                      <Check className="mr-2 h-4 w-4" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setActionDialog({
                          open: true,
                          action: "decline",
                          note: "",
                        })
                      }
                    >
                      <X className="mr-2 h-4 w-4" /> Decline
                    </Button>
                    <Button variant="secondary" onClick={openNegotiation}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Negotiate
                    </Button>
                  </>
                )}
              {role === "proposer" &&
                proposal.status === "under_negotiation" &&
                proposal.awaitingParty === "proposer" && (
                  <Button variant="secondary" onClick={openNegotiation}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Respond
                  </Button>
                )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBlockDialogOpen(true)}
              >
                <Slash className="mr-2 h-4 w-4" /> Block
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Conversation
            </h3>
            <ScrollArea className="h-48 rounded border border-gray-100 bg-gray-50 p-3">
              <div className="space-y-3">
                {proposal.messages.map((message: ProposalMessage) => {
                  const isMine = message.senderRole === role;
                  return (
                    <div
                      key={message.id}
                      className={`rounded-lg p-3 text-sm ${
                        isMine
                          ? "bg-[#0f172a] text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {message.senderName}
                        </span>
                        <span
                          className={`text-xs ${
                            isMine ? "text-white/70" : "text-gray-500"
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="mt-3 flex gap-2">
              <Textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                placeholder="Type a message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageDraft.trim() || isMessageSending}
              >
                {isMessageSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) =>
          setActionDialog((prev) => ({ ...prev, open, note: prev.note }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "accept"
                ? "Accept proposal"
                : actionDialog.action === "decline"
                  ? "Decline proposal"
                  : "Cancel proposal"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Add an optional note"
            value={actionDialog.note}
            onChange={(event) =>
              setActionDialog((prev) => ({ ...prev, note: event.target.value }))
            }
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setActionDialog({ open: false, action: null, note: "" })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                actionDialog.action &&
                handleAction(actionDialog.action, actionDialog.note.trim())
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block this business?</AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer be able to send you messages or proposals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock}>Block</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
