import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BlockService } from "@/services/blockService";

interface Props { targetBusinessId: string; }

export default function BlockBusinessButton({ targetBusinessId }: Props) {
  const { user } = useAuth();
  const myBusinessId = useMemo(()=> user ? `biz_${user.id}` : "", [user]);
  const [isBlocked, setIsBlocked] = useState(()=> myBusinessId ? BlockService.isBlocked(myBusinessId, targetBusinessId) : false);

  if (!myBusinessId || myBusinessId === targetBusinessId) return null;

  const toggle = () => {
    if (!isBlocked) BlockService.block(myBusinessId, targetBusinessId); else BlockService.unblock(myBusinessId, targetBusinessId);
    setIsBlocked(!isBlocked);
  };

  return (
    <Button variant={isBlocked ? "destructive" : "outline"} size="lg" onClick={toggle}>
      {isBlocked ? "Unblock" : "Block"}
    </Button>
  );
}
