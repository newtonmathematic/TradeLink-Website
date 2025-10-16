import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ProposalDetail } from "@shared/proposals";

type ProposalComposerMode = "create" | "negotiate";

type CreateProposalOpenOptions = {
  partnerId?: string;
  requestId?: string;
  templateId?: string;
  startStep?: number;
  mode?: ProposalComposerMode;
  proposal?: ProposalDetail;
};

type CreateProposalContextValue = {
  isOpen: boolean;
  mode: ProposalComposerMode;
  proposalId: string | null;
  initialProposal: ProposalDetail | null;
  openModal: (options?: CreateProposalOpenOptions) => void;
  closeModal: () => void;
  selectedPartnerId: string | null;
  setSelectedPartnerId: (id: string | null) => void;
  options: CreateProposalOpenOptions | null;
};

const CreateProposalContext = createContext<
  CreateProposalContextValue | undefined
>(undefined);

export function CreateProposalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [options, setOptions] = useState<CreateProposalOpenOptions | null>(
    null,
  );
  const [mode, setMode] = useState<ProposalComposerMode>("create");
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [initialProposal, setInitialProposal] = useState<ProposalDetail | null>(
    null,
  );

  const openModal = useCallback((openOptions?: CreateProposalOpenOptions) => {
    setOptions(openOptions ?? null);
    setSelectedPartnerId(openOptions?.partnerId ?? null);
    setMode(openOptions?.mode ?? "create");
    setProposalId(openOptions?.proposal?.id ?? null);
    setInitialProposal(openOptions?.proposal ?? null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMode("create");
    setProposalId(null);
    setInitialProposal(null);
    setOptions(null);
    setSelectedPartnerId(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      proposalId,
      initialProposal,
      openModal,
      closeModal,
      selectedPartnerId,
      setSelectedPartnerId,
      options,
    }),
    [
      isOpen,
      mode,
      proposalId,
      initialProposal,
      openModal,
      closeModal,
      selectedPartnerId,
      options,
    ],
  );

  return (
    <CreateProposalContext.Provider value={value}>
      {children}
    </CreateProposalContext.Provider>
  );
}

export function useCreateProposalModal() {
  const ctx = useContext(CreateProposalContext);
  if (!ctx) {
    throw new Error(
      "useCreateProposalModal must be used within a CreateProposalProvider",
    );
  }
  return ctx;
}
