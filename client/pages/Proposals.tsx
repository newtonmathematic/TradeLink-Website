import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Check,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Slash,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";
import { useToast } from "@/hooks/use-toast";
import {
  ProposalService,
  type ProposalAction,
} from "@/services/proposalService";
import type {
  ProposalDetail,
  ProposalListItem,
  ProposalMessage,
  ProposalParticipantRole,
} from "@shared/proposals";

const TABS = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "awaiting", label: "Awaiting" },
  { key: "negotiating", label: "Negotiating" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
];

type ActionDialogState = {
  open: boolean;
  action: ProposalAction | null;
  note: string;
};

type ReportDialogState = {
  open: boolean;
  reason: string;
  details: string;
};

function resolveRole(
  proposal: ProposalDetail | ProposalListItem,
  userId: string,
): ProposalParticipantRole {
  return proposal.proposerId === userId ? "proposer" : "recipient";
}

function statusLabel(
  proposal: ProposalListItem | ProposalDetail,
  userId: string,
): { label: string; tone: string } {
  const role = resolveRole(proposal, userId);
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
        tone: "bg-red-100 text-red-700 border border-red-200",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        tone: "bg-gray-100 text-gray-600 border border-gray-200",
      };
    case "expired":
      return {
        label: "Expired",
        tone: "bg-gray-100 text-gray-600 border border-gray-200",
      };
    default:
      return {
        label: "Pending",
        tone: "bg-slate-100 text-slate-700 border border-slate-200",
      };
  }
}

function matchesTab(
  proposal: ProposalListItem,
  userId: string,
  tab: string,
): boolean {
  switch (tab) {
    case "sent":
      return proposal.proposerId === userId;
    case "received":
      return proposal.recipientId === userId;
    case "awaiting":
      return (
        proposal.status === "awaiting_recipient" ||
        proposal.awaitingParty === "recipient" ||
        proposal.awaitingParty === "proposer"
      );
    case "negotiating":
      return proposal.status === "under_negotiation";
    case "accepted":
      return proposal.status === "accepted";
    case "declined":
      return proposal.status === "declined" || proposal.status === "cancelled";
    default:
      return true;
  }
}

function formatTimestamp(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return timestamp;
  }
}

export default function Proposals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { openModal } = useCreateProposalModal();

  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null,
  );
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalDetail | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [messageDraft, setMessageDraft] = useState("");
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    action: null,
    note: "",
  });
  const [reportDialog, setReportDialog] = useState<ReportDialogState>({
    open: false,
    reason: "",
    details: "",
  });
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const userId = user?.id ?? null;
  const businessName =
    user?.businessName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`;

  const refreshList = useCallback(async () => {
    if (!userId) return;
    setIsListLoading(true);
    try {
      const data = await ProposalService.list(userId);
      setProposals(data);
      if (data.length && !selectedProposalId) {
        setSelectedProposalId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch proposals", error);
      toast({
        variant: "destructive",
        title: "Unable to load proposals",
        description: "Please try again shortly.",
      });
    } finally {
      setIsListLoading(false);
    }
  }, [toast, userId, selectedProposalId]);

  const refreshDetail = useCallback(async () => {
    if (!userId || !selectedProposalId) {
      setSelectedProposal(null);
      return;
    }
    setIsDetailLoading(true);
    try {
      const detail = await ProposalService.get(userId, selectedProposalId);
      setSelectedProposal(detail);
    } catch (error) {
      console.error("Failed to fetch proposal detail", error);
      toast({
        variant: "destructive",
        title: "Unable to load proposal",
        description: "Please try again soon.",
      });
    } finally {
      setIsDetailLoading(false);
    }
  }, [toast, userId, selectedProposalId]);

  useEffect(() => {
    if (!userId) return;
    void refreshList();
    const unsubscribe = ProposalService.subscribe(() => {
      void refreshList();
    });
    return () => {
      unsubscribe();
    };
  }, [refreshList, userId]);

  useEffect(() => {
    if (!userId || !selectedProposalId) {
      setSelectedProposal(null);
      return;
    }
    void refreshDetail();
  }, [refreshDetail, selectedProposalId, userId]);

  const filteredProposals = useMemo(() => {
    if (!userId) return [];
    const lowered = searchTerm.trim().toLowerCase();
    return proposals.filter((proposal) => {
      if (!matchesTab(proposal, userId, activeTab)) {
        return false;
      }
      if (!lowered) return true;
      return (
        proposal.title.toLowerCase().includes(lowered) ||
        proposal.partnerName.toLowerCase().includes(lowered)
      );
    });
  }, [proposals, searchTerm, activeTab, userId]);

  const handleSelectProposal = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    setMessageDraft("");
  };

  const handleAction = async (action: ProposalAction, note?: string) => {
    if (!userId || !selectedProposalId) return;
    setActionDialog({ action: null, note: "", open: false });
    try {
      await ProposalService.act(
        userId,
        selectedProposalId,
        businessName,
        action,
        note,
      );
      await refreshList();
      await refreshDetail();
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
    }
  };

  const handleSendMessage = async () => {
    if (!userId || !selectedProposalId || !messageDraft.trim()) return;
    setIsMessageSending(true);
    try {
      await ProposalService.sendMessage(userId, selectedProposalId, {
        senderName: businessName,
        content: messageDraft.trim(),
      });
      setMessageDraft("");
      await refreshDetail();
    } catch (error) {
      console.error("Failed to send message", error);
      toast({
        variant: "destructive",
        title: "Message not sent",
        description: "Try again in a moment.",
      });
    } finally {
      setIsMessageSending(false);
    }
  };

  const handleReport = async () => {
    if (!userId || !selectedProposalId || !reportDialog.reason.trim()) {
      return;
    }
    try {
      await ProposalService.report(userId, selectedProposalId, {
        reason: reportDialog.reason.trim(),
        details: reportDialog.details.trim(),
        actorName: businessName,
      });
      toast({
        title: "Report submitted",
        description: "Our team will review this proposal.",
      });
      setReportDialog({ open: false, reason: "", details: "" });
    } catch (error) {
      console.error("Failed to report proposal", error);
      toast({
        variant: "destructive",
        title: "Unable to submit report",
        description: "Please try again soon.",
      });
    }
  };

  const handleBlock = async () => {
    if (!userId || !selectedProposalId) return;
    try {
      await ProposalService.block(userId, selectedProposalId);
      toast({
        title: "Business blocked",
        description: "They will no longer be able to contact you.",
      });
      setIsBlockDialogOpen(false);
      await refreshList();
      await refreshDetail();
    } catch (error) {
      console.error("Failed to block business", error);
      toast({
        variant: "destructive",
        title: "Unable to block",
        description: "Please try again.",
      });
    }
  };

  const openNegotiation = () => {
    if (!selectedProposal) return;
    openModal({ mode: "negotiate", proposal: selectedProposal, startStep: 0 });
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sign in to view proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Your proposals will appear here once you create an account and
              start collaborating.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const awaitingLabel = selectedProposal
    ? statusLabel(selectedProposal, userId).label
    : null;
  const role = selectedProposal
    ? resolveRole(selectedProposal, userId)
    : "proposer";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Proposals</h1>
          <p className="text-sm text-gray-600">
            Track, review, and negotiate your partnership opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => void refreshList()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => openModal({ mode: "create" })}>
            New proposal
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <Card className="h-[75vh]">
          <CardHeader className="space-y-4">
            <CardTitle className="text-lg">Your proposals</CardTitle>
            <Input
              placeholder="Search by title or partner"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </CardHeader>
          <CardContent className="h-full">
            {isListLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Loading proposals...
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                <p className="text-sm">No proposals found for this filter.</p>
              </div>
            ) : (
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {filteredProposals.map((proposal) => {
                    const { label, tone } = statusLabel(proposal, userId);
                    const isSelected = proposal.id === selectedProposalId;
                    return (
                      <button
                        key={proposal.id}
                        onClick={() => handleSelectProposal(proposal.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-[#0f172a] bg-[#0f172a]/5"
                            : "border-gray-200 hover:border-[#0f172a]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {proposal.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {proposal.partnerName}
                            </p>
                          </div>
                          <Badge className={tone}>{label}</Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {proposal.summary}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Updated {formatTimestamp(proposal.updatedAt)}
                          </span>
                          {proposal.unreadForRecipient &&
                          resolveRole(proposal, userId) === "recipient" ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              New activity
                            </span>
                          ) : proposal.unreadForProposer &&
                            resolveRole(proposal, userId) === "proposer" ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              New activity
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="h-[75vh]">
          {isDetailLoading ? (
            <CardContent className="flex h-full items-center justify-center text-sm text-gray-500">
              Loading proposal...
            </CardContent>
          ) : !selectedProposal ? (
            <CardContent className="flex h-full items-center justify-center text-sm text-gray-500">
              Select a proposal to view the details.
            </CardContent>
          ) : (
            <CardContent className="flex h-full flex-col gap-4 overflow-hidden">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {selectedProposal.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {role === "proposer"
                        ? `Sent to ${selectedProposal.recipientName}`
                        : `Received from ${selectedProposal.proposerName}`}
                    </p>
                  </div>
                  <Badge className={statusLabel(selectedProposal, userId).tone}>
                    {awaitingLabel}
                  </Badge>
                </div>
                {selectedProposal.awaitingParty === role && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Your response is required on this proposal.
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
                <div className="space-y-6 text-sm text-gray-700">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Overview
                    </h3>
                    <p className="mt-2 leading-relaxed">
                      {selectedProposal.content.outline.summary}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Contributions
                    </h3>
                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          {selectedProposal.proposerName}
                        </p>
                        <p className="mt-1 text-sm">
                          {
                            selectedProposal.content.contributions
                              .proposerContribution
                          }
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          {selectedProposal.recipientName}
                        </p>
                        <p className="mt-1 text-sm">
                          {
                            selectedProposal.content.contributions
                              .recipientContribution
                          }
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Objectives & Outcomes
                    </h3>
                    <p className="mt-2">
                      {selectedProposal.content.objectives.overview}
                    </p>
                    <div className="mt-3 space-y-2">
                      {selectedProposal.content.objectives.rows.map((row) => (
                        <div
                          key={row.id}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <p className="text-xs font-semibold text-gray-500">
                            {selectedProposal.proposerName}
                          </p>
                          <p className="text-sm text-gray-700">
                            {row.proposerOutcome}
                          </p>
                          <div className="mt-2 h-px bg-gray-100" />
                          <p className="text-xs font-semibold text-gray-500">
                            {selectedProposal.recipientName}
                          </p>
                          <p className="text-sm text-gray-700">
                            {row.recipientOutcome}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Terms & Details
                    </h3>
                    <div className="mt-2 grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Start date
                        </p>
                        <p className="text-sm">
                          {selectedProposal.content.terms.startDate}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Review cadence
                        </p>
                        <p className="text-sm">
                          {`${selectedProposal.content.terms.reviewFrequencyValue} ${selectedProposal.content.terms.reviewFrequencyUnit}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Duration
                        </p>
                        <p className="text-sm">
                          {selectedProposal.content.terms.ongoing
                            ? "Ongoing"
                            : `${selectedProposal.content.terms.durationValue} ${selectedProposal.content.terms.durationUnit}`}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">
                          Termination options
                        </p>
                        <p className="text-sm capitalize">
                          {selectedProposal.content.terms.terminationOptions.join(
                            ", ",
                          )}
                        </p>
                      </div>
                    </div>
                    {selectedProposal.content.terms.additionalTerms && (
                      <p className="mt-2 text-sm text-gray-700">
                        {selectedProposal.content.terms.additionalTerms}
                      </p>
                    )}
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      KPIs to track
                    </h3>
                    <div className="mt-2 space-y-2">
                      {selectedProposal.content.tracking.kpis.map((kpi) => (
                        <div
                          key={kpi.id}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <p className="font-medium text-gray-900">
                            {kpi.name}
                          </p>
                          <div className="mt-2 grid gap-2 text-xs text-gray-600 md:grid-cols-3">
                            <span>
                              Target: {kpi.targetValue}
                              {kpi.currency ? ` ${kpi.currency}` : ""}
                            </span>
                            <span>Unit: {kpi.measurementUnit}</span>
                            <span>
                              Report every {kpi.reportFrequencyValue}{" "}
                              {kpi.reportFrequencyUnit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {selectedProposal.content.additionalNotes.trim() && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Additional notes
                      </h3>
                      <p className="mt-2 text-sm">
                        {selectedProposal.content.additionalNotes}
                      </p>
                    </section>
                  )}
                </div>
              </ScrollArea>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {role === "recipient" &&
                    (selectedProposal.status === "awaiting_recipient" ||
                      selectedProposal.status === "under_negotiation") && (
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
                    selectedProposal.status === "under_negotiation" &&
                    selectedProposal.awaitingParty === "proposer" && (
                      <Button variant="secondary" onClick={openNegotiation}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Respond
                      </Button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setReportDialog({ open: true, reason: "", details: "" })
                    }
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" /> Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsBlockDialogOpen(true)}
                  >
                    <Slash className="mr-2 h-4 w-4" /> Block
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Conversation
                  </h3>
                  <span className="text-xs text-gray-500">
                    {selectedProposal.messages.length} messages
                  </span>
                </div>
                <ScrollArea className="h-48 rounded border border-gray-100 bg-gray-50 p-3">
                  <div className="space-y-3">
                    {selectedProposal.messages.map(
                      (message: ProposalMessage) => {
                        const messageRole = message.senderRole;
                        const isMine =
                          (messageRole === "proposer" && role === "proposer") ||
                          (messageRole === "recipient" && role === "recipient");
                        return (
                          <div
                            key={message.id}
                            className={`flex flex-col rounded-lg p-3 text-sm ${
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
                                {formatTimestamp(message.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                </ScrollArea>
                <div className="mt-3 flex gap-2">
                  <Textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Type a message"
                    className="min-h-[60px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageDraft.trim() || isMessageSending}
                  >
                    {isMessageSending ? "Sending..." : "Message"}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

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
            <DialogDescription>
              Add an optional note to share with your partner.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={actionDialog.note}
            onChange={(event) =>
              setActionDialog((prev) => ({
                ...prev,
                note: event.target.value,
              }))
            }
            rows={4}
            placeholder="Let them know why you're making this decision (optional)."
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

      <Dialog
        open={reportDialog.open}
        onOpenChange={(open) =>
          setReportDialog((prev) => ({
            ...prev,
            open,
            ...(open ? prev : { reason: "", details: "" }),
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report proposal</DialogTitle>
            <DialogDescription>
              Provide details about why this proposal is inappropriate or
              violates guidelines.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason"
            value={reportDialog.reason}
            onChange={(event) =>
              setReportDialog((prev) => ({
                ...prev,
                reason: event.target.value,
              }))
            }
            rows={2}
            className="mb-3"
          />
          <Textarea
            placeholder="Additional details (optional)"
            value={reportDialog.details}
            onChange={(event) =>
              setReportDialog((prev) => ({
                ...prev,
                details: event.target.value,
              }))
            }
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setReportDialog({ open: false, reason: "", details: "" })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              disabled={!reportDialog.reason.trim()}
            >
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block this business?</AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer be able to message you or send proposals.
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
