import { useState } from "react";

import { useEffect } from "react";

function Chat2() {
  const [orderStatus, setOrderStatus] = useState("pending");
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (orderStatus === "accepted") {
      setChatVisible(true);
    } else if (orderStatus === "completed") {
      setChatVisible(false);
    }
  }, [orderStatus]);

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          padding: "15px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
          Order Status: {orderStatus}
        </h2>
        <button
          style={{ marginTop: "10px" }}
          onClick={() => setOrderStatus("accepted")}
        >
          Accept Order
        </button>
        <button
          style={{ marginTop: "10px", marginLeft: "10px" }}
          onClick={() => setOrderStatus("completed")}
        >
          Complete Order
        </button>
      </div>
      {chatVisible && (
        <div
          style={{
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>Chat</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "150px",
              overflowY: "auto",
              marginBottom: "10px",
            }}
          >
            {messages.map((msg, index) => (
              <p
                key={index}
                style={{ textAlign: msg.sender === "user" ? "right" : "left" }}
              >
                {msg.text}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              padding: "8px",
              width: "calc(100% - 16px)",
              marginBottom: "10px",
            }}
          />
          <button style={{ marginTop: "10px" }} onClick={sendMessage}>
            Send
          </button>
        </div>
      )}
    </div>
  );
}
export default Chat2;
