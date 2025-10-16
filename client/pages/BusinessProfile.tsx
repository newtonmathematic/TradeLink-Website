import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Users,
  Star,
  MessageSquare,
  Handshake,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  Clock,
  Verified,
  ArrowLeft,
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Building,
  DollarSign,
  Target,
  Sparkles,
  Map,
  Pencil,
  Share2,
  X,
} from "lucide-react";
import { Youtube, Music2, Fingerprint } from "lucide-react";
import { BusinessService } from "@/services/businessService";
import type { BusinessProfile } from "@/services/businessService";
import BlockBusinessButton from "@/components/messages/BlockBusinessButton";
import { BlockService } from "@/services/blockService";

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { openModal } = useCreateProposalModal();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwner = !!(user && id === `biz_${user.id}`);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<{
    name: string;
    industry: string;
    description: string;
    email: string;
    phone: string;
    website?: string;
    tags: string[];
    partnershipTypes: string[];
    seekingTypes: string[];
    address: BusinessProfile["address"];
    socialMedia?: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      let businessData = BusinessService.getBusinessById(id);
      if (!businessData) {
        await BusinessService.refreshFromApi();
        businessData = BusinessService.getBusinessById(id);
      }
      setBusiness(businessData);
      if (businessData) {
        setForm({
          name: businessData.name,
          industry: businessData.industry,
          description: businessData.description,
          email: businessData.email,
          phone: businessData.phone,
          website: businessData.website,
          tags: [...(businessData.tags || [])],
          partnershipTypes: [...(businessData.partnershipTypes || [])],
          seekingTypes: [...(businessData.seekingTypes || [])],
          address: { ...businessData.address },
          socialMedia: { ...(businessData.socialMedia || {}) },
        });
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const myBusinessId = user ? `biz_${user.id}` : "";
  if (
    !business ||
    (myBusinessId &&
      business &&
      BlockService.isBlocked(myBusinessId, business.id) &&
      !isOwner)
  ) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Business Not Accessible
        </h1>
        <p className="text-gray-600 mb-6">This business is not available.</p>
        <Button asChild>
          <Link to="/discovery">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discovery
          </Link>
        </Button>
      </div>
    );
  }

  const aiOverview = BusinessService.generateAIOverview(business);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/discovery">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discovery
          </Link>
        </Button>
      </div>

      {/* Business Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-2xl">
                    {business.logo}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {business.name}
                    </h1>
                    {business.verified && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Verified className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{business.industry}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {business.address.city}, {business.address.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{business.employees} employees</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{business.rating}</span>
                      <span className="text-gray-500">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-gray-600">
                        {business.responseTime} response time
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    {business.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {business.tags.map((tag, i) => (
                      <Badge
                        key={`${business.id}-tag-${i}-${tag}`}
                        variant="secondary"
                        className="text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {!isOwner ? (
                  <>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={() => openModal({ partnerId: business.id })}
                    >
                      <Handshake className="h-5 w-5 mr-2" />
                      Propose Partnership
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to={`/messages?to=${business.id}`}>
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Send Message
                      </Link>
                    </Button>
                    <BlockBusinessButton targetBusinessId={business.id} />
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={() => setEditOpen(true)}
                    >
                      <Pencil className="h-5 w-5 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/business/${business.id}`,
                          );
                          toast({ title: "Profile link copied" });
                        } catch {
                          toast({
                            title: "Copy failed",
                            description:
                              "Select and copy the URL from your browser.",
                          });
                        }
                      }}
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share Profile
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {business.foundedYear}
                      </div>
                      <div className="text-xs text-gray-600">Founded</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {business.companySize.charAt(0).toUpperCase() +
                          business.companySize.slice(1)}
                      </div>
                      <div className="text-xs text-gray-600">Size</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${business.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${business.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                    {business.website && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Fingerprint className="h-4 w-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {business.id}
                        </code>
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(business.id);
                              toast({ title: "Business ID copied" });
                            } catch {}
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {business.socialMedia &&
                    Object.keys(business.socialMedia).length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Social Media</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(business.socialMedia).map(
                              ([platform, url]) => {
                                if (!url) return null;
                                const normalized = /^(https?:)?\/\//i.test(url)
                                  ? url
                                  : `https://${url}`;
                                const Icon = (() => {
                                  const key = platform.toLowerCase();
                                  if (key.includes("instagram"))
                                    return Instagram;
                                  if (key.includes("facebook")) return Facebook;
                                  if (key.includes("linkedin")) return Linkedin;
                                  if (
                                    key.includes("twitter") ||
                                    key.includes("x")
                                  )
                                    return Twitter;
                                  if (key.includes("youtube")) return Youtube;
                                  if (key.includes("tiktok")) return Music2;
                                  return Globe;
                                })();
                                return (
                                  <Button
                                    key={platform}
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    aria-label={platform}
                                    title={platform}
                                  >
                                    <a
                                      href={normalized}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Icon className="h-4 w-4" />
                                    </a>
                                  </Button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* AI-Generated Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Business Overview
              </CardTitle>
              <CardDescription>
                AI-generated insights about this business and partnership
                potential
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">{aiOverview}</p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Partnership Match Criteria</h4>
                <div className="flex flex-wrap gap-2">
                  {business.matchCriteria.map((criteria) => (
                    <Badge
                      key={criteria}
                      className="bg-purple-100 text-purple-700 border-purple-200"
                    >
                      {criteria}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>What We Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {business.partnershipTypes.map((type) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 flex-1">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What We're Seeking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {business.seekingTypes.map((type) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 flex-1">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Company Size
                  </h4>
                  <p className="text-gray-600">
                    {business.employees} employees
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {business.companySize.charAt(0).toUpperCase() +
                      business.companySize.slice(1)}{" "}
                    business
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Industry Focus
                  </h4>
                  <p className="text-gray-600">{business.industry}</p>
                  <p className="text-sm text-gray-500 mt-1">Primary sector</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Member Since
                  </h4>
                  <p className="text-gray-600">
                    {new Date(business.registrationDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last active:{" "}
                    {new Date(business.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Location
              </CardTitle>
              <CardDescription>
                Address details and map integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Address</h4>
                  <div className="space-y-2 text-gray-600">
                    <p>{business.address.street}</p>
                    <p>
                      {business.address.city}, {business.address.state}{" "}
                      {business.address.postcode}
                    </p>
                    <p>{business.address.country}</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Coordinates</h4>
                    <div className="text-sm text-gray-600">
                      <p>Latitude: {business.address.coordinates.lat}</p>
                      <p>Longitude: {business.address.coordinates.lng}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        Interactive Map
                      </h4>
                      <p className="text-sm text-gray-600 max-w-xs">
                        Integrated map showing exact business location would be
                        displayed here using Google Maps or similar service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews & Ratings</CardTitle>
              <CardDescription>
                Feedback from partnership collaborations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {business.rating}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(business.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {business.reviewCount} reviews
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm w-8">{stars}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 8 : 2}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 w-8">
                            {stars === 5
                              ? "70%"
                              : stars === 4
                                ? "20%"
                                : stars === 3
                                  ? "8%"
                                  : "2%"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Reviews</h4>
                  <div className="space-y-4">
                    {/* Mock reviews */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          2 weeks ago
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        "Excellent partnership experience. Very professional and
                        responsive team. The collaboration exceeded our
                        expectations and brought real value to both businesses."
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        - TechCorp Solutions
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-yellow-400 fill-current"
                            />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                        <span className="text-sm text-gray-500">
                          1 month ago
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">
                        "Great communication and follow-through. The partnership
                        has been mutually beneficial and we're looking forward
                        to expanding our collaboration."
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        - Urban Marketing Group
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Sheet */}
      {isOwner && form && (
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
              <SheetDescription>
                Update what appears on your public profile.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Business Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input
                  value={form.industry}
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={form.website || ""}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Street</label>
                  <Input
                    value={form.address.street}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, street: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={form.address.city}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, city: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={form.address.state}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, state: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Postcode</label>
                  <Input
                    value={form.address.postcode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, postcode: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    value={form.address.country}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, country: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">What We Offer</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.partnershipTypes.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs flex items-center gap-1"
                    >
                      {t}
                      <button
                        className="text-blue-700"
                        onClick={() =>
                          setForm({
                            ...form,
                            partnershipTypes: form.partnershipTypes.filter(
                              (x, idx) => idx !== i,
                            ),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add an offer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setForm({
                            ...form,
                            partnershipTypes: [...form.partnershipTypes, val],
                          });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const inp = document.activeElement as HTMLInputElement;
                      if (
                        inp &&
                        inp.placeholder === "Add an offer" &&
                        inp.value.trim()
                      ) {
                        setForm({
                          ...form,
                          partnershipTypes: [
                            ...form.partnershipTypes,
                            inp.value.trim(),
                          ],
                        });
                        inp.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  What We're Seeking
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.seekingTypes.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs flex items-center gap-1"
                    >
                      {t}
                      <button
                        className="text-green-700"
                        onClick={() =>
                          setForm({
                            ...form,
                            seekingTypes: form.seekingTypes.filter(
                              (x, idx) => idx !== i,
                            ),
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a need"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setForm({
                            ...form,
                            seekingTypes: [...form.seekingTypes, val],
                          });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const inp = document.activeElement as HTMLInputElement;
                      if (
                        inp &&
                        inp.placeholder === "Add a need" &&
                        inp.value.trim()
                      ) {
                        setForm({
                          ...form,
                          seekingTypes: [
                            ...form.seekingTypes,
                            inp.value.trim(),
                          ],
                        });
                        inp.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Tags (comma separated)
                </label>
                <Input
                  value={form.tags.join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium">Social Media</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {[
                    { key: "instagram", label: "Instagram" },
                    { key: "youtube", label: "YouTube" },
                    { key: "tiktok", label: "TikTok" },
                    { key: "linkedin", label: "LinkedIn" },
                    { key: "facebook", label: "Facebook" },
                    { key: "twitter", label: "Twitter" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      {label === "Instagram" && (
                        <Instagram className="h-4 w-4 text-gray-500" />
                      )}
                      {label === "YouTube" && (
                        <Youtube className="h-4 w-4 text-gray-500" />
                      )}
                      {label === "TikTok" && (
                        <Music2 className="h-4 w-4 text-gray-500" />
                      )}
                      {label === "LinkedIn" && (
                        <Linkedin className="h-4 w-4 text-gray-500" />
                      )}
                      {label === "Facebook" && (
                        <Facebook className="h-4 w-4 text-gray-500" />
                      )}
                      {label === "Twitter" && (
                        <Twitter className="h-4 w-4 text-gray-500" />
                      )}
                      <Input
                        placeholder={`${label} URL`}
                        value={form!.socialMedia?.[key] || ""}
                        onChange={(e) =>
                          setForm({
                            ...form!,
                            socialMedia: {
                              ...(form!.socialMedia || {}),
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                      {form!.socialMedia?.[key] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const { [key]: _omit, ...rest } =
                              form!.socialMedia || {};
                            setForm({ ...form!, socialMedia: rest });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Platform name"
                      value={(form as any)._customPlatform || ""}
                      onChange={(e) =>
                        setForm({
                          ...(form as any),
                          _customPlatform: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Platform URL"
                      value={(form as any)._customUrl || ""}
                      onChange={(e) =>
                        setForm({
                          ...(form as any),
                          _customUrl: e.target.value,
                        })
                      }
                    />
                    <Button
                      onClick={() => {
                        const name = (
                          (form as any)._customPlatform || ""
                        ).trim();
                        const url = ((form as any)._customUrl || "").trim();
                        if (!name || !url) return;
                        setForm({
                          ...(form as any),
                          socialMedia: {
                            ...(form!.socialMedia || {}),
                            [name.toLowerCase()]: url,
                          },
                          _customPlatform: "",
                          _customUrl: "",
                        } as any);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!business || !form) return;
                    const updated: BusinessProfile = {
                      ...business,
                      ...form,
                      tags: form.tags,
                      partnershipTypes: form.partnershipTypes,
                      seekingTypes: form.seekingTypes,
                      name: form.name,
                      industry: form.industry,
                      description: form.description,
                      email: form.email,
                      phone: form.phone,
                      website: form.website,
                      address: form.address,
                      socialMedia: form.socialMedia,
                    };
                    BusinessService.upsertBusiness(updated);
                    setBusiness(updated);
                    setEditOpen(false);
                    toast({ title: "Profile updated" });
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
