// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";

function OrderPage() {
  const [phoneNumber, setPhoneNumber] = useState("+63 977 488 3524");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Panel */}
      <div style={{ width: "40%", padding: "20px", background: "#fff" }}>
        <h2>Delivery Date & Contact Information</h2>
        <label>Time</label>
        <select style={{ width: "100%", padding: "5px" }}>
          <option>Now</option>
          <option>9:15</option>
        </select>
        <br />
        <br />
        <label>Phone Number</label>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
        <br />
        <br />
        <h3>Notes to driver</h3>
        <textarea
          placeholder="Landmarks, amount of goods, instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "100%", height: "80px", padding: "5px" }}
        ></textarea>
        <br />
        <br />
        <h3>Payment</h3>
        <select
          style={{ width: "100%", padding: "5px" }}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option>Select a payment method</option>
          <option>Cash</option>
          <option>Wallet</option>
          <option>Credit Card</option>
        </select>
        <br />
        <br />
        <button
          style={{
            width: "100%",
            padding: "10px",
            background: "#f57224",
            color: "#fff",
            border: "none",
          }}
        >
          Add Coupon
        </button>
      </div>

      {/* Right Panel - Map */}
      <div style={{ flexGrow: 1, background: "#eaeaea" }}>
        <iframe
          title="map"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Manila,Philippines"
          allowFullScreen
        ></iframe>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          background: "#fff",
          padding: "10px 20px",
          borderTop: "1px solid #ddd",
        }}
      >
        <button
          style={{ padding: "10px 20px", background: "#ddd", border: "none" }}
        >
          Back
        </button>
        <span style={{ fontSize: "20px", fontWeight: "bold" }}>₱164.00</span>
        <button
          style={{
            padding: "10px 20px",
            background: "#f57224",
            color: "#fff",
            border: "none",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
export default OrderPage;
