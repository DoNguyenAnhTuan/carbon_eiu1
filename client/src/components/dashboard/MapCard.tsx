import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Site } from "@shared/schema";
import { initializeMap, addSiteMarkers } from "@/lib/mapUtils";
import L from "leaflet";

const MapCard = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  // Initialize map when component mounts
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = initializeMap(mapRef.current);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Add markers when sites data is loaded
  useEffect(() => {
    if (sites && leafletMapRef.current) {
      addSiteMarkers(leafletMapRef.current, sites);
      
      // If we have sites, fit map to all markers
      if (sites.length > 0) {
        const bounds = sites.reduce(
          (acc, site) => {
            acc.extend([site.latitude, site.longitude]);
            return acc;
          }, 
          L.latLngBounds([sites[0].latitude, sites[0].longitude], [sites[0].latitude, sites[0].longitude])
        );
        
        leafletMapRef.current.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [sites]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800">SITE LOCATIONS</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-[300px] w-full" id="map-container">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          ) : (
            <div ref={mapRef} className="h-full w-full"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MapCard;
