"use client";

import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

type Vehicle = {
  id: number;
  name: string;
  current_lat: number;
  current_lng: number;
};

const truckIcon = new L.Icon({
  iconUrl: "/icons/delivery-truck.svg",

  iconSize: [38, 38],

  iconAnchor: [21, 21],

  popupAnchor: [0, -20],
});

export default function FleetMap() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/vehicles/"
      );

      const data = await response.json();

      console.log(data);

      setVehicles(data);
    } catch (error) {
      console.error("Vehicle fetch error:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();

    const interval = setInterval(() => {
      fetchVehicles();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[
              vehicle.current_lat,
              vehicle.current_lng,
            ]}
            icon={truckIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">
                  🚚 {vehicle.name}
                </p>

                <p>
                  Lat: {vehicle.current_lat.toFixed(4)}
                </p>

                <p>
                  Lng: {vehicle.current_lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}