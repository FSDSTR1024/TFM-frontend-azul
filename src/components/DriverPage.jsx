// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Chat2 from "./Chat2"; // Ensure you import ChatComponent

const socket = io("http://localhost:5000");

function DriverPage() {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const driverId = localStorage.getItem("driverId"); // Ensure driverId is stored in localStorage

  useEffect(() => {
    fetch("http://localhost:5000/api/orders/pending", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setOrders);

    socket.on("newOrder", (newOrder) => {
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    socket.on("orderUpdated", ({ orderId, status }) => {
      if (status === "accepted" || status === "declined") {
        setOrders((prevOrders) => prevOrders.filter((o) => o._id !== orderId));
      }
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
    };
  }, []);

  const handleOrderAction = (orderId, status, customerId) => {
    fetch(`http://localhost:5000/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    }).then(() => {
      if (status === "accepted") {
        setActiveOrder({ _id: orderId, customerId });
      }
    });
  };

  return (
    <div>
      <h2>Available Orders</h2>
      {orders.map((order) => (
        <div
          key={order._id}
          style={{ border: "1px solid black", margin: "10px", padding: "10px" }}
        >
          <p>Pickup: {order.pickupLocation}</p>
          <p>Dropoff: {order.dropoffLocation}</p>
          <p>Price: ${order.price}</p>
          <button
            onClick={() =>
              handleOrderAction(order._id, "accepted", order.customerId)
            }
          >
            Accept
          </button>
          <button onClick={() => handleOrderAction(order._id, "declined")}>
            Decline
          </button>
        </div>
      ))}

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
