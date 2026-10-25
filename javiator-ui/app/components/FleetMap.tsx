"use client";

import {
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";

import dynamic from "next/dynamic";

import {
  TileLayer,
  Popup,
  useMap,
  Marker,
  Polyline,
  CircleMarker,
} from "react-leaflet";

import {
  LeafletTrackingMarker,
} from "react-leaflet-tracking-marker";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { mapTokens }
from "../styles/theme";

import { apiFetch }
from "@/services/api";

// =====================================================
// 🚀 DYNAMIC MAP CONTAINER
// =====================================================

const MapContainer = dynamic(
  async () => {

    const mod =
      await import(
        "react-leaflet"
      );

    return mod.MapContainer;
  },
  {
    ssr: false,
  }
);

// =====================================================
// 🚀 TYPES
// =====================================================

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

  darkMode: boolean;

  selectedVehicle:
    Vehicle | null;

  setSelectedVehicle: React.Dispatch<
    React.SetStateAction<Vehicle | null>
  >;
};

// =====================================================
// 🚀 RECENTER
// =====================================================

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

// =====================================================
// 🚀 ICONS
// =====================================================

const truckIcon = new L.Icon({

  iconUrl:
    "/icons/delivery-truck.svg",

  iconSize: [42, 42],

  iconAnchor: [21, 21],

  popupAnchor: [0, -20],
});

const pickupIcon = new L.Icon({

  iconUrl:
    "/icons/pickup.svg",

  iconSize: [36, 36],

  iconAnchor: [18, 36],

  popupAnchor: [0, -30],
});

const dropIcon = new L.Icon({

  iconUrl:
    "/icons/drop.svg",

  iconSize: [36, 36],

  iconAnchor: [18, 36],

  popupAnchor: [0, -30],
});

// =====================================================
// 🚀 COMPONENT
// =====================================================

export default function FleetMap({

  darkMode,

  selectedVehicle,

  setSelectedVehicle,

}: FleetMapProps) {

  const [mounted, setMounted] =
    useState(false);

  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [focusedVehicle, setFocusedVehicle] =
    useState<Vehicle | null>(null);

  const previousPositions = useRef<
    Record<number, [number, number]>
  >({});

  // =====================================================
  // 🚀 MOUNT FIX
  // =====================================================

  useEffect(() => {

    setMounted(true);

  }, []);

  // =====================================================
  // 🚀 POSITION
  // =====================================================

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

  // =====================================================
  // 🚀 FETCH DATA
  // =====================================================

  const fetchVehicles =
    async () => {

      try {

        const data =
          await apiFetch(
            "/api/fleet/vehicles/"
          );

        setVehicles(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Vehicle fetch error:",
          error
        );
      }
    };

  const fetchOrders =
    async () => {

      try {

        const data =
          await apiFetch(
            "/api/orders/"
          );

        setOrders(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Orders fetch error:",
          error
        );
      }
    };

  // =====================================================
  // 🚀 INITIALIZE
  // =====================================================

  useEffect(() => {

    fetchVehicles();

    fetchOrders();

    const interval =
      setInterval(() => {

        fetchVehicles();

        fetchOrders();

      }, 3000);

    return () =>
      clearInterval(interval);

  }, []);

  // =====================================================
  // 🚀 SIDEBAR SYNC
  // =====================================================

  useEffect(() => {

    if (!selectedVehicle)
      return;

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

  // =====================================================
  // 🚀 MAP THEME
  // =====================================================

  const mapTheme =
    darkMode
      ? mapTokens.dark
      : mapTokens.light;

  // =====================================================
  // 🚀 SSR FIX
  // =====================================================

  if (!mounted) {

    return null;
  }

  // =====================================================
  // 🚀 UI
  // =====================================================

  return (

    <div className="h-full w-full">

      <MapContainer
        key={
          darkMode
            ? "dark-map"
            : "light-map"
        }
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
          url={mapTheme.tileUrl}
        />

        {/* FOLLOW */}

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

        {/* VEHICLES */}

        {vehicles.map((vehicle) => {

          const currentPosition =
            getVehiclePosition(
              vehicle
            );

          return (

            <div key={vehicle.id}>

              {/* ROUTE */}

              {vehicle.route_data?.length > 0 && (

                <Polyline
                  positions={
                    vehicle.route_data
                  }
                  pathOptions={{
                    color:
                      mapTheme.route,
                    weight: 5,
                  }}
                />
              )}

              {/* PULSE */}

              {vehicle.is_moving && (

                <CircleMarker
                  center={
                    currentPosition
                  }
                  radius={18}
                  pathOptions={{
                    color:
                      mapTheme.pulseStroke,
                    fillColor:
                      mapTheme.pulseFill,
                    fillOpacity: 0.4,
                  }}
                />
              )}

              {/* VEHICLE */}

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
                duration={800}
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

                  <div className="text-sm min-w-[200px]">

                    <h3 className="font-semibold">

                      {vehicle.name}

                    </h3>

                    <p>

                      Driver:
                      {" "}
                      {
                        vehicle.driver_name
                      }

                    </p>

                    <p>

                      Speed:
                      {" "}
                      {vehicle.speed}
                      {" "}
                      km/h

                    </p>

                  </div>

                </Popup>

              </LeafletTrackingMarker>

            </div>
          );
        })}

        {/* ORDERS */}

        {orders
          .filter(
            (order) =>
              order.status !==
              "delivered"
          )
          .map((order) => (

            <div
              key={order.id}
            >

              {/* PICKUP */}

              <Marker
                position={[
                  order.pickup_lat,
                  order.pickup_lng,
                ]}
                icon={pickupIcon}
              >

                <Popup>

                  📦 Pickup:
                  {" "}
                  {
                    order.customer_name
                  }

                </Popup>

              </Marker>

              {/* DROP */}

              <Marker
                position={[
                  order.drop_lat,
                  order.drop_lng,
                ]}
                icon={dropIcon}
              >

                <Popup>

                  🏁 Drop:
                  {" "}
                  {
                    order.customer_name
                  }

                </Popup>

              </Marker>

            </div>
          ))}

      </MapContainer>

    </div>
  );
}