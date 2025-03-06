import React, { useState, useMemo, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./OrderPage.css"; // Import the CSS file

const libraries = ["places"]; // Load the Places library for autocomplete

const OrderPage = () => {
  const [step, setStep] = useState(1); // Step 1: Delivery Details, Step 2: Contact Info, Step 3: Payment
  const [formData, setFormData] = useState({
    name: "",
    packageSize: "",
    carType: "",
    pickup: "",
    dropoff: "",
    phone: "",
    notes: "",
    payment: "",
    deliveryDate: "",
    contactEmail: "",
    pickupCoords: null, // { lat, lng }
    dropoffCoords: null, // { lat, lng }
    distance: 0, // Distance in kilometers
    price: 0, // Calculated price
    directions: null, // Directions between pickup and dropoff
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({}); // For form validation errors

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your API key
    libraries,
  });

  useEffect(() => {
    calculatePrice(); // Recalculate price whenever relevant fields change
  }, [formData.distance, formData.packageSize, formData.carType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.packageSize)
        newErrors.packageSize = "Package size is required";
      if (!formData.carType) newErrors.carType = "Vehicle type is required";
      if (!formData.pickup) newErrors.pickup = "Pickup location is required";
      if (!formData.dropoff)
        newErrors.dropoff = "Drop-off location is required";
    } else if (step === 2) {
      if (!formData.deliveryDate)
        newErrors.deliveryDate = "Delivery date is required";
      if (!formData.phone) newErrors.phone = "Phone number is required";
      if (!formData.contactEmail) newErrors.contactEmail = "Email is required";
      if (!/^\d{10}$/.test(formData.phone))
        newErrors.phone = "Invalid phone number";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail))
        newErrors.contactEmail = "Invalid email";
    } else if (step === 3) {
      if (!formData.cardNumber)
        newErrors.cardNumber = "Card number is required";
      if (!formData.expiryDate)
        newErrors.expiryDate = "Expiry date is required";
      if (!formData.cvv) newErrors.cvv = "CVV is required";
      if (!/^\d{16}$/.test(formData.cardNumber))
        newErrors.cardNumber = "Invalid card number";
      if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = "Invalid CVV";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1); // Move to the next step
    }
  };

  const handlePrevious = () => {
    setStep(step - 1); // Move to the previous step
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 3 && validateStep()) {
      console.log("Booking and Payment Details:", formData);
      alert("Booking and payment submitted successfully!");
      setStep(4); // Move to the confirmation page
    } else {
      handleNext(); // Proceed to the next step
    }
  };

  const calculatePrice = () => {
    const baseRate = 5; // Base rate in dollars
    const distanceRate = formData.distance * 0.5; // $0.5 per kilometer
    const vehicleRate =
      formData.carType === "van" ? 10 : formData.carType === "sedan" ? 5 : 3; // Vehicle type rate
    const weightRate =
      formData.packageSize === "large"
        ? 10
        : formData.packageSize === "medium"
        ? 5
        : 2; // Package weight rate

    const totalPrice = baseRate + distanceRate + vehicleRate + weightRate;
    setFormData((prev) => ({ ...prev, price: totalPrice }));
  };

  const handlePlaceSelect = async (type, address) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        if (type === "pickup") {
          setFormData({
            ...formData,
            pickup: address,
            pickupCoords: { lat: lat(), lng: lng() },
          });
        } else if (type === "dropoff") {
          setFormData({
            ...formData,
            dropoff: address,
            dropoffCoords: { lat: lat(), lng: lng() },
          });
        }

        // Calculate distance and directions if both pickup and dropoff coordinates are set
        if (formData.pickupCoords && formData.dropoffCoords) {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route(
            {
              origin: formData.pickupCoords,
              destination: formData.dropoffCoords,
              travelMode: "DRIVING",
            },
            (result, status) => {
              if (status === "OK") {
                const distance = result.routes[0].legs[0].distance.value / 1000; // Distance in kilometers
                setFormData((prev) => ({
                  ...prev,
                  distance,
                  directions: result,
                }));
              }
            }
          );
        }
      }
    });
  };

  const mapCenter = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []); // Default center (San Francisco)

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2 className="title">Book a Delivery</h2>
      <form onSubmit={handleSubmit} className="form">
        {step === 1 && (
          <>
            {/* Step 1: Delivery Details */}
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <select
              name="packageSize"
              value={formData.packageSize}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Package Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            {errors.packageSize && (
              <p className="error">{errors.packageSize}</p>
            )}

            <select
              name="carType"
              value={formData.carType}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="sedan">Sedan</option>
              <option value="van">Van</option>
            </select>
            {errors.carType && <p className="error">{errors.carType}</p>}

            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  name="pickup"
                  placeholder="Pickup Location"
                  value={formData.pickup}
                  onChange={(e) => {
                    handleChange(e);
                    handlePlaceSelect("pickup", e.target.value);
                  }}
                  className="input"
                  required
                />
                {errors.pickup && <p className="error">{errors.pickup}</p>}

                <input
                  type="text"
                  name="dropoff"
                  placeholder="Drop-off Location"
                  value={formData.dropoff}
                  onChange={(e) => {
                    handleChange(e);
                    handlePlaceSelect("dropoff", e.target.value);
                  }}
                  className="input"
                  required
                />
                {errors.dropoff && <p className="error">{errors.dropoff}</p>}
              </div>
              <div style={{ flex: 1, height: "300px" }}>
                <GoogleMap
                  zoom={12}
                  center={mapCenter}
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                >
                  {formData.pickupCoords && (
                    <Marker position={formData.pickupCoords} />
                  )}
                  {formData.dropoffCoords && (
                    <Marker position={formData.dropoffCoords} />
                  )}
                  {formData.directions && (
                    <DirectionsRenderer directions={formData.directions} />
                  )}
                </GoogleMap>
              </div>
            </div>

            <button type="submit" className="button">
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2: Delivery Date and Contact Information */}
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.deliveryDate && (
              <p className="error">{errors.deliveryDate}</p>
            )}

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.phone && <p className="error">{errors.phone}</p>}

            <input
              type="email"
              name="contactEmail"
              placeholder="Contact Email"
              value={formData.contactEmail}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.contactEmail && (
              <p className="error">{errors.contactEmail}</p>
            )}

            <textarea
              name="notes"
              placeholder="Notes to Driver"
              value={formData.notes}
              onChange={handleChange}
              className="textarea"
            />

            <div style={{ display: "flex", gap: "16px" }}>
              <button type="button" onClick={handlePrevious} className="button">
                Previous
              </button>
              <button type="submit" className="button">
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Step 3: Payment Information */}
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.cardNumber && <p className="error">{errors.cardNumber}</p>}

            <input
              type="text"
              name="expiryDate"
              placeholder="Expiry Date (MM/YY)"
              value={formData.expiryDate}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.expiryDate && <p className="error">{errors.expiryDate}</p>}

            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleChange}
              className="input"
              required
            />
            {errors.cvv && <p className="error">{errors.cvv}</p>}

            <div style={{ display: "flex", gap: "16px" }}>
              <button type="button" onClick={handlePrevious} className="button">
                Previous
              </button>
              <button type="submit" className="button">
                Submit Payment
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            {/* Step 4: Confirmation Page */}
            <h2 className="title">Booking Confirmed!</h2>
            <p>
              Thank you for your booking. Your delivery is scheduled for{" "}
              {formData.deliveryDate}.
            </p>
            <p>Total Price: ${formData.price.toFixed(2)}</p>
            <button
              type="button"
              className="button"
              onClick={() => setStep(1)} // Reset to step 1
            >
              Book Another Delivery
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default OrderPage;
