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

  remaining_distance: number;

  eta_minutes: number;
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
  selectedVehicle:
    Vehicle | null;

  setSelectedVehicle: React.Dispatch<
    React.SetStateAction<Vehicle | null>
  >;
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
        duration: 1.5,
      }
    );

  }, [lat, lng, map]);

  return null;
}

const truckIcon = new L.Icon({

  iconUrl:
    "/icons/delivery-truck.svg",

  iconSize: [42, 42],

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

  selectedVehicle,

  setSelectedVehicle,

}: FleetMapProps) {

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [focusedVehicle, setFocusedVehicle] =
    useState<Vehicle | null>(null);

  const previousPositions = useRef<
    Record<number, [number, number]>
  >({});

  // 🚚 GET CURRENT POSITION

  const getVehiclePosition = (
    vehicle: Vehicle
  ): [number, number] => {

    if (
      vehicle.route_data &&
      vehicle.route_data.length > 0
    ) {

      const safeIndex = Math.max(
        0,
        Math.min(
          vehicle.route_index - 1,
          vehicle.route_data.length - 1
        )
      );

      return vehicle.route_data[
        safeIndex
      ];
    }

    return [
      vehicle.current_lat,
      vehicle.current_lng,
    ];
  };

  // 🚚 FETCH VEHICLES

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

  // 📦 FETCH ORDERS

  const fetchOrders = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/orders/"
      );

      const data = await response.json();

      setOrders(data);

    } catch (error) {

      console.error(
        "Orders fetch error:",
        error
      );
    }
  };

  // 🚀 INITIAL LOAD + WEBSOCKET

  useEffect(() => {

    fetchVehicles();

    fetchOrders();

    const socket = new WebSocket(
      "ws://127.0.0.1:8000/ws/fleet/"
    );

    socket.onopen = () => {

      console.log(
        "✅ WebSocket connected"
      );
    };

    socket.onclose = (event) => {

      if (!event.wasClean) {

        console.warn(
          "WebSocket disconnected"
        );
      }
    };

    socket.onmessage = (
      event
    ) => {

      const updatedVehicle =
        JSON.parse(event.data);

      setVehicles(
        (prevVehicles) => {

          const existingVehicle =
            prevVehicles.find(
              (v) =>
                v.id ===
                updatedVehicle.id
            );

          if (existingVehicle) {

            previousPositions.current[
              updatedVehicle.id
            ] = getVehiclePosition(
              existingVehicle
            );

            return prevVehicles.map(
              (vehicle) =>

                vehicle.id ===
                updatedVehicle.id

                  ? updatedVehicle

                  : vehicle
            );
          }

          return [
            ...prevVehicles,
            updatedVehicle,
          ];
        }
      );
    };

    // 📦 REFRESH ORDERS

    const orderInterval =
      setInterval(() => {

        fetchOrders();

      }, 3000);

    return () => {

      clearInterval(orderInterval);

      socket.close();
    };

  }, []);

  // 🔥 SAFE LIVE SIDEBAR UPDATE

  useEffect(() => {

    if (!selectedVehicle) return;

    const latestVehicle =
      vehicles.find(
        (v) =>
          v.id ===
          selectedVehicle.id
      );

    if (latestVehicle) {

      setSelectedVehicle(
        latestVehicle
      );

      setFocusedVehicle(
        latestVehicle
      );
    }

  }, [vehicles]);

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

        {/* 🚀 AUTO FOLLOW */}

        {focusedVehicle && (

          <RecenterMap
            lat={
              getVehiclePosition(
                focusedVehicle
              )[0]
            }
            lng={
              getVehiclePosition(
                focusedVehicle
              )[1]
            }
          />

        )}

        {/* 🚚 VEHICLES */}

        {vehicles.map((vehicle) => {

          const currentPosition =
            getVehiclePosition(vehicle);

          return (

            <div key={vehicle.id}>

              {/* 🛣️ ROUTE */}

              {vehicle.route_data &&
                vehicle.route_data.length > 0 &&
                vehicle.is_moving && (

                  <Polyline
                    positions={
                      vehicle.route_data
                    }
                    pathOptions={{
                      color: "#2563eb",
                      weight: 5,
                      opacity: 0.8,
                    }}
                  />
                )}

              {/* 🚚 MOVING VEHICLE */}

              <LeafletTrackingMarker
                position={
                  currentPosition
                }

                previousPosition={
                  previousPositions
                    .current[
                    vehicle.id
                  ] ||
                  currentPosition
                }

                duration={900}

                keepAtCenter={false}

                icon={truckIcon}

                eventHandlers={{

                  click: () => {

                    setSelectedVehicle(
                      vehicle
                    );

                    setFocusedVehicle(
                      vehicle
                    );
                  },
                }}
              >

                <Popup>

                  <div className="text-sm min-w-[220px]">

                    <p className="font-bold text-lg mb-2">

                      🚚 {vehicle.name}

                    </p>

                    <div className="space-y-1">

                      <p>
                        <strong>Driver:</strong>{" "}
                        {
                          vehicle.driver_name
                        }
                      </p>

                      <p>
                        <strong>Type:</strong>{" "}
                        {
                          vehicle.vehicle_type
                        }
                      </p>

                      <p>
                        <strong>Speed:</strong>{" "}
                        {vehicle.speed.toFixed(
                          0
                        )} km/h
                      </p>

                      <p>
                        <strong>Fuel:</strong>{" "}
                        {vehicle.fuel_level.toFixed(
                          1
                        )}%
                      </p>

                      <p>
                        <strong>ETA:</strong>{" "}
                        {
                          vehicle.eta_minutes
                        } mins
                      </p>

                      <p>
                        <strong>Distance:</strong>{" "}
                        {
                          vehicle.remaining_distance
                        } km
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {vehicle.is_moving
                          ? "Moving"
                          : "Idle"}
                      </p>

                    </div>

                  </div>

                </Popup>

              </LeafletTrackingMarker>

            </div>
          );
        })}

        {/* 📦 ACTIVE ORDERS */}

        {orders
          .filter(
            (order) =>
              order.status !==
              "delivered"
          )
          .map((order) => {

            const uniqueKey =
              `${order.id}-${order.status}`;

            return (

              <div key={uniqueKey}>

                {/* 📦 PICKUP */}

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
                        {
                          order.customer_name
                        }
                      </p>

                      <p>
                        Status:{" "}
                        {order.status}
                      </p>

                    </div>

                  </Popup>

                </Marker>

                {/* 📍 DROP */}

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

                        📍 Drop

                      </p>

                      <p>
                        {
                          order.customer_name
                        }
                      </p>

                    </div>

                  </Popup>

                </Marker>

              </div>
            );
          })}

      </MapContainer>

    </div>
  );
}