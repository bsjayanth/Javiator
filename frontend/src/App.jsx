import { useEffect, useState } from "react";
import API from "./services/api";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function App() {

  // ✅ State for vehicles from backend
  const [vehicles, setVehicles] = useState([]);

  // ✅ Auto-refresh vehicles every 5 seconds
  useEffect(() => {

    fetchVehicles();

    const interval = setInterval(() => {
      fetchVehicles();
    }, 2000);

    return () => clearInterval(interval);

  }, []);

  // ✅ API call to Django backend
  const fetchVehicles = async () => {

    try {

      const response = await API.get("/api/vehicles/");

      console.log(response.data);

      setVehicles(response.data);

    } catch (error) {

      console.error("Error fetching vehicles:", error);

    }
  };

  return (

    <div
      style={{
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "20px"
      }}
    >

      <h1>🚚 Javiator Live Fleet Tracking</h1>

      <div
        style={{
          height: "80vh",
          marginTop: "20px",
          borderRadius: "12px",
          overflow: "hidden"
        }}
      >

        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ Render vehicles from API */}
          {vehicles
            .filter(
              (vehicle) =>
                vehicle.current_lat &&
                vehicle.current_lng
            )
            .map((vehicle) => (

              <Marker
                key={vehicle.id}
                position={[
                  vehicle.current_lat,
                  vehicle.current_lng
                ]}
              >

                <Popup>

                  <div>

                    <h3>🚚 {vehicle.name}</h3>

                    <p>
                      Capacity: {vehicle.capacity}
                    </p>

                    <p>
                      Status:{" "}
                      {vehicle.is_available
                        ? "Available"
                        : "Busy"}
                    </p>

                    <p>
                      Lat: {vehicle.current_lat}
                    </p>

                    <p>
                      Lng: {vehicle.current_lng}
                    </p>

                  </div>

                </Popup>

              </Marker>

            ))}

        </MapContainer>

      </div>

    </div>
  );
}