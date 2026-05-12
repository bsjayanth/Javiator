"use client";

import {

  useEffect,
  useState,
  useRef,

} from "react";

import {

  LeafletTrackingMarker,

} from "react-leaflet-tracking-marker";

import {

  MapContainer,
  TileLayer,
  Popup,
  useMap,
  Marker,
  Polyline,
  CircleMarker,

} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { mapTokens } from "../styles/theme";

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

/* ===================================================== */
/* 🚀 ICONS */
/* ===================================================== */

const truckIcon = new L.Icon({

  iconUrl:
    "/icons/delivery-truck.svg",

  iconSize: [42, 42],

  iconAnchor: [21, 21],

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

export default function FleetMap({

  darkMode,

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

  /* ===================================================== */
  /* 🚀 POSITION */
  /* ===================================================== */

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

  /* ===================================================== */
  /* 🚀 FETCH VEHICLES */
  /* ===================================================== */

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

  /* ===================================================== */
  /* 🚀 FETCH ORDERS */
  /* ===================================================== */

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

  /* ===================================================== */
  /* 🚀 WEBSOCKET */
  /* ===================================================== */

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

    socket.onclose = () => {

      console.warn(
        "⚠️ WebSocket disconnected"
      );
    };

    const orderInterval =
      setInterval(() => {

        fetchOrders();

      }, 3000);

    return () => {

      clearInterval(orderInterval);

      socket.close();
    };

  }, []);

  /* ===================================================== */
  /* 🚀 LIVE SIDEBAR */
  /* ===================================================== */

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

  const mapTheme =
    darkMode
      ? mapTokens.dark
      : mapTokens.light;

  return (

    <div className="h-full w-full">

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        scrollWheelZoom={true}
        className={
          darkMode
            ? "leaflet-map--dark"
            : "leaflet-map--light"
        }
        style={{
          height: "100%",
          width: "100%",
        }}
      >

        <TileLayer
          key={
            darkMode
              ? "dark"
              : "light"
          }
          attribution="&copy; OpenStreetMap contributors"
          url={mapTheme.tileUrl}
        />

        {/* ================================================= */}
        {/* 🚀 AUTO FOLLOW */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* 🚚 VEHICLES */}
        {/* ================================================= */}

        {vehicles.map((vehicle) => {

          const currentPosition =
            getVehiclePosition(vehicle);

          return (

            <div key={vehicle.id}>

              {/* ================================================= */}
              {/* 🚀 ACTIVE ROUTE */}
              {/* ================================================= */}

              {vehicle.route_data &&
                vehicle.route_data.length > 0 &&
                vehicle.is_moving && (

                  <>
                    <Polyline
                      positions={
                        vehicle.route_data
                      }
                      pathOptions={{
                        color: mapTheme.routeHalo,
                        weight: mapTheme.routeHaloWeight,
                        opacity: mapTheme.routeHaloOpacity,
                        lineCap: "round",
                        lineJoin: "round",
                      }}
                    />

                    <Polyline
                      positions={
                        vehicle.route_data
                      }
                      pathOptions={{
                        color: mapTheme.route,
                        weight: mapTheme.routeWeight,
                        opacity: mapTheme.routeOpacity,
                        lineCap: "round",
                        lineJoin: "round",
                      }}
                    />
                  </>
                )}

              {/* ================================================= */}
              {/* 🚀 VEHICLE PULSE */}
              {/* ================================================= */}

              {vehicle.is_moving && (

                <CircleMarker
                  center={
                    currentPosition
                  }
                  radius={20}
                  pathOptions={{
                    color: mapTheme.pulseStroke,
                    fillColor: mapTheme.pulseFill,
                    fillOpacity: 1,
                    opacity: 0.5,
                    weight: 1,
                  }}
                />

              )}

              {/* ================================================= */}
              {/* 🚀 MOVING VEHICLE */}
              {/* ================================================= */}

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

                  <div className="min-w-[220px] text-sm text-neutral-800">

                    <div className="mb-3">

                      <h3 className="font-semibold text-base text-neutral-900 tracking-tight">

                        {vehicle.name}

                      </h3>

                      <p className="text-neutral-500 text-xs mt-1 capitalize">

                        {
                          vehicle.vehicle_type
                        }

                      </p>

                    </div>

                    <div className="space-y-1.5 text-[13px] text-neutral-700">

                      <p>

                        <span className="text-neutral-500">
                          Driver
                        </span>
                        {": "}
                        {
                          vehicle.driver_name
                        }

                      </p>

                      <p>

                        <span className="text-neutral-500">
                          Speed
                        </span>
                        {": "}
                        {vehicle.speed.toFixed(
                          0
                        )}{" "}
                        km/h

                      </p>

                      <p>

                        <span className="text-neutral-500">
                          Fuel
                        </span>
                        {": "}
                        {vehicle.fuel_level.toFixed(
                          1
                        )}
                        %

                      </p>

                      <p>

                        <span className="text-neutral-500">
                          ETA
                        </span>
                        {": "}
                        {
                          vehicle.eta_minutes
                        }{" "}
                        mins

                      </p>

                      <p>

                        <span className="text-neutral-500">
                          Distance
                        </span>
                        {": "}
                        {
                          vehicle.remaining_distance
                        }{" "}
                        km

                      </p>

                      <p>

                        <span className="text-neutral-500">
                          Status
                        </span>
                        {": "}

                        <span className="font-medium text-neutral-900">

                          {vehicle.is_moving
                            ? "Moving"
                            : "Idle"}

                        </span>

                      </p>

                    </div>

                  </div>

                </Popup>

              </LeafletTrackingMarker>

            </div>
          );
        })}

        {/* ================================================= */}
        {/* 📦 ACTIVE ORDERS */}
        {/* ================================================= */}

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

                {/* PICKUP */}

                <Marker
                  position={[
                    order.pickup_lat,
                    order.pickup_lng,
                  ]}
                  icon={pickupIcon}
                >

                  <Popup>

                    <div>

                      <p className="font-semibold text-neutral-900">

                        Pickup

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

                {/* DROP */}

                <Marker
                  position={[
                    order.drop_lat,
                    order.drop_lng,
                  ]}
                  icon={dropIcon}
                >

                  <Popup>

                    <div>

                      <p className="font-semibold text-neutral-900">

                        Drop

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