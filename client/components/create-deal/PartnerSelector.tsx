import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { BusinessProfile, BusinessService } from "@/services/businessService";
import { useAuth } from "@/contexts/AuthContext";

interface PartnerSelectorProps {
  selected: BusinessProfile | { id: string; name: string; email?: string } | null;
  onSelect: (partner: BusinessProfile | { id: string; name: string; email?: string }) => void;
}

export default function PartnerSelector({ selected, onSelect }: PartnerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const { user } = useAuth();

  const businesses = useMemo(() => {
    const all = BusinessService.getBusinesses({ excludeDemo: true });
    const myId = user ? `biz_${user.id}` : null;
    return myId ? all.filter((b) => b.id !== myId) : all;
  }, [user]);

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inviteExternal = () => {
    if (!inviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) return;
    const name = inviteEmail.split("@")[0].replace(/[._-]/g, " ");
    onSelect({ id: `external:${inviteEmail}`, name, email: inviteEmail });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="partner-search">Search for a business partner</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input id="partner-search" placeholder="Search by name, industry, or city..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
        {filtered.map((business) => (
          <Card
            key={business.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selected && (selected as any).id === business.id ? "ring-2 ring-blue-500 border-blue-200" : "hover:border-gray-300"}`}
            onClick={() => onSelect(business)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">{business.logo}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{business.name}</h4>
                  <p className="text-sm text-gray-600">{business.industry}</p>
                  <p className="text-sm text-gray-500 mt-1">{business.address.city}</p>
                  {business.verified && (
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 text-xs">Verified</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Invite external partner</Label>
        <div className="flex gap-2">
          <Input type="email" placeholder="partner@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <Button type="button" onClick={inviteExternal}>Invite</Button>
        </div>
        <p className="text-xs text-gray-500">We'll email your partner a secure link to view and respond.</p>
      </div>
    </div>
  );
}
