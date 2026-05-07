"use client";

import { useEffect, useState } from "react";

import { LeafletTrackingMarker }
from "react-leaflet-tracking-marker";

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
  setSelectedVehicle: (
    vehicle: Vehicle
  ) => void;
};

function RecenterMap({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {

  const map = useMap();

  useEffect(() => {

    map.flyTo(
      [lat, lng],
      14,
      {
        duration: 2,
      }
    );

  }, [lat, lng, map]);

  return null;
}

const truckIcon = new L.Icon({
  iconUrl: "/icons/delivery-truck.svg",

  iconSize: [38, 38],

  iconAnchor: [21, 21],

  popupAnchor: [0, -20],
});

const pickupIcon = new L.Icon({
  iconUrl: "/icons/pickup.svg",

  iconSize: [32, 32],

  iconAnchor: [16, 32],
});

const dropIcon = new L.Icon({
  iconUrl: "/icons/drop.svg",

  iconSize: [32, 32],

  iconAnchor: [16, 32],
});

export default function FleetMap({
  setSelectedVehicle,
}: FleetMapProps) {

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [focusedVehicle, setFocusedVehicle] =
    useState<Vehicle | null>(null);

  const fetchVehicles = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/fleet/vehicles/"
      );

      const data = await response.json();

      setVehicles(data);

    } catch (error) {

      console.error(
        "Vehicle fetch error:",
        error
      );

    }
  };

  const fetchOrders = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/orders/"
      );

      const data = await response.json();

      console.log("Orders:", data);

      setOrders(data);

    } catch (error) {

      console.error(
        "Orders fetch error:",
        error
      );

    }
  };

  useEffect(() => {

    fetchVehicles();

    fetchOrders();

    const interval = setInterval(async () => {

      try {

        await fetch(
          "http://127.0.0.1:8000/api/fleet/simulate/",
          {
            method: "POST",
          }
        );

        await fetchVehicles();

      } catch (error) {

        console.error(
          "Simulation error:",
          error
        );

      }

    }, 3000);

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

        {focusedVehicle && (

          <RecenterMap
            lat={focusedVehicle.current_lat}
            lng={focusedVehicle.current_lng}
          />

        )}

        {/* VEHICLES */}

        {vehicles.map((vehicle) => (

          <LeafletTrackingMarker
            key={vehicle.id}

            position={[
              vehicle.current_lat,
              vehicle.current_lng,
            ]}

            previousPosition={[
              vehicle.current_lat - 0.001,
              vehicle.current_lng - 0.001,
            ]}

            duration={3000}

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

                <p className="font-bold">
                  🚚 {vehicle.name}
                </p>

                <p>
                  Driver: {vehicle.driver_name}
                </p>

                <p>
                  Speed: {vehicle.speed} km/h
                </p>

                <p>
                  Fuel: {vehicle.fuel_level}%
                </p>

              </div>

            </Popup>

          </LeafletTrackingMarker>

        ))}

        {/* ORDERS */}

        {orders.map((order) => (

          <div key={order.id}>

            {/* PICKUP MARKER */}

            <Marker
              position={[
                order.pickup_lat,
                order.pickup_lng,
              ]}
              icon={pickupIcon}
            >

              <Popup>

                <div>

                  <p className="font-bold">
                    📦 Pickup
                  </p>

                  <p>
                    {order.customer_name}
                  </p>

                  <p>
                    Status: {order.status}
                  </p>

                </div>

              </Popup>

            </Marker>

            {/* DROP MARKER */}

            <Marker
              position={[
                order.drop_lat,
                order.drop_lng,
              ]}
              icon={dropIcon}
            >

              <Popup>

                <div>

                  <p className="font-bold">
                    📍 Drop Location
                  </p>

                  <p>
                    {order.customer_name}
                  </p>

                </div>

              </Popup>

            </Marker>

            {/* ROUTE LINE */}

            <Polyline
              positions={[
                [
                  order.pickup_lat,
                  order.pickup_lng,
                ],
                [
                  order.drop_lat,
                  order.drop_lng,
                ],
              ]}
            />

          </div>

        ))}

      </MapContainer>

    </div>
  );
}