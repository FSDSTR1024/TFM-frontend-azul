import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Chat2 from "./Chat2"; // Ensure you import the chat component
import "./DriverPage.css"; // Import external CSS

const socket = io("http://localhost:5000");

function DriverPage() {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const driverId = localStorage.getItem("driverId") || "defaultDriverId";

  useEffect(() => {
    const abortController = new AbortController();

    fetch("http://localhost:5000/api/orders/pending", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      signal: abortController.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(setOrders)
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Fetch error:", err);
      });

    socket.on("newOrder", (newOrder) => {
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    socket.on(
      "orderUpdated",
      ({ orderId, status, driverId: assignedDriver }) => {
        if (status === "accepted" || status === "declined" || assignedDriver) {
          setOrders((prevOrders) =>
            prevOrders.filter((o) => o._id !== orderId)
          );
        }
      }
    );

    return () => {
      abortController.abort();
      socket.off("newOrder");
      socket.off("orderUpdated");
    };
  }, []);

  const handleOrderAction = (orderId, status, customerId) => {
    setProcessingOrder(orderId);
    fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    })
      .then(() => {
        if (status === "accepted") {
          setActiveOrder({ _id: orderId, customerId });
        }
      })
      .finally(() => setProcessingOrder(null));
  };

  return (
    <div className="driver-page">
      <h2>Available Orders</h2>
      <div className="orders-container">
        {orders.length === 0 ? (
          <p>No available orders</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <p>
                <strong>Pickup:</strong> {order.pickupLocation}
              </p>
              <p>
                <strong>Dropoff:</strong> {order.dropoffLocation}
              </p>
              <p>
                <strong>Price:</strong> ${order.price}
              </p>
              <button
                onClick={() =>
                  handleOrderAction(order._id, "accepted", order.customerId)
                }
                disabled={processingOrder === order._id}
                className="accept-btn"
              >
                {processingOrder === order._id ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleOrderAction(order._id, "declined")}
                disabled={processingOrder === order._id}
                className="decline-btn"
              >
                Decline
              </button>
            </div>
          ))
        )}
      </div>

      {/* Show Chat when an order is active */}
      {activeOrder && (
        <Chat2
          orderId={activeOrder._id}
          userId={driverId}
          receiverId={activeOrder.customerId}
        />
      )}
    </div>
  );
}

export default DriverPage;
