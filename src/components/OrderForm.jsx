// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./OrderForm.css";

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiamFkcmlhbmdwIiwiYSI6ImNtN3hxZm9nczAxdmkyaXFzbGk0b28xNHUifQ.svXLzJIXxrcOeC2ldaw0Jg";

function OrderForm() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Map refs
  const pickupMapRef = useRef(null);
  const dropoffMapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupTime: "",
    deliveryTime: "",
    notes: "",
    contactPhone: "",
    paymentMethod: "tarjeta",
    packageSize: "pequeño",
    weight: 1,
    dimensions: { width: 10, height: 10, length: 10 },
    vehicleType: "moto",
  });

  // Map coordinates
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);

  // Price calculation
  const [price, setPrice] = useState(0);
  const [distance, setDistance] = useState(0);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapsInitialized, setMapsInitialized] = useState(false);

  // Initialize maps with a delay to ensure DOM elements are available
  useEffect(() => {
    const initializeMaps = setTimeout(() => {
      try {
        const pickupMapContainer = document.getElementById("pickup-map");
        const dropoffMapContainer = document.getElementById("dropoff-map");

        if (!pickupMapContainer || !dropoffMapContainer) {
          console.error("Map containers not found");
          return;
        }

        // Initialize pickup map
        const pickupMap = new mapboxgl.Map({
          container: "pickup-map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-3.70379, 40.416775], // Madrid by default
          zoom: 12,
        });

        const pickupMarker = new mapboxgl.Marker();
        pickupMarkerRef.current = pickupMarker;
        pickupMapRef.current = pickupMap;

        pickupMap.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          pickupMarker.setLngLat([lng, lat]).addTo(pickupMap);
          setPickupCoords([lng, lat]);

          // Get address from coordinates
          getAddressFromCoordinates([lng, lat], "pickup");
        });

        // Initialize dropoff map
        const dropoffMap = new mapboxgl.Map({
          container: "dropoff-map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-3.70379, 40.416775], // Madrid by default
          zoom: 12,
        });

        const dropoffMarker = new mapboxgl.Marker({ color: "#F50057" });
        dropoffMarkerRef.current = dropoffMarker;
        dropoffMapRef.current = dropoffMap;

        dropoffMap.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          dropoffMarker.setLngLat([lng, lat]).addTo(dropoffMap);
          setDropoffCoords([lng, lat]);

          // Get address from coordinates
          getAddressFromCoordinates([lng, lat], "dropoff");
        });

        setMapsInitialized(true);
      } catch (error) {
        console.error("Error initializing maps:", error);
        setError(
          "Error al inicializar los mapas. Por favor, recarga la página."
        );
      }
    }, 500); // 500ms delay to ensure DOM elements are loaded

    // Cleanup
    return () => {
      clearTimeout(initializeMaps);
      if (pickupMapRef.current) {
        pickupMapRef.current.remove();
      }
      if (dropoffMapRef.current) {
        dropoffMapRef.current.remove();
      }
    };
  }, []);

  // Calculate distance and price when both coordinates are available
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateDistance();
    }
  }, [
    pickupCoords,
    dropoffCoords,
    formData.vehicleType,
    formData.weight,
    formData.packageSize,
  ]);

  // Get address from coordinates using Mapbox Geocoding API
  const getAddressFromCoordinates = async (coords, type) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;

        setFormData((prev) => ({
          ...prev,
          [type === "pickup" ? "pickupLocation" : "dropoffLocation"]: address,
        }));
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setError("Error al obtener la dirección. Por favor, inténtalo de nuevo.");
    }
  };

  // Calculate distance between pickup and dropoff
  const calculateDistance = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Distance in kilometers
        const distanceInKm = data.routes[0].distance / 1000;
        setDistance(distanceInKm.toFixed(2));

        // Calculate price
        calculatePrice(distanceInKm);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      setError(
        "Error al calcular la distancia. Por favor, inténtalo de nuevo."
      );
    }
  };

  // Calculate price based on distance, vehicle type, and package dimensions
  const calculatePrice = (distanceInKm) => {
    // Base rate per km for each vehicle type
    const baseRates = {
      bicicleta: 1.5, // €/km
      moto: 2, // €/km
      coche: 2.5, // €/km
    };

    // Fuel consumption factor (higher value = more expensive)
    const fuelFactor = {
      bicicleta: 1, // No fuel
      moto: 1.3, // Some fuel
      coche: 1.8, // More fuel
    };

    // Package size factor
    const sizeFactor = {
      pequeño: 1,
      mediano: 1.3,
      grande: 1.8,
    };

    // Weight factor (per kg)
    const weightFactor = 0.1;

    // Calculate base price
    let basePrice = distanceInKm * baseRates[formData.vehicleType];

    // Apply fuel factor
    basePrice *= fuelFactor[formData.vehicleType];

    // Apply size factor
    basePrice *= sizeFactor[formData.packageSize];

    // Apply weight factor (every kg adds to the price)
    basePrice += formData.weight * weightFactor * distanceInKm;

    // Round up to 2 decimal places
    const finalPrice = Math.ceil(basePrice * 100) / 100;
    setPrice(finalPrice);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "width" || name === "height" || name === "length") {
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [name]: parseFloat(value) || 0, // Added fallback to 0
        },
      }));
    } else if (name === "weight") {
      setFormData((prev) => ({
        ...prev,
        weight: parseFloat(value) || 0, // Added fallback to 0
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle direct address input
  const handleAddressInput = async (e, type) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [type === "pickup" ? "pickupLocation" : "dropoffLocation"]: value,
    }));

    // If the user has typed enough characters, try to geocode the address
    if (value.length > 5) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value
          )}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const coords = data.features[0].center; // [lng, lat]

          if (type === "pickup") {
            setPickupCoords(coords);
            if (pickupMapRef.current && pickupMarkerRef.current) {
              pickupMarkerRef.current
                .setLngLat(coords)
                .addTo(pickupMapRef.current);
              pickupMapRef.current.setCenter(coords);
            }
          } else {
            setDropoffCoords(coords);
            if (dropoffMapRef.current && dropoffMarkerRef.current) {
              dropoffMarkerRef.current
                .setLngLat(coords)
                .addTo(dropoffMapRef.current);
              dropoffMapRef.current.setCenter(coords);
            }
          }
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    }
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!pickupCoords || !dropoffCoords) {
      setError(
        "Por favor selecciona los puntos de recogida y entrega en el mapa"
      );
      setIsLoading(false);
      return;
    }

    try {
      const orderData = {
        ...formData,
        pickupCoords,
        dropoffCoords,
        price,
        status: "pending",
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la orden");
      }

      // Redirect to user profile
      navigate("/UserProfile");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="order-form-container">
        <Navbar />
        <div className="order-form-main">
          <div className="authentication-error">
            <h2>Acceso restringido</h2>
            <p>Debes iniciar sesión para crear una orden.</p>
            <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-form-container">
      <Navbar />
      <div className="order-form-main">
        <h1>Crear Nueva Orden</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Ubicaciones</h2>

            <div className="location-section">
              <div className="location-column">
                <label>Punto de Recogida</label>
                <div id="pickup-map" className="map-container"></div>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => handleAddressInput(e, "pickup")}
                  placeholder="Dirección de recogida"
                  required
                />
              </div>

              <div className="location-column">
                <label>Punto de Entrega</label>
                <div id="dropoff-map" className="map-container"></div>
                <input
                  type="text"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={(e) => handleAddressInput(e, "dropoff")}
                  placeholder="Dirección de entrega"
                  required
                />
              </div>
            </div>

            {distance > 0 && (
              <div className="distance-info">
                <p>
                  Distancia: <strong>{distance} km</strong>
                </p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Detalles del Envío</h2>

            <div className="form-group">
              <label>Fecha y Hora de Recogida</label>
              <input
                type="datetime-local"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha y Hora de Entrega Deseada</label>
              <input
                type="datetime-local"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Notas para el Conductor</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instrucciones especiales, detalles del paquete, etc."
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Teléfono de Contacto para la Entrega</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Ej: 654123789"
                required
              />
            </div>

            <div className="form-group">
              <label>Método de Pago</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia Bancaria</option>
              </select>
            </div>
          </div>
          <div className="form-section">
            <h2>Características del Paquete</h2>

            <div className="form-group">
              <label>Tamaño del Paquete</label>
              <select
                name="packageSize"
                value={formData.packageSize}
                onChange={handleChange}
                required
              >
                <option value="pequeño">Pequeño (menos de 30cm)</option>
                <option value="mediano">Mediano (30-60cm)</option>
                <option value="grande">Grande (más de 60cm)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Peso (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                required
              />
            </div>

            <div className="dimensions-group">
              <label>Dimensiones (cm)</label>
              <div className="dimensions-inputs">
                <input
                  type="number"
                  name="width"
                  placeholder="Ancho"
                  value={formData.dimensions.width}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <input
                  type="number"
                  name="height"
                  placeholder="Alto"
                  value={formData.dimensions.height}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <input
                  type="number"
                  name="length"
                  placeholder="Largo"
                  value={formData.dimensions.length}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Vehículo Necesario</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="bicicleta">Bicicleta</option>
                <option value="moto">Moto</option>
                <option value="coche">Coche</option>
              </select>
            </div>
          </div>
          <div className="price-section">
            <h2>Precio Estimado</h2>
            <div className="price-display">{price.toFixed(2)} €</div>
            <p className="price-note">
              Precio calculado según distancia, tipo de vehículo y
              características del paquete
            </p>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
export default OrderForm;
