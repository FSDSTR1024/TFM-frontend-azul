// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Package,
  Clock,
  TruckIcon,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("/api/orders/available", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error loading available orders");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAvailableOrders();
  }, [navigate]);

  const handleAcceptOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/orders/${orderId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove the accepted order from the list
      setOrders(orders.filter((order) => order._id !== orderId));

      // Show success message
      alert("Order accepted successfully!");
    } catch (err) {
      console.error("Error accepting order:", err);
      alert("Failed to accept order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/driver-profile")}
              className="mr-4 flex items-center text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Available Orders</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No available orders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for new delivery opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order._id.substring(order._id.length - 6)}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {order.packageSize}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-start">
                      <MapPin className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Pickup</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.pickupLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Dropoff</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.dropoffLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Pickup Time</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.pickupTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <TruckIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Vehicle Type</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.vehicleType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-gray-900">
                        €{order.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                      >
                        Accept Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableOrders;
