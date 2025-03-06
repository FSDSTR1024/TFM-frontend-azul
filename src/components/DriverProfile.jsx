import React, { useState } from "react";
import { Star, CheckCircle, Clock } from "lucide-react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import "./DriverProfile.css";

// Chat Component
const Chat = ({ orderId, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: "driver" }]);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat for Order #{orderId}</h3>
        <button onClick={onClose} className="close-chat-button">
          Close
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

function DriverProfile() {
  const [orders, setOrders] = useState([
    {
      id: 12345,
      name: "Juan",
      pickUp: "Calle ginzo de limia 24",
      dropOff: "Calle de juan de Mariana",
      price: "8 Euros",
      status: "pending", // 'pending', 'accepted', 'declined', 'completed'
    },
    {
      id: 12346,
      name: "Maria",
      pickUp: "Calle de la Luna 15",
      dropOff: "Calle del Sol 42",
      price: "10 Euros",
      status: "pending", // 'pending', 'accepted', 'declined', 'completed'
    },
  ]);

  const [activeChatOrderId, setActiveChatOrderId] = useState(null); // Track which order has an active chat

  const handleAcceptOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "accepted" } : order
      )
    );
    setActiveChatOrderId(orderId); // Open chat for the accepted order
  };

  const handleDeclineOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "declined" } : order
      )
    );
    setActiveChatOrderId(null); // Close chat if declined
  };

  const handleCompleteOrder = (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "completed" } : order
      )
    );
    setActiveChatOrderId(null); // Close chat when order is completed
  };

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
          {orders.map((order) => (
            <div className="order-item" key={order.id}>
              <div>
                <p className="order-id">Order #{order.id}</p>
                <p className="order-status">{order.status}</p>
              </div>
              {order.status === "completed" ? (
                <CheckCircle className="order-icon" />
              ) : (
                <Clock className="order-icon" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Orders */}
      <div className="new-order-card">
        <h3 className="card-title">Incoming Order</h3>
        <div className="order-list">
          {orders
            .filter((order) => order.status === "pending")
            .map((order) => (
              <div className="order-item" key={order.id}>
                <div>
                  <p className="order-id">Order #{order.id}</p>
                  <p className="order-name">{order.name}</p>
                  <p className="order-pick-up">{order.pickUp}</p>
                  <p className="order-drop-off">{order.dropOff}</p>
                  <p className="order-price">Price: {order.price}</p>
                  <button
                    className="accept-order-button"
                    onClick={() => handleAcceptOrder(order.id)}
                  >
                    Accept Order
                  </button>
                  <button
                    className="decline-order-button"
                    onClick={() => handleDeclineOrder(order.id)}
                  >
                    Decline Order
                  </button>
                </div>
                <Clock className="order-icon" />
              </div>
            ))}
        </div>
      </div>

      {/* Chat for Accepted Orders */}
      {orders
        .filter((order) => order.status === "accepted")
        .map((order) => (
          <Chat
            key={order.id}
            orderId={order.id}
            onClose={() => handleCompleteOrder(order.id)} // Close chat and mark order as completed
          />
        ))}

      {/* Update Profile Button */}
      <button className="update-profile-button">Update Profile</button>
      <Footer />
    </div>
  );
}

export default DriverProfile;
