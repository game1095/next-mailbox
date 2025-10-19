// components/FormMapPicker.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
// [แก้ไข] เอา LatLng, Icon ออก เพราะไม่ได้ใช้โดยตรง
import { LatLngExpression, Map } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issue with Webpack/Next.js
import L from "leaflet";
// [แก้ไข] เพิ่ม eslint-disable comment เพื่อบอก Vercel ให้ข้าม Error บรรทัดนี้
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  mapRef?: React.MutableRefObject<Map | null>;
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
      map.flyTo(e.latlng, map.getZoom());
      setPosition(e.latlng);
      onPositionChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
};

// [แก้ไข] ย้าย THAILAND_CENTER ออกมานอก Component
const THAILAND_CENTER: LatLngExpression = [13.7563, 100.5018]; // Default center (Bangkok)
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 15;

const FormMapPicker: React.FC<FormMapPickerProps> = ({
  initialLat,
  initialLng,
  onPositionChange,
  mapRef,
}) => {
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
    return THAILAND_CENTER; // ใช้ Constant ที่อยู่นอก Component
    // [แก้ไข] เอา THAILAND_CENTER ออกจาก dependency เพราะมันเป็น Constant นอก Component แล้ว
  }, [initialLat, initialLng]);

  const [markerPosition, setMarkerPosition] =
    useState<LatLngExpression>(getInitialPosition);
  const [currentZoom, setCurrentZoom] = useState(
    initialLat && initialLng ? SELECTED_ZOOM : DEFAULT_ZOOM
  );

  useEffect(() => {
    const pos = getInitialPosition();
    setMarkerPosition(pos);
    const newZoom =
      pos[0] === THAILAND_CENTER[0] && pos[1] === THAILAND_CENTER[1] // ใช้ Constant
        ? DEFAULT_ZOOM
        : SELECTED_ZOOM;
    setCurrentZoom(newZoom);

    if (mapRef?.current) {
      mapRef.current.flyTo(pos, newZoom);
    }
    // [แก้ไข] เอา THAILAND_CENTER ออก
  }, [initialLat, initialLng, getInitialPosition, mapRef]);

  return (
    <MapContainer
      center={markerPosition}
      zoom={currentZoom}
      scrollWheelZoom={true}
      style={{ height: "300px", width: "100%", borderRadius: "8px" }}
      whenCreated={(mapInstance) => {
        if (mapRef) {
          mapRef.current = mapInstance;
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
