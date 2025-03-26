import React, { useState, useEffect, useRef } from "react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Precios.css";
import {
  TruckIcon,
  Package,
  Calculator,
  MessageSquare,
  CreditCard,
  Clock,
  Shield,
  MapPin,
  Send,
} from "lucide-react";

// Establecer el token de acceso de Mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoiamFkcmlhbmdwIiwiYSI6ImNtN3hxZm9nczAxdmkyaXFzbGk0b28xNHUifQ.svXLzJIXxrcOeC2ldaw0Jg";

const Precios = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    delivery: "",
    vehicle: "moto",
    packageSize: "pequeño",
    weight: 1,
    details: "",
  });

  // Estado de los mapas
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapsInitialized, setMapsInitialized] = useState(false);

  // Referencias para los mapas
  const pickupMapRef = useRef(null);
  const dropoffMapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);

  // Inicializar mapas
  useEffect(() => {
    const initializeMaps = setTimeout(() => {
      try {
        const pickupMapContainer = document.getElementById("pickup-map");
        const dropoffMapContainer = document.getElementById("dropoff-map");

        if (!pickupMapContainer || !dropoffMapContainer) {
          console.error("Contenedores de mapas no encontrados");
          return;
        }

        // Inicializar mapa de recogida
        const pickupMap = new mapboxgl.Map({
          container: "pickup-map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-3.70379, 40.416775], // Madrid por defecto
          zoom: 12,
        });

        const pickupMarker = new mapboxgl.Marker();
        pickupMarkerRef.current = pickupMarker;
        pickupMapRef.current = pickupMap;

        pickupMap.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          pickupMarker.setLngLat([lng, lat]).addTo(pickupMap);
          setPickupCoords([lng, lat]);

          // Obtener dirección a partir de coordenadas
          getAddressFromCoordinates([lng, lat], "pickup");
        });

        // Inicializar mapa de entrega
        const dropoffMap = new mapboxgl.Map({
          container: "dropoff-map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [-3.70379, 40.416775], // Madrid por defecto
          zoom: 12,
        });

        const dropoffMarker = new mapboxgl.Marker({ color: "#F50057" });
        dropoffMarkerRef.current = dropoffMarker;
        dropoffMapRef.current = dropoffMap;

        dropoffMap.on("click", (e) => {
          const { lng, lat } = e.lngLat;
          dropoffMarker.setLngLat([lng, lat]).addTo(dropoffMap);
          setDropoffCoords([lng, lat]);

          // Obtener dirección a partir de coordenadas
          getAddressFromCoordinates([lng, lat], "dropoff");
        });

        setMapsInitialized(true);
      } catch (error) {
        console.error("Error inicializando mapas:", error);
      }
    }, 500); // 500ms de retraso para asegurar que los elementos DOM estén cargados

    // Limpieza
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

  // Calcular distancia y precio cuando ambas coordenadas están disponibles
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateDistance();
    }
  }, [
    pickupCoords,
    dropoffCoords,
    formData.vehicle,
    formData.weight,
    formData.packageSize,
  ]);

  // Obtener dirección a partir de coordenadas usando Mapbox Geocoding API
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
          [type === "pickup" ? "pickup" : "delivery"]: address,
        }));
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
    }
  };

  // Calcular distancia entre puntos de recogida y entrega
  const calculateDistance = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropoffCoords[0]},${dropoffCoords[1]}?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Distancia en kilómetros
        const distanceInKm = data.routes[0].distance / 1000;
        setDistance(distanceInKm.toFixed(2));

        // Calcular precio
        calculatePrice(distanceInKm);
      }
    } catch (error) {
      console.error("Error calculando distancia:", error);
    }
  };

  // Calcular precio basado en distancia, tipo de vehículo y dimensiones del paquete
  const calculatePrice = (distanceInKm) => {
    // Tarifa base por km para cada tipo de vehículo
    const baseRates = {
      bicicleta: 1.5, // €/km
      moto: 2, // €/km
      coche: 2.5, // €/km
      furgoneta: 3.0, // €/km
    };

    // Factor de consumo de combustible (mayor valor = más caro)
    const fuelFactor = {
      bicicleta: 1, // Sin combustible
      moto: 1.3, // Algo de combustible
      coche: 1.8, // Más combustible
      furgoneta: 2.2, // Mucho combustible
    };

    // Factor de tamaño del paquete
    const sizeFactor = {
      pequeño: 1,
      mediano: 1.3,
      grande: 1.8,
    };

    // Factor de peso (por kg)
    const weightFactor = 0.1;

    // Calcular precio base
    let basePrice = distanceInKm * baseRates[formData.vehicle];

    // Aplicar factor de combustible
    basePrice *= fuelFactor[formData.vehicle];

    // Aplicar factor de tamaño
    basePrice *= sizeFactor[formData.packageSize];

    // Aplicar factor de peso (cada kg añade al precio)
    basePrice += formData.weight * weightFactor * distanceInKm;

    // Redondear a 2 decimales
    const finalPrice = Math.ceil(basePrice * 100) / 100;
    setPrice(finalPrice);
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "weight") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0, // Añadido valor por defecto a 0
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Manejar entrada directa de dirección
  const handleAddressInput = async (e, type) => {
    const { value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [type === "pickup" ? "pickup" : "delivery"]: value,
    }));

    // Si el usuario ha escrito suficientes caracteres, intentar geocodificar la dirección
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
        console.error("Error geocodificando dirección:", error);
      }
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!pickupCoords || !dropoffCoords) {
      setMessage(
        "Por favor selecciona los puntos de recogida y entrega en el mapa"
      );
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        pickupCoords,
        dropoffCoords,
        price,
        distance,
      };

      const response = await fetch("http://localhost:5000/api/send-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) {
        throw new Error(
          `Error del servidor: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setMessage(
          "¡Solicitud de presupuesto enviada! Revisa tu correo electrónico."
        );
        // Limpiar formulario
        setFormData({
          name: "",
          email: "",
          phone: "",
          pickup: "",
          delivery: "",
          vehicle: "moto",
          packageSize: "pequeño",
          weight: 1,
          details: "",
        });
        // Limpiar mapas
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.remove();
        }
        if (dropoffMarkerRef.current) {
          dropoffMarkerRef.current.remove();
        }
        setPickupCoords(null);
        setDropoffCoords(null);
        setDistance(0);
        setPrice(0);
      } else {
        setMessage(
          "Error al enviar la solicitud. Por favor, inténtalo de nuevo."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(
        "Error al conectar con el servidor. Por favor, inténtalo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Sección Hero */}
      <section className="precios-hero">
        <div className="hero-content">
          <h1>Precios Transparentes y Competitivos</h1>
          <p>
            En FlashGo te ofrecemos las mejores tarifas para tus envíos con
            precios claros y sin sorpresas
          </p>
        </div>
      </section>

      {/* Sección de Planes */}
      <section className="pricing-plans">
        <h2>Nuestros Planes</h2>
        <p className="section-description">
          Tenemos opciones para cada necesidad, desde envíos puntuales hasta
          soluciones empresariales
        </p>

        <div className="plans-container">
          <div className="plan-card">
            <div className="plan-header">
              <h3>Plan Básico</h3>
              <p className="price">Desde 5€</p>
            </div>
            <div className="plan-features">
              <ul>
                <li>Envíos a domicilio dentro de tu ciudad</li>
                <li>Entrega en el mismo día</li>
                <li>Seguimiento en tiempo real</li>
                <li>Soporte por chat</li>
              </ul>
            </div>
            <p className="plan-ideal">
              Ideal para envíos personales ocasionales
            </p>
          </div>

          <div className="plan-card">
            <div className="plan-header">
              <h3>Plan Premium</h3>
              <p className="price">Desde 8€</p>
            </div>
            <div className="plan-features">
              <ul>
                <li>Envíos a domicilio con prioridad</li>
                <li>Entrega en menos de 4 horas</li>
                <li>Seguimiento en tiempo real</li>
                <li>Soporte 24/7</li>
                <li>Seguro básico incluido</li>
              </ul>
            </div>
            <p className="plan-ideal">Ideal para envíos urgentes</p>
          </div>

          <div className="plan-card">
            <div className="plan-header">
              <h3>Plan Empresarial</h3>
              <p className="price">Personalizado</p>
            </div>
            <div className="plan-features">
              <ul>
                <li>Envíos múltiples y programados</li>
                <li>API de integración</li>
                <li>Panel de administración</li>
                <li>Facturación mensual</li>
                <li>Seguro completo incluido</li>
                <li>Gerente de cuenta dedicado</li>
              </ul>
            </div>
            <p className="plan-ideal">
              Ideal para empresas con envíos regulares
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Calculadora de Precios */}
      <section className="price-calculator">
        <h2>Calcula tu Precio</h2>
        <p className="section-description">
          Utiliza nuestra calculadora para obtener un presupuesto personalizado
          basado en tu envío específico
        </p>

        <div className="calculator-container">
          <div className="maps-section">
            <div className="location-column">
              <label>Punto de Recogida</label>
              <div id="pickup-map" className="map-container"></div>
              <input
                type="text"
                name="pickup"
                value={formData.pickup}
                onChange={(e) => handleAddressInput(e, "pickup")}
                placeholder="Dirección de recogida (o haz clic en el mapa)"
              />
            </div>

            <div className="location-column">
              <label>Punto de Entrega</label>
              <div id="dropoff-map" className="map-container"></div>
              <input
                type="text"
                name="delivery"
                value={formData.delivery}
                onChange={(e) => handleAddressInput(e, "delivery")}
                placeholder="Dirección de entrega (o haz clic en el mapa)"
              />
            </div>
          </div>

          <div className="calculation-options">
            <div className="option-row">
              <div className="option-group">
                <label>Tipo de Vehículo</label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                >
                  <option value="bicicleta">Bicicleta</option>
                  <option value="moto">Moto</option>
                  <option value="coche">Coche</option>
                  <option value="furgoneta">Furgoneta</option>
                </select>
              </div>

              <div className="option-group">
                <label>Tamaño del Paquete</label>
                <select
                  name="packageSize"
                  value={formData.packageSize}
                  onChange={handleChange}
                >
                  <option value="pequeño">Pequeño (menos de 30cm)</option>
                  <option value="mediano">Mediano (30-60cm)</option>
                  <option value="grande">Grande (más de 60cm)</option>
                </select>
              </div>
            </div>

            <div className="option-row">
              <div className="option-group">
                <label>Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="calculation-result">
            {distance > 0 && (
              <div className="distance-info">
                <MapPin size={16} className="icon" />
                <span>
                  Distancia: <strong>{distance} km</strong>
                </span>
              </div>
            )}

            {price > 0 && (
              <div className="price-display">
                <h3>Precio Estimado:</h3>
                <span className="price-value">{price.toFixed(2)}€</span>
                <p className="price-note">
                  Este precio es aproximado y puede variar según condiciones
                  específicas.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sección de Solicitud de Presupuesto */}
      <section className="quote-request">
        <h2>Solicita un Presupuesto</h2>
        <p className="section-description">
          Recibe una cotización personalizada en tu correo electrónico
        </p>

        <form className="quote-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Detalles Adicionales</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Información adicional relevante para tu envío"
              rows="4"
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Enviando..." : "Solicitar Presupuesto"}
            {!loading && <Send size={16} className="icon" />}
          </button>

          {message && <div className="form-message">{message}</div>}
        </form>
      </section>

      {/* Sección de Beneficios */}
      <section className="benefits-section">
        <h2>¿Por qué Elegir FlashGo?</h2>
        <p className="section-description">
          Diseñamos nuestro servicio pensando en ti y en tus necesidades
        </p>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <Clock className="icon" />
            </div>
            <h3>Rapidez</h3>
            <p>
              Entregas en el mismo día, incluso en menos de 1 hora en zonas
              céntricas
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <TruckIcon className="icon" />
            </div>
            <h3>Múltiples Vehículos</h3>
            <p>
              Escoge entre bicicleta, moto, coche o furgoneta según tus
              necesidades
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <Package className="icon" />
            </div>
            <h3>Paquetes de Cualquier Tamaño</h3>
            <p>Desde documentos pequeños hasta objetos voluminosos</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <CreditCard className="icon" />
            </div>
            <h3>Múltiples Métodos de Pago</h3>
            <p>Tarjetas, efectivo contra entrega, PayPal y transferencias</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <Shield className="icon" />
            </div>
            <h3>Seguro Incluido</h3>
            <p>
              Todos los envíos incluyen un seguro básico, con opciones de
              ampliación
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <MessageSquare className="icon" />
            </div>
            <h3>Soporte 24/7</h3>
            <p>
              Nuestro equipo está disponible para ayudarte en cualquier momento
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Preguntas Frecuentes */}
      <section className="faq-section">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq-grid">
          <details>
            <summary>¿Cómo se calcula el precio de un envío?</summary>
            <div className="faq-answer">
              <p>
                El precio de un envío se calcula en base a varios factores: la
                distancia entre el punto de recogida y entrega, el tipo de
                vehículo utilizado, el tamaño y peso del paquete, y la urgencia
                del envío.
              </p>
              <p>
                Nuestra calculadora te ofrece un precio estimado, pero el precio
                final puede variar ligeramente dependiendo de condiciones
                específicas como el tráfico o condiciones climáticas.
              </p>
            </div>
          </details>

          <details>
            <summary>¿Qué zonas cubren vuestros servicios?</summary>
            <div className="faq-answer">
              <p>
                Actualmente ofrecemos nuestros servicios en las principales
                ciudades de España: Madrid, Barcelona, Valencia, Sevilla,
                Zaragoza y Málaga, tanto para envíos dentro de la ciudad como
                para conexiones entre estas ciudades.
              </p>
              <p>
                Estamos en constante expansión, así que te recomendamos
                consultar la disponibilidad para tu zona específica a través de
                nuestra calculadora o contactando con nuestro servicio de
                atención al cliente.
              </p>
            </div>
          </details>

          <details>
            <summary>
              ¿Cuál es el tamaño máximo de paquete que puedo enviar?
            </summary>
            <div className="faq-answer">
              <p>El tamaño máximo depende del tipo de vehículo:</p>
              <ul>
                <li>Bicicleta: Hasta 40x30x20 cm y 5 kg</li>
                <li>Moto: Hasta 50x40x30 cm y 15 kg</li>
                <li>Coche: Hasta 80x60x40 cm y 30 kg</li>
                <li>Furgoneta: Hasta 200x120x100 cm y 200 kg</li>
              </ul>
              <p>
                Para envíos especiales o de mayor tamaño, contáctanos para una
                solución personalizada.
              </p>
            </div>
          </details>

          <details>
            <summary>
              ¿Existe algún tipo de producto que no transportéis?
            </summary>
            <div className="faq-answer">
              <p>Sí, por motivos legales y de seguridad no transportamos:</p>
              <ul>
                <li>Sustancias ilegales o peligrosas</li>
                <li>Explosivos, inflamables o corrosivos</li>
                <li>Armas y municiones</li>
                <li>Animales vivos</li>
                <li>Mercancías perecederas sin embalaje adecuado</li>
                <li>
                  Artículos de valor extremadamente alto sin seguro especial
                </li>
              </ul>
            </div>
          </details>

          <details>
            <summary>¿Cómo puedo pagar por el servicio?</summary>
            <div className="faq-answer">
              <p>Ofrecemos múltiples métodos de pago para tu comodidad:</p>
              <ul>
                <li>Tarjetas de crédito/débito</li>
                <li>PayPal</li>
                <li>Efectivo contra entrega (con recargo adicional)</li>
                <li>Transferencia bancaria (para empresas con cuenta)</li>
                <li>Facturación mensual (solo para clientes empresariales)</li>
              </ul>
            </div>
          </details>

          <details>
            <summary>¿Qué pasa si mi paquete se pierde o daña?</summary>
            <div className="faq-answer">
              <p>
                Todos nuestros envíos incluyen un seguro básico gratuito que
                cubre pérdidas o daños hasta 100€. Para envíos de mayor valor,
                ofrecemos seguros adicionales con mayor cobertura.
              </p>
              <p>
                En caso de incidencia, debes notificarlo en un plazo máximo de
                24 horas a través de nuestro servicio de atención al cliente, y
                nuestro equipo gestionará tu reclamación en un plazo de 48-72h
                laborables.
              </p>
            </div>
          </details>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Precios;
