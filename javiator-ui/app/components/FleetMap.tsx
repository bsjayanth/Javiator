"use client";

import { useEffect, useState, useRef } from "react";

import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";

import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  Marker,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

type Vehicle = {
  id: number;
  name: string;
  vehicle_type: string;
  speed: number;
  fuel_level: number;
  driver_name: string;

  current_lat: number;
  current_lng: number;

  is_moving: boolean;

  route_data: [number, number][];
  route_index: number;
};

type Order = {
  id: number;

  customer_name: string;

  pickup_lat: number;
  pickup_lng: number;

  drop_lat: number;
  drop_lng: number;

  status: string;
};

type FleetMapProps = {
  setSelectedVehicle: (vehicle: Vehicle) => void;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 14, {
      duration: 2,
    });
  }, [lat, lng, map]);

  return null;
}

const truckIcon = new L.Icon({
  iconUrl: "/icons/delivery-truck.svg",

  iconSize: [40, 40],

  iconAnchor: [20, 20],

  popupAnchor: [0, -20],
});

const pickupIcon = new L.Icon({
  iconUrl: "/icons/pickup.svg",

  iconSize: [30, 30],

  iconAnchor: [15, 30],
});

const dropIcon = new L.Icon({
  iconUrl: "/icons/drop.svg",

  iconSize: [30, 30],

  iconAnchor: [15, 30],
});

export default function FleetMap({ setSelectedVehicle }: FleetMapProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [focusedVehicle, setFocusedVehicle] = useState<Vehicle | null>(null);

  const previousPositions = useRef<Record<number, [number, number]>>({});

  // 🔥 GET CURRENT ROUTE POSITION

  const getVehiclePosition = (vehicle: Vehicle): [number, number] => {
    if (vehicle.route_data && vehicle.route_data.length > 0) {
      const safeIndex = Math.max(
        0,
        Math.min(vehicle.route_index - 1,
          vehicle.route_data.length - 1),
      );
      return vehicle.route_data[safeIndex];
    }

    return [vehicle.current_lat, vehicle.current_lng];
  };

  // 🚚 FETCH VEHICLES

  const fetchVehicles = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/fleet/vehicles/");

      const data = await response.json();

      setVehicles((prevVehicles) => {
        data.forEach((vehicle: Vehicle) => {
          const currentPos = getVehiclePosition(vehicle);

          const oldVehicle = prevVehicles.find((v) => v.id === vehicle.id);

          if (oldVehicle) {
            previousPositions.current[vehicle.id] =
              getVehiclePosition(oldVehicle);
          } else {
            previousPositions.current[vehicle.id] = currentPos;
          }
        });

        return data;
      });
    } catch (error) {
      console.error("Vehicle fetch error:", error);
    }
  };

  // 📦 FETCH ORDERS

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders/");

      const data = await response.json();

      setOrders(data);
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  };

  // 🔥 LIVE REFRESH

  useEffect(() => {
    fetchVehicles();

    fetchOrders();

    const interval = setInterval(async () => {
      await fetchVehicles();

      await fetchOrders();
    }, 1000);

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

        {/* 🔥 AUTO FOLLOW */}

        {focusedVehicle && (
          <RecenterMap
            lat={getVehiclePosition(focusedVehicle)[0]}
            lng={getVehiclePosition(focusedVehicle)[1]}
          />
        )}

        {/* 🚚 VEHICLES */}

        {vehicles.map((vehicle) => {
          const currentPosition = getVehiclePosition(vehicle);

          return (
            <div key={vehicle.id}>
              {/* 🛣️ REAL ROAD ROUTE */}

              {vehicle.route_data && vehicle.route_data.length > 0 && (
                <Polyline
                  positions={vehicle.route_data}
                  pathOptions={{
                    color: "#3b82f6",
                    weight: 5,
                  }}
                />
              )}

              {/* 🚚 MOVING TRUCK */}

              <LeafletTrackingMarker
                position={currentPosition}
                previousPosition={
                  previousPositions.current[vehicle.id] || currentPosition
                }
                duration={1000}
                keepAtCenter={false}
                icon={truckIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedVehicle(vehicle);

                    setFocusedVehicle(vehicle);
                  },
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">🚚 {vehicle.name}</p>

                    <p>Driver: {vehicle.driver_name}</p>

                    <p>Type: {vehicle.vehicle_type}</p>

                    <p>Speed: {vehicle.speed.toFixed(0)} km/h</p>

                    <p>Fuel: {vehicle.fuel_level.toFixed(1)}%</p>

                    <p>Status: {vehicle.is_moving ? "Moving" : "Idle"}</p>

                    <p>Route Points: {vehicle.route_data?.length}</p>
                  </div>
                </Popup>
              </LeafletTrackingMarker>
            </div>
          );
        })}

        {/* 📦 ORDERS */}

        {orders
          .filter((order) => order.status !== "delivered")
          .map((order) => (
            <div key={order.id}>
              {/* PICKUP */}

              <Marker
                position={[order.pickup_lat, order.pickup_lng]}
                icon={pickupIcon}
              >
                <Popup>
                  <div>
                    <p className="font-bold">📦 Pickup</p>

                    <p>{order.customer_name}</p>

                    <p>Status: {order.status}</p>
                  </div>
                </Popup>
              </Marker>

              {/* DROP */}

              <Marker
                position={[order.drop_lat, order.drop_lng]}
                icon={dropIcon}
              >
                <Popup>
                  <div>
                    <p className="font-bold">📍 Drop</p>

                    <p>{order.customer_name}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
      </MapContainer>
    </div>
  );
}
