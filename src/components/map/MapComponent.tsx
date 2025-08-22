'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapComponentProps {
  className?: string;
}

export default function MapComponent({ className = '' }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-98.5795); // Center of US
  const [lat, setLat] = useState(39.8283);
  const [zoom, setZoom] = useState(4);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme for lightning visibility
      center: [lng, lat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;
          setUserLocation([userLng, userLat]);
          
          if (map.current) {
            // Center map on user location
            map.current.setCenter([userLng, userLat]);
            map.current.setZoom(8);
            
            // Add user location marker
            new mapboxgl.Marker({ color: '#3B82F6' })
              .setLngLat([userLng, userLat])
              .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
              .addTo(map.current);
          }
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }

    // Update state when map moves
    map.current.on('move', () => {
      if (!map.current) return;
      setLng(Number(map.current.getCenter().lng.toFixed(4)));
      setLat(Number(map.current.getCenter().lat.toFixed(4)));
      setZoom(Number(map.current.getZoom().toFixed(2)));
    });
  }, []);

  // Add distance rings around user location
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const distances = [10, 20, 30]; // miles
    const colors = ['#EF4444', '#F97316', '#EAB308']; // red, orange, yellow

    distances.forEach((distance, index) => {
      const radiusInKm = distance * 1.60934; // Convert miles to km
      const radiusInMeters = radiusInKm * 1000;
      
      // Create circle (simplified - you might want to use a proper circle calculation)
      const circle = {
        type: 'Feature' as const,
        geometry: {
          type: 'Polygon' as const,
          coordinates: [createCircle(userLocation, radiusInMeters)],
        },
      };

      const sourceId = `distance-ring-${distance}`;
      const layerId = `distance-ring-layer-${distance}`;

      if (map.current?.getSource(sourceId)) {
        return; // Already added
      }

      map.current?.addSource(sourceId, {
        type: 'geojson',
        data: circle,
      });

      map.current?.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {},
        paint: {
          'line-color': colors[index],
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });
    });
  }, [userLocation]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Info Panel */}
      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 text-white p-3 rounded-lg shadow-lg">
        <div className="text-sm">
          <div>Longitude: {lng}</div>
          <div>Latitude: {lat}</div>
          <div>Zoom: {zoom}</div>
          {userLocation && <div className="text-blue-400 mt-1">📍 Location Found</div>}
        </div>
      </div>

      {/* Distance Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-90 text-white p-3 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Lightning Alert Zones</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span>10 miles - High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500"></div>
            <span>20 miles - Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-500"></div>
            <span>30 miles - Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to create circle coordinates
function createCircle(center: [number, number], radiusInMeters: number) {
  const points = 64;
  const coords = [];
  const distanceX = radiusInMeters / (111320 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInMeters / 110540;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // Close the polygon

  return coords;
}