"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Map, LatLngBounds } from "leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

// Interface สำหรับข้อมูล
interface Mailbox {
  id: number;
  postOffice: string;
  landmark: string;
  lat: number | string;
  lng: number | string;
}

interface MailboxMapProps {
  mailboxes: Mailbox[]; // ✨ รับข้อมูลเป็น Array
}

// ไอคอนหมุดสีแดงขนาดเล็ก
const smallRedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [13, 21],
  iconAnchor: [6, 21],
  popupAnchor: [1, -20],
  shadowSize: [21, 21],
});

const MailboxMap = ({ mailboxes }: MailboxMapProps) => {
  const mapRef = useRef<Map>(null);
  const defaultPosition: LatLngExpression = [15.7, 100.12];
  const defaultZoom = 8;

  // ✨ Effect สำหรับปรับมุมกล้องอัตโนมัติ ✨
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mailboxes && mailboxes.length > 0) {
      // สร้างขอบเขตจากพิกัดทั้งหมดที่เลือก
      const bounds = new L.LatLngBounds(
        mailboxes.map((m) => [
          parseFloat(m.lat as string),
          parseFloat(m.lng as string),
        ])
      );
      // เลื่อนแผนที่ให้แสดงทุกหมุดพอดีขอบเขต
      map.flyToBounds(bounds, { padding: [50, 50] }); // padding เพื่อไม่ให้หมุดชิดขอบจอเกินไป
    } else {
      // ถ้าไม่มีอะไรถูกเลือก ให้กลับไปที่มุมมองเริ่มต้น
      map.flyTo(defaultPosition, defaultZoom);
    }
  }, [mailboxes]); // Effect นี้จะทำงานทุกครั้งที่ `mailboxes` มีการเปลี่ยนแปลง

  return (
    <MapContainer
      ref={mapRef}
      center={defaultPosition}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* วน Loop แสดง Marker ทั้งหมดที่ถูกส่งเข้ามา */}
      {mailboxes.map((marker) => (
        <Marker
          key={marker.id}
          position={[
            parseFloat(marker.lat as string),
            parseFloat(marker.lng as string),
          ]}
          icon={smallRedIcon}
        >
          <Popup>
            <b>{marker.postOffice}</b>
            <br />
            {marker.landmark}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MailboxMap;
