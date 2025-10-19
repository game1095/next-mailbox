// components/FormMapPicker.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react"; // <--- แก้ไขบรรทัดนี้
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import { LatLngExpression, LatLng, Icon, Map } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issue with Webpack/Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface FormMapPickerProps {
  initialLat?: number | string;
  initialLng?: number | string;
  onPositionChange: (lat: number, lng: number) => void;
  mapRef?: React.MutableRefObject<Map | null>; // Optional ref for external control
}

const DraggableMarker = ({
  position,
  setPosition,
  onPositionChange,
}: {
  position: LatLngExpression;
  setPosition: (pos: LatLngExpression) => void;
  onPositionChange: (lat: number, lng: number) => void;
}) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    // <-- useMemo ถูก import มาแล้ว
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onPositionChange(
            parseFloat(newPos.lat.toFixed(6)),
            parseFloat(newPos.lng.toFixed(6))
          );
        }
      },
    }),
    [setPosition, onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup minWidth={90}>ลากหมุดนี้เพื่อเลือกตำแหน่ง</Popup>
    </Marker>
  );
};

const MapClickHandler = ({
  setPosition,
  onPositionChange,
}: {
  setPosition: (pos: LatLngExpression) => void;
  onPositionChange: (lat: number, lng: number) => void;
}) => {
  const map = useMapEvents({
    click(e) {
      map.flyTo(e.latlng, map.getZoom()); // เคลื่อนแผนที่ไปจุดที่คลิก
      setPosition(e.latlng);
      onPositionChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
};

const FormMapPicker: React.FC<FormMapPickerProps> = ({
  initialLat,
  initialLng,
  onPositionChange,
  mapRef, // Accept the ref
}) => {
  const THAILAND_CENTER: LatLngExpression = [13.7563, 100.5018]; // Default center (Bangkok)
  const DEFAULT_ZOOM = 6;
  const SELECTED_ZOOM = 15;

  const getInitialPosition = useCallback((): LatLngExpression => {
    const lat =
      typeof initialLat === "string" ? parseFloat(initialLat) : initialLat;
    const lng =
      typeof initialLng === "string" ? parseFloat(initialLng) : initialLng;

    if (
      typeof lat === "number" &&
      !isNaN(lat) &&
      typeof lng === "number" &&
      !isNaN(lng)
    ) {
      return [lat, lng];
    }
    return THAILAND_CENTER;
  }, [initialLat, initialLng]);

  const [markerPosition, setMarkerPosition] =
    useState<LatLngExpression>(getInitialPosition);
  const [currentZoom, setCurrentZoom] = useState(
    initialLat && initialLng ? SELECTED_ZOOM : DEFAULT_ZOOM
  );

  // Update marker and map view when initial coordinates change (e.g., from 'getCurrentLocation')
  useEffect(() => {
    const pos = getInitialPosition();
    setMarkerPosition(pos);
    const newZoom =
      pos[0] === THAILAND_CENTER[0] && pos[1] === THAILAND_CENTER[1]
        ? DEFAULT_ZOOM
        : SELECTED_ZOOM;
    setCurrentZoom(newZoom);

    // Fly to the new position if map instance exists
    if (mapRef?.current) {
      mapRef.current.flyTo(pos, newZoom);
    }
  }, [initialLat, initialLng, getInitialPosition, mapRef]);

  return (
    <MapContainer
      center={markerPosition}
      zoom={currentZoom}
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%", borderRadius: "8px" }}
      whenCreated={(mapInstance) => {
        if (mapRef) {
          mapRef.current = mapInstance; // Store map instance in ref
        }
      }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker
        position={markerPosition}
        setPosition={setMarkerPosition}
        onPositionChange={onPositionChange}
      />
      <MapClickHandler
        setPosition={setMarkerPosition}
        onPositionChange={onPositionChange}
      />
    </MapContainer>
  );
};

export default FormMapPicker;
