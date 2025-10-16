import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Users,
  Star,
  MessageSquare,
  Handshake,
  Filter,
  Grid,
  Map,
  Clock,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  Verified,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  BusinessService,
  BusinessProfile,
  FilterOptions,
} from "@/services/businessService";
import { useAuth } from "@/contexts/AuthContext";
import InteractiveMap from "@/components/InteractiveMap";
import { BlockService } from "@/services/blockService";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";

export default function Discovery() {
  const [view, setView] = useState<"grid" | "map">("grid");
  const { openModal } = useCreateProposalModal();
  const navigate = useNavigate();
  const [selectedMapBusiness, setSelectedMapBusiness] =
    useState<BusinessProfile | null>(null);
  const [activeTab, setActiveTab] = useState("browse");

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    excludeDemo: true, // Always exclude demo accounts by default
    sortBy: "relevance",
  });

  // Subscribe to business store updates to reflect new registrations live
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const unsub = BusinessService.subscribe(() => setVersion((v) => v + 1));
    return unsub;
  }, []);

  const { user } = useAuth();

  useEffect(() => {
    BusinessService.ensureLoaded();
  }, []);

  // Get data using the service
  const businesses = useMemo(
    () => BusinessService.getBusinesses(filters),
    [filters, version],
  );
  const myBusinessId = user ? `biz_${user.id}` : null;
  const listedBusinesses = useMemo(() => {
    const base = myBusinessId
      ? businesses.filter((b) => b.id !== myBusinessId)
      : businesses;
    if (!myBusinessId) return base;
    return base.filter((b) => !BlockService.isBlocked(myBusinessId, b.id));
  }, [businesses, myBusinessId]);
  const [openReqVersion, setOpenReqVersion] = useState(0);
  useEffect(() => {
    const unsub = BusinessService.subscribeOpenRequests(() =>
      setOpenReqVersion((v) => v + 1),
    );
    return unsub;
  }, []);
  const openRequests = useMemo(
    () => BusinessService.getOpenRequests(filters),
    [filters, openReqVersion],
  );

  // Filter options from the service
  const industries = useMemo(() => BusinessService.getIndustries(), [version]);
  const cities = useMemo(() => BusinessService.getCities(), [version]);
  const states = useMemo(() => BusinessService.getStates(), [version]);
  const countries = useMemo(() => BusinessService.getCountries(), [version]);
  const companySizes = useMemo(() => BusinessService.getCompanySizes(), []);
  const partnershipTypes = useMemo(
    () => BusinessService.getPartnershipTypes(),
    [version],
  );

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      excludeDemo: true,
      sortBy: "relevance",
    });
  };

  const handleCardNavigation = (businessId: string) => {
    navigate(`/business/${businessId}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discovery</h1>
          <p className="text-gray-600">
            {listedBusinesses.length > 0 ? (
              <>
                Find and connect with {listedBusinesses.length} verified
                business partners
              </>
            ) : (
              <>No businesses to display yet.</>
            )}
          </p>
        </div>
        <Button onClick={() => openModal()}>Create Proposal</Button>
      </div>

      {/* Search and Quick Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search businesses, industries, or services..."
                className="pl-10"
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.industry?.[0]}
                onValueChange={(value) =>
                  updateFilter("industry", value === "_all" ? [] : [value])
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.city}
                onValueChange={(value) =>
                  updateFilter("city", value === "_all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any City</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.companySize?.[0]}
                onValueChange={(value) =>
                  updateFilter("companySize", value === "_all" ? [] : [value])
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Any Size</SelectItem>
                  <SelectItem value="small">Small (1-25)</SelectItem>
                  <SelectItem value="medium">Medium (25-100)</SelectItem>
                  <SelectItem value="large">Large (100+)</SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Filters Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search with detailed filtering options
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    {/* Location Filters */}
                    <div>
                      <h4 className="font-medium mb-3">Location</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Select
                            value={filters.country}
                            onValueChange={(value) =>
                              updateFilter(
                                "country",
                                value === "_all" ? undefined : value,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_all">Any Country</SelectItem>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="state">State/Region</Label>
                          <Select
                            value={filters.state}
                            onValueChange={(value) =>
                              updateFilter(
                                "state",
                                value === "_all" ? undefined : value,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_all">Any State</SelectItem>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="postcode">Postcode</Label>
                          <Input
                            id="postcode"
                            placeholder="Enter postcode"
                            value={filters.postcode || ""}
                            onChange={(e) =>
                              updateFilter("postcode", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Business Criteria */}
                    <div>
                      <h4 className="font-medium mb-3">Business Criteria</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="verified"
                            checked={filters.verified || false}
                            onCheckedChange={(checked) =>
                              updateFilter(
                                "verified",
                                checked ? true : undefined,
                              )
                            }
                          />
                          <Label htmlFor="verified">
                            Verified businesses only
                          </Label>
                        </div>

                        <div>
                          <Label>Minimum Rating</Label>
                          <Select
                            value={
                              filters.rating
                                ? String(filters.rating)
                                : undefined
                            }
                            onValueChange={(value) =>
                              updateFilter(
                                "rating",
                                value === "_all"
                                  ? undefined
                                  : parseFloat(value),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any rating" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="_all">Any Rating</SelectItem>
                              <SelectItem value="4.5">4.5+ Stars</SelectItem>
                              <SelectItem value="4.0">4.0+ Stars</SelectItem>
                              <SelectItem value="3.5">3.5+ Stars</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Partnership Types */}
                    <div>
                      <h4 className="font-medium mb-3">Partnership Types</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {partnershipTypes.map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`partnership-${type}`}
                              checked={
                                filters.partnershipTypes?.includes(type) ||
                                false
                              }
                              onCheckedChange={(checked) => {
                                const current = filters.partnershipTypes || [];
                                const updated = checked
                                  ? [...current, type]
                                  : current.filter((t) => t !== type);
                                updateFilter(
                                  "partnershipTypes",
                                  updated.length > 0 ? updated : undefined,
                                );
                              }}
                            />
                            <Label
                              htmlFor={`partnership-${type}`}
                              className="text-sm"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Sorting */}
                    <div>
                      <h4 className="font-medium mb-3">Sort By</h4>
                      <Select
                        value={filters.sortBy || "relevance"}
                        onValueChange={(value) =>
                          updateFilter(
                            "sortBy",
                            value as FilterOptions["sortBy"],
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="company_size">
                            Company Size
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Browse vs Open Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="browse">
              Browse Partners ({listedBusinesses.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Open Requests ({openRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* View Toggle (only for Browse tab) */}
          {activeTab === "browse" && (
            <div className="flex items-center gap-2">
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={view === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("map")}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="browse" className="mt-6">
          {listedBusinesses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No businesses to display yet
                </h3>
                <p className="text-gray-600">
                  When new businesses register, they will appear here.
                </p>
              </CardContent>
            </Card>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listedBusinesses.map((business) => (
                <Card
                  key={business.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCardNavigation(business.id)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " " ||
                      event.key === "Space"
                    ) {
                      event.preventDefault();
                      handleCardNavigation(business.id);
                    }
                  }}
                  className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                            {business.logo}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg text-left">
                            <button
                              type="button"
                              className="w-full bg-transparent p-0 text-left font-semibold text-current transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:underline"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCardNavigation(business.id);
                              }}
                            >
                              {business.name}
                            </button>
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {business.industry}
                          </p>
                        </div>
                      </div>
                      {business.verified && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Verified className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {business.address.city}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {business.employees}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {business.reviewCount && business.reviewCount > 0 ? (
                          <>
                            {Number.isFinite(business.rating)
                              ? business.rating.toFixed(1)
                              : "0.0"}
                          </>
                        ) : (
                          <>0.0 ★ rating</>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-4 line-clamp-3">
                      {business.description}
                    </CardDescription>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {business.tags.slice(0, 3).map((tag, i) => (
                        <Badge
                          key={`${business.id}-tag-${i}-${tag}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {business.responseTime}
                        </p>
                        <p className="text-xs text-gray-500">Response time</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {business.reviewCount}
                        </p>
                        <p className="text-xs text-gray-500">Reviews</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          openModal({ partnerId: business.id });
                        }}
                      >
                        <Handshake className="h-4 w-4 mr-2" /> Propose
                        Partnership
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/messages?to=${business.id}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={`/business/${business.id}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <InteractiveMap
              businesses={listedBusinesses}
              filters={filters}
              onFiltersChange={setFilters}
              selectedBusiness={selectedMapBusiness}
              onBusinessSelect={setSelectedMapBusiness}
            />
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="space-y-4">
            {openRequests.map((request) => (
              <Card
                key={request.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-100 text-purple-600 font-medium">
                          {request.logo}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {request.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          by {request.business}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge className="bg-blue-100 text-blue-700">
                        {request.industry}
                      </Badge>
                      <p className="text-xs text-gray-500">{request.expires}</p>
                      {myBusinessId === request.businessId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            BusinessService.deleteOpenRequest(request.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4">
                    {request.description}
                  </CardDescription>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        {request.value}
                      </p>
                      <p className="text-xs text-gray-500">Estimated Value</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-600">
                        {request.responses}
                      </p>
                      <p className="text-xs text-gray-500">Responses</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-600">
                        {request.posted}
                      </p>
                      <p className="text-xs text-gray-500">Posted</p>
                    </div>
                  </div>

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
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Respond to Request
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/requests/${request.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
