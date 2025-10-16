import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Users,
  Star,
  MessageSquare,
  Handshake,
  ExternalLink,
  Search,
  Filter,
  Verified,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCreateProposalModal } from "@/contexts/CreateProposalContext";
import { BusinessProfile, FilterOptions } from "@/services/businessService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for Leaflet with Vite
const DefaultIcon = L.icon({
  iconUrl: new URL(
    "leaflet/dist/images/marker-icon.png",
    import.meta.url,
  ).toString(),
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).toString(),
  shadowUrl: new URL(
    "leaflet/dist/images/marker-shadow.png",
    import.meta.url,
  ).toString(),
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
(L.Marker.prototype as any).options.icon = DefaultIcon;

interface InteractiveMapProps {
  businesses: BusinessProfile[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  selectedBusiness?: BusinessProfile | null;
  onBusinessSelect: (business: BusinessProfile | null) => void;
}

export default function InteractiveMap({
  businesses,
  filters,
  onFiltersChange,
  selectedBusiness,
  onBusinessSelect,
}: InteractiveMapProps) {
  const { openModal } = useCreateProposalModal();
  const center = useMemo(() => {
    if (selectedBusiness)
      return [
        selectedBusiness.address.coordinates.lat,
        selectedBusiness.address.coordinates.lng,
      ] as [number, number];
    if (businesses.length > 0) {
      const lat =
        businesses.reduce((s, b) => s + b.address.coordinates.lat, 0) /
        businesses.length;
      const lng =
        businesses.reduce((s, b) => s + b.address.coordinates.lng, 0) /
        businesses.length;
      return [lat, lng] as [number, number];
    }
    return [-41.2865, 174.7762] as [number, number]; // Default: Wellington
  }, [businesses, selectedBusiness]);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {businesses.length} businesses
          </div>
        </div>

        <div className="relative h-96">
          <MapContainer
            {...({
              center,
              zoom: 12,
              className: "h-full w-full",
              scrollWheelZoom: true,
            } as any)}
          >
            <TileLayer
              {...({
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              } as any)}
            />
            {businesses.map((b) => (
              <Marker
                key={b.id}
                position={[
                  b.address.coordinates.lat,
                  b.address.coordinates.lng,
                ]}
                eventHandlers={{ click: () => onBusinessSelect(b) }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-gray-600">{b.industry}</div>
                    <div className="text-xs text-gray-500">
                      {b.address.city}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {selectedBusiness && (
            <Card className="absolute bottom-4 left-4 right-4 shadow-xl border-2 border-blue-200 z-20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                        {selectedBusiness.logo}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {selectedBusiness.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedBusiness.industry}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{selectedBusiness.address.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{selectedBusiness.employees}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{selectedBusiness.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {selectedBusiness.verified && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Verified className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBusinessSelect(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {selectedBusiness.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      openModal({ partnerId: selectedBusiness.id })
                    }
                  >
                    <Handshake className="h-4 w-4 mr-2" /> Propose Partnership
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/messages?to=${selectedBusiness.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Chat
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/business/${selectedBusiness.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search on map..."
                className="pl-10"
                value={filters.search || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, search: e.target.value })
                }
              />
            </div>
            <Select
              value={filters.city}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  city: value === "_all" ? undefined : value,
                })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Cities</SelectItem>
                {[...new Set(businesses.map((b) => b.address.city))].map(
                  (city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onFiltersChange({ ...filters, verified: !filters.verified })
              }
              className={filters.verified ? "bg-green-50 border-green-200" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />{" "}
              {filters.verified ? "Verified Only" : "All"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
