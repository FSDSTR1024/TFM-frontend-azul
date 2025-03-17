import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Package,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Edit,
} from "lucide-react";
//import { toast } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

const DriverProfile = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch driver profile
        const profileResponse = await axios.get("/api/driver/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(profileResponse.data);
        setUpdatedProfile(profileResponse.data);

        // Fetch driver orders
        const ordersResponse = await axios.get("/api/orders/driver", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(ordersResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Error loading profile data");
        setLoading(false);
        // toast.error("Failed to load profile data");
        console.error(err);
      }
    };

    fetchDriverData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    //toast.success("Logged out successfully");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedProfile(profile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/driver/profile", updatedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(updatedProfile);
      setIsEditing(false);
      //toast.success("Profile updated successfully");
    } catch (err) {
      //toast.error("Failed to update profile");
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            Accepted
          </span>
        );
      case "in-progress":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">FlashGo Driver</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {profile && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="bg-white text-blue-600 rounded-full p-4 mr-6 mb-4 md:mb-0">
                  <User size={48} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>
                  <p className="flex items-center mt-2">
                    <Truck className="mr-2" size={16} />
                    {profile.vehicleType}
                  </p>
                  <p className="flex items-center mt-1">
                    <MapPin className="mr-2" size={16} />
                    {profile.workCity}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="inline-flex bg-blue-700 text-white rounded-full px-4 py-2 font-medium">
                    Active Driver
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-gray-50 px-6 border-b">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "profile"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  aria-label="Profile Information"
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ml-8 ${
                    activeTab === "orders"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  aria-label="Orders"
                >
                  Orders
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Personal Information
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start mb-3">
                        <Mail className="text-gray-400 mt-1" size={18} />
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Email</p>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={updatedProfile.email}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          ) : (
                            <p className="font-medium">{profile.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start mb-3">
                        <Phone className="text-gray-400 mt-1" size={18} />
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Phone Number</p>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={updatedProfile.phoneNumber}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          ) : (
                            <p className="font-medium">{profile.phoneNumber}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Calendar className="text-gray-400 mt-1" size={18} />
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          {isEditing ? (
                            <input
                              type="date"
                              name="birthdate"
                              value={updatedProfile.birthdate}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          ) : (
                            <p className="font-medium">
                              {new Date(profile.birthdate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Driver Information
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start mb-3">
                        <Truck className="text-gray-400 mt-1" size={18} />
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Vehicle Type</p>
                          {isEditing ? (
                            <input
                              type="text"
                              name="vehicleType"
                              value={updatedProfile.vehicleType}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          ) : (
                            <p className="font-medium">{profile.vehicleType}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start mb-3">
                        <MapPin className="text-gray-400 mt-1" size={18} />
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Work City</p>
                          {isEditing ? (
                            <input
                              type="text"
                              name="workCity"
                              value={updatedProfile.workCity}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          ) : (
                            <p className="font-medium">{profile.workCity}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Clock className="text-gray-400 mt-1" size={18} />
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                          >
                            Save Changes
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEditProfile}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center"
                        >
                          <Edit className="mr-2" size={16} />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Your Orders
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                        onClick={() => navigate("/available-orders")}
                      >
                        Find Available Orders
                      </button>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No orders yet
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start accepting orders to see them here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pickup
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dropoff
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                #{order._id.substring(order._id.length - 6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.pickupLocation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.dropoffLocation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.status === "accepted" && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() =>
                                      navigate(`/orders/${order._id}`)
                                    }
                                  >
                                    Start Delivery
                                  </button>
                                )}
                                {order.status === "in-progress" && (
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() =>
                                      navigate(`/orders/${order._id}`)
                                    }
                                  >
                                    Complete Delivery
                                  </button>
                                )}
                                {(order.status === "completed" ||
                                  order.status === "cancelled") && (
                                  <button
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={() =>
                                      navigate(`/orders/${order._id}`)
                                    }
                                  >
                                    View Details
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverProfile;
