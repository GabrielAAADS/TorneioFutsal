import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import { LeafletMouseEvent, LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';

export function MapaLocal({ lat, lng, onLocationSelect }: {
  lat?: string;
  lng?: string;
  onLocationSelect: (lat: string, lng: string) => void;
}) {
  const initialLat = lat ? parseFloat(lat) : -7.215;
  const initialLng = lng ? parseFloat(lng) : -35.9;

  const [markerPos, setMarkerPos] = useState<[number, number]>([initialLat, initialLng]);

  function MapClickHandler() {
    useMapEvents({
        click(e: LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        setMarkerPos([lat, lng]);
        onLocationSelect(String(lat), String(lng));
      },
    });
    return null;
  }
  
  function InvalidateOnShow() {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }, [map]);
    return null;
  }

  return (
    <div style={{ marginTop: '1rem', width: '500px', height: '400px', }}>
        <MapContainer
            center={markerPos as LatLngExpression}
            zoom={10}
            style={{ height: '100%', width: '100%', border: '1px solid #ccc' }}
        >        
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <InvalidateOnShow />
        <MapClickHandler />
        <Marker position={markerPos}>
          <Popup>Lat: {markerPos[0].toFixed(4)}, Lng: {markerPos[1].toFixed(4)}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
