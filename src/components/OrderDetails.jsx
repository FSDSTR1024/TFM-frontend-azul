import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Package,
  Clock,
  TruckIcon,
  Calendar,
  ArrowLeft,
  Camera,
  MessageCircle,
  Upload,
  CheckCircle,
  User,
  Phone,
} from "lucide-react";
import { io } from "socket.io-client";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);

        // Fetch chat messages if order is accepted or in progress
        if (
          response.data.status === "accepted" ||
          response.data.status === "in-progress"
        ) {
          const chatResponse = await axios.get(
            `/api/chat/${orderId}/messages`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMessages(chatResponse.data.messages || []);
        }

        setLoading(false);
      } catch (err) {
        setError("Error loading order details");
        setLoading(false);
        console.error(err);
      }
    };

    fetchOrderDetails();

    // Set up Socket.io connection
    const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
      socket.emit("joinOrderRoom", orderId);
      socket.emit("joinChatRoom", orderId);
    });

    socket.on("newMessage", (data) => {
      if (data.orderId === orderId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    socket.on("orderUpdated", (data) => {
      if (data.orderId === orderId) {
        setOrder((prevOrder) => ({ ...prevOrder, status: data.status }));
      }
    });

    socket.on("chatClosed", (data) => {
      if (data.orderId === orderId) {
        alert(data.message);
        setChatOpen(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, navigate]);

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  const handleStartDelivery = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/orders/${orderId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder((prev) => ({ ...prev, status: "in-progress" }));
    } catch (err) {
      console.error("Failed to start delivery", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `/api/chat/${orderId}/messages`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(
        `/api/chat/${orderId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );
      setMessages((prev) => [...prev, response.data.message]);
      setUploading(false);
      setSelectedImage(null);
    } catch (err) {
      console.error("Error uploading image", err);
      setUploading(false);
    }
  };

  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-4 text-blue-500"
      >
        <ArrowLeft className="mr-2" /> Back
      </button>

      {order && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package /> Order #{order._id}
          </h2>
          <div className="flex items-center gap-2">
            <MapPin /> {order.address}
          </div>
          <div className="flex items-center gap-2">
            <User /> {order.customerName}
          </div>
          <div className="flex items-center gap-2">
            <Phone /> {order.customerPhone}
          </div>
          <div className="flex items-center gap-2">
            <Calendar /> {new Date(order.createdAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock /> Status: {order.status}
          </div>

          {order.status === "accepted" && (
            <button
              onClick={handleStartDelivery}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <TruckIcon className="inline mr-2" /> Start Delivery
            </button>
          )}

          {(order.status === "accepted" || order.status === "in-progress") && (
            <div className="mt-6 border rounded p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle /> Chat with Customer
                </h3>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="text-sm text-blue-600"
                >
                  {chatOpen ? "Close Chat" : "Open Chat"}
                </button>
              </div>

              {chatOpen && (
                <>
                  <div
                    ref={chatContainerRef}
                    className="h-64 overflow-y-auto border p-2 bg-white rounded mb-2"
                  >
                    {messages.map((msg, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="font-semibold">{msg.senderName}:</span>{" "}
                        {msg.text}
                        {msg.imageUrl && (
                          <div>
                            <img
                              src={msg.imageUrl}
                              alt="Sent"
                              className="mt-1 w-40 h-auto rounded"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Send
                    </button>
                    <button
                      onClick={handleSelectImage}
                      className="p-2 bg-gray-200 rounded"
                    >
                      <Camera />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      hidden
                    />
                  </div>

                  {uploading && (
                    <div className="text-sm text-gray-500 mt-1">
                      Uploading... {uploadProgress}%
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
