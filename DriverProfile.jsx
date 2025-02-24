// eslint-disable-next-line no-unused-vars
import React from "react";
import { Star, CheckCircle, Clock } from "lucide-react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./DriverProfile.css";

function DriverProfile() {
  return (
    <div className="driver-profile">
      <Navbar />
      {/* Profile Section */}
      <div className="profile-card">
        <img
          className="avatar"
          src="https://via.placeholder.com/150"
          alt="Driver"
        />
        <div>
          <h2 className="driver-name">Juan Dela Cruz</h2>
          <p className="driver-role">Delivery Driver - Lalamove</p>
          <div className="rating">
            <Star className="star-icon" />
            <span className="rating-value">4.8</span>
          </div>
        </div>
      </div>

      {/* Driver Details */}
      <div className="details-card">
        <h3 className="card-title">Driver Details</h3>
        <p>
          <strong>Vehicle:</strong> Motorcycle
        </p>
        <p>
          <strong>Plate Number:</strong> ABC-1234
        </p>
        <p>
          <strong>Completed Deliveries:</strong> 1,245
        </p>
      </div>

      {/* Earnings Section */}
      <div className="earnings-card">
        <h3 className="card-title">Earnings</h3>
        <p className="earnings-value">₱50,000</p>
        <p className="earnings-text">Total Earnings this Month</p>
      </div>

      {/* Order History */}
      <div className="order-history-card">
        <h3 className="card-title">Order History</h3>
        <div className="order-list">
          <div className="order-item">
            <div>
              <p className="order-id">Order #12345</p>
              <p className="order-status">Completed</p>
            </div>
            <CheckCircle className="order-icon" />
          </div>
          <div className="order-item">
            <div>
              <p className="order-id">Order #12344</p>
              <p className="order-status">Pending</p>
              <button className="order-chat">Chat</button>
            </div>
            <Clock className="order-icon" />
          </div>
        </div>
      </div>

      {/* Accept Order Button */}
      <div className="new-order-card">
        <h3 className="card-title">Incoming Order</h3>
        <div className="order-list">
          <div className="order-item">
            <div>
              <p className="order-id">Order #12345</p>
              <p className="order-name">Juan</p>
              <p className="order-pick up">Calle ginzo de limia 24</p>
              <p className="order-drop off">Calle de juan de Mariana</p>
              <p className="order-price">Price: 8 Euros</p>
              <button className="accept-order-button">Accept Order</button>
              <button className="decline-order-button">Decline Order</button>
            </div>
            <Clock className="order-icon" />
          </div>
          <div className="order-item">
            <div>
              <p className="order-id">Order #12346</p>
              <p className="order-name">Juan</p>
              <p className="order-pick up">Calle ginzo de limia 24</p>
              <p className="order-drop off">Calle de juan de Mariana</p>
              <p className="order-price">Price: 8 Euros</p>
              <button className="accept-order-button">Accept Order</button>
              <button className="decline-order-button">Decline Order</button>
            </div>
            <Clock className="order-icon" />
          </div>
        </div>
      </div>

      {/* Update Profile Button */}
      <button className="update-profile-button">Update Profile</button>
      <Footer />
    </div>
  );
}

export default DriverProfile;
