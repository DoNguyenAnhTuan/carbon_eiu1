import L from 'leaflet';

// Custom marker icon for the map
export const createMarkerIcon = (count?: number) => {
  const className = count ? 'flex items-center justify-center bg-primary rounded-full w-6 h-6 shadow-md text-white' 
    : 'flex items-center justify-center bg-primary rounded-full w-6 h-6 shadow-md text-white';
    
  const html = count ? `<span class="text-xs font-bold">${count}</span>` : `<i class="fas fa-map-marker-alt"></i>`;
    
  return L.divIcon({
    className,
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

// Initialize map and center on given coordinates
export const initializeMap = (
  mapContainer: HTMLElement, 
  center: [number, number] = [21.0388, 105.8505], 
  zoom: number = 13
) => {
  const map = L.map(mapContainer).setView(center, zoom);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  return map;
};

// Add site markers to the map
export const addSiteMarkers = (map: L.Map, sites: any[]) => {
  const markers: L.Marker[] = [];
  
  sites.forEach(site => {
    const position: [number, number] = [site.latitude, site.longitude];
    const icon = createMarkerIcon(site.meterCount);
    
    const marker = L.marker(position, { icon }).addTo(map);
    marker.bindTooltip(site.name);
    
    markers.push(marker);
  });
  
  return markers;
};
