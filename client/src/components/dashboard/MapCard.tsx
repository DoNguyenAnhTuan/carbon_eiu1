import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaExpand, FaCompress } from "react-icons/fa";
import L from "leaflet";

const MapCard = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Adjusted locations - increased latitude further to move markers higher
  const locations = [
    { 
      latitude: 11.0540552, // Increased latitude more
      longitude: 106.6663097,
      name: "B11"
    },
    { 
      latitude: 11.0544552, // Increased latitude more
      longitude: 106.6660097,
      name: "B8"
    },
    {
      latitude: 11.0523552,
      longitude: 106.6680097,
      name: "B3"
    },
    {
      latitude: 11.0519552,
      longitude: 106.6680097,
      name: "B6"
    },
    {
      latitude: 11.0537552,
      longitude: 106.6655097,
      name: "B10"
    },
    {
      latitude: 11.0536552,
      longitude: 106.6672097,
      name: "B4"
    },
    {
      latitude: 11.0535552,
      longitude: 106.6679097,
      name: "B5"
    },
    {
      latitude: 11.0550552,
      longitude: 106.6670097,
      name: "Canteen"
    },
    {
      latitude: 11.0498552,
      longitude: 106.6678097,
      name: "AMC"
    },
  ];

  useEffect(() => {
    if (mapRef.current) {
      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current).setView(
          [11.0526552, 106.6665097],
          16  // Decreased zoom level from 17 to 16 for an even wider view
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMapRef.current);

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background-color: #0B3D61;
              width: 30px;
              height: 40px;
              position: relative;
              border-radius: 8px 8px 24px 24px;
              display: flex;
              justify-content: center;
              align-items: center;
            ">
              <div style="
                color: white;
                font-size: 16px;
                margin-top: -4px;
              ">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                  <path d="M1 11V3C1 1.9 1.9 1 3 1h8v10H1zm2-8v6h6V3H3zM13 1h8c1.1 0 2 .9 2 2v8H13V1zm2 8h6V3h-6v6zM1 21c0-1.1.9-2 2-2h8v-6h10v6c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2z"/>
                </svg>
              </div>
              <div style="
                width: 10px;
                height: 10px;
                background-color: #4ADE80;
                border-radius: 50%;
                position: absolute;
                top: -2px;
                right: -2px;
                border: 2px solid white;
              "></div>
            </div>
          `,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          popupAnchor: [0, -40]
        });

        // Add markers for all locations
        locations.forEach((location) => {
          L.marker([location.latitude, location.longitude], {
            icon: customIcon
          })
            .addTo(leafletMapRef.current!)
            .bindPopup(`<b>Building ${location.name}</b>`);
        });
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (leafletMapRef.current) {
        // Invalidate map size when fullscreen changes
        setTimeout(() => {
          leafletMapRef.current?.invalidateSize();
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fullscreen-card' : ''}`}>
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-gray-800">SITE LOCATIONS</CardTitle>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <FaCompress className="h-5 w-5 text-gray-600" />
          ) : (
            <FaExpand className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          className={`relative ${isFullscreen ? 'h-screen' : 'h-[300px]'} w-full`} 
          id="map-container"
        >
          <div 
            ref={mapRef} 
            className="h-full w-full"
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add these styles to your CSS
const styles = `
.fullscreen-card {
  position: fixed !important;
  inset: 0 !important;
  z-index: 9999 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  border-radius: 0 !important;
}

.fullscreen-card .leaflet-container {
  height: calc(100vh - 60px) !important;
}
`;

export default MapCard;
