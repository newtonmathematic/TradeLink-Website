import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  ArrowLeft,
  Trash2,
  Building2,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";
import { BusinessService, OpenRequest } from "@/services/businessService";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";

export default function OpenRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useCreateProposalModal();
  const myBusinessId = user ? `biz_${user.id}` : null;

  const [version, setVersion] = useState(0);
  useEffect(() => {
    const unsub = BusinessService.subscribeOpenRequests(() =>
      setVersion((v) => v + 1),
    );
    return unsub;
  }, []);

  const request: OpenRequest | null = useMemo(
    () => (id ? BusinessService.getOpenRequestById(id) : null),
    [id, version],
  );

  if (!request) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Request not found</CardTitle>
            <CardDescription>
              The request may have been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/discovery">Back to Discovery</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="-ml-2 w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                  {request.logo}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{request.title}</CardTitle>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <Link
                    to={`/business/${request.businessId}`}
                    className="hover:underline"
                  >
                    {request.business}
                  </Link>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-700">
                {request.industry}
              </Badge>
              <div className="text-xs text-gray-500 mt-1">
                {request.type === "open" ? "Open" : "Targeted"}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <CardDescription className="text-base text-gray-800">
              {request.description}
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <DollarSign className="h-4 w-4" />
                Estimated Value
              </div>
              <div className="text-lg font-semibold text-green-600">
                {request.value}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {request.posted}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Closes In
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {request.expires}
              </div>
            </div>
          </div>

          {request.requirements && request.requirements.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Requirements</div>
              <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                {request.requirements.map((req, i) => (
                  <li key={`${request.id}-req-${i}`}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() =>
                openModal({
                  partnerId: request.businessId,
                  requestId: request.id,
                })
              }
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Respond to Request
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/business/${request.businessId}`}>View Business</Link>
            </Button>
            {myBusinessId === request.businessId && (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  BusinessService.deleteOpenRequest(request.id);
                  navigate("/discovery");
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
